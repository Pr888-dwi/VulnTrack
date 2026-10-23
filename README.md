# VulnTrack 🔐

A Vulnerability Management Dashboard built with FastAPI, React, and SQLite to track, manage, and monitor security vulnerabilities.

## Features

- Create and manage vulnerability records
- Track severity: Critical, High, Medium, and Low
- Monitor status: Open, In Progress, and Resolved
- Search vulnerabilities by title, description, or affected asset
- Filter vulnerabilities by severity and status
- Update vulnerability status
- Delete vulnerability records
- Persistent storage using SQLite
- Interactive dashboard with summary statistics

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Python, FastAPI, SQLAlchemy

**Database:** SQLite

**API Documentation:** Swagger UI

## Project Structure

```text
VulnTrack/
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── db_models.py
│       └── models.py
├── frontend/
│   └── src/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js and npm

### 1. Clone the repository

```bash
git clone https://github.com/Pr888-dwi/VulnTrack.git
cd VulnTrack
```

### 2. Set up the backend

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install fastapi uvicorn sqlalchemy
```

Start the backend from the project root:

```powershell
python -m uvicorn app.main:app --reload --app-dir backend
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/health` | Health check |
| POST | `/vulnerabilities` | Create a vulnerability |
| GET | `/vulnerabilities` | List and filter vulnerabilities |
| GET | `/vulnerabilities/{id}` | Get a vulnerability |
| PATCH | `/vulnerabilities/{id}/status` | Update vulnerability status |
| DELETE | `/vulnerabilities/{id}` | Delete a vulnerability |

## Purpose

VulnTrack is a learning project demonstrating vulnerability tracking, REST API development, database integration, and frontend-backend communication.

## Author

**Pr888-dwi**

---

If you find this project useful, consider giving the repository a star!
