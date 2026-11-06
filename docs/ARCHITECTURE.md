# System Architecture

Hence-Code uses a modern, distributed architecture designed for real-time collaboration and scalable execution.

## High-Level Architecture Diagram

![System Architecture Diagram](Screenshots/React%20Frontend%20to%20Spring-2026-06-11-083847.png)

## Component Breakdown

### 1. Frontend (React 19)
- **Editor**: `Monaco Editor` (`@monaco-editor/react`) coupled with `y-monaco` (`MonacoBinding`) provides the collaborative code editing surface.
- **State Management**: `Zustand` manages UI state, room configurations, and authentication lifecycle.
- **Real-Time Sync**: The `Yjs` CRDT engine runs in the browser, tracking local edits and resolving concurrent changes deterministically using a subscribe-first, fetch, flush, and bind lifecycle.
- **Client Execution**:
  - Python: Official `Pyodide` WebAssembly engine running in a dedicated Web Worker ($10\text{s}$ timeout).
  - JavaScript: Sandboxed Web Worker hosted in a restricted iframe (`sandbox="allow-scripts"` only, $5\text{s}$ timeout).
- **Terminal (Optional)**: `Xterm.js` renders a live pseudo-terminal connection to a container runtime when connected to a local Docker daemon (gated on cloud deployments via `VITE_DOCKER_FEATURES`).

### 2. Backend (Spring Boot 3.3.5 / Java 22)
- **REST API**: Handles workspace lifecycle, file/directory CRUD, snapshots, execution recording, and health checks.
- **Authentication**: Dual-token architecture:
  - `accessToken` (15-minute validity) is stored in `localStorage` for cross-origin REST `Authorization: Bearer` headers and STOMP WebSocket `CONNECT` frame authentication.
  - `refreshToken` (7-day validity) is stored in a secure, `HttpOnly`, `SameSite` cookie used strictly to rotate tokens via `/api/auth/refresh`.
  - *Trade-off analysis*: Storing the access token in `localStorage` enables cross-domain STOMP WebSocket authentication, with the standard trade-off of accessibility to client scripts in the event of an XSS vulnerability. This is mitigated by short token lifetimes (15 minutes), strict HttpOnly refresh token rotation, and Content Security Policy (CSP) headers.
- **WebSockets**: STOMP over SockJS endpoints protected by `AuthChannelInterceptor` routing binary CRDT updates, cursor awareness, and in-room chat.
- **Execution Providers**:
  - Cloud / Remote: `Judge0` and `Piston` execution providers wrapped with `Resilience4j` Circuit Breakers, Retries, and Bulkheads.
  - Local Host: `docker-java` for containerized execution and interactive terminal sessions.

### 3. Data & Messaging Layer
- **PostgreSQL**: Stores persistent relational entities: Users, Workspaces, Files, Execution History, and Snapshots.
- **Redis (Upstash)**:
  - **Pub/Sub**: Coordinates Yjs document updates across distributed backend instances (`yjs:updates`).
  - **Document State Cache**: Caches binary Yjs state vectors (`yjs:doc:{roomId}:{fileId}`) for rapid access prior to 2000ms debounced PostgreSQL flushes.
  - **Rate Limiting**: Atomic Redis Lua script (`INCR` + `EXPIRE`) enforcing request limits on auth and resource-intensive endpoints. *(Note: `bucket4j-core` dependency is currently unused and marked for removal).*
  - **Execution Queue**: FIFO queue for asynchronous server-side code execution tasks.

### 4. Deployment Topology
- **Production**: Deployed on **Vercel** (React SPA) and **Render** free tier (Spring Boot backend) with **Neon** (serverless PostgreSQL) and **Upstash** (Redis).
- **Self-Hosted / Local**: Docker Desktop or Cloudflare Tunnels (optional alternative for exposing local environments).
