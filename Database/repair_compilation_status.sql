-- ============================================================================
-- CODEMERCE — CRITICAL REPAIR: "Data truncated for column 'compilation_status'"
-- ============================================================================
-- ROOT CAUSE
--   submissions.compilation_status and teams.last_compilation_status were
--   defined as
--     ENUM('not_run','compiled','compile_error','runtime_error',
--          'wrong_answer','correct')
--   The judge/compiler pipeline (executeCode / executeCodeDocker) returns
--   statuses such as 'infrastructure_error' that are NOT members of that ENUM.
--   Under MySQL STRICT SQL mode the INSERT is aborted with:
--     Data truncated for column 'compilation_status' at row 1
--
-- FIX (preferred)
--   Convert every status column to VARCHAR so ANY status string produced by a
--   valid submission can be stored without truncation or STRICT-mode rejection.
--
-- FIX (if an ENUM is truly required)
--   The extended ENUM below is commented out. Use it ONLY if a business rule
--   forbids VARCHAR. If you keep any ENUM you MUST extend it to cover every
--   value the pipeline can emit, at minimum:
--     Accepted, Wrong Answer, Compilation Error, Runtime Error,
--     Time Limit Exceeded, Memory Limit Exceeded, Success, Failed,
--     Pending, Judging, Internal Error
--   (Match your application's spelling/format exactly.)
--
-- Idempotent: safe to run multiple times. Only MODIFY COLUMN is used because
-- every status column already exists in the live schema.
-- Run with:  mysql -h <host> -P <port> -u <user> -p < Database\repair_compilation_status.sql
-- ============================================================================

USE defaultdb;

-- 1) submissions.compilation_status — the column named in the error.
ALTER TABLE submissions
  MODIFY COLUMN compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run';

-- 2) submissions.status — accept every verification/execution status too.
ALTER TABLE submissions
  MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'submitted';

-- 3) teams.last_compilation_status — mirror of the same status on the team row.
ALTER TABLE teams
  MODIFY COLUMN last_compilation_status VARCHAR(100) NOT NULL DEFAULT 'not_run';

-- 4) Widening output columns removes the secondary "Data truncated for column
--    'output'/'compiler_output'" risk when a valid program prints ~64KB+.
ALTER TABLE submissions
  MODIFY COLUMN output LONGTEXT NULL,
  MODIFY COLUMN compiler_output LONGTEXT NULL;

-- 5) Register the same finder guarantee for the "if ENUM is required" option.
--    The extended ENUM below replaces the three VARCHAR MODIFY statements ONLY
--    if your team decides that schema must keep ENUMs:
--
--    ALTER TABLE submissions
--      MODIFY COLUMN compilation_status ENUM('not_run','compiled','compile_error',
--        'runtime_error','wrong_answer','correct','infrastructure_error',
--        'accepted','wrong_answer_label','success','failed','pending','judging',
--        'internal_error','Internal Error') NOT NULL DEFAULT 'not_run';
--    ALTER TABLE submissions
--      MODIFY COLUMN status ENUM('submitted','correct','wrong','wrong_answer',
--        'compile_error','runtime_error','debug_pass','internal_error',
--        'Internal Error') NOT NULL DEFAULT 'submitted';
--    ALTER TABLE teams
--      MODIFY COLUMN last_compilation_status ENUM('not_run','compiled',
--        'compile_error','runtime_error','wrong_answer','correct',
--        'infrastructure_error','internal_error','Internal Error')
--        NOT NULL DEFAULT 'not_run';
--    -- then RE-ADD the VARCHAR fix ONLY after the application pipeline is
--    -- guaranteed to emit only the values above.

-- 6) Diagnostics — confirm the final column definitions.
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema = 'defaultdb'
  AND table_name IN ('submissions', 'teams')
  AND column_name IN ('compilation_status', 'status', 'last_compilation_status', 'output', 'compiler_output')
ORDER BY table_name, column_name;

-- 7) Show any rows that were previously truncated/mangled by the ENUM so the
--    data can be reviewed (the ENUM stores '' for rejected values in
--    non-strict mode, or the write was blocked entirely in strict mode).
SELECT id, team_id, question_id, status, compilation_status, submitted_at
FROM submissions
WHERE compilation_status = '' OR compilation_status IS NULL OR status = '' OR status IS NULL
ORDER BY id DESC;