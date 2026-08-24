import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Nav from '../components/Nav.jsx';
import { api } from '../api.js';

const tabs = [
  'teams',
  'scores',
  'violations',
  'questions'
];

export default function AdminDashboard() {
  const nav = useNavigate();

  const [tab, setTab] = useState('teams');

  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [violations, setViolations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  // =====================================================
  // LOAD ALL ADMIN DATA
  // =====================================================

  const load = async () => {
    const currentToken =
      localStorage.getItem('adminToken');

    // No admin token
    if (!currentToken) {
      nav('/admin/login');
      return;
    }

    try {
      const [
        teamsData,
        scoresData,
        violationsData,
        questionsData
      ] = await Promise.all([
        api(
          `/api/admin/teams?department=${encodeURIComponent(departmentFilter)}&year=${encodeURIComponent(yearFilter)}`,
          {},
          'adminToken'
        ),

        api(
          '/api/admin/scores',
          {},
          'adminToken'
        ),

        api(
          '/api/admin/violations',
          {},
          'adminToken'
        ),

        api(
          '/api/admin/questions',
          {},
          'adminToken'
        )
      ]);

      setTeams(
        Array.isArray(teamsData)
          ? teamsData
          : []
      );

      setScores(
        Array.isArray(scoresData)
          ? scoresData
          : []
      );

      setViolations(
        Array.isArray(violationsData)
          ? violationsData
          : []
      );

      setQuestions(
        Array.isArray(questionsData)
          ? questionsData
          : []
      );

    } catch (error) {
      console.error(
        'Admin dashboard load error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to load admin data.'
      );

      // If token is invalid/expired
      if (
        error?.message?.toLowerCase().includes(
          'session'
        ) ||
        error?.message?.toLowerCase().includes(
          'authentication'
        ) ||
        error?.message?.toLowerCase().includes(
          'unauthorized'
        ) ||
        error?.message?.toLowerCase().includes(
          'invalid'
        )
      ) {
        localStorage.removeItem(
          'adminToken'
        );

        nav('/admin/login');
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    if (!token) {
      nav('/admin/login');
      return;
    }

    load();

    const intervalId = setInterval(
      load,
      5000
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [departmentFilter, yearFilter]);

  // =====================================================
  // CHANGE TEAM STATUS
  // =====================================================

  const changeStatus = async (
    teamId,
    value
  ) => {
    try {
      await api(
        `/api/admin/teams/${teamId}/status`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            status: value
          })
        },
        'adminToken'
      );

      toast.success(
        `Team ${value}`
      );

      await load();

    } catch (error) {
      console.error(
        'Team status error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to update team status.'
      );
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const deleteQuestion = async (
    questionId
  ) => {
    const confirmed = window.confirm(
      'Delete this question?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(
        `/api/admin/questions/${questionId}`,
        {
          method: 'DELETE'
        },
        'adminToken'
      );

      toast.success(
        'Question deleted successfully.'
      );

      await load();

    } catch (error) {
      console.error(
        'Delete question error:',
        error
      );

      toast.error(
        error?.message ||
        'Unable to delete question.'
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      'adminToken'
    );

    nav('/admin/login');
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page">
        <Nav />

        <main className="container admin">
          <div className="glass-card">
            <p>Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="page">
      <Nav />

      <main className="container admin">

        {/* HEADER */}
        <header className="admin-head">

          <div>
            <div className="eyebrow">
              PHASE 03 • ADMIN MANAGEMENT PANEL
            </div>

            <h2>
              CONTROL <span>ROOM</span>
            </h2>
          </div>

          <button
            className="btn dark"
            onClick={logout}
          >
            LOG OUT
          </button>

        </header>

        {/* STATISTICS */}
        <div className="stat-grid">

          <Stat
            n={teams.length}
            label="TEAMS"
          />

          <Stat
            n={
              teams.filter(
                (team) =>
                  team.status === 'pending'
              ).length
            }
            label="PENDING"
          />

          <Stat
            n={scores.reduce(
              (total, item) =>
                total +
                Number(
                  item.total_score || 0
                ),
              0
            )}
            label="TOTAL SCORE"
          />

          <Stat
            n={violations.length}
            label="VIOLATIONS"
          />

        </div>

        {/* TABS */}
        <div className="tabbar">

          {tabs.map((item) => (
            <button
              key={item}
              className={
                tab === item
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setTab(item)
              }
            >
              {item}
            </button>
          ))}

        </div>

        {/* TEAMS */}
        {tab === 'teams' && (
          <TeamTable
            rows={teams.filter((team) => `${team.team_name} ${team.team_leader} ${team.member1_name}`.toLowerCase().includes(search.toLowerCase()))}
            changeStatus={changeStatus}
            search={search}
            setSearch={setSearch}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
          />
        )}

        {/* SCORES */}
        {tab === 'scores' && (
          <ScoreTable
            rows={scores}
          />
        )}

        {/* VIOLATIONS */}
        {tab === 'violations' && (
          <ViolationTable
            rows={violations}
          />
        )}

        {/* QUESTIONS */}
        {tab === 'questions' && (
          <QuestionTable
            rows={questions}
            deleteQuestion={
              deleteQuestion
            }
          />
        )}

      </main>
    </div>
  );
}

// =======================================================
// STAT CARD
// =======================================================

function Stat({ n, label }) {
  return (
    <div className="glass-card stat">

      <b>{n}</b>

      <span>{label}</span>

    </div>
  );
}

// =======================================================
// TEAM TABLE
//
// DATABASE:
// team_name
// team_leader
// leader_batch
// leader_email
// member1_name
// member1_batch
// status
// =======================================================

function TeamTable({ rows, changeStatus, search, setSearch, departmentFilter, setDepartmentFilter, yearFilter, setYearFilter }) {
  return (
    <div className="glass-card table-card">
      <div className="table-filters">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search participants or teams" />
        <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
          <option value="">All Departments</option>
          {['CSBS', 'CSE', 'IT', 'AIDS', 'AIML'].map((department) => <option key={department} value={department}>{department}</option>)}
        </select>
        <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
          <option value="">All Years</option>
          {['I Year', 'II Year', 'III Year', 'IV Year'].map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>TEAM</th>
            <th>MEMBERS</th>
            <th>EMAIL</th>
            <th>DEPARTMENT</th>
            <th>YEAR</th>
            <th>LANGUAGE</th>
            <th>SET</th>
            <th>CURRENT LEVEL</th>
            <th>SOLVED</th>
            <th>POINTS</th>
            <th>SUBMISSION TIME</th>
            <th>COMPILATION</th>
            <th>STATUS</th>
            <th>VIOLATIONS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan="15" style={{textAlign:'center'}}>No teams registered.</td></tr>
          ) : rows.map((team) => (
            <tr key={team.id}>
              <td><b>{team.team_name}</b></td>
              <td>{team.team_leader}<br />{team.member1_name}</td>
              <td>{team.leader_email}</td>
              <td>{team.department}</td>
              <td>{team.year}</td>
              <td>{team.selected_language ? team.selected_language.toUpperCase() : '—'}</td>
              <td>{team.assigned_set || '—'}</td>
              <td>{team.current_level || 'Easy'}</td>
              <td>{Number(team.solved_count || 0)}</td>
              <td><b>{Number(team.total_score || 0)}</b></td>
              <td>{team.last_submission_at ? new Date(team.last_submission_at).toLocaleString() : '—'}</td>
              <td>{team.last_compilation_status || 'not_run'}</td>
              <td><span className={`status ${team.status}`}>{team.status}</span></td>
              <td>{Number(team.violation_count || 0)}</td>
              <td>
                <div className="row-actions">
                  {team.status !== 'approved' && <button onClick={() => changeStatus(team.id, 'approved')}>APPROVE</button>}
                  {team.status !== 'rejected' && <button onClick={() => changeStatus(team.id, 'rejected')}>REJECT</button>}
                  {team.status === 'rejected' && <button onClick={() => changeStatus(team.id, 'pending')}>PENDING</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =======================================================
// SCORE TABLE
//
// DATABASE:
// leaderboard.total_score
// leaderboard.solved_count
// leaderboard.penalty_seconds
// =======================================================

function ScoreTable({ rows }) {
  return (
    <div className="glass-card table-card">

      <table>

        <thead>
          <tr>
            <th>RANK</th>
            <th>TEAM</th>
            <th>DEPARTMENT</th>
            <th>YEAR</th>
            <th>STATUS</th>
            <th>LANGUAGE</th>
            <th>SET</th>
            <th>CURRENT LEVEL</th>
            <th>SCORE</th>
            <th>SOLVED</th>
            <th>PENALTY</th>
          </tr>
        </thead>

        <tbody>

          {rows.length === 0 ? (
            <tr>
              <td
                colSpan="11"
                style={{
                  textAlign: 'center'
                }}
              >
                No scores available.
              </td>
            </tr>
          ) : (
            rows.map((item, index) => (
              <tr
                key={
                  item.id ||
                  `${item.team_name}-${index}`
                }
              >

                <td>
                  {index + 1}
                </td>

                <td>
                  {item.team_name}
                </td>
                <td>{item.department}</td>
                <td>{item.year}</td>

                <td>
                  <span
                    className={`status ${item.status}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>{item.selected_language ? item.selected_language.toUpperCase() : '—'}</td>
                <td>{item.assigned_set || '—'}</td>
                <td>{item.current_level || 'Easy'}</td>

                <td>
                  <b>
                    {Number(
                      item.total_score || 0
                    )}
                  </b>
                </td>

                <td>
                  {Number(
                    item.solved_count || 0
                  )}
                </td>

                <td>
                  {Number(
                    item.penalty_seconds || 0
                  )}
                  s
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

// =======================================================
// VIOLATION TABLE
//
// DATABASE:
// violations.reason
// violations.violation_type
// violations.details
// violations.created_at
// =======================================================

function ViolationTable({ rows }) {
  return (
    <div className="glass-card table-card">

      <table>

        <thead>
          <tr>
            <th>TIME</th>
            <th>TEAM</th>
            <th>DEPARTMENT</th>
            <th>YEAR</th>
            <th>TYPE</th>
            <th>REASON</th>
            <th>DETAILS</th>
          </tr>
        </thead>

        <tbody>

          {rows.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: 'center'
                }}
              >
                No violations recorded.
              </td>
            </tr>
          ) : (
            rows.map((violation) => (
              <tr
                key={violation.id}
              >

                <td>
                  {violation.created_at
                    ? new Date(
                        violation.created_at
                      ).toLocaleString()
                    : '-'}
                </td>

                <td>
                  {violation.team_name}
                </td>
                <td>{violation.department}</td>
                <td>{violation.year}</td>

                <td className="danger">
                  {
                    violation.violation_type
                  }
                </td>

                <td>
                  {violation.reason ||
                    '-'}
                </td>

                <td>
                  {violation.details ||
                    '-'}
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

// =======================================================
// QUESTION TABLE
//
// DATABASE:
// questions.points
// NOT max_score
// =======================================================

function QuestionTable({
  rows,
  deleteQuestion
}) {
  return (
    <div className="glass-card table-card">

      <table>

        <thead>
          <tr>
            <th>TITLE</th>
            <th>LANGUAGE</th>
            <th>DIFFICULTY</th>
            <th>POINTS</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>

          {rows.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: 'center'
                }}
              >
                No questions available.
              </td>
            </tr>
          ) : (
            rows.map((question) => (
              <tr
                key={question.id}
              >

                <td>
                  {question.title}
                </td>

                <td>
                  {question.language}
                </td>

                <td>
                  {question.difficulty}
                </td>

                {/* CORRECT DATABASE COLUMN */}
                <td>
                  <b>
                    {Number(
                      question.points || 0
                    )}
                  </b>
                </td>

                <td>
                  <button
                    onClick={() =>
                      deleteQuestion(
                        question.id
                      )
                    }
                  >
                    DELETE
                  </button>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}