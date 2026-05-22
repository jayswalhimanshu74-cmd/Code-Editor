# CodeEditor 🚀

A real-time collaborative code editor that allows multiple users to create rooms, join coding sessions, collaborate live, manage files, and execute code together.

Built with React, Spring Boot, WebSocket/STOMP, JWT Authentication, and collaborative room architecture.

---

## ✨ Features

### Authentication & Security
- User registration and login
- JWT authentication
- Access token based authorization
- Protected routes
- Secure APIs using Spring Security

### Collaborative Rooms
- Create coding rooms
- Join rooms using Room ID
- Real-time participant collaboration
- Join/leave notifications
- Room lobby management

### Real-Time Code Collaboration
- Live code synchronization
- WebSocket + STOMP integration
- Instant updates for all room members
- Prevent self-update loops
- Multi-user editing experience

### File Management
- Create files
- Rename files
- Delete files
- Switch between files
- Support for multiple files inside rooms

### Code Execution
- Run code directly from editor
- Multiple language support:
  - Java
  - JavaScript
  - Python
  - C
  - C++
  - Go
  - Rust
  - Kotlin
- Input support (stdin)
- Output console
- Execution history

### Dashboard
- View created rooms
- Recent activity
- Profile information

---

## 🛠 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios
- Zustand
- SockJS
- STOMPJS

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- Spring WebSocket
- JPA / Hibernate
- PostgreSQl
- REST APIs

### Database
- PostgreSQL

### Real-Time Communication
- WebSocket
- SockJS
- STOMP

---

## 📁 Project Structure

```text
CodeEditor/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── entity/
│   ├── repository/
│   ├── security/
│   └── websocket/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── assets/
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/CodeEditor.git
```

```bash
cd CodeEditor
```

---

## Backend Setup

Go into backend:

```bash
cd backend
```

Configure:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/codeeditor

spring.datasource.username=root

spring.datasource.password=yourpassword

jwt.secret=yourSecret

jwt.expiration=900000
```

Run backend:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

## Frontend Setup

Move to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env`

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

## WebSocket Endpoint

```text
/ws
```

Topics:

```text
/topic/room/{roomId}/code
```

Application destinations:

```text
/app/room/{roomId}
```

---

## API Examples

### Login

```http
POST /api/auth/login
```

### Register

```http
POST /api/auth/register
```

### Create Room

```http
POST /api/rooms
```

### Join Room

```http
POST /api/rooms/{roomId}/join
```

### Execute Code

```http
POST /api/rooms/{roomId}/execute
```

---

## Screens

- Landing Page
- Login
- Register
- Dashboard
- Room Lobby
- Collaborative Editor
- File Manager
- History
- Profile
- Settings

---

## Future Improvements

- Video call integration
- Cursor presence
- Live chat
- Code compilation containers
- AI code assistant
- Syntax intelligence
- GitHub integration

---

## Author

Himanshu Jayswal

 Java Full Stack Developer

GitHub:
https://github.com/jayswalhimanshu74-cmd

---

## License

This project is developed for educational and portfolio purposes.