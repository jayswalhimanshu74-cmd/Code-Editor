# 🚀 Self-Hosted Piston Code Execution Engine Deployment Guide (Render)

This guide provides step-by-step instructions to deploy a dedicated, self-hosted **EngineerMan Piston** code execution engine on **Render** for the HenceCode platform.

---

## 📋 System Architecture

```
React Frontend (Vercel)  ──>  Spring Boot Backend (Render)  ──>  Self-Hosted Piston (Render Docker Service)
```

---

## 🛠️ Step 1: Deploy Piston Web Service on Render

### Option A: Render Dashboard Manual Setup (Recommended)
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Hence-Code` or `Code-Editor`).
4. Set the following details:
   - **Name**: `hencecode-piston`
   - **Region**: Select your preferred region (e.g., `Singapore` or `Oregon`)
   - **Environment**: `Docker`
   - **Docker Command / Context**:
     - **Dockerfile Path**: `./piston/Dockerfile`
     - **Docker Build Context**: `./piston`
   - **Instance Type**: `Free` or `Starter` (512MB RAM minimum)
5. Add Environment Variables under **Advanced**:

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `PORT` | `20000` | Port bound inside container |
| `PISTON_BIND` | `0.0.0.0:20000` | Bind IP and Port |
| `PISTON_RUNTIMES_PATH` | `/piston/packages` | Path where language runtimes are stored |
| `PISTON_TMP_PATH` | `/tmp/piston` | Temporary execution directory |
| `MAX_EXECUTION_TIME` | `10000` | Max code execution time in milliseconds (10s) |
| `MAX_MEMORY` | `512000000` | Max memory limit per execution process (512MB) |

6. Set Health Check Path:
   - **Health Check Path**: `/api/v2/runtimes`
7. Click **Create Web Service**.

---

### Option B: Render Blueprint Deployment (1-Click)
If using Render Blueprints:
1. Render will automatically detect `piston/render.yaml`.
2. Apply the Blueprint to launch `hencecode-piston`.

---

## 🔗 Step 2: Connect Spring Boot Backend to Piston

1. Get your deployed Piston Web Service URL from Render (e.g. `https://hencecode-piston.onrender.com`).
2. Go to your Spring Boot Backend service on Render dashboard (`code-editor-5n1x`).
3. Add / update the environment variable:

```env
EXECUTION_PISTON_URL=https://hencecode-piston.onrender.com/api/v2/piston/execute
```

4. Trigger a manual redeploy of the backend.

---

## 🔍 Step 3: Health Checks & Verification

Verify the self-hosted Piston endpoints:

### 1. Check Runtimes List
```bash
curl -X GET https://hencecode-piston.onrender.com/api/v2/runtimes
```

Expected Response:
```json
[
  {"language":"javascript","version":"18.15.0","aliases":["js"]},
  {"language":"python","version":"3.10.0","aliases":["py","py3"]},
  {"language":"java","version":"15.0.2","aliases":["openjdk"]}
]
```

### 2. Test Code Execution
```bash
curl -X POST https://hencecode-piston.onrender.com/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [
      {
        "content": "print(\"Hello from Self-Hosted Piston on Render!\")"
      }
    ]
  }'
```

Expected Response:
```json
{
  "language": "python",
  "version": "3.10.0",
  "run": {
    "stdout": "Hello from Self-Hosted Piston on Render!\n",
    "stderr": "",
    "code": 0,
    "signal": null
  }
}
```

---

## 📊 Troubleshooting & Common Errors

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `503 Service Unavailable` | Render cold-start / spin down | Circuit breaker will trigger `fallbackExecute`. Upgrade to paid plan for 24/7 warm container. |
| `400 Bad Request` | Language unsupported | Verify language alias against `/api/v2/runtimes`. |
| Memory Exhaustion | Huge output payload | `PistonExecutionProvider` automatically truncates output to 100 KB max. |

---

## 💰 Cost Estimation

- **Render Free Tier**: $0/month (spins down after 15m inactivity).
- **Render Starter Plan**: $7/month (24/7 uptime, 512MB RAM, no cold starts).
