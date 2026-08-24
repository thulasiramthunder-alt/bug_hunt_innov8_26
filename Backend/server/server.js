require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const EXEC_TIMEOUT_MS = Number(process.env.CODE_EXEC_TIMEOUT_MS || 5000);
const EXEC_MAX_OUTPUT = Number(process.env.CODE_EXEC_MAX_OUTPUT || 1024 * 1024);
const dbSsl = /^(require|true|1)$/i.test(process.env.DB_SSL || '')
  ? {
      minVersion: process.env.DB_TLS_MIN_VERSION || 'TLSv1.2',
      rejectUnauthorized: !/^(false|0)$/i.test(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true'),
      ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {})
    }
  : undefined;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: dbSsl,
  connectTimeout: 15000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function sign(payload, expiresIn = '12h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function getBearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireRole(role) {
  return (req, res, next) => {
    const token = getBearer(req);
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== role) return res.status(403).json({ error: 'Access denied' });
      req.auth = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  };
}

function validEmail(email) {
  return typeof email === 'string' && /^[A-Za-z0-9._%+-]+@saranathan\.ac\.in$/i.test(email.trim());
}

function validLanguage(language) {
  return ['python', 'java', 'c'].includes(String(language || '').toLowerCase());
}

const DEPARTMENTS = ['CSBS', 'CSE', 'IT', 'AIDS', 'AIML'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

function validDepartment(department) {
  return DEPARTMENTS.includes(String(department || '').trim().toUpperCase());
}

function validYear(year) {
  return YEARS.includes(String(year || '').trim());
}

function validDifficulty(difficulty) {
  return ['easy', 'medium', 'hard', 'debug'].includes(String(difficulty || '').toLowerCase());
}

function normalizeOutput(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n+$/g, '');
}

function levelFromOrder(order) {
  const n = Number(order || 1);
  if (n <= 2) return 'Easy';
  if (n <= 4) return 'Medium';
  if (n <= 6) return 'Hard';
  if (n === 7) return 'Tie Breaker';
  return 'Completed';
}

function nextOrderAfter(order) {
  const n = Number(order || 1);
  return Math.min(n + 1, 8);
}

function sanitizeQuestion(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    language: row.language,
    question_set: Number(row.question_set || 0),
    question_order: Number(row.question_order || 1),
    points: Number(row.points || 1),
    starter_code: row.starter_code,
    test_input: row.test_input || ''
  };
}

async function getTeamState(teamId) {
  const [rows] = await pool.execute(
        `SELECT id, team_name, leader_name AS team_leader, leader_name, leader_batch, leader_email, department, year,
          member1_name, member1_batch, member1_email, status, created_at,
            selected_language, assigned_set, current_question_order,
            debug_started_at, last_submission_at, last_compilation_status
       FROM teams WHERE id = ? LIMIT 1`,
    [teamId]
  );
  return rows[0] || null;
}

// ======================================================
// HEALTH
// ======================================================
app.get('/api/health', async (req, res) => {
  try {
    const [[dbNameRow]] = await pool.query('SELECT DATABASE() AS db');
    res.json({
      ok: true,
      app: "INNOV8'26 CODEMERCE",
      database: 'connected',
      host: process.env.DB_HOST,
      dbName: dbNameRow ? dbNameRow.db : null,
      user: process.env.DB_USER,
      port: process.env.DB_PORT
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      host: process.env.DB_HOST,
      user: process.env.DB_USER
    });
  }
});

