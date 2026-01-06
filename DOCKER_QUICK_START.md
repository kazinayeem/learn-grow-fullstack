# 🚀 Quick Docker Commands

## Start Everything
```bash
docker-compose up -d
```

## Start with Database UI
```bash
docker-compose --profile dev up -d
```

## View Logs
```bash
docker-compose logs -f
```

## Stop Everything
```bash
docker-compose down
```

## Rebuild After Changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Access URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB UI: http://localhost:8081 (user: admin, pass: admin123)

## MongoDB Shell
```bash
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

## Check Status
```bash
docker-compose ps
```
