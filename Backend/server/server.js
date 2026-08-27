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

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));

// ======================================================
// ROOT ROUTE — prevents "Cannot GET /"
// ======================================================
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Codemerce Backend Running',
    timestamp: new Date()
  });
});

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

// ======================================================
// STATUS SANITIZERS — guarantee DB writes can NEVER crash
// with "Data truncated for column 'compilation_status'".
//
// DB-SAFE VALUES: only these strings are ever persisted. They are a subset
// that is valid under BOTH the legacy ENUM definitions and the new VARCHAR
// columns, so a write survives any database state. 'infrastructure_error'
// (returned when Docker / the compiler host is unavailable) and every other
// unexpected status is clamped here BEFORE it reaches MySQL.
//
// The raw status is still returned to the frontend in the JSON response so
// the UI can show the specific reason (e.g. DOCKER UNAVAILABLE).
// ======================================================
const DB_SAFE_COMPILATION_STATUSES = [
  'not_run', 'compiled', 'compile_error', 'runtime_error', 'wrong_answer', 'correct'
];

const DB_SAFE_SUBMISSION_STATUSES = [
  'submitted', 'correct', 'wrong', 'wrong_answer',
  'compile_error', 'runtime_error', 'debug_pass'
];

function sanitizeCompilationStatus(value) {
  const normalized = String(value ?? '').trim();
  if (DB_SAFE_COMPILATION_STATUSES.includes(normalized)) return normalized;
  console.warn(`[Sanitizer] compilation_status "${normalized}" → 'runtime_error' (DB-safe clamp)`);
  return 'runtime_error';
}

function sanitizeSubmissionStatus(value) {
  const normalized = String(value ?? '').trim();
  if (DB_SAFE_SUBMISSION_STATUSES.includes(normalized)) return normalized;
  console.warn(`[Sanitizer] submission status "${normalized}" → 'wrong_answer' (DB-safe clamp)`);
  return 'wrong_answer';
}

// ======================================================
// SELF-HEALING SCHEMA — widens every status column to
// VARCHAR at startup so valid programs can never hit a
// restrictive ENUM. Idempotent and non-fatal: each MODIFY
// only runs when the live column type differs, and a
// failure (e.g. no ALTER privilege) is logged, not thrown.
// ======================================================
const STATUS_SCHEMA_DESIRED = [
  { table: 'submissions', column: 'compilation_status', type: 'varchar(100)', ddl: `VARCHAR(100) NOT NULL DEFAULT 'not_run'` },
  { table: 'submissions', column: 'status', type: 'varchar(50)', ddl: `VARCHAR(50) NOT NULL DEFAULT 'submitted'` },
  { table: 'teams', column: 'last_compilation_status', type: 'varchar(100)', ddl: `VARCHAR(100) NOT NULL DEFAULT 'not_run'` },
  { table: 'submissions', column: 'output', type: 'longtext', ddl: `LONGTEXT NULL` },
  { table: 'submissions', column: 'compiler_output', type: 'longtext', ddl: `LONGTEXT NULL` }
];