// ======================================================
// REGISTRATION — existing flow preserved
// ======================================================
app.post('/api/teams/register', async (req, res) => {
  try {
    const {
      teamName, leaderName, leaderBatch, leaderEmail,
      member1Name, member1Batch, member1Email, department, year
    } = req.body;

    if (!teamName || !leaderName || !leaderBatch || !leaderEmail || !member1Name || !member1Batch || !member1Email || !department || !year) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const values = [
      String(teamName).trim(), String(leaderName).trim(), String(leaderBatch).trim(),
      String(leaderEmail).trim().toLowerCase(), String(member1Name).trim(), String(member1Batch).trim(),
      String(member1Email).trim().toLowerCase(), String(department).trim().toUpperCase(), String(year).trim()
    ];
    if (!validEmail(values[3])) return res.status(400).json({ error: 'Leader email must be @saranathan.ac.in' });
    if (!validEmail(values[6])) return res.status(400).json({ error: 'Member 1 email must be @saranathan.ac.in' });
    if (!validDepartment(values[7])) return res.status(400).json({ error: 'Choose a valid department.' });
    if (!validYear(values[8])) return res.status(400).json({ error: 'Choose a valid year.' });

    const [existing] = await pool.execute('SELECT id FROM teams WHERE team_name = ? LIMIT 1', [values[0]]);
    if (existing.length) return res.status(400).json({ error: 'Team already exists' });

    // Support the current CODEMERCE schema used by the supplied server.
    const [result] = await pool.execute(
      `INSERT INTO teams
      (team_name, leader_name, leader_batch, leader_email, member1_name, member1_batch, member1_email, department, year, status,
        selected_language, assigned_set, current_question_order, last_compilation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, 1, 'not_run')`,
      values
    );

    const teamToken = sign({ id: result.insertId, role: 'team', teamName: values[0] }, '7d');
    res.status(201).json({
      success: true,
      team: { id: result.insertId, teamName: values[0], leaderName: values[1], member1Name: values[4], member1Email: values[6], department: values[7], year: values[8], status: 'pending' },
      teamToken,
      message: 'Registration received. Choose your programming language.'
    });
  } catch (error) {
    console.error('Team registration error:', error);
    res.status(500).json({ error: 'Registration failed.', details: error.message });
  }
});

// ======================================================
// TEAM PROFILE
// ======================================================
app.get('/api/team/me', requireRole('team'), async (req, res) => {
  try {
    const team = await getTeamState(req.auth.id);
    if (!team) return res.status(404).json({ error: 'Team not found.' });
    res.json({ ...team, current_level: levelFromOrder(team.current_question_order) });
  } catch (error) {
    console.error('Team profile error:', error);
    res.status(500).json({ error: 'Unable to load team information.' });
  }
});

// ======================================================
// LANGUAGE SELECTION — immutable after first save
// ======================================================
app.post('/api/team/language', requireRole('team'), async (req, res) => {
  const language = String(req.body.language || '').toLowerCase();
  if (!validLanguage(language)) return res.status(400).json({ error: 'Choose exactly one language: C, Python or Java.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [teams] = await conn.execute(
      `SELECT id, status, selected_language, assigned_set FROM teams WHERE id = ? FOR UPDATE`,
      [req.auth.id]
    );
    if (!teams.length) throw Object.assign(new Error('Team not found.'), { statusCode: 404 });
    const team = teams[0];

    if (team.selected_language) {
      if (team.selected_language !== language) {
        throw Object.assign(new Error('Language selection is already locked and cannot be changed.'), { statusCode: 409 });
      }
      await conn.commit();
      return res.json({ success: true, language: team.selected_language, assignedSet: Number(team.assigned_set) });
    }

    const [sets] = await conn.execute(
      `SELECT DISTINCT question_set FROM questions
       WHERE language = ? AND question_set IN (1,2,3)
       ORDER BY question_set`,
      [language]
    );
    if (sets.length < 3) {
      throw Object.assign(new Error('Question bank is incomplete for this language. Expected 3 question sets.'), { statusCode: 500 });
    }

    const assignedSet = crypto.randomInt(1, 4);
    await conn.execute(
      `UPDATE teams SET selected_language = ?, assigned_set = ?, current_question_order = 1
       WHERE id = ? AND selected_language IS NULL`,
      [language, assignedSet, req.auth.id]
    );
    await conn.commit();
    res.json({ success: true, language, assignedSet });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    res.status(error.statusCode || 500).json({ error: error.message || 'Unable to save language.' });
  } finally {
    conn.release();
  }
});

// ======================================================
// DEBUG SESSION START
// ======================================================
app.post('/api/team/start', requireRole('team'), async (req, res) => {
  try {
    const team = await getTeamState(req.auth.id);
    if (!team) return res.status(404).json({ error: 'Team not found.' });
    if (team.status !== 'approved') return res.status(403).json({ error: 'Your team is not approved yet.' });
    if (!team.selected_language || !team.assigned_set) return res.status(409).json({ error: 'Select a programming language first.' });
    if (!team.debug_started_at) {
      await pool.execute(`UPDATE teams SET debug_started_at = NOW() WHERE id = ?`, [req.auth.id]);
    }
    res.json({ success: true, started: true });
  } catch (error) {
    res.status(500).json({ error: 'Unable to start debugging session.' });
  }
});

// ======================================================
// ADMIN AUTH
// ======================================================
app.post('/api/admin/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid admin credentials.' });
  const adminToken = sign({ id: 1, role: 'admin', username });
  res.json({ success: true, adminToken, user: { id: 1, username } });
});

