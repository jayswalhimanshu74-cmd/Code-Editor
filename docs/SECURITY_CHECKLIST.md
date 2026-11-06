# Production Security Checklist

Before exposing Hence-Code to the public internet, ensure every box is checked. Failure to do so could result in remote code execution (RCE) on your host machine or data breaches.

## 🔐 Credentials & Secrets
- [ ] Ensure **NO secrets** (JWT keys, OAuth Client IDs, Database passwords) are hardcoded in `application*.properties` or committed to Git.
- [ ] Verify `app.jwt.secret` is injected via environment variables and is at least 32 characters long.
- [ ] Verify `github.token.encryption.key` is exactly 32 characters long.

## 🍪 Authentication & Session Architecture
- [ ] **Dual-Token Model**:
  - `accessToken` (15-minute lifetime) is stored in `localStorage` for cross-origin REST API `Authorization: Bearer` headers and STOMP WebSocket `CONNECT` frame authorization.
  - `refreshToken` (7-day lifetime) is stored exclusively in a secure `HttpOnly=true` cookie with `SameSite=Lax` (or `None` over cross-site HTTPS) and `Secure=true` in `AuthController.java`.
- [ ] **XSS Trade-off Awareness**: Storing `accessToken` in `localStorage` enables cross-domain STOMP WebSocket authentication, but carries the standard trade-off of accessibility to client scripts in the event of an XSS vulnerability. This is mitigated by:
  - Short 15-minute access token lifespan.
  - Refresh tokens kept strictly out of JavaScript access via HttpOnly cookies.
  - Enforced Content Security Policy (CSP) headers.
- [ ] Verify WebSocket STOMP endpoints are guarded by `AuthChannelInterceptor` validating the Bearer token.

## 🚦 Rate Limiting & Protection
- [ ] Verify Redis rate limiting (atomic Lua script) is active in `RateLimitFilter.java` for:
  - `/api/auth/login` (e.g., 5 req/min)
  - `/api/auth/register` (e.g., 3 req/min)
  - `/api/git` operations (e.g., 15 req/min)
- [ ] Verify `/health` and `/` bypass rate limiting so uptime monitors never trigger 429 blocks.
- [ ] *(Note: `bucket4j-core` dependency in `pom.xml` is unused and candidate for removal).*

## 🐳 Execution Sandboxing
- [ ] **Browser Runners**:
  - Python runs via Pyodide in an isolated Web Worker with a 10s execution timeout.
  - JavaScript runs in a sandboxed iframe with `sandbox="allow-scripts"` ONLY (no `allow-same-origin`) to prevent origin credential access, with a 5s execution timeout.
- [ ] **Server-Side Runners**:
  - Remote Judge0 / Piston APIs are protected by Resilience4j Circuit Breakers to fail fast during outages.
  - If self-hosting local Docker execution, verify containers launch with restricted CPU, memory, and non-root user.

## 🎛️ Admin Privilege
- [ ] Verify `admin.bootstrap.enabled=false` in production environment variables to prevent unauthorized users from bootstrapping Admin privileges.

## 🌐 Headers & Infrastructure
- [ ] Verify Spring Security emits strict headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- [ ] Verify frontend (Vercel) and backend (Render) communicate exclusively over HTTPS and WSS.
