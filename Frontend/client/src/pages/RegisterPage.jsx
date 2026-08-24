import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Nav from '../components/Nav.jsx';
import Shapes from '../components/Shapes.jsx';
import { api } from '../api.js';

const initial = {
  teamName: '',
  leaderName: '',
  leaderBatch: '',
  leaderEmail: '',
  member1Name: '',
  member1Batch: '',
  member1Email: '',
  department: '',
  year: ''
};

// Correct email validation
const emailOk = (value) =>
  /^[A-Za-z0-9._%+-]+@saranathan\.ac\.in$/i.test(
    value.trim()
  );

export default function RegisterPage() {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  const update = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Trim values before sending
    const data = {
      teamName: form.teamName.trim(),
      leaderName: form.leaderName.trim(),
      leaderBatch: form.leaderBatch.trim(),
      leaderEmail: form.leaderEmail.trim().toLowerCase(),
      member1Name: form.member1Name.trim(),
      member1Batch: form.member1Batch.trim(),
      member1Email: form.member1Email.trim().toLowerCase(),
      department: form.department,
      year: form.year
    };

    // Check all fields
    if (
      !data.teamName ||
      !data.leaderName ||
      !data.leaderBatch ||
      !data.leaderEmail ||
      !data.member1Name ||
      !data.member1Batch ||
      !data.member1Email ||
      !data.department ||
      !data.year
    ) {
      toast.error('Please fill in all fields.');
      return;
    }

    // Check email
    if (!emailOk(data.leaderEmail)) {
      toast.error(
        'Only @saranathan.ac.in emails are accepted.'
      );
      return;
    }

    setBusy(true);

    try {
      const response = await api(
        '/api/teams/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        },
        'none'
      );

      // Save team session
      if (response.teamToken) {
        localStorage.setItem(
          'teamToken',
          response.teamToken
        );
      }

      // Save team information
      if (response.team) {
        localStorage.setItem(
          'team',
          JSON.stringify(response.team)
        );
      }

      toast.success(
        'Team registered. Choose your programming language.'
      );

      nav('/language');

    } catch (err) {
      console.error('Registration error:', err);

      toast.error(
        err?.message || 'Registration failed.'
      );

    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <Nav />

      <main className="container form-wrap">

        <div className="form-head">
          <Shapes />

          <div className="eyebrow">
            PHASE 02 • TEAM REGISTRATION
          </div>

          <h2>
            FORM YOUR <span>TEAM</span>
          </h2>

          <p>
            No participant passwords. Use your generated
            team session after registration.
          </p>
        </div>

        <form
          className="glass-card form-card"
          onSubmit={submit}
        >

          {/* TEAM NAME */}
          <Field
            label="Team Name"
            value={form.teamName}
            onChange={update('teamName')}
          />

          {/* TEAM LEADER */}
          <Field
            label="Team Leader Name"
            value={form.leaderName}
            onChange={update('leaderName')}
          />

          {/* LEADER BATCH */}
          <Field
            label="Team Leader Batch Number"
            value={form.leaderBatch}
            onChange={update('leaderBatch')}
          />

          {/* LEADER EMAIL */}
          <Field
            label="Leader Email • @saranathan.ac.in"
            type="email"
            value={form.leaderEmail}
            onChange={update('leaderEmail')}
          />

          {/* MEMBER */}
          <div className="two">

            <Field
              label="Team Member 1 Name"
              value={form.member1Name}
              onChange={update('member1Name')}
            />

            <Field
              label="Member 1 Batch Number"
              value={form.member1Batch}
              onChange={update('member1Batch')}
            />

            <Field
              label="Member 1 Email • @saranathan.ac.in"
              type="email"
              value={form.member1Email}
              onChange={update('member1Email')}
            />

          </div>

          <div className="two">
            <SelectField
              label="Department"
              value={form.department}
              onChange={update('department')}
              options={['CSBS', 'CSE', 'IT', 'AIDS', 'AIML']}
            />
            <SelectField
              label="Year"
              value={form.year}
              onChange={update('year')}
              options={['I Year', 'II Year', 'III Year', 'IV Year']}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn pink wide"
            disabled={busy}
          >
            {busy
              ? 'SUBMITTING...'
              : 'SUBMIT TEAM REGISTRATION'}
          </button>

        </form>

      </main>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange
}) {
  return (
    <label className="field">

      <span>{label}</span>

      <input
        required
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
      />

    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select required value={value} onChange={onChange}>
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}