// ======================================================
// ADMIN TEAMS / DASHBOARD
// ======================================================
app.get('/api/admin/teams', requireRole('admin'), async (req, res) => {
  try {
    const department = String(req.query.department || '').trim().toUpperCase();
    const year = String(req.query.year || '').trim();
    if (department && !validDepartment(department)) return res.status(400).json({ error: 'Invalid department filter.' });
    if (year && !validYear(year)) return res.status(400).json({ error: 'Invalid year filter.' });
    const filters = [];
    const filterValues = [];
    if (department) { filters.push('t.department = ?'); filterValues.push(department); }
    if (year) { filters.push('t.year = ?'); filterValues.push(year); }
    const [rows] = await pool.execute(
            `SELECT t.id, t.team_name, t.leader_name AS team_leader, t.leader_name, t.leader_batch, t.leader_email, t.department, t.year,
              t.member1_name, t.member1_batch, t.member1_email, t.created_at, t.status,
              t.selected_language, t.assigned_set, t.current_question_order,
              CASE WHEN t.current_question_order <= 2 THEN 'Easy'
                   WHEN t.current_question_order <= 4 THEN 'Medium'
                   WHEN t.current_question_order <= 6 THEN 'Hard'
                   WHEN t.current_question_order = 7 THEN 'Tie Breaker'
                   ELSE 'Completed' END AS current_level,
              COALESCE(l.total_score,0) AS total_score,
              COALESCE(l.solved_count,0) AS solved_count,
              t.last_submission_at, t.last_compilation_status,
              COALESCE(v.violation_count,0) AS violation_count
       FROM teams t
       LEFT JOIN leaderboard l ON l.team_id = t.id
       LEFT JOIN (SELECT team_id, COUNT(*) violation_count FROM violations GROUP BY team_id) v ON v.team_id = t.id
       ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
       ORDER BY t.created_at DESC`
      , filterValues
    );
    res.json(rows);
  } catch (error) {
    console.error('Admin teams error:', error);
    res.status(500).json({ error: 'Unable to load teams.' });
  }
});

app.put('/api/admin/teams/:id/status', requireRole('admin'), async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const status = String(req.body.status || '');
    if (!Number.isInteger(teamId)) return res.status(400).json({ error: 'Invalid team ID.' });
    if (!['pending','approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid team status.' });
    const [result] = await pool.execute('UPDATE teams SET status = ? WHERE id = ?', [status, teamId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Team not found.' });
    if (status === 'approved') {
      await pool.execute(
        `INSERT INTO leaderboard(team_id,total_score,solved_count,penalty_seconds)
         VALUES (?,0,0,0) ON DUPLICATE KEY UPDATE team_id=VALUES(team_id)`,
        [teamId]
      );
    }
    res.json({ success: true, message: `Team ${status} successfully.` });
  } catch (error) {
    console.error('Team status error:', error);
    res.status(500).json({ error: 'Unable to update team status.' });
  }
});

app.get('/api/admin/scores', requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.id,t.team_name,t.department,t.year,t.status,t.selected_language,t.assigned_set,
              CASE WHEN t.current_question_order <= 2 THEN 'Easy'
                   WHEN t.current_question_order <= 4 THEN 'Medium'
                   WHEN t.current_question_order <= 6 THEN 'Hard'
                   WHEN t.current_question_order = 7 THEN 'Tie Breaker'
                   ELSE 'Completed' END AS current_level,
              COALESCE(l.total_score,0) total_score,COALESCE(l.solved_count,0) solved_count,
              COALESCE(l.penalty_seconds,0) penalty_seconds
       FROM teams t LEFT JOIN leaderboard l ON l.team_id=t.id
       ORDER BY total_score DESC, penalty_seconds ASC, t.team_name ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load scores.' });
  }
});

app.get('/api/admin/violations', requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id,v.team_id,t.team_name,t.department,t.year,v.reason,v.violation_type,v.details,v.created_at
       FROM violations v INNER JOIN teams t ON t.id=v.team_id ORDER BY v.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load violations.' });
  }
});

