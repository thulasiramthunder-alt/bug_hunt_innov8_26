# INNOV8'26 — CODEMERCE

Roadmap-style replacement project for the old Codemese codebase.

## 1. Install
Backend:
```bash
cd Backend/server
npm install
```

Frontend:
```bash
cd Frontend/client
npm install
```

## 2. Database
Create/import `Database/schema.sql` in MySQL.

## 3. Environment
Copy `Backend/server/.env.example` to `.env` and set the MySQL/JWT values.

## 4. Run
Backend:
```bash
npm run dev
```
Frontend:
```bash
npm run dev
```

Default frontend API URL is `http://localhost:5000`.

## Admin
The SQL file creates an `admin` account with a bcrypt password hash. Change the hash/password before production use.

## Important security note
The browser can detect common cheating events, but it cannot guarantee a full operating-system lock. The server also does not execute arbitrary submitted code. For real auto-judging, connect a properly isolated sandbox/code-execution service (container/VM with strict CPU, memory, filesystem and network limits).
