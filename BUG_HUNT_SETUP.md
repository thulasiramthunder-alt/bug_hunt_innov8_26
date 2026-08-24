# CODEMERCE Bug Hunt Upgrade

This update keeps the existing CODEMERCE routes, authentication, UI theme, admin control room and database architecture, and adds the Bug Hunt competition flow.

## Database

Run these scripts in order against the existing `codemerce` database:

1. `Database/bug_hunt_migration.sql`
2. `Database/bug_hunt_seed.sql`

The seed replaces only the Bug Hunt question-bank records (`question_set` 0–3) and their related submissions. It does not delete unrelated application tables.

## Question bank

The three independent sets are sourced from the uploaded documents:

- Set 1: `BugHunt_Questions_Corrected.docx`
- Set 2: `Bug_hunt_Set-2.docx`
- Set 3: `Bug_Hunt_Set3.docx`
- Tie breaker: `TIE BREAKER.docx`

Each language has 2 Easy + 2 Medium + 2 Hard questions. The tie breaker is a single shared problem per language and is not assigned to a set.

The corrected-question document did not provide sample input/expected-output pairs, so deterministic judge inputs were added for those six problems. The Set 3 phone-directory problem also did not provide a concrete sample pair; a deterministic judge sample and execution harness were added so the supplied method-only Java/Python source and malformed C starter can still be judged after the participant fixes it.

## Runtime requirements

The backend executes submissions with:

- C: `gcc`
- Java: `javac` + `java`
- Python: `python3` (override with `PYTHON_COMMAND` if required)

For production deployment, run the compiler/executor in an isolated container or sandbox. The current implementation keeps the project dependency-free and applies a process timeout/output limit, but arbitrary code execution should not share a privileged production host.

## Participant flow

Registration → immutable language selection → admin approval → fullscreen Bug Hunt → fixed random question set → sequential Easy/Medium/Hard questions → tie breaker → completion.

A successful submission receives exactly 1 point and advances the server-side question order. The client cannot skip or select a later question because the backend exposes only the currently unlocked question.
