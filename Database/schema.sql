CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(120) NOT NULL UNIQUE,
  leader_name VARCHAR(120) NOT NULL,
  leader_batch VARCHAR(50) NOT NULL,
  leader_email VARCHAR(160) NOT NULL,
  member1_name VARCHAR(120) NOT NULL,
  member1_batch VARCHAR(50) NOT NULL,
  member1_email VARCHAR(160) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year VARCHAR(20) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_team_status(status)
  , INDEX idx_team_department_year(department, year)
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('easy','medium','hard','debug') NOT NULL DEFAULT 'easy',
  language ENUM('python','java','c') NOT NULL,
  starter_code TEXT NOT NULL,
  expected_output TEXT NULL,
  max_score INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  question_id INT NOT NULL,
  language ENUM('python','java','c') NOT NULL,
  code LONGTEXT NOT NULL,
  output TEXT NULL,
  score INT NOT NULL DEFAULT 0,
  status ENUM('submitted','correct','wrong','wrong_answer','compile_error','runtime_error','debug_pass') NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_submission_team(team_id),
  INDEX idx_submission_question(question_id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL UNIQUE,
  total_score INT NOT NULL DEFAULT 0,
  solved_count INT NOT NULL DEFAULT 0,
  penalty_seconds INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  reason VARCHAR(255) NULL,
  violation_type ENUM('copy_paste','right_click','tab_switch','window_blur','fullscreen_exit','minimize','window_change') NOT NULL,
  details VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_violation_team(team_id)
);

INSERT INTO admins (username, password_hash)
SELECT 'admin', '$2a$10$HZTKmxYy6nWh2Jif4rFiceteiLKsWsWTfDevSebejyPd5PaY5iCj6'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username='admin');

INSERT INTO questions(title,description,difficulty,language,starter_code,expected_output,max_score)
SELECT 'Reverse a String','Reverse the input text.','easy','python','def solve(s):\n    return s[::-1]\n\n# Example: solve("code")','edoc',10
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE title='Reverse a String' AND language='python');

INSERT INTO questions(title,description,difficulty,language,starter_code,expected_output,max_score)
SELECT 'Reverse a String','Reverse the input text.','easy','java','class Main {\n  static String solve(String s) {\n    return new StringBuilder(s).reverse().toString();\n  }\n}','edoc',10
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE title='Reverse a String' AND language='java');

INSERT INTO questions(title,description,difficulty,language,starter_code,expected_output,max_score)
SELECT 'Reverse a String','Reverse the input text.','easy','c','#include <stdio.h>\n#include <string.h>\nint main(void) {\n  char s[101];\n  scanf("%100s", s);\n  int n = (int)strlen(s);\n  for(int i=n-1;i>=0;i--) putchar(s[i]);\n  return 0;\n}','edoc',10
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE title='Reverse a String' AND language='c');

INSERT INTO questions(title,description,difficulty,language,starter_code,expected_output,max_score)
SELECT 'Fix the Bug','Debug the starter code so the answer becomes 42.','debug','python','value = 40\nvalue += 1\n# Fix the bug\nprint(value)','42',15
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE title='Fix the Bug');
