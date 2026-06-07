# 📘 Document Tracker

**Document Tracker** is a full‑stack application designed to streamline the management, tracking, and organization of documents.  
It provides a modern **React/Vite frontend** for user interaction, a robust **Laravel backend** for business logic and APIs, and a **MySQL database** for secure storage — all orchestrated with **Docker Compose** for reproducible deployment.

## ✨ Key Features
- 📂 **Frontend (React/Vite)** – clean UI for document submission, search, and tracking.  
- ⚙️ **Backend (Laravel)** – handles authentication, document workflows, and API endpoints.  
- 🗄️ **Database (MySQL)** – stores document metadata and tracking information.  
- 🐳 **Dockerized setup** – ensures cross‑platform reproducibility and easy team collaboration.  
- 🔧 **Modular design** – frontend and backend separated for clarity and maintainability.  

## 🎯 Purpose
This project was built to:
- Help teams **track documents efficiently** across workflows.  
- Provide a **panel‑friendly, reproducible architecture** for academic and professional use.  
- Serve as a **capstone project** demonstrating hybrid deployment, modular coding, and clear documentation practices.  

## 🚀 Tech Stack
- **Frontend:** React + Vite  
- **Backend:** Laravel (PHP)  
- **Database:** MySQL 8.0  
- **Containerization:** Docker Compose  



# Quick Commands
Setup & Updates
Clone repo: git clone https://github.com/bxlionelle/document-tracker.git

Pull latest code: git pull origin main

Database Management
Run migrations: docker exec -it doctracker_backend php artisan migrate

Seed database: docker exec -it doctracker_backend php artisan db:seed

Reset schema: docker exec -it doctracker_backend php artisan migrate:fresh --seed

Logs & Monitoring
Check backend logs: docker logs doctracker_backend

Check frontend logs: docker logs doctracker_frontend

Check database logs: docker logs doctracker_db
# Document-Tracking-System
# Document-Tracking-System
