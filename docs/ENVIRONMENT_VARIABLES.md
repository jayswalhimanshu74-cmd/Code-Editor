# HenceCode Environment Variables Specification

## Production Environment Variables (Render & Vercel)

### Backend (Render Environment)

| Variable Name | Description | Example / Standard Value | Required |
| --- | --- | --- | --- |
| `PORT` | HTTP Server Port (assigned dynamically by Render) | `8080` | Auto |
| `SPRING_DATASOURCE_URL` | Neon PostgreSQL JDBC connection string | `jdbc:postgresql://<host>/neondb?sslmode=require` | Yes |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL User | `neondb_owner` | Yes |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL Password | `password_hash` | Yes |
| `REDIS_URL` | Unified Redis connection URL (with TLS) | `rediss://default:PASS@HOST:6379` | Yes |
| `JWT_SECRET` | 256-bit secret key for JWT signing | `3f8d2a1b9e7c4f6d0a...` | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:5173,https://*.vercel.app` | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant | `AIzaSy...` | Optional |
| `EXECUTION_PROVIDER` | Code execution engine (`piston` or `judge0`) | `piston` | Yes |
| `EXECUTION_PISTON_URL` | Piston API endpoint | `https://emkc.org/api/v2/piston/execute` | Yes |

### Frontend (Vercel Environment)

| Variable Name | Description | Example / Standard Value |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend REST API URL | `https://hence-code-backend.onrender.com` |
| `VITE_WS_BASE_URL` | Backend WebSocket URL | `wss://hence-code-backend.onrender.com/ws` |