app.get('/api/admin/questions', requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id,title,description,difficulty,language,question_set,question_order,points,
              starter_code,solution_code,test_input,expected_output,created_at
       FROM questions ORDER BY language,question_set,question_order,id`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load questions.' });
  }
});

app.post('/api/admin/questions', requireRole('admin'), async (req, res) => {
  try {
    const { title, description, difficulty, language, points, questionSet, questionOrder, starterCode, solutionCode, testInput, expectedOutput, runnerCode } = req.body;
    if (!title || !description || !starterCode || !validLanguage(language) || !validDifficulty(difficulty)) {
      return res.status(400).json({ error: 'Question fields are incomplete.' });
    }
    await pool.execute(
      `INSERT INTO questions(title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,runner_code)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [String(title).trim(),String(description).trim(),String(difficulty).toLowerCase(),String(language).toLowerCase(),
       Number(questionSet || 1),Number(questionOrder || 1),Math.max(1,Number(points || 1)),String(starterCode),String(solutionCode || ''),String(testInput || ''),String(expectedOutput || ''),String(runnerCode || '')]
    );
    res.status(201).json({ success: true, message: 'Question created successfully.' });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Unable to create question.' });
  }
});

app.delete('/api/admin/questions/:id', requireRole('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Question not found.' });
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete question.' });
  }
});

