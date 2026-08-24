import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Nav from '../components/Nav.jsx';
import { api } from '../api.js';

export default function AdminLogin() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  // =====================================================
  // INPUT UPDATE
  // =====================================================

  const update = (field) => (e) => {
    setForm((previous) => ({
      ...previous,
      [field]: e.target.value
    }));
  };

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const submit = async (e) => {
    e.preventDefault();

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      toast.error(
        'Enter your admin username and password.'
      );
      return;
    }

    setBusy(true);

    try {
      const data = await api(
        '/api/admin/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            username,
            password
          })
        },
        'none'
      );

      // Make sure server returned token
      if (!data || !data.adminToken) {
        throw new Error(
          'Admin login failed: no session token received.'
        );
      }

      // Save admin session
      localStorage.setItem(
        'adminToken',
        data.adminToken
      );

      // Optional: save admin user information
      if (data.user) {
        localStorage.setItem(
          'adminUser',
          JSON.stringify(data.user)
        );
      }

      toast.success(
        'Control room unlocked'
      );

      nav('/admin/dashboard');

    } catch (error) {
      console.error(
        'Admin login error:',
        error
      );

      toast.error(
        error?.message ||
        'Invalid admin credentials.'
      );

    } finally {
      setBusy(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page">

      <Nav />

      <main className="center">

        <form
          className="glass-card auth-card"
          onSubmit={submit}
        >

          <div className="eyebrow">
            PHASE 03 • ADMIN SYSTEM
          </div>

          <h2>
            CONTROL <span>ROOM</span>
          </h2>

          {/* USERNAME */}
          <input
            type="text"
            placeholder="Admin username"
            value={form.username}
            onChange={update('username')}
            autoComplete="username"
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Admin password"
            value={form.password}
            onChange={update('password')}
            autoComplete="current-password"
            required
          />

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="btn pink wide"
            disabled={busy}
          >
            {busy
              ? 'CHECKING...'
              : 'UNLOCK ADMIN PANEL'}
          </button>

        </form>

      </main>

    </div>
  );
}