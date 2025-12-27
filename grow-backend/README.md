# Learn & Grow Backend (TypeScript + Express + Mongoose + Zod)

Modular monolith backend starter for the Learn & Grow system.

## Features
- TypeScript, Express, Mongoose
- Zod validation middleware
- JWT auth, bcrypt password hashing
- Modular structure with `user` module

## Project Structure
```
src/
  config/
  database/
  middleware/
  modules/
    user/
      domain/ (model, zod)
      application/ (service)
      interfaces/ (controller, routes)
  app.ts
  server.ts
```

## Setup
1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies.

```bash
cd "c:/Users/NAYEEM/OneDrive/Desktop/grow-backend"
npm install
```

## Development
```bash
npm run dev
```
- Starts server at `http://localhost:5000`
- Health check: `GET /health`

## API
- `POST /api/v1/auth/register` { name, email, password, role? }
- `POST /api/v1/auth/login` { email, password }
- `GET  /api/v1/auth/me` (Bearer token)

## Build & Start
```bash
npm run build
npm start
```

## Notes
- Default MongoDB URI is `mongodb://127.0.0.1:27017/grow`
- Roles supported: `admin`, `teacher`, `student`, `guardian`