// ======================================================
// PUBLIC LEADERBOARD
// ======================================================
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.team_name,t.department,t.year,
              CASE WHEN t.current_question_order <= 2 THEN 'Easy'
                   WHEN t.current_question_order <= 4 THEN 'Medium'
                   WHEN t.current_question_order <= 6 THEN 'Hard'
                   WHEN t.current_question_order = 7 THEN 'Tie Breaker'
                   ELSE 'Completed' END AS current_level,
              COALESCE(l.total_score,0) points,
              COALESCE(l.solved_count,0) solved_count,
              COALESCE(l.penalty_seconds,0) penalty_seconds,
              t.last_submission_at
       FROM teams t INNER JOIN leaderboard l ON l.team_id=t.id
       WHERE t.status='approved'
       ORDER BY points DESC, penalty_seconds ASC, t.team_name ASC`
    );
    res.json(rows.map((row,index) => ({ rank:index+1, ...row })));
  } catch (error) {
    res.status(500).json({ error: 'Unable to load leaderboard.' });
  }
});

// ======================================================
// QUESTIONS — server only exposes the next unlocked problem
// ======================================================
app.get('/api/questions', requireRole('team'), async (req, res) => {
  try {
    const team = await getTeamState(req.auth.id);
    if (!team) return res.status(404).json({ error: 'Team not found.' });
    if (team.status !== 'approved') return res.status(403).json({ error: 'Your team is not approved yet.' });
    if (!team.selected_language || !team.assigned_set) return res.status(409).json({ error: 'Select a programming language first.' });

    const [rows] = await pool.execute(
      `SELECT id,title,description,difficulty,language,question_set,question_order,points,starter_code,test_input
       FROM questions
       WHERE language=? AND question_set=? AND question_order=?
       LIMIT 1`,
      [team.selected_language, team.assigned_set, team.current_question_order]
    );

    // Once the six assigned problems are solved, expose only the tie breaker.
    if (!rows.length && Number(team.current_question_order) === 7) {
      const [tie] = await pool.execute(
        `SELECT id,title,description,difficulty,language,question_set,question_order,points,starter_code,test_input
         FROM questions WHERE language=? AND question_set=0 AND question_order=7 LIMIT 1`,
        [team.selected_language]
      );
      return res.json(tie.map(sanitizeQuestion));
    }
    res.json(rows.map(sanitizeQuestion));
  } catch (error) {
    console.error('Questions error:', error);
    res.status(500).json({ error: 'Unable to load questions.' });
  }
});

// ======================================================
// COMPILER / RUNNER
// ======================================================
function runProcess(command, args, input, cwd, timeoutMs = EXEC_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed = false;
    let timer = setTimeout(() => {
      killed = true;
      try { child.kill('SIGKILL'); } catch {}
    }, timeoutMs);

    const append = (target, chunk) => {
      const text = chunk.toString();
      return (target + text).slice(0, EXEC_MAX_OUTPUT);
    };
    child.stdout.on('data', (c) => { stdout = append(stdout, c); });
    child.stderr.on('data', (c) => { stderr = append(stderr, c); });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: error.message, timedOut: false });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, signal, stdout, stderr, timedOut: killed });
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

async function executeCode(language, code, input, runnerCode = '') {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codemerce-'));
  const started = Date.now();
  try {
    let source = String(code || '');
    if (runnerCode) {
      if (language === 'java' && runnerCode.startsWith('__WRAP_JAVA__')) {
        source = `class Main {\n${source}\n${runnerCode.replace('__WRAP_JAVA__','')}\n}\n`;
      } else {
        source += `\n\n${runnerCode}\n`;
      }
    }

    if (language === 'c') {
      const sourceFile = path.join(tempDir, 'main.c');
      const binary = path.join(tempDir, 'main.out');
      await fs.promises.writeFile(sourceFile, source, 'utf8');
      const compile = await runProcess('gcc', ['-std=c11','-O2','-pipe','main.c','-o','main.out'], '', tempDir);
      if (compile.code !== 0 || compile.timedOut) {
        return { status:'compile_error', output:'', compilerOutput:compile.stderr || 'Compilation failed.', executionTimeMs:Date.now()-started };
      }
      const run = await runProcess(binary, [], input, tempDir);
      if (run.timedOut) return { status:'runtime_error', output:run.stdout, compilerOutput:'Execution timed out.', executionTimeMs:Date.now()-started };
      if (run.code !== 0) return { status:'runtime_error', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
      return { status:'compiled', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
    }

    if (language === 'java') {
      const sourceFile = path.join(tempDir, 'Main.java');
      await fs.promises.writeFile(sourceFile, source, 'utf8');
      const compile = await runProcess('javac', ['Main.java'], '', tempDir);
      if (compile.code !== 0 || compile.timedOut) {
        return { status:'compile_error', output:'', compilerOutput:compile.stderr || 'Compilation failed.', executionTimeMs:Date.now()-started };
      }
      const run = await runProcess('java', ['-cp', tempDir, 'Main'], input, tempDir);
      if (run.timedOut) return { status:'runtime_error', output:run.stdout, compilerOutput:'Execution timed out.', executionTimeMs:Date.now()-started };
      if (run.code !== 0) return { status:'runtime_error', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
      return { status:'compiled', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
    }

    const sourceFile = path.join(tempDir, 'main.py');
    await fs.promises.writeFile(sourceFile, source, 'utf8');
    const configuredPython = process.env.PYTHON_COMMAND;
    const pythonCommand = configuredPython || (process.platform === 'win32' ? 'py' : 'python3');
    const pythonArgs = configuredPython || process.platform !== 'win32' ? [sourceFile] : ['-3', sourceFile];
    let run = await runProcess(pythonCommand, pythonArgs, input, tempDir);
    if (!configuredPython && process.platform === 'win32' && run.code === -1) {
      run = await runProcess('python', [sourceFile], input, tempDir);
    }
    if (run.timedOut) return { status:'runtime_error', output:run.stdout, compilerOutput:'Execution timed out.', executionTimeMs:Date.now()-started };
    if (run.code !== 0) return { status:'compile_error', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
    return { status:'compiled', output:run.stdout, compilerOutput:run.stderr, executionTimeMs:Date.now()-started };
  } finally {
    fs.promises.rm(tempDir, { recursive:true, force:true }).catch(() => {});
  }
}

// ======================================================
// SUBMISSION — compile, run, compare, score, unlock
// ======================================================
app.post('/api/submissions', requireRole('team'), async (req, res) => {
  const { questionId, language, code } = req.body;
  if (!validLanguage(language) || !code || !questionId) return res.status(400).json({ error:'Question, language and code are required.' });
  const qid = Number(questionId);
  if (!Number.isInteger(qid)) return res.status(400).json({ error:'Invalid question ID.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [teamRows] = await conn.execute(`SELECT * FROM teams WHERE id=? FOR UPDATE`, [req.auth.id]);
    if (!teamRows.length) throw Object.assign(new Error('Team not found.'), { statusCode:404 });
    const team = teamRows[0];
    if (team.status !== 'approved') throw Object.assign(new Error('Your team is not approved.'), { statusCode:403 });
    if (!team.selected_language || team.selected_language !== String(language).toLowerCase()) throw Object.assign(new Error('Language does not match the locked team language.'), { statusCode:409 });

    const order = Number(team.current_question_order || 1);
    const expectedSet = order <= 6 ? Number(team.assigned_set) : 0;
    const [qRows] = await conn.execute(
      `SELECT id,title,difficulty,language,question_set,question_order,points,test_input,expected_output,runner_code
       FROM questions WHERE id=? AND language=? AND question_set=? AND question_order=? LIMIT 1`,
      [qid, String(language).toLowerCase(), expectedSet, order]
    );
    if (!qRows.length) throw Object.assign(new Error('This question is not unlocked.'), { statusCode:409 });
    const question = qRows[0];

    await conn.commit();

    const result = await executeCode(language, code, question.test_input || '', question.runner_code || '');
    const normalizedActual = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(question.expected_output);
    const correct = result.status === 'compiled' && normalizedActual === normalizedExpected;
    const finalStatus = result.status === 'compile_error' ? 'compile_error' : result.status === 'runtime_error' ? 'runtime_error' : correct ? 'correct' : 'wrong_answer';
    const score = correct ? 1 : 0;

    const conn2 = await pool.getConnection();
    try {
      await conn2.beginTransaction();
      const [freshRows] = await conn2.execute(`SELECT * FROM teams WHERE id=? FOR UPDATE`, [req.auth.id]);
      const freshTeam = freshRows[0];
      // Prevent double scoring if two submissions race.
      const stillUnlocked = Number(freshTeam.current_question_order) === order;

      await conn2.execute(
        `INSERT INTO submissions(team_id,question_id,language,code,output,score,status,compilation_status,execution_time_ms,compiler_output,submitted_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
        [req.auth.id,qid,String(language).toLowerCase(),String(code),String(result.output || ''),score,finalStatus,result.status,result.executionTimeMs,result.compilerOutput || null]
      );

      if (stillUnlocked && correct) {
        const next = nextOrderAfter(order);
        await conn2.execute(
          `UPDATE teams SET current_question_order=?, last_submission_at=NOW(), last_compilation_status='correct' WHERE id=?`,
          [next, req.auth.id]
        );
        await conn2.execute(
          `INSERT INTO leaderboard(team_id,total_score,solved_count,penalty_seconds)
           VALUES(?,?,1,0)
           ON DUPLICATE KEY UPDATE total_score=total_score+1, solved_count=solved_count+1`,
          [req.auth.id, 1]
        );
      } else {
        await conn2.execute(
          `UPDATE teams SET last_submission_at=NOW(), last_compilation_status=? WHERE id=?`,
          [finalStatus, req.auth.id]
        );
        await conn2.execute(
          `INSERT INTO leaderboard(team_id,total_score,solved_count,penalty_seconds)
           VALUES(?,0,0,0) ON DUPLICATE KEY UPDATE team_id=team_id`,
          [req.auth.id]
        );
      }
      await conn2.commit();
    } catch (error) {
      try { await conn2.rollback(); } catch {}
      throw error;
    } finally {
      conn2.release();
    }

    const newOrder = correct ? nextOrderAfter(order) : order;
    res.json({
      success:true,
      correct,
      score,
      status: finalStatus,
      compilationStatus: result.status,
      output: result.output || '',
      compilerOutput: result.compilerOutput || '',
      expectedOutput: question.expected_output,
      currentLevel: levelFromOrder(newOrder),
      unlockedNext: correct,
      message: correct ? 'Correct answer! Next level unlocked.' : result.status === 'compile_error' ? 'Compilation failed.' : result.status === 'runtime_error' ? 'Runtime error.' : 'Wrong answer.'
    });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    res.status(error.statusCode || 500).json({ error: error.message || 'Submission failed.' });
  } finally {
    conn.release();
  }
});

