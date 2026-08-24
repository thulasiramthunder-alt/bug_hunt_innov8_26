import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Nav from '../components/Nav.jsx';
import Shapes from '../components/Shapes.jsx';
import Background from '../components/Background.jsx';

export default function LandingPage() {
  const features = [
    'TEAM BATTLE',
    'JAVA • PYTHON • C',
    'DEBUG CHALLENGES',
    'LIVE RANKING'
  ];

  return (
    <div className="page">

      {/* BACKGROUND */}
      <Background />

      {/* NAVIGATION */}
      <Nav />

      {/* HERO */}
      <main className="hero container">

        <Shapes />

        <motion.div
          initial={{
            scale: 0.94,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.7
          }}
          className="hero-card glass-card"
        >

          {/* EYEBROW */}
          <div className="eyebrow">
            SCHOOL OF SURVIVAL • CODING ARENA
          </div>

          {/* TITLE */}
          <h1>
            INNOV8<span>'26</span>
          </h1>

          {/* BRAND */}
          <div className="hero-brand">
            CODEMERCE
          </div>

          {/* DESCRIPTION */}
          <p>
            Three languages. One arena.
            Zero room for careless code.
          </p>

          {/* ACTION BUTTONS */}
          <div className="cta">

            <Link
              className="btn pink"
              to="/register"
            >
              ENTER THE GAME
            </Link>

            <Link
              className="btn cyan"
              to="/leaderboard"
            >
              LIVE LEADERBOARD
            </Link>

          </div>

          {/* FEATURES */}
          <div className="feature-grid">

            {features.map(
              (feature, index) => (
                <div
                  className="mini-card"
                  key={feature}
                >

                  <b>
                    {String(
                      index + 1
                    ).padStart(2, '0')}
                  </b>

                  <span>
                    {feature}
                  </span>

                </div>
              )
            )}

          </div>

        </motion.div>

        {/* WARNING */}
        <div className="warning-line">
          AUTHORIZED PARTICIPANTS ONLY • INNOV8'26
        </div>

      </main>

    </div>
  );
}