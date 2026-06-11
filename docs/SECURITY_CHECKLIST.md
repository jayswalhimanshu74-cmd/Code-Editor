# Production Security Checklist

Before exposing the Hence-Code to the public internet, ensure every box is checked. Failure to do so could result in remote code execution (RCE) on your host machine or data breaches.

## 🔐 Credentials & Secrets
- [ ] Ensure **NO secrets** (JWT keys, OAuth Client IDs, Database passwords) are hardcoded in `application.properties` or committed to GitHub.
- [ ] Verify `app.jwt.secret` is injected via environment variables and is at least 32 characters long.
- [ ] Verify `github.token.encryption.key` is exactly 32 characters long.

## 🍪 Authentication & Session
- [ ] Verify `localStorage` is **not** used to store JWTs on the frontend.
- [ ] Verify `HttpOnly=true` is set on the `accessToken` and `refreshToken` cookies in `AuthController.java`.
- [ ] Verify `Secure=true` is set on the cookies if deploying over HTTPS (Cloudflare Tunnel).
- [ ] Verify `SameSite=Lax` or `Strict` is configured for the cookies.

## 🛡️ WebSockets & Yjs
- [ ] Verify `TerminalWebSocketHandler` explicitly checks `session.getPrincipal()` and drops connections if unauthenticated.
- [ ] Verify STOMP endpoints (used by Yjs) are protected by `AuthChannelInterceptor`.

## 🚦 Rate Limiting
- [ ] Verify Upstash Redis (or local Redis) is connected and functioning.
- [ ] Verify `Bucket4j` rate limiting is active for:
  - `/api/auth/login` (e.g., 5 req/min)
  - `/api/auth/register` (e.g., 3 req/min)
  - `/api/auth/forgot-password` (e.g., 3 req/15 min)

## 🐳 Docker Execution Engine
- [ ] Verify Docker containers are launched with restricted privileges.
- [ ] Ensure the container has memory and CPU limits configured to prevent denial of service (DoS) attacks via infinite loops.

## 🎛️ Admin Privilege
- [ ] Verify `admin.bootstrap.enabled=false` in the production environment variables to prevent unauthorized users from granting themselves Admin access.

## 🌐 Headers & Infrastructure
- [ ] Verify Spring Security is emitting strict headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- [ ] Verify the frontend and backend are exclusively accessible via HTTPS.
