USE defaultdb;

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
  ADD COLUMN IF NOT EXISTS last_compilation_status ENUM('not_run','compiled','compile_error','runtime_error','wrong_answer','correct') NOT NULL DEFAULT 'not_run';

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_set TINYINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS question_order TINYINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS points INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS solution_code LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS test_input LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS expected_output LONGTEXT NULL;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS compilation_status ENUM('not_run','compiled','compile_error','runtime_error','wrong_answer','correct') NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS execution_time_ms INT NULL,
  ADD COLUMN IF NOT EXISTS compiler_output TEXT NULL;

CREATE INDEX idx_questions_set_language_order
  ON questions(language, question_set, question_order);

CREATE INDEX idx_teams_language_set
  ON teams(selected_language, assigned_set);

CREATE INDEX idx_teams_department_year
  ON teams(department, year);

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS runner_code LONGTEXT NULL;

ALTER TABLE submissions
  MODIFY COLUMN status ENUM('submitted','correct','wrong','wrong_answer','compile_error','runtime_error','debug_pass') NOT NULL DEFAULT 'submitted';