// ======================================================
// ANTI-CHEAT
// ======================================================
app.post('/api/violations', requireRole('team'), async (req, res) => {
  try {
    const allowed=['copy_paste','right_click','tab_switch','window_blur','fullscreen_exit','minimize','window_change'];
    const { violationType, reason='', details='' } = req.body;
    if (!allowed.includes(violationType)) return res.status(400).json({ error:'Invalid violation.' });
    await pool.execute(`INSERT INTO violations(team_id,reason,violation_type,details) VALUES(?,?,?,?)`, [req.auth.id,String(reason).slice(0,255),String(violationType),String(details)]);
    res.json({ success:true, message:'Violation recorded.' });
  } catch (error) {
    res.status(500).json({ error:'Unable to record violation.' });
  }
});

app.listen(PORT, async () => {
  try {
    const [[databaseRow]] = await pool.query('SELECT DATABASE() AS database_name');
    const [[healthRow]] = await pool.query('SELECT 1 AS ok');
    if (databaseRow.database_name !== process.env.DB_NAME || Number(healthRow.ok) !== 1) {
      throw new Error(`Database startup check failed for ${databaseRow.database_name || 'unknown database'}.`);
    }
    console.log(`INNOV8'26 CODEMERCE API running on http://localhost:${PORT}`);
    console.log(`Database connection verified: ${databaseRow.database_name}`);
  } catch (error) {
    console.error('Database startup error:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      message: error.message
    });
  }
});
