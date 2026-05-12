# Quick Commands
Clone repo → git clone https://github.com/bxlionelle/document-tracker.git
Pull latest code → git pull origin main
Run migrations → docker exec -it doctracker_backend php artisan migrate
Seed database → docker exec -it doctracker_backend php artisan db:seed
Reset schema → docker exec -it doctracker_backend php artisan migrate:fresh --seed
Check backend logs → docker logs doctracker_backend
Check frontend logs → docker logs doctracker_frontend
Check database logs → docker logs doctracker_db
