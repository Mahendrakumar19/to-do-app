# To-Do List App (MERN)

A responsive to-do app with weekly organization. Tasks are grouped into Monday–Sunday weeks, and each week card shows its open and completed counts.

## Features
- Create, edit, delete tasks (title, description, date & time, priority Low/Medium/High)
- Weekly cards (Mon–Sun) with open/completed counts and a progress bar
- Tap a week card to expand and view its tasks
- Mark tasks Completed / In Progress (updates the week card)
- Search by title or description, with view/edit/delete on results
- Swipe left on a task (or tap its Delete button) to delete

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (local or Atlas)
- **Tests:** Jest, Supertest, mongodb-memory-server

## Project Structure
```
todo-app/
├── server/
│   ├── src/
│   │   ├── app.js            # Express app (no DB connection, testable)
│   │   ├── index.js          # Connects to MongoDB and starts the server
│   │   ├── models/Task.js    # Task schema, computes weekKey on save
│   │   ├── routes/tasks.js   # REST endpoints
│   │   └── utils/            # week.js (Mon–Sun logic), validate.js
│   └── tests/                # Unit + API tests
└── client/
    └── src/
        ├── App.jsx           # Home screen, search, week cards
        ├── api.js            # API client
        ├── components/       # TaskForm, TaskItem
        └── lib/week.js       # Date/week formatting helpers
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend
```bash
cd server
cp .env.example .env        # set MONGODB_URI
npm install
npm run dev                 # http://localhost:5000
```

> **Your Atlas connection string is already configured** in `server/.env`:
> `mongodb+srv://mahendrakumaruohyd_db_user:0vz9M7Fhu4EmBEcl@cluster0.exn1qgc.mongodb.net/todo-app`

### 2. Frontend
```bash
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

## API

Base path: `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks. Optional query: `q` (search), `weekKey`, `status` |
| GET | `/api/tasks/weeks` | Weekly summaries: `[{ weekKey, open, completed }]` |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update any field (partial updates allowed) |
| DELETE | `/api/tasks/:id` | Delete task (204) |

Example create:
```json
POST /api/tasks
{ "title": "Submit report", "description": "Q3 numbers", "dueAt": "2026-11-12T10:00", "priority": "High" }
```
Response (201):
```json
{ "_id": "...", "title": "Submit report", "dueAt": "2026-11-12T04:30:00.000Z", "priority": "High", "status": "In Progress", "weekKey": "2026-11-09", ... }
```

Validation errors return `400` with `{ "errors": { "title": "Title is required" } }`.

## Week Logic
Weeks run Monday to Sunday. `weekKey` is the local Monday's date (`YYYY-MM-DD`). For example, Sunday 8 Nov 2026 belongs to the week keyed `2026-11-02`, and Monday 9 Nov starts `2026-11-09`. The key is recomputed whenever a task's date changes.

## Testing
```bash
cd server
npm test
```
- `tests/week.test.js`: unit tests for week boundaries
- `tests/tasks.api.test.js`: integration tests for CRUD, validation, search, and week counts. These use an in-memory MongoDB, so no database is needed. The first run downloads a MongoDB binary.

## Deployment
- **Frontend (Netlify):** Build command `npm run build`, publish directory `dist`, base directory `client`. Set env var `VITE_API_URL` to your deployed backend URL (no trailing slash).
- **Backend:** Deploy `server` to Render, Railway, or similar. Set `MONGODB_URI` and `PORT`. Allow your Netlify origin in CORS if you restrict it.

## Known Limitations / Next Steps
- No authentication: all tasks are shared. Per-user accounts would be the next step.
- Status toggling and search use simple list refreshes rather than optimistic updates.
- The UI follows the spec's flows and layout but was not pixel-matched to the Figma file. Adjust Tailwind classes to match exact spacing and colors.
- Add E2E tests (Playwright) and drag-to-reschedule across weeks as future improvements.
