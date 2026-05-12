# 📘 Document Tracker – Team Guide

Welcome to the **Document Tracker** project. This guide explains how to set up, edit, troubleshoot, and contribute to the project.

---

## 🔄 README_Setup

### 1. Clone the repository
```bash
git clone https://github.com/bxlionelle/document-tracker.git
cd document-tracker

2. Install dependencies
- Frontend (React/Vite)  
  Clean old dependencies:

go to powershell:
    Remove-Item -Recurse -Force frontend\node_modules
    Remove-Item -Force frontend\package-lock.json

Then reinstall inside Docker:

go to bash:
    docker compose run --rm frontend npm install

- Backend (Laravel)  
   Dependencies are installed automatically inside the backend container.

3. Run the application
go to bash:
    docker compose up -d

- Services:
    Frontend → http://localhost:3000

    Backend → http://localhost:8000

    Database (MySQL) → localhost:3307 (SQL only, not browser)