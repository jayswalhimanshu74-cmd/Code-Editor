# System Architecture

Hence-Code uses a modern, distributed architecture designed for real-time collaboration and scalable execution.

## High-Level Architecture Diagram

![System Architecture Diagram](Screenshots/React%20Frontend%20to%20Spring-2026-06-11-083847.png)

## Component Breakdown

### 1. Frontend (React)
- **State Management**: `Zustand` manages UI state and authentication status.
- **Editor**: `CodeMirror 6` combined with `y-codemirror.next` provides the editing surface.
- **Real-Time Sync**: The `Yjs` CRDT engine runs in the browser, tracking local changes and resolving conflicts from remote users.
- **Terminal**: `Xterm.js` renders a live pseudo-terminal connection to the backend.

### 2. Backend (Spring Boot)
- **REST API**: Handles workspace management, snapshot persistence, and file CRUD operations.
- **Authentication**: `Spring Security` issues and validates stateless JWTs stored securely in `HttpOnly` cookies. OAuth2 integration handles Google/GitHub login.
- **WebSockets**: Custom `WebSocketHandler` classes route binary CRDT payloads and terminal keystrokes.
- **Docker Integration**: Uses `docker-java` to interact with the local or remote Docker daemon. It creates containers based on the requested runtime (Node, Python, Java) and streams execution results back.

### 3. Data Layer
- **PostgreSQL**: Stores relational data: Users, Workspaces, Files, Execution History, and Snapshots.
- **Redis (Upstash)**: 
  - **Pub/Sub**: Essential for horizontally scaling the backend. If User A connects to Backend Node 1 and User B connects to Backend Node 2, Redis Pub/Sub bridges the WebSocket messages so they can collaborate seamlessly.
  - **Rate Limiting**: `Bucket4j` uses Redis to track IP-based rate limits across instances.

### 4. Execution Layer (Docker)
- Workspaces are logically mapped to physical Docker containers.
- When a user clicks "Run", the backend writes the current file content to the container, triggers the appropriate runtime command (`node`, `python3`, `javac`), captures `stdout`/`stderr`, and returns the result.
- A long-lived terminal connection can be established via `docker exec -it /bin/sh`.
