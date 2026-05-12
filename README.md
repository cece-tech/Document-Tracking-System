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
