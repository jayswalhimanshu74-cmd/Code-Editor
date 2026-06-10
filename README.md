# CodeEditor 🚀

A Full-Stack Real-Time Collaborative Code Editor that allows multiple users to create coding rooms, collaborate live, chat with teammates, manage files, and execute code remotely.

Inspired by collaborative IDE platforms like Replit and CodePen, the platform combines real-time communication with multi-language code execution and room-based collaboration.

---

# ✨ Features

## 🔐 Authentication & Security

- User registration and login
- JWT authentication
- Refresh token support
- Spring Security authorization
- Protected frontend routes
- Secure REST APIs

---

## 👥 Collaborative Rooms

Users can:

- Create coding rooms
- Join rooms via room ID / invite code
- Collaborate in shared workspaces
- Track room members in real time
- Join and leave dynamically

---

## ⚡ Real-Time Code Collaboration

Built using:

- Spring WebSocket
- STOMP Protocol
- SockJS

Features:

- Live code synchronization
- Instant updates to all users
- Presence tracking
- Join/leave events
- Multi-user collaboration

The editor prevents self-trigger update loops for smooth editing.

---

## 💻 Monaco Editor Integration

Uses Monaco Editor (VS Code engine)

Features:

- Syntax highlighting
- Multi-language support
- Editor themes
- Fast rendering
- Rich coding experience

---

## 📁 File Management System

Workspace supports:

- Create file
- Rename file
- Delete file
- Multiple files per room
- File switching

---

## ▶ Remote Code Execution (Native Docker Sandbox)

Code execution is handled by a natively hosted, distributed Docker Sandbox engine, removing all dependencies on external compilation APIs.

Architecture Highlights:
- **Ephemeral Isolation:** Every code execution spawns a secure, short-lived, throwaway Docker container (`--rm`).
- **Resource Constraints:** Enforces strict limits (256MB RAM, 0.5 CPU) to guarantee platform stability.
- **Zombie Process Protection:** Utilizes Linux `timeout` utilities natively to instantly kill infinite loops.

Supported languages:

- JavaScript
- Python
- Java
- C
- C++
- Go
- Rust
- Kotlin
- TypeScript
- C#

Execution features:

- stdin support
- stdout
- stderr
- exit code
- execution history
- execution time tracking

---

## 💬 Live Team Chat

Users inside the same room can communicate through:

- Real-time messaging
- Instant updates
- Team collaboration panel

No page refresh required.

---

Stores a full execution state machine and lifecycle log per run:

- States: `QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`, `TIMEOUT`
- source code
- output (stdout/stderr)
- errors
- language
- execution duration
- exit codes

Saved reliably using PostgreSQL.

---

## 🤖 AI Assistant (In Progress)

Frontend currently includes:

AI Chat panel integration

Current state:

- UI completed
- backend endpoint pending
- prepared for future LLM integration

Planned:

- AI Copilot
- code suggestions
- debugging help
- explain code
- generation assistance

---

# 🏗 System Architecture

Frontend ↔ REST API/WebSocket ↔ Spring Boot Backend ↔ PostgreSQL

**Real-time communication:**
Frontend ↔ STOMP ↔ WebSocket ↔ Backend

**Distributed Execution Engine:**
Frontend (Run Click) 
  → ExecutionController (HTTP) 
  → Redis Queue (`execution:queue:{roomId}`)
  → Scalable Execution Worker
  → Ephemeral Docker Sandbox (`cloud-ide-workspace` Image)
  → Live STOMP Stream & PostgreSQL Persistence

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Axios
- Monaco Editor
- SockJS
- STOMPJS
- React Router

---

## Backend

- Java 22
- Spring Boot 3.3.5
- Spring Security
- Spring WebSocket
- Spring Data JPA
- JWT Authentication

---

## Database

- PostgreSQL

---

## Real-Time Communication

- WebSocket
- STOMP
- SockJS

---

# 📂 Project Structure

```text
CodeEditor/
│
├── backend/
│
│   ├── controller/
│   ├── service/
│   ├── entity/
│   ├── repository/
│   ├── websocket/
│   ├── security/
│   └── config/
│
├── frontend/
│
│   ├── src/
│   │
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── assets/
│   └── hooks/
│
└── README.md
```

---

# ⚙ Backend Setup

Clone project:

```bash
git clone https://github.com/YOUR_USERNAME/CodeEditor.git
```

Move:

```bash
cd backend
```

Configure:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/codeeditor

spring.datasource.username=postgres

spring.datasource.password=password

jwt.secret=your-secret

jwt.expiration=900000
```

Run:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

# ⚙ Frontend Setup

Move:

```bash
cd frontend
```

Install:

```bash
npm install
```

Create:

```env
VITE_API_URL=http://localhost:8080
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# WebSocket Endpoint

```text
/ws
```

Subscribe:

```text
/ topic/room/{roomId}/code
/ topic/room/{roomId}/chat
```

Send:

```text
/app/room/{roomId}
```

---

# API Routes

Authentication:

```http
POST /api/auth/register
POST /api/auth/login
```

Rooms:

```http
POST /api/rooms
POST /api/rooms/{roomId}/join
```

Execution:

```http
POST /api/rooms/{roomId}/execute
GET /api/rooms/{roomId}/executions
```

Files:

```http
POST /api/files
DELETE /api/files
```

---

# Future Enhancements

- **Kubernetes Migration:** Move from raw Docker daemon API to Kubernetes Pod-based execution sandboxes.
- **Language Server Protocol (LSP):** Add intelligent auto-completion, linting, and hover definitions.
- **Advanced AI Copilot:** Context-aware codebase debugging and code generation.
- **WebRTC Video/Audio:** Native team video calling alongside live chat.
- **Shared Live Terminal:** PTY-based interactive terminal broadcasting.
- **GitHub Integration:** Commit, push, and pull directly from the collaborative workspace.
- **Cursor Presence:** Visual indicators of where team members are actively typing.

---

# Current Status

Completed:

✅ Authentication

✅ Room Management

✅ Real-Time Collaboration

✅ File Management

✅ Live Chat

✅ WebSocket Integration

✅ Code Synchronization

✅ Persistent Execution History

✅ Distributed Docker Execution Engine (Redis Orchestrated)

🚧 AI Assistant

🚧 Advanced IDE features

---

# Author

Himanshu Jayswal

Full Stack Java Developer

GitHub:
https://github.com/jayswalhimanshu74-cmd

LinkedIn:
https://www.linkedin.com/in/himanshu-jayswal-14a747314

---

# License

Developed for educational, portfolio, and learning purposes.