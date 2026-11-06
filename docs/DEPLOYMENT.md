# Deployment Guide

This guide covers deploying Hence-Code across modern free cloud hosting tiers (**Vercel + Render**), with an optional guide for exposing a local self-hosted instance via **Cloudflare Tunnels**.

---

## 🌐 1. Production Deployment (Vercel + Render Free Tier)

Hence-Code is optimized to run smoothly on free cloud infrastructure with zero compute cost for Python and JavaScript browser runs.

### Topology Overview
* **Frontend**: Hosted on [Vercel](https://vercel.com) (Static SPA with CDN edge caching).
* **Backend**: Hosted on [Render](https://render.com) (Spring Boot 3.3.5 running on Java 22).
* **Database**: Serverless PostgreSQL on [Neon](https://neon.tech).
* **Cache & Pub/Sub**: Serverless Redis on [Upstash](https://upstash.com).
* **Remote Code Execution**: [Judge0](https://ce.judge0.com) or [Piston](https://github.com/engineer-man/piston) API for compiled languages.

---

### Step 1: Deploy Database & Redis
1. **Neon PostgreSQL**:
   - Create a free project on [Neon.tech](https://neon.tech).
   - Copy the Pooled connection string (`jdbc:postgresql://...`).
2. **Upstash Redis**:
   - Create a free Redis database on [Upstash.com](https://upstash.com).
   - Note the endpoint host, port (default `6379`), and password.

---

### Step 2: Deploy Backend to Render
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Select **Docker** as the runtime.
   - **DockerfilePath**: `Code-Editor_backend/Dockerfile` (or root `Dockerfile`).
3. Add the following **Environment Variables** (names only shown here; see `.env.example`):
   ```env
   PORT=8080
   FRONTEND_URL=https://<your-vercel-domain>.vercel.app
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>/neondb?sslmode=require
   SPRING_DATASOURCE_USERNAME=<neon-user>
   SPRING_DATASOURCE_PASSWORD=<neon-password>
   SPRING_DATA_REDIS_HOST=<upstash-host>
   SPRING_DATA_REDIS_PORT=6379
   SPRING_DATA_REDIS_PASSWORD=<upstash-password>
   JWT_SECRET=<your-random-32+-character-secret>
   EXECUTION_PROVIDER=judge0
   ```
4. Render will build and deploy the Spring Boot backend container. Note your service URL (e.g. `https://your-backend.onrender.com`).

> [!NOTE]
> **Free-Tier Cold Starts**: Render puts free web services to sleep after 15 minutes of inactivity. When a request arrives, it takes 30–60 seconds to spin up. The Hence-Code frontend automatically displays a non-blocking wake-up banner and retries with backoff until the server is responsive.

---

### Step 3: Deploy Frontend to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_CLIENT_RUN=true
   VITE_DOCKER_FEATURES=false
   ```
5. Deploy. Vercel will build the frontend into `dist/` and assign a production URL.

---

## 🔒 2. Optional Alternative: Self-Hosting via Cloudflare Tunnels

If you want to expose a locally running Hence-Code instance with access to your local **Docker Desktop daemon** (for interactive container terminals and raw bash access), you can expose your local machine to the internet for free using **Cloudflare Tunnels**.

### Prerequisites
* Local Spring Boot backend running on `localhost:8080`
* Local React frontend running on `localhost:5173`
* Docker Desktop running locally
* A domain managed on Cloudflare

### Setup
1. **Install Cloudflared**:
   Follow instructions on the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/) under **Networks > Tunnels**.
2. **Configure Hostname Routes**:
   * `ide.example.com/` $\rightarrow$ `HTTP localhost:5173` (Frontend)
   * `ide.example.com/api` $\rightarrow$ `HTTP localhost:8080` (Backend REST)
   * `ide.example.com/ws` $\rightarrow$ `HTTP localhost:8080` (WebSocket / STOMP)
3. **Set Frontend `.env`**:
   ```env
   VITE_API_URL=https://ide.example.com
   VITE_DOCKER_FEATURES=true
   ```
4. **Update Allowed Origins**:
   In `SecurityConfig.java`, ensure `https://ide.example.com` is included in allowed CORS origins.
