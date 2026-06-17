# 📋 TaskFlow

> Full-stack task management app · MERN Stack · JWT Auth · Kanban · Dark/Light mode

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite)](https://vitejs.dev)

---

## 🖥 Live Demo

Open **`TaskFlow.html`** directly in Chrome — no install, no build step needed.  
Or run the full-stack app locally (see setup below).

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🔐 Auth | JWT register / login / logout · 7-day tokens · auto-logout on expiry |
| 🌙 Dark / Light | One-toggle animated theme switch across every screen |
| 🗂 Kanban board | 3 columns · card hover glow · click-to-expand actions |
| ⚡ Quick add | Type directly in a column, press Enter |
| 🎯 4-level priority | Urgent · High · Medium · Low |
| 🏷 Smart tags | Work · Personal · Bug · Feature · Design · Research |
| ✅ Subtasks | Add, tick off, delete · auto progress bar |
| 📌 Pin tasks | Star important tasks; dedicated Pinned view |
| 🔍 Search & filter | Real-time search + filter by priority and tag |
| ☰ List view | Full table: status, priority, tags, progress, due date |
| 📊 Analytics | Status bar chart, priority bars, tag distribution, summary stats |
| 📅 Overdue detection | Past due dates turn red with a ⚠ warning |

---

## 🗂 Project Structure

```
Taskflow/
├── TaskFlow.html              ← Standalone demo (open in browser instantly)
├── README.md
├── .gitignore
│
├── backend/                   ← Node.js + Express REST API
│   ├── server.js
│   ├── .env.example
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       └── tasks.js
│
└── frontend/                  ← React 18 + Vite SPA
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── Landing.jsx + Landing.module.css
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx + Dashboard.module.css
        │   └── Auth.module.css
        └── components/
            ├── TaskCard.jsx + TaskCard.module.css
            └── TaskModal.jsx + TaskModal.module.css
```

---

## 🛠 Tech Stack

**Backend**  
- Node.js + Express.js  
- MongoDB + Mongoose  
- JSON Web Tokens (JWT)  
- bcryptjs (password hashing)  

**Frontend**  
- React 18  
- Vite  
- React Router v6  
- Axios  
- CSS Modules  

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

### 1. Clone the repo

```bash
git clone https://github.com/LuckyCoder07/Taskflow.git
cd Taskflow
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskflow
JWT_SECRET=your_super_secret_string_min_32_chars
FRONTEND_URL=http://localhost:5173
```

### 3. Install & run

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Open **http://localhost:5173** ✅

---

## 🌐 API Reference

> All `/api/tasks` routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login`    | `{ email, password }` |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/tasks`      | Get all tasks (current user) |
| POST   | `/api/tasks`      | Create a task |
| PUT    | `/api/tasks/:id`  | Update a task |
| DELETE | `/api/tasks/:id`  | Delete a task |

Optional query params: `?status=todo`, `?priority=high`, `?tag=Bug`, `?pinned=true`

---

## ☁️ Deployment

### Backend → [Render](https://render.com)
1. New Web Service → connect repo → Root: `backend`
2. Build: `npm install` · Start: `node server.js`
3. Add all `.env` values as environment variables

### Frontend → [Vercel](https://vercel.com)
1. Import repo → Root: `frontend`
2. Add env var: `VITE_API_URL=https://your-app.onrender.com`
3. In `src/api/axios.js`, set `baseURL: import.meta.env.VITE_API_URL + '/api'`

---

## 👨‍💻 Author

**Lakshit** · CS Student · PCCOE, Pune  
GitHub: [@LuckyCoder07](https://github.com/LuckyCoder07)
