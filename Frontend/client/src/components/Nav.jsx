import React from 'react';
import { Link } from 'react-router-dom';
export default function Nav(){
  return <nav className="topbar">
    <Link className="brand" to="/"><span className="brand-mark">○ △ □</span> CODEMERCE</Link>
    <div className="navlinks">
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/register">Register</Link>
      <Link to="/admin/login">Admin</Link>
    </div>
  </nav>;
}
