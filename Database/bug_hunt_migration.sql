USE defaultdb;

-- ============================================================================
-- CODEMERCE bug-hunt migration — status columns are VARCHAR, never ENUM.
-- ENUM status columns are the root cause of:
--   "Data truncated for column 'compilation_status' at row 1"
-- The judge pipeline emits statuses (e.g. 'infrastructure_error') that are
-- not ENUM members, so MySQL STRICT mode blocks the INSERT. VARCHAR columns
-- store any status string without truncation. This file is the canonical
-- migration; Database/repair_compilation_status.sql heals a live database.
-- ============================================================================

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS leader_batch VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS leader_email VARCHAR(160) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS department VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS year VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS selected_language ENUM('c','python','java') NULL,
  ADD COLUMN IF NOT EXISTS assigned_set TINYINT NULL,
  ADD COLUMN IF NOT EXISTS current_question_order TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS debug_started_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS last_submission_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS last_compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run';

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_set TINYINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS question_order TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS points INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS solution_code LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS test_input LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS expected_output LONGTEXT NULL;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS execution_time_ms INT NULL,
  ADD COLUMN IF NOT EXISTS compiler_output TEXT NULL;

-- CRITICAL FIX: guarantee the column type regardless of what the previous
-- version of this migration created. 'infrastructure_error' and every other
-- judge value must be storable.
ALTER TABLE submissions
  MODIFY COLUMN compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run';

-- The execution/verification status column gets the same guarantee.
ALTER TABLE submissions
  MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'submitted';

-- teams.last_compilation_status must mirror the same guarantee.
ALTER TABLE teams
  MODIFY COLUMN last_compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run';

-- Widening output columns avoids secondary truncation when a valid program
-- prints more than 64 KB.
ALTER TABLE submissions
  MODIFY COLUMN output LONGTEXT NULL,
  MODIFY COLUMN compiler_output LONGTEXT NULL;

CREATE INDEX idx_questions_set_language_order
  ON questions(language, question_set, question_order);

CREATE INDEX idx_teams_language_set
  ON teams(selected_language, assigned_set);

CREATE INDEX idx_teams_department_year
  ON teams(department, year);

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS runner_code LONGTEXT NULL;

-- NOTE: submissions.status is left as VARCHAR(50). Do NOT re-apply an ENUM
-- definition here — it is exactly what produced the truncation error.