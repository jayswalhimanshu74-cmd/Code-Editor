# Free Public Deployment Guide

This guide explains how to expose your locally running Hence-Code to the public internet securely using **Cloudflare Tunnels**. This requires zero port-forwarding, no static IP, and is 100% free.

> [!IMPORTANT]
> This method assumes you are running the backend (`localhost:8080`) and frontend (`localhost:5173`) locally on your machine, alongside Docker Desktop for execution.

## 1. Install Cloudflared

1. Go to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Navigate to **Networks > Tunnels**.
3. Click **Create a tunnel**.
4. Choose **Cloudflared**.
5. Name your tunnel (e.g., `cloud-ide-tunnel`).
6. Select your operating system and copy the installation command provided. Run this command in your local terminal to install and authenticate the `cloudflared` daemon.

## 2. Configure Routing

Once the tunnel is connected, configure the **Public Hostnames**. You will need a domain name managed by Cloudflare.

Assuming your domain is `example.com`:

### Route 1: Frontend
*   **Subdomain:** `ide`
*   **Domain:** `example.com`
*   **Path:** (leave empty)
*   **Service Type:** `HTTP`
*   **URL:** `localhost:5173`

### Route 2: Backend REST API
*   **Subdomain:** `ide`
*   **Domain:** `example.com`
*   **Path:** `api`
*   **Service Type:** `HTTP`
*   **URL:** `localhost:8080`

### Route 3: WebSockets (Yjs + Terminal)
*   **Subdomain:** `ide`
*   **Domain:** `example.com`
*   **Path:** `ws`
*   **Service Type:** `HTTP`
*   **URL:** `localhost:8080`
*(Note: Cloudflare automatically upgrades HTTP tunnel connections to WebSockets if requested by the client).*

## 3. Update Environment Variables

Now that your application is exposed at `https://ide.example.com`, you must update your local environment variables.

**Frontend (`.env`):**
```env
VITE_API_URL=https://ide.example.com
```
*Restart the Vite server.*

**Backend (`application.properties`):**
Because the frontend is now served via HTTPS and a public domain, you must update the CORS configuration in `SecurityConfig.java` to allow the new origin.
```java
// Inside SecurityConfig.java
config.setAllowedOrigins(List.of("http://localhost:5173", "https://ide.example.com"));
```

## 4. Secure Cookies

Since you are now accessing the application over HTTPS via Cloudflare, ensure your authentication cookies are configured with `Secure=true`.
Modify `AuthController.java`:
```java
ResponseCookie accessCookie = ResponseCookie.from("accessToken", authResponse.getAccessToken())
        .httpOnly(true).secure(true).path("/").maxAge(900).sameSite("Lax").build(); 
```
*Rebuild and restart the Spring Boot backend.*

## 5. Alternative: Ngrok (Backup Method)
If you don't have a custom domain on Cloudflare, you can use Ngrok.
```bash
# Expose the frontend
ngrok http 5173

# Open a second terminal and expose the backend
ngrok http 8080
```
Update your frontend `.env` to point to the backend Ngrok URL. Note that free Ngrok URLs change on every restart.
