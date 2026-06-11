# Demo Video Script & Flow

**Target Duration:** 5 - 7 minutes
**Target Audience:** Recruiters, Engineering Managers, and Technical Interviewers.

## Preparation
1. Ensure Docker Desktop is running locally.
2. Have the frontend and backend running.
3. Open two separate browser windows (e.g., Chrome and Firefox, or normal/incognito) to demonstrate real-time collaboration.
4. Have the Cloudflare Tunnel public URL ready.

---

## Script & Screen Actions

### 1. Introduction (0:00 - 0:45)
**Screen:** Show the Login Page via the public URL.
**Script:** 
> "Hi, I'm [Your Name] and this is my Hence-Code. It's a distributed, real-time collaborative code editor built with Spring Boot, React, and Docker. Security is a primary focus, so I've implemented stateless JWT authentication using secure HttpOnly cookies, protected by Bucket4j rate limiting. I'll log in now using Google OAuth to access the platform."
**Action:** Click the Google OAuth button and log in.

### 2. Dashboard & Workspace Creation (0:45 - 1:30)
**Screen:** The main Dashboard.
**Script:** 
> "Once authenticated, we land on the dashboard. This data is pulled from a PostgreSQL database. Let's create a new workspace. The architecture isolates every workspace in its own dedicated Docker container. I can select from Node.js, Python, or Java environments. I'll choose Node.js for this demo."
**Action:** Click 'Create Workspace', select 'Node.js', and enter a name. Click 'Create'.

### 3. Real-Time Collaboration (1:30 - 3:00)
**Screen:** The IDE view. Split the screen to show Browser 1 (User A) and Browser 2 (User B - joined via URL).
**Script:** 
> "Here is the core IDE. To demonstrate the distributed nature of the application, I have a second browser window open simulating a coworker. The editor uses Yjs, a Conflict-Free Replicated Data Type (CRDT), syncing state over WebSockets. Notice that as I type in one window, it instantly appears in the other with sub-millisecond latency. Even if the backend were scaled to multiple instances, Redis Pub/Sub ensures these WebSocket messages are routed correctly across the cluster."
**Action:** Type a simple Node.js script in Browser 1. Show the cursor of Browser 2 moving and typing a comment.

### 4. Code Execution & Terminal (3:00 - 4:30)
**Screen:** Maximize Browser 1. Open the Terminal panel.
**Script:** 
> "Code is useless if we can't run it. When I hit 'Execute', the Spring Boot backend securely proxies the file contents to the isolated Docker container daemon, runs the code, and streams the standard output back. 
> Furthermore, I have a raw terminal integrated via Xterm.js. This WebSocket connection gives me direct, secure shell access to the container. Watch as I run `npm init -y` or check the node version directly."
**Action:** 
1. Click the 'Run' button and show the output.
2. Type `node -v` in the terminal pane and hit enter.

### 5. Workspace Snapshots (4:30 - 5:15)
**Screen:** The Snapshot UI/Menu.
**Script:** 
> "State persistence is handled via a Snapshot system. I can capture the exact state of this workspace right now. This takes the file tree and persists it to the PostgreSQL database. If I delete all my code by accident, I can instantly restore the previous snapshot."
**Action:** Create a snapshot. Delete the code in the editor. Restore the snapshot.

### 6. Admin Analytics (5:15 - 6:00)
**Screen:** Navigate to the `/admin` dashboard.
**Script:** 
> "Finally, enterprise applications require observability. This Admin dashboard, protected by strict Role-Based Access Control, provides real-time system metrics. It monitors active WebSocket connections, container health, and rate-limit triggers across the system."
**Action:** Briefly scroll through the analytics charts.

### 7. Outro (6:00 - 6:30)
**Screen:** Show the GitHub repository page.
**Script:** 
> "The entire infrastructure is automated and deployable. All secrets are stripped from the repository, and the backend is configured to fail-fast if insecure configurations are detected at startup. You can find the full source code, architecture diagrams, and deployment guides on my GitHub. Thank you for watching."

---

## Interview Talking Points
If asked about specific areas during an interview, use these pivot points:
* **Why WebSockets instead of HTTP polling?** "WebSockets provide the necessary full-duplex communication required for CRDT syncing and live terminal streaming with minimal overhead."
* **Why Docker?** "Running code locally on the host JVM is a massive security risk. Docker provides process isolation and allows us to easily support multiple runtimes without polluting the host OS."
* **How did you secure it?** "I migrated from `localStorage` to `HttpOnly` cookies to prevent XSS. I implemented Bucket4j for IP-based rate limiting to stop brute force attacks, and configured Spring Security to emit strict CSP and HSTS headers."
