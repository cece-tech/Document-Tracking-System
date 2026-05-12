Database issues
- Seeder duplicate error → run:

go to bash:
    docker exec -it doctracker_backend php artisan migrate:fresh --seed

- “Nothing to migrate” → migrations already applied. Use migrate:fresh for reset.
- DB not opening in browser → expected. Use CLI or Workbench, not Chrome.

Logs
- Backend logs:

go to bash:
    docker logs doctracker_backend

- Frontend logs:

go to bash:
    docker logs doctracker_frontend

- Database logs:

go to bash:
    docker logs doctracker_db

    