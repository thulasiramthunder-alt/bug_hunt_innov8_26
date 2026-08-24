import React, {
  useEffect,
  useState
} from 'react';

import Nav from '../components/Nav.jsx';
import Shapes from '../components/Shapes.jsx';
import { api } from '../api.js';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD LEADERBOARD
  // =====================================================

  const load = async () => {
    try {
      const data = await api(
        '/api/leaderboard',
        {},
        'none'
      );

      setRows(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        'Leaderboard loading error:',
        error
      );

      // Keep old data on temporary refresh failure
      // instead of clearing the leaderboard.

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    load();

    const intervalId =
      setInterval(
        load,
        5000
      );

    return () => {
      clearInterval(
        intervalId
      );
    };
  }, []);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page">

      <Nav />

      <main className="container leaderboard">

        <Shapes />

        <div className="eyebrow">
          PHASE 05 • LIVE LEADERBOARD
        </div>

        <h2>
          THE <span>TOP PLAYERS</span>
        </h2>

        <p className="muted">
          Scores refresh every five seconds.
        </p>

        {/* =================================================
            LEADERBOARD TABLE
        ================================================= */}

        <div className="glass-card table-card">

          <table>

            <thead>

              <tr>
                <th>#</th>
                <th>TEAM</th>
                <th>DEPARTMENT</th>
                <th>YEAR</th>
                <th>CURRENT LEVEL</th>
                <th>POINTS</th>
                <th>SUBMISSIONS</th>
              </tr>

            </thead>

            <tbody>

              {rows.length > 0 ? (
                rows.map((row, index) => (

                  <tr
                    key={
                      row.team_name ||
                      row.id ||
                      index
                    }
                    className={
                      Number(row.rank) === 1
                        ? 'gold-row'
                        : ''
                    }
                  >

                    {/* RANK */}
                    <td>
                      <strong>
                        {Number(
                          row.rank ||
                          index + 1
                        )}
                      </strong>
                    </td>

                    {/* TEAM */}
                    <td>
                      {row.team_name}
                    </td>

                    <td>{row.department}</td>
                    <td>{row.year}</td>

                    {/* CURRENT LEVEL */}
                    <td>{row.current_level || 'Easy'}</td>

                    {/* POINTS */}
                    <td>
                      <strong>
                        {Number(
                          row.points ?? row.total_score ?? 0
                        )}
                      </strong>
                    </td>

                    {/* PENALTY */}
                    <td>
                      {Number(row.solved_count || 0)}
                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    {loading
                      ? 'Loading leaderboard...'
                      : 'No approved teams have scored yet.'}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}