async function ensureStatusColumnsRobust() {
  const results = [];
  for (const d of STATUS_SCHEMA_DESIRED) {
    try {
      const [cols] = await pool.query(
        `SELECT column_name, column_type
           FROM information_schema.columns
          WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [d.table, d.column]
      );
      if (!cols.length) {
        await pool.query(`ALTER TABLE ?? ADD COLUMN ?? ${d.ddl}`, [d.table, d.column]);
        results.push(`ADDED    ${d.table}.${d.column} → ${d.ddl}`);
      } else if (String(cols[0].column_type).toLowerCase() !== d.type) {
        await pool.query(`ALTER TABLE ?? MODIFY COLUMN ?? ${d.ddl}`, [d.table, d.column]);
        results.push(`MODIFIED ${d.table}.${d.column}: ${cols[0].column_type} → ${d.ddl}`);
      } else {
        results.push(`OK       ${d.table}.${d.column} (${cols[0].column_type})`);
      }
    } catch (error) {
      results.push(`FAILED   ${d.table}.${d.column}: ${error.message}`);
    }
  }
  return results;
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
// CONTAINER EXECUTION INFRASTRUCTURE
//
// Job scratch root CONTAINER_JOB_ROOT MUST live on the container's WRITABLE
// OVERLAY layer — never a tmpfs mount. The docker daemon's `docker cp` cannot
// write into container-internal tmpfs mounts and errors with:
//   "Could not find the file /tmp/jobs/<job-id> in container <name>"
// which surfaced as "Docker file transfer failed" / "DOCKER UNAVAILABLE".
// ======================================================
const CONTAINER_JOB_ROOT = String(process.env.CONTAINER_JOB_ROOT || '/workspace/jobs');
const CONTAINER_MAP = {
  c: process.env.DOCKER_C_CONTAINER || 'c-compiler',
  java: process.env.DOCKER_JAVA_CONTAINER || 'java-compiler',
  python: process.env.DOCKER_PYTHON_CONTAINER || 'python-compiler'
};
const CONTAINER_TOOLCHECK = {
  c: 'gcc --version',
  java: 'java -version',
  python: 'python3 --version'
};
const COMPOSE_FILE_PATH = process.env.COMPOSE_FILE
  ? path.resolve(process.env.COMPOSE_FILE)
  : path.resolve(__dirname, '..', '..', 'docker-compose.yml');

const COMPOSE_START_HINT =
  `Start the compiler containers with:\n  ` +
  `docker compose -f "${COMPOSE_FILE_PATH}" up -d\n`;

async function dockerContainerState(dockerBin, container) {
  const ps = await runProcess(
    dockerBin, ['ps', '-a', '--filter', `name=^${container}$`, '--format', '{{.Names}}|{{.State}}'], '', os.tmpdir(), 8000
  );
  const line = String(ps.stdout || '').trim();
  if (!line) return 'missing';
  return (line.split('|')[1] || 'unknown');
}

async function ensureJobDir(dockerBin, container, jobDir) {
  const r = await runProcess(dockerBin, ['exec', container, 'mkdir', '-p', jobDir], '', os.tmpdir(), 8000);
  if (r.code !== 0) {
    throw Object.assign(
      new Error(`Container "${container}" could not create ${jobDir}: ${r.stderr || r.stdout}`),
      { infra: true }
    );
  }
  return r;
}

async function ensureJobRoot(dockerBin, container) {
  await ensureJobDir(dockerBin, container, CONTAINER_JOB_ROOT);
}

async function autoStartContainer(dockerBin, container, language) {
  const state = await dockerContainerState(dockerBin, container);

  if (state === 'running') {
    const tool = await runProcess(dockerBin, ['exec', container, 'sh', '-c', CONTAINER_TOOLCHECK[language]], '', os.tmpdir(), 10000);
    if (tool.code === 0) return 'running';
    console.warn(`[Docker] ${container} is up but its toolchain is unreachable → recreating.`);
  }

  if (state === 'created' || state === 'exited' || state === 'restarting' || state === 'paused') {
    const start = await runProcess(dockerBin, ['start', container], '', os.tmpdir(), 20000);
    if (start.code === 0 && (await dockerContainerState(dockerBin, container)) === 'running') return 'started-existing';
  }

  try { await fs.promises.access(COMPOSE_FILE_PATH, fs.constants.F_OK); }
  catch (e) {
    throw Object.assign(new Error(`Cannot auto-start "${container}": ${COMPOSE_FILE_PATH} not found.\n${COMPOSE_START_HINT}`), { infra: true });
  }

  const up = await runProcess(dockerBin, ['compose', '-f', COMPOSE_FILE_PATH, 'up', '-d', container], '', os.tmpdir(), 180000);
  if (up.code !== 0) {
    throw Object.assign(new Error(`Cannot auto-start "${container}". ${up.stderr || up.stdout}\n${COMPOSE_START_HINT}`), { infra: true });
  }
  for (let i = 0; i < 60; i++) {
    if ((await dockerContainerState(dockerBin, container)) === 'running') return 'compose-started';
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw Object.assign(new Error(`Container "${container}" did not reach running state after compose up.`), { infra: true });
}

async function dockerCopyIn(dockerBin, container, localPath, remotePath, attempts = 2) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const cp = await runProcess(dockerBin, ['cp', localPath, `${container}:${remotePath}`], '', path.dirname(localPath), 10000);
    if (cp.code === 0) return cp;
    console.warn(`[Docker] docker cp attempt ${attempt}/${attempts} failed for ${remotePath}: ${String(cp.stderr).trim()} → recreating parent dir and retrying.`);
    await runProcess(dockerBin, ['exec', container, 'mkdir', '-p', path.posix.dirname(remotePath)], '', os.tmpdir(), 8000);
    if (attempt === attempts) {
      throw Object.assign(new Error(`Docker file transfer failed: ${cp.stderr}`), { infra: true });
    }
  }
}

async function getCompilerContainerStatus() {
  if (process.env.USE_DOCKER !== 'true') return [];
  const bin = await resolveDockerBin();
  if (!bin) return [];
  const states = [];
  for (const [lang, name] of Object.entries(CONTAINER_MAP)) {
    states.push({ language: lang, container: name, status: await dockerContainerState(bin, name) });
  }
  return states;
}

// ======================================================
// HEALTH
// ======================================================
app.get('/api/health', async (req, res) => {
  let dbStatus = 'connected';
  try { await pool.query('SELECT 1'); } catch (e) { dbStatus = `error: ${e.message}`; }

  let dockerStatus = 'disabled';
  if (process.env.USE_DOCKER === 'true') {
    const bin = await resolveDockerBin();
    if (bin) {
      const ver = await runProcess(bin, ['--version'], '', os.tmpdir(), 5000);
      const info = await runProcess(bin, ['info', '--format', '{{.ServerVersion}}'], '', os.tmpdir(), 10000);
      dockerStatus = info.code === 0
        ? `available — Docker ${ver.stdout.trim()} (daemon v${info.stdout.trim()})`
        : `CLI found but daemon unreachable (is Docker Desktop running?)`;
    } else {
      dockerStatus = 'unavailable — Docker CLI not found. Please install Docker Desktop.';
    }
  }

  const ok = dbStatus === 'connected';
  const containers = await getCompilerContainerStatus();
  res.status(ok ? 200 : 500).json({
    ok,
    app: "INNOV8'26 CODEMERCE",
    database: dbStatus,
    dockerExecution: dockerStatus,
    containers,
    useDocker: process.env.USE_DOCKER === 'true',
  });
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
    try { await conn.rollback(); } catch { }
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
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid team status.' });
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
      [String(title).trim(), String(description).trim(), String(difficulty).toLowerCase(), String(language).toLowerCase(),
      Number(questionSet || 1), Number(questionOrder || 1), Math.max(1, Number(points || 1)), String(starterCode), String(solutionCode || ''), String(testInput || ''), String(expectedOutput || ''), String(runnerCode || '')]
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
    res.json(rows.map((row, index) => ({ rank: index + 1, ...row })));
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
function runProcess(command, args, input, cwd, timeoutMs = EXEC_TIMEOUT_MS, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, windowsHide: true, env: { ...process.env, ...extraEnv } });
    let stdout = '';
    let stderr = '';
    let killed = false;
    let timer = setTimeout(() => {
      killed = true;
      try { child.kill('SIGKILL'); } catch { }
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

// ======================================================
// DOCKER BINARY RESOLUTION — cross-platform, cached
// ======================================================
const DOCKER_CANDIDATE_PATHS = [
  // Windows — Docker Desktop (system-wide installs)
  'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
  'C:\\ProgramData\\DockerDesktop\\version-bin\\docker.exe',
  'C:\\Program Files\\Docker\\Docker\\resources\\bin\\com.docker.cli.exe',
  // Windows — Docker Desktop (per-user installs via LOCALAPPDATA)
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DockerDesktop', 'resources', 'bin', 'docker.exe'),
  // Linux / macOS
  '/usr/bin/docker',
  '/usr/local/bin/docker',
  '/opt/homebrew/bin/docker',
  '/snap/bin/docker',
];
let _resolvedDockerBin = undefined; // undefined = unchecked, '' = not found, string = resolved path

function getWindowsRegistryDockerPath() {
  if (process.platform !== 'win32') return null;
  try {
    const { execSync } = require('child_process');
    const reg = execSync(
      'reg query "HKLM\\SOFTWARE\\Docker Inc.\\Docker" /v InstallPath 2>nul || ' +
      'reg query "HKCU\\SOFTWARE\\Docker Inc.\\Docker" /v InstallPath 2>nul',
      { encoding: 'utf8', timeout: 3000, windowsHide: true }
    );
    const match = reg.match(/InstallPath\s+REG_SZ\s+(.+)/i);
    if (match) {
      const installDir = match[1].trim();
      return path.join(installDir, 'resources', 'bin', 'docker.exe');
    }
  } catch { /* registry read failed — not critical */ }
  return null;
}

async function resolveDockerBin() {
  if (_resolvedDockerBin !== undefined) return _resolvedDockerBin;

  // 1. Try bare 'docker' from the system PATH
  const fromPath = await runProcess('docker', ['--version'], '', os.tmpdir(), 5000);
  if (fromPath.code === 0) {
    _resolvedDockerBin = 'docker';
    console.log('[Docker] docker CLI found in PATH');
    return _resolvedDockerBin;
  }

  // 2. Try well-known installation directories (Windows .exe / Linux binaries)
  for (const candidate of DOCKER_CANDIDATE_PATHS) {
    if (!candidate) continue;
    try {
      await fs.promises.access(candidate, fs.constants.F_OK);
      const test = await runProcess(candidate, ['--version'], '', os.tmpdir(), 5000);
      if (test.code === 0) {
        _resolvedDockerBin = candidate;
        console.log(`[Docker] docker CLI found at: ${candidate}`);
        return _resolvedDockerBin;
      }
    } catch { /* not accessible — try next candidate */ }
  }

  // 3. On Windows, query the registry for Docker Desktop's install location
  const regPath = getWindowsRegistryDockerPath();
  if (regPath) {
    try {
      await fs.promises.access(regPath, fs.constants.F_OK);
      const test = await runProcess(regPath, ['--version'], '', os.tmpdir(), 5000);
      if (test.code === 0) {
        _resolvedDockerBin = regPath;
        console.log(`[Docker] docker CLI found via registry: ${regPath}`);
        return _resolvedDockerBin;
      }
    } catch { /* registry path didn't work */ }
  }

  _resolvedDockerBin = '';
  console.warn('[Docker] Docker CLI binary not found. Code execution will use Docker containers when available.');
  return _resolvedDockerBin;
}

// ======================================================
// DOCKER HEALTH CHECK — verifies the daemon is reachable
// ======================================================
async function checkDockerHealth() {
  const bin = await resolveDockerBin();
  if (!bin) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  DOCKER IS NOT AVAILABLE                                   ║');
    console.error('║                                                            ║');
    console.error('║  The Docker CLI could not be found on this system.         ║');
    console.error('║  USE_DOCKER=true is set in .env but Docker is not          ║');
    console.error('║  installed or not in the system PATH.                      ║');
    console.error('║                                                            ║');
    console.error('║  To fix this:                                              ║');
    console.error('║  1. Install Docker Desktop:                                ║');
    console.error('║     https://www.docker.com/products/docker-desktop/        ║');
    console.error('║  2. Start Docker Desktop and wait for it to initialize     ║');
    console.error('║  3. Run: docker compose -f "<compose-file>" up -d          ║');
    console.error('║  4. Restart the backend server                             ║');
    console.error('║                                                            ║');
    console.error('║  Or set USE_DOCKER=false in .env to use local compilers.   ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('');
    return false;
  }

  const versionResult = await runProcess(bin, ['--version'], '', os.tmpdir(), 5000);
  if (versionResult.code === 0) {
    console.log(`[Docker] Version: ${versionResult.stdout.trim()}`);
  }

  const infoResult = await runProcess(bin, ['info', '--format', '{{.ServerVersion}}'], '', os.tmpdir(), 10000);
  if (infoResult.code === 0) {
    console.log(`[Docker] Daemon reachable — server version: ${infoResult.stdout.trim()}`);
    console.log('[Docker] Docker health check PASSED');
    return true;
  }

  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  DOCKER DAEMON IS NOT RUNNING                              ║');
  console.error('║                                                            ║');
  console.error('║  The Docker CLI was found but the Docker daemon is not     ║');
  console.error('║  responding. Code execution will fail until Docker is      ║');
  console.error('║  running.                                                  ║');
  console.error('║                                                            ║');
  console.error('║  Please start Docker Desktop and wait for it to finish     ║');
  console.error('║  initializing, then restart the backend server.            ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
  return false;
}

// ======================================================
// DOCKER EXECUTION — isolated container per language
// ======================================================
async function executeCodeDocker(language, code, input, runnerCode = '') {
  // ── 1. Resolve Docker binary (cross-platform, cached) ──────────────────────
  const dockerBin = await resolveDockerBin();
  if (!dockerBin) {
    return {
      status: 'infrastructure_error',
      output: '',
      compilerOutput:
        'Docker is not available. Please start Docker Desktop and try again.\n\n' +
        'Steps to fix:\n' +
        '  1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/\n' +
        '  2. Start Docker Desktop and wait for it to finish initializing\n' +
        `  3. Run: docker compose -f "${COMPOSE_FILE_PATH}" up -d\n` +
        '  4. Restart this server\n\n' +
        'Alternatively, set USE_DOCKER=false in the server .env to use local compilers instead.',
      executionTimeMs: 0,
    };
  }

  const container = CONTAINER_MAP[language];
  const jobId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const jobDir = `${CONTAINER_JOB_ROOT}/${jobId}`;
  const started = Date.now();
  // ── DIAGNOSTICS: container and job paths ─────────────────────────────────
  console.log('Container:', container);
  console.log('Job Directory:', jobDir);

  let tempDir = null;
  try {
    // ── 2. Ensure the container is running (auto-heals stopped/missing ones) ──
    const outcome = await autoStartContainer(dockerBin, container, language);
    console.log(`[Docker] Container ${container} ready (${outcome}).`);

    // ── 3. Create the per-job scratch directory inside the container ──────────
    // Automatically creates CONTAINER_JOB_ROOT first if it is missing.
    await ensureJobDir(dockerBin, container, jobDir);
    console.log(`[Docker] Created/wrote job dir ${jobDir} in ${container}.`);

    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codemerce-'));

    let source = String(code || '');
    if (runnerCode) {
      if (language === 'java' && runnerCode.startsWith('__WRAP_JAVA__')) {
        source = `class Main {\n${source}\n${runnerCode.replace('__WRAP_JAVA__', '')}\n}\n`;
      } else {
        source += `\n\n${runnerCode}\n`;
      }
    }

    if (language === 'c') {
      const localSource = path.join(tempDir, 'main.c');
      await fs.promises.writeFile(localSource, source, 'utf8');
      console.log('Copy Source:', localSource);
      console.log('Copy Destination:', `${container}:${jobDir}/main.c`);
      await dockerCopyIn(dockerBin, container, localSource, `${jobDir}/main.c`);

      const compile = await runProcess(dockerBin, ['exec', container, 'gcc', '-std=c11', '-pipe', `${jobDir}/main.c`, '-o', `${jobDir}/main.out`], '', tempDir, EXEC_TIMEOUT_MS);
      if (compile.code !== 0 || compile.timedOut) {
        return { status: 'compile_error', output: '', compilerOutput: compile.stderr || 'Compilation failed.', executionTimeMs: Date.now() - started };
      }

      const run = await runProcess(dockerBin, ['exec', '-i', container, `${jobDir}/main.out`], input, tempDir, EXEC_TIMEOUT_MS);
      if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
      if (run.code !== 0) return { status: 'runtime_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
      return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    }

    if (language === 'java') {
      const localSource = path.join(tempDir, 'Main.java');
      await fs.promises.writeFile(localSource, source, 'utf8');
      console.log('Copy Source:', localSource);
      console.log('Copy Destination:', `${container}:${jobDir}/Main.java`);
      await dockerCopyIn(dockerBin, container, localSource, `${jobDir}/Main.java`);

      const compile = await runProcess(dockerBin, ['exec', container, 'javac', `${jobDir}/Main.java`, '-d', jobDir], '', tempDir, EXEC_TIMEOUT_MS);
      if (compile.code !== 0 || compile.timedOut) {
        return { status: 'compile_error', output: '', compilerOutput: compile.stderr || 'Compilation failed.', executionTimeMs: Date.now() - started };
      }

      const run = await runProcess(dockerBin, ['exec', '-i', container, 'java', '-cp', jobDir, 'Main'], input, tempDir, EXEC_TIMEOUT_MS);
      if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
      if (run.code !== 0) return { status: 'runtime_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
      return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    }

    // ── Python ────────────────────────────────────────────────────────────────
    const localSource = path.join(tempDir, 'main.py');
    await fs.promises.writeFile(localSource, source, 'utf8');
    console.log('Copy Source:', localSource);
    console.log('Copy Destination:', `${container}:${jobDir}/main.py`);
    await dockerCopyIn(dockerBin, container, localSource, `${jobDir}/main.py`);

    const run = await runProcess(dockerBin, ['exec', '-i', container, 'python3', `${jobDir}/main.py`], input, tempDir, EXEC_TIMEOUT_MS);
    if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
    if (run.code !== 0) return { status: 'compile_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };

  } catch (error) {
    console.error('[Docker] Execution infrastructure failure:', error.message);
    if (error && error.infra) {
      const hint = /not running|No such container|not found/i.test(error.message)
        ? `\n${COMPOSE_START_HINT}` : '';
      return {
        status: 'infrastructure_error',
        output: '',
        compilerOutput: `${error.message}${hint}`,
        executionTimeMs: Date.now() - started,
      };
    }
    throw error;
  } finally {
    // Async cleanup — do not block the response
    if (tempDir) fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => { });
    if (dockerBin && container) {
      runProcess(dockerBin, ['exec', container, 'rm', '-rf', jobDir], '', os.tmpdir(), 5000).catch(() => { });
    }
  }
}

async function executeCode(language, code, input, runnerCode = '') {
  // Dispatch to Docker BEFORE creating a local tempDir (avoids leaked directories)
  if (process.env.USE_DOCKER === 'true') {
    return executeCodeDocker(language, code, input, runnerCode);
  }
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codemerce-'));

  const started = Date.now();
  try {
    let source = String(code || '');
    if (runnerCode) {
      if (language === 'java' && runnerCode.startsWith('__WRAP_JAVA__')) {
        source = `class Main {\n${source}\n${runnerCode.replace('__WRAP_JAVA__', '')}\n}\n`;
      } else {
        source += `\n\n${runnerCode}\n`;
      }
    }

    if (language === 'c') {
      const sourceFile = path.join(tempDir, 'main.c');
      const binaryName = process.platform === 'win32' ? 'main.exe' : 'main.out';
      const binary = path.join(tempDir, binaryName);
      await fs.promises.writeFile(sourceFile, source, 'utf8');
      const gccCmd = process.env.GCC_COMMAND || 'gcc';
      // Prepend mingw64/bin so gcc can find its runtime DLLs on Windows
      const gccExtraPath = process.env.GCC_EXTRA_PATH || (process.platform === 'win32' ? 'C:\\msys64\\mingw64\\bin' : '');
      const gccEnv = gccExtraPath ? { PATH: gccExtraPath + path.delimiter + (process.env.PATH || '') } : {};
      const compile = await runProcess(gccCmd, ['-std=c11', '-pipe', 'main.c', '-o', binaryName], '', tempDir, EXEC_TIMEOUT_MS, gccEnv);
      if (compile.code !== 0 || compile.timedOut) {
        return { status: 'compile_error', output: '', compilerOutput: compile.stderr || 'Compilation failed.', executionTimeMs: Date.now() - started };
      }
      const run = await runProcess(binary, [], input, tempDir, EXEC_TIMEOUT_MS, gccEnv);
      if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
      if (run.code !== 0) return { status: 'runtime_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
      return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    }

    if (language === 'java') {
      const sourceFile = path.join(tempDir, 'Main.java');
      await fs.promises.writeFile(sourceFile, source, 'utf8');
      const javacCmd = process.env.JAVAC_COMMAND || 'javac';
      const javaCmd = process.env.JAVA_COMMAND || 'java';
      const compile = await runProcess(javacCmd, ['Main.java'], '', tempDir);
      if (compile.code !== 0 || compile.timedOut) {
        return { status: 'compile_error', output: '', compilerOutput: compile.stderr || 'Compilation failed.', executionTimeMs: Date.now() - started };
      }
      const run = await runProcess(javaCmd, ['-cp', tempDir, 'Main'], input, tempDir);
      if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
      if (run.code !== 0) return { status: 'runtime_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
      return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    }

    const sourceFile = path.join(tempDir, 'main.py');
    await fs.promises.writeFile(sourceFile, source, 'utf8');
    const configuredPython = process.env.PYTHON_COMMAND;
    const pythonCommand = configuredPython || (process.platform === 'win32' ? 'py' : 'python3');
    const pythonArgs = (configuredPython || process.platform !== 'win32') ? [sourceFile] : ['-3', sourceFile];
    let run = await runProcess(pythonCommand, pythonArgs, input, tempDir);
    if (!configuredPython && process.platform === 'win32' && run.code === -1) {
      run = await runProcess('python', [sourceFile], input, tempDir);
    }
    if (run.timedOut) return { status: 'runtime_error', output: run.stdout, compilerOutput: 'Execution timed out.', executionTimeMs: Date.now() - started };
    if (run.code !== 0) return { status: 'compile_error', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
    return { status: 'compiled', output: run.stdout, compilerOutput: run.stderr, executionTimeMs: Date.now() - started };
  } finally {
    fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => { });
  }
}

// ======================================================
// SUBMISSION — compile, run, compare, score, unlock
// ======================================================
app.post('/api/submissions', requireRole('team'), async (req, res) => {
  const { questionId, language, code } = req.body;
  if (!validLanguage(language) || !code || !questionId) return res.status(400).json({ error: 'Question, language and code are required.' });
  const qid = Number(questionId);
  if (!Number.isInteger(qid)) return res.status(400).json({ error: 'Invalid question ID.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [teamRows] = await conn.execute(`SELECT * FROM teams WHERE id=? FOR UPDATE`, [req.auth.id]);
    if (!teamRows.length) throw Object.assign(new Error('Team not found.'), { statusCode: 404 });
    const team = teamRows[0];
    if (team.status !== 'approved') throw Object.assign(new Error('Your team is not approved.'), { statusCode: 403 });
    if (!team.selected_language || team.selected_language !== String(language).toLowerCase()) throw Object.assign(new Error('Language does not match the locked team language.'), { statusCode: 409 });

    const order = Number(team.current_question_order || 1);
    const expectedSet = order <= 6 ? Number(team.assigned_set) : 0;
    const [qRows] = await conn.execute(
      `SELECT id,title,difficulty,language,question_set,question_order,points,test_input,expected_output,runner_code
       FROM questions WHERE id=? AND language=? AND question_set=? AND question_order=? LIMIT 1`,
      [qid, String(language).toLowerCase(), expectedSet, order]
    );
    if (!qRows.length) throw Object.assign(new Error('This question is not unlocked.'), { statusCode: 409 });
    const question = qRows[0];

    await conn.commit();

    const result = await executeCode(language, code, question.test_input || '', question.runner_code || '');
    // ── DIAGNOSTICS: log the ACTUAL value the compiler/judge returned ──────────
    console.log('Compilation Status:', result.status);
    console.log('Execution Result:', {
      status: result.status,
      output: String(result.output || '').slice(0, 500),
      compilerOutput: String(result.compilerOutput || '').slice(0, 500),
      executionTimeMs: result.executionTimeMs
    });

    const normalizedActual = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(question.expected_output);
    const correct = result.status === 'compiled' && normalizedActual === normalizedExpected;
    const finalStatus = result.status === 'compile_error' ? 'compile_error'
      : result.status === 'runtime_error' ? 'runtime_error'
      : result.status === 'infrastructure_error' ? 'runtime_error'
      : correct ? 'correct' : 'wrong_answer';

    // ── SANITIZE every status before it touches the database ──────────────────
    // Critical fix for "Data truncated for column 'compilation_status'".
    // 'infrastructure_error' (Docker/compiler host down) is NOT a value the
    // legacy ENUM accepts, so it is clamped to 'runtime_error' here. Every
    // unexpected status is also clamped so a valid program can NEVER crash
    // the write, regardless of whether the VARCHAR migration has run yet.
    const safeCompilationStatus = sanitizeCompilationStatus(result.status);
    const safeSubmissionStatus = sanitizeSubmissionStatus(finalStatus);
    const score = correct ? 1 : 0;

    const submissionPayload = {
      team_id: req.auth.id,
      question_id: qid,
      language: String(language).toLowerCase(),
      code: String(code),
      output: String(result.output || ''),
      score,
      status: safeSubmissionStatus,
      compilation_status: safeCompilationStatus,
      execution_time_ms: result.executionTimeMs,
      compiler_output: result.compilerOutput || null
    };
    console.log('Database Insert Payload:', {
      ...submissionPayload,
      code: String(submissionPayload.code).slice(0, 200),
      output: String(submissionPayload.output).slice(0, 200)
    });

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
        [submissionPayload.team_id, submissionPayload.question_id, submissionPayload.language, submissionPayload.code,
         submissionPayload.output, submissionPayload.score, submissionPayload.status,
         submissionPayload.compilation_status, submissionPayload.execution_time_ms, submissionPayload.compiler_output]
      );

      if (stillUnlocked && correct) {
        const next = nextOrderAfter(order);
        await conn2.execute(
          `UPDATE teams SET current_question_order=?, last_submission_at=NOW(), last_compilation_status=? WHERE id=?`,
          [next, sanitizeCompilationStatus('correct'), req.auth.id]
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
          [sanitizeCompilationStatus(finalStatus), req.auth.id]
        );
        await conn2.execute(
          `INSERT INTO leaderboard(team_id,total_score,solved_count,penalty_seconds)
           VALUES(?,0,0,0) ON DUPLICATE KEY UPDATE team_id=team_id`,
          [req.auth.id]
        );
      }
      await conn2.commit();
    } catch (error) {
      try { await conn2.rollback(); } catch { }
      // ── Proper JSON error (never a raw crash) ────────────────────────────────
      console.error('Submission database write failed:', { error: error.message, payload: submissionPayload });
      const isTruncation = !!(error && (error.code === 'ER_DATA_TOO_LONG' || String(error.message || '').includes('Data truncated')));
      if (isTruncation) {
        // ── LAST-RESORT SAFE INSERT ────────────────────────────────────────────
        // Even with the VARCHAR schema + DB-safe sanitizers this branch exists so
        // a valid submission is never lost to the user: write a fully DB-safe
        // row (legacy-ENUM-compatible statuses, truncated text fields) so the
        // submission history is preserved and the API returns a clean JSON body.
        console.log('[Submission] Truncation detected — retrying with fully DB-safe values.');
        try {
          const conn3 = await pool.getConnection();
          try {
            await conn3.execute(
              `INSERT INTO submissions(team_id,question_id,language,code,output,score,status,compilation_status,execution_time_ms,compiler_output,submitted_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
              [
                submissionPayload.team_id,
                submissionPayload.question_id,
                submissionPayload.language,
                String(submissionPayload.code || '').slice(0, 4000000),
                String(submissionPayload.output || '').slice(0, 4000000),
                0,
                sanitizeSubmissionStatus('wrong_answer'),
                sanitizeCompilationStatus('runtime_error'),
                Number(submissionPayload.execution_time_ms) || 0,
                String(submissionPayload.compiler_output || '').slice(0, 4000000)
              ]
            );
            console.log('[Submission] Persisted with DB-safe fallback values.');
          } finally {
            conn3.release();
          }
          return res.status(200).json({
            success: true,
            correct: false,
            score: 0,
            status: 'wrong_answer',
            compilationStatus: result.status,
            compilationStatusStored: 'runtime_error',
            output: String(result.output || ''),
            compilerOutput: String(result.compilerOutput || ''),
            expectedOutput: question.expected_output,
            currentLevel: levelFromOrder(order),
            unlockedNext: false,
            fallback: true,
            message: `A database status-rejection was detected and auto-repaired. Your submission was recorded. (${error.message})`
          });
        } catch (fallbackError) {
          console.error('Submission fallback insert failed:', { error: fallbackError.message });
          return res.status(500).json({
            error: 'Unable to save the submission.',
            details: `${error.message}${fallbackError.message ? ' | ' + fallbackError.message : ''}`
          });
        }
      }
      throw error;
    } finally {
      conn2.release();
    }

    const newOrder = correct ? nextOrderAfter(order) : order;
    res.json({
      success: true,
      correct,
      score,
      status: safeSubmissionStatus,
      compilationStatus: result.status,
      compilationStatusStored: safeCompilationStatus,
      output: result.output || '',
      compilerOutput: result.compilerOutput || '',
      expectedOutput: question.expected_output,
      currentLevel: levelFromOrder(newOrder),
      unlockedNext: correct,
      message: correct ? 'Correct answer! Next level unlocked.'
        : result.status === 'compile_error' ? 'Compilation failed.'
        : result.status === 'runtime_error' ? 'Runtime error.'
        : result.status === 'infrastructure_error' ? 'Code execution service unavailable.'
        : 'Wrong answer.'
    });
  } catch (error) {
    try { await conn.rollback(); } catch { }
    console.error('Submission processing error:', error);
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
    const allowed = ['copy_paste', 'right_click', 'tab_switch', 'window_blur', 'fullscreen_exit', 'minimize', 'window_change'];
    const { violationType, reason = '', details = '' } = req.body;
    if (!allowed.includes(violationType)) return res.status(400).json({ error: 'Invalid violation.' });
    await pool.execute(`INSERT INTO violations(team_id,reason,violation_type,details) VALUES(?,?,?,?)`, [req.auth.id, String(reason).slice(0, 255), String(violationType), String(details)]);
    res.json({ success: true, message: 'Violation recorded.' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to record violation.' });
  }
});

