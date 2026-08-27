import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { AntiCheatMonitor } from '../antiCheat.js';
import Nav from '../components/Nav.jsx';

const templates = {
  python: '# Fix the bugs in the program provided for this level.\n',
  java: '// Fix the bugs in the program provided for this level.\n',
  c: '/* Fix the bugs in the program provided for this level. */\n'
};

const levelLabel = (order) => {
  if (order <= 2) return 'EASY';
  if (order <= 4) return 'MEDIUM';
  if (order <= 6) return 'HARD';
  if (order === 7) return 'TIE BREAKER';
  return 'COMPLETED';
};

export default function ArenaPage() {
  const nav = useNavigate();
  const [team, setTeam] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);
  const outputRef = useRef(null);

  const language = team?.selected_language || 'python';
  const level = levelLabel(Number(team?.current_question_order || 1));
  const theme = useMemo(() => ({ python: '#00e5ff', java: '#ffd166', c: '#59ff8b' }[language]), [language]);

  const loadTeam = async () => {
    const data = await api('/api/team/me', {}, 'teamToken');
    setTeam(data);
    if (!data.selected_language) {
      nav('/language', { replace: true });
      return;
    }
    if (data.debug_started_at || data.current_question_order > 1) setStarted(true);
  };

  const loadQuestion = async () => {
    const data = await api(`/api/questions?language=${encodeURIComponent(language)}`, {}, 'teamToken');
    const next = Array.isArray(data) ? data[0] : null;
    setQuestion(next);
    setCode(next?.starter_code || templates[language]);
    setResult(null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadTeam();
      } catch (error) {
        if (mounted) {
          localStorage.removeItem('teamToken');
          localStorage.removeItem('team');
          toast.error(error?.message || 'Your team session has expired.');
          nav('/register', { replace: true });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [nav]);

  useEffect(() => {
    if (!team || !team.selected_language || team.status !== 'approved') return;
    let mounted = true;
    loadQuestion().catch((error) => {
      if (mounted) toast.error(error?.message || 'Unable to load the unlocked problem.');
    });
    return () => { mounted = false; };
  }, [team?.id, team?.selected_language, team?.assigned_set, team?.current_question_order, team?.status]);

  useEffect(() => {
    if (!started) return undefined;
    const monitor = new AntiCheatMonitor((type) => {
      setViolations((value) => value + 1);
      toast.error(`Violation: ${type}`);
    });
    monitor.init();
    return () => monitor.destroy();
  }, [started]);

  useEffect(() => {
    if (result) outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [result]);

  const startDebugging = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(err => {
          console.warn("Fullscreen request failed or was rejected:", err);
        });
      }
      await api('/api/team/start', { method: 'POST' }, 'teamToken');
      setStarted(true);
      await loadTeam();
      toast.success('Debugging session started.');
    } catch (error) {
      toast.error(error?.message || 'Fullscreen is required to start debugging.');
    }
  };

  const submit = async () => {
    if (!question || !code.trim() || busy) return;
    setBusy(true);
    try {
      const data = await api('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({ questionId: question.id, language, code })
      }, 'teamToken');
      setResult(data);
      if (data.correct) {
        toast.success('ACCEPTED +1 • NEXT LEVEL UNLOCKED');
        await loadTeam();
      } else if (data.compilationStatus === 'infrastructure_error') {
        toast.error('DOCKER UNAVAILABLE • Code execution service is down');
      } else if (data.compilationStatus === 'compile_error') {
        toast.error('COMPILATION ERROR • +0');
      } else if (data.compilationStatus === 'runtime_error') {
        toast.error('RUNTIME ERROR • +0');
      } else {
        toast.error('WRONG ANSWER • +0');
      }
    } catch (error) {
      toast.error(error?.message || 'Submission failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !team) {
    return <div className="page"><Nav /><main className="center"><div className="glass-card status-card"><p>Loading team session...</p></div></main></div>;
  }

  if (!team.selected_language) {
    nav('/language', { replace: true });
    return null;
  }

  if (team.status !== 'approved') {
    return (
      <div className="page"><Nav /><main className="center"><div className="glass-card status-card">
        <div className="eyebrow">TEAM {team.id}</div>
        <h2>WAITING FOR <span>APPROVAL</span></h2>
        <p>Team <b>{team.team_name}</b> is currently <b>{team.status}</b>. Your selected language is <b>{team.selected_language.toUpperCase()}</b>.</p>
        <button className="btn cyan" onClick={async () => { try { await loadTeam(); } catch {} }}>CHECK AGAIN</button>
      </div></main></div>
    );
  }

  if (!started) {
    return (
      <div className="page arena-start-page">
        <Nav />
        <main className="center">
          <div className="glass-card status-card arena-start-card">
            <div className="eyebrow">PHASE 04 • BUG HUNT</div>
            <h2>READY TO <span>DEBUG?</span></h2>
            <p>Team <b>{team.team_name}</b> • Language <b>{language.toUpperCase()}</b> • Set <b>{team.assigned_set}</b></p>
            <p>Your debugging screen will enter browser fullscreen. Do not exit fullscreen during the competition.</p>
            <button className="btn pink wide" onClick={startDebugging}>START DEBUGGING • ENTER FULLSCREEN</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page arena-page">
      <Nav />
      <main className="container arena">
        <header className="arena-head">
          <div>
            <div className="eyebrow">PHASE 04 • LIVE BUG HUNT</div>
            <h2>{team.team_name} <span>VS THE BUGS</span></h2>
          </div>
          <div className="arena-actions">
            <span className="violation-pill">VIOLATIONS {violations}</span>
            <span className="level-pill">{level}</span>
            <span className="level-pill">SET {team.assigned_set}</span>
            <button className="btn dark" onClick={async () => { try { await document.exitFullscreen(); } catch {} localStorage.removeItem('teamToken'); localStorage.removeItem('team'); nav('/'); }}>EXIT</button>
          </div>
        </header>

        <div className="progress-strip">
          <span className="progress-step active">EASY</span>
          <span className={Number(team.current_question_order) >= 3 ? 'progress-step active' : 'progress-step'}>MEDIUM</span>
          <span className={Number(team.current_question_order) >= 5 ? 'progress-step active' : 'progress-step'}>HARD</span>
          <span className={Number(team.current_question_order) >= 7 ? 'progress-step active' : 'progress-step'}>TIE BREAKER</span>
        </div>

        <div className="arena-grid">
          <aside className="glass-card questions">
            <div className="panel-title">CURRENT CHALLENGE <small>1 POINT</small></div>
            {question ? (
              <div className="q active locked-question">
                <b>{question.title}</b>
                <span>{level} • QUESTION {question.question_order}</span>
              </div>
            ) : (
              <p className="muted">Competition completed.</p>
            )}
            <div className="locked-note">Previous questions remain locked after a successful submission.</div>
          </aside>

          <section className="glass-card ide">
            <div className="ide-bar">
              <span>● CODEMERCE / {language.toUpperCase()}</span>
              <span>{question?.title || 'COMPLETE'}</span>
            </div>

            <div className="question-box">
              <b>{question?.title || 'BUG HUNT COMPLETED'}</b>
              <span className="badge">{level}</span>
              <p>{question?.description || 'All assigned challenges have been solved.'}</p>
              {question?.test_input && <details className="sample-input"><summary>INPUT PROVIDED TO YOUR PROGRAM</summary><pre>{question.test_input}</pre></details>}
            </div>

            {question && <div className="editor">
              <Editor
                height="100%"
                language={language === 'c' ? 'c' : language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? '')}
                options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, wordWrap: 'on', scrollBeyondLastLine: false }}
              />
            </div>}

            <div className="console" ref={outputRef}>
              <div className="console-head"><span>JUDGE OUTPUT</span><span>{result?.compilationStatus === 'infrastructure_error' ? 'DOCKER UNAVAILABLE' : (result?.compilationStatus || 'WAITING FOR SUBMISSION')}</span></div>
              <pre className="judge-output">{result?.output || result?.compilerOutput || 'Submit the fixed program to compile, execute and score it.'}</pre>
              {result && <div className={`result ${result.correct ? 'ok' : 'bad'}`}>
                {result.correct ? `✓ ACCEPTED • +${result.score} POINT • ${result.currentLevel} UNLOCKED` : result.compilationStatus === 'infrastructure_error' ? `✕ INFRASTRUCTURE ERROR • +0` : `✕ ${String(result.status || 'WRONG').toUpperCase()} • +0`}
              </div>}
            </div>

            <div className="ide-footer">
              <small>Server judge: compile → run → compare normalized output → score 1 point.</small>
              <button className="btn pink" onClick={submit} disabled={!question || busy}>{busy ? 'JUDGING...' : 'SUBMIT & DEBUG'}</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
