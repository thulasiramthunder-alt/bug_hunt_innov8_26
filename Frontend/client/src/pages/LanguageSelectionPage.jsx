import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Nav from '../components/Nav.jsx';
import Shapes from '../components/Shapes.jsx';
import { api } from '../api.js';

const languages = [
  { id: 'c', label: 'C', description: 'Pointers • Memory • Algorithms' },
  { id: 'python', label: 'PYTHON', description: 'Functions • Data Structures • Algorithms' },
  { id: 'java', label: 'JAVA', description: 'OOP • Collections • Algorithms' }
];

export default function LanguageSelectionPage() {
  const nav = useNavigate();
  const [team, setTeam] = useState(null);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    api('/api/team/me', {}, 'teamToken')
      .then((data) => {
        if (!mounted) return;
        setTeam(data);
        if (data.selected_language) {
          nav('/arena', { replace: true });
        }
      })
      .catch(() => nav('/register', { replace: true }));
    return () => { mounted = false; };
  }, [nav]);

  const save = async () => {
    if (!selected) {
      toast.error('Choose exactly one programming language.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/team/language', {
        method: 'POST',
        body: JSON.stringify({ language: selected })
      }, 'teamToken');
      toast.success('Language locked. Your question set has been assigned.');
      nav('/arena', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Unable to save language.');
    } finally {
      setBusy(false);
    }
  };

  if (!team) {
    return <div className="page"><Nav /><main className="center"><div className="glass-card status-card"><p>Loading team session...</p></div></main></div>;
  }

  return (
    <div className="page">
      <Nav />
      <main className="container form-wrap language-selection">
        <Shapes />
        <div className="form-head">
          <div className="eyebrow">PHASE 03 • LOCKED LANGUAGE SELECTION</div>
          <h2>CHOOSE YOUR <span>LANGUAGE</span></h2>
          <p>Team: <b>{team.team_name}</b>. Select exactly one language. Once saved, it cannot be changed.</p>
        </div>

        <div className="language-choice-grid">
          {languages.map((language) => (
            <button
              key={language.id}
              type="button"
              className={`glass-card language-choice ${selected === language.id ? 'selected' : ''}`}
              onClick={() => setSelected(language.id)}
              disabled={busy}
            >
              <strong>{language.label}</strong>
              <span>{language.description}</span>
              {selected === language.id && <small>SELECTED • WILL BE LOCKED</small>}
            </button>
          ))}
        </div>

        <div className="language-lock-note">
          The system will randomly assign one complete question set from the three uploaded sets for your team.
        </div>

        <button className="btn pink wide language-confirm" onClick={save} disabled={busy || !selected}>
          {busy ? 'LOCKING LANGUAGE...' : 'CONFIRM & ENTER ARENA'}
        </button>
      </main>
    </div>
  );
}