// ======================================================
// 404 HANDLER — catches every unmatched route
// ======================================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'This route does not exist on the Codemerce backend. See /api/health for service status.'
  });
});

// ======================================================
// ROUTE INSPECTOR — prints every registered route
// ======================================================
function listRegisteredRoutes() {
  const routes = [];
  const stack = app._router.stack;
  stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase());
      routes.push(`${methods.join(',')} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      layer.handle.stack.forEach((inner) => {
        if (inner.route) {
          const methods = Object.keys(inner.route.methods)
            .filter((m) => inner.route.methods[m])
            .map((m) => m.toUpperCase());
          routes.push(`${methods.join(',')} ${layer.regexp ? layer.regexp.source : inner.route.path}`);
        }
      });
    }
  });
  return routes;
}

app.listen(PORT, async () => {
  console.log('══════════════════════════════════════════════════════════');
  console.log('  INNOV8\'26 CODEMERCE  —  Backend Startup');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Backend URL   : http://localhost:${PORT}`);
  console.log(`  Port          : ${PORT}`);
  console.log(`  Environment   : ${process.env.NODE_ENV || 'development'}`);

  // Database status
  try {
    const [[databaseRow]] = await pool.query('SELECT DATABASE() AS database_name');
    const [[healthRow]] = await pool.query('SELECT 1 AS ok');
    if (databaseRow.database_name !== process.env.DB_NAME || Number(healthRow.ok) !== 1) {
      throw new Error(`Database startup check failed for ${databaseRow.database_name || 'unknown database'}.`);
    }
    console.log(`  Database      : VERIFIED → ${databaseRow.database_name} (host ${process.env.DB_HOST})`);
  } catch (error) {
    console.error('  Database      : FAILED →', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      message: error.message
    });
  }

  // Schema self-heal — widens any legacy ENUM status columns so submissions
  // can never be rejected with "Data truncated for column 'compilation_status'".
  try {
    const schemaResults = await ensureStatusColumnsRobust();
    console.log('  Schema        : status columns verified (self-heal)');
    schemaResults.forEach((line) => console.log(`                  ${line}`));
  } catch (error) {
    console.error('  Schema        : self-heal skipped →', error.message);
  }

  // Docker status
  if (process.env.USE_DOCKER === 'true') {
    console.log(`  Docker        : USE_DOCKER=true (checking availability…)`);
    checkDockerHealth().then(async ok => {
      if (ok) {
        console.log('[Docker] Code execution will use Docker containers');
        console.log('[Docker] Validating compiler containers…');
        const bin = await resolveDockerBin();
        if (bin) {
          for (const [lang, name] of Object.entries(CONTAINER_MAP)) {
            try {
              const outcome = await autoStartContainer(bin, name, lang);
              await ensureJobRoot(bin, name);
              console.log(`[Docker]   ${name} (${lang}) → ${outcome} — job root ${CONTAINER_JOB_ROOT} ready`);
            } catch (e) {
              console.error(`[Docker]   ${name} (${lang}) → FAILED: ${e.message}`);
            }
          }
        }
      } else {
        console.error('[Docker] USE_DOCKER=true but Docker is not available!');
        console.error('[Docker] Install Docker Desktop or set USE_DOCKER=false in .env to use local compilers.');
      }
    });
  } else {
    console.log(`  Docker        : disabled (USE_DOCKER=false)`);
    console.log('[Compiler] Using local compilers.');
    console.log(`[Compiler]   C   → ${process.env.GCC_COMMAND || 'gcc'}`);
    console.log(`[Compiler]   Java → ${process.env.JAVAC_COMMAND || 'javac'} / ${process.env.JAVA_COMMAND || 'java'}`);
    console.log(`[Compiler]   Py  → ${process.env.PYTHON_COMMAND || (process.platform === 'win32' ? 'py' : 'python3')}`);
  }

  // Registered routes
  console.log('  Registered Routes:');
  listRegisteredRoutes().forEach((route) => console.log(`    - ${route}`));
  console.log('══════════════════════════════════════════════════════════');
});

// Trigger reload

