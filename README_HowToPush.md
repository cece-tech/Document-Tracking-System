1. Create a branch with your name
    git checkout -b feature/<your-name>

2. Stage and commit changes
    git add .
    git commit -m "Update by <your-name>: description of changes"

3. Push branch to GitHub
    git push origin feature/<your-name>

4. Verify branch exists
Check on GitHub under Branches tab or run:
    git branch -r

5. Merge into main
- Open a Pull Request on GitHub.
- Wait for review/approval before merging into main.

!!!Rules:
    - Never push directly to main.
    - Always create a branch with your name.
    - Use Pull Requests for merging.


# Quick Commands
Clone repo → git clone https://github.com/bxlionelle/document-tracker.git
Pull latest code → git pull origin main
Run migrations → docker exec -it doctracker_backend php artisan migrate
Seed database → docker exec -it doctracker_backend php artisan db:seed
Reset schema → docker exec -it doctracker_backend php artisan migrate:fresh --seed
Check backend logs → docker logs doctracker_backend
Check frontend logs → docker logs doctracker_frontend
Check database logs → docker logs doctracker_db