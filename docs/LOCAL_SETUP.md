# Local Setup Guide

Follow these steps to run the Hence-Code locally for development and testing.

## Prerequisites

Ensure you have the following installed on your machine:
1. **Java 22** (JDK)
2. **Node.js** (v18+)
3. **Docker Desktop** (Must be running)
4. **Maven** (Optional, but recommended)

## 1. Database & Infrastructure Setup (Docker Compose)

The easiest way to run PostgreSQL and Redis locally is using Docker.

Create a `docker-compose.yml` file in the root directory (if not already present) with the following content:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: ide-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: localpassword
      POSTGRES_DB: code_editor
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    container_name: ide-redis
    ports:
      - "6379:6379"
```

Run the infrastructure:
```bash
docker-compose up -d
```

## 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
```bash
cd Code-Editor_backend
```

2. Configure Environment Variables:
Create an `application-local.properties` file or inject these via your IDE:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/code_editor
spring.datasource.username=postgres
spring.datasource.password=localpassword

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Generate a 32+ char secret for JWT
app.jwt.secret=your_super_secret_32_character_jwt_key_here

# Generate exactly a 32 char key for GitHub Tokens
github.token.encryption.key=12345678901234567890123456789012

# OAuth (Create these in Google Cloud Console / GitHub Developer Settings)
spring.security.oauth2.client.registration.google.client-id=your-google-id
spring.security.oauth2.client.registration.google.client-secret=your-google-secret

# Bootstrapping Admin
admin.bootstrap.enabled=true
admin.bootstrap.secret=my_bootstrap_secret
```

3. Run the backend:
```bash
./mvnw spring-boot:run
```
*(The backend runs on `http://localhost:8080`)*

## 3. Frontend Setup (React)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Configure Environment Variables:
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8080
```

3. Install dependencies:
```bash
npm install
```

4. Run the frontend:
```bash
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

## 4. Bootstrapping the Admin Account

Because of security policies, the system does not come with a default admin account.

To create the first admin:
1. Register a standard user account via the UI.
2. Send a POST request to the backend using Postman or cURL:
```bash
curl -X POST "http://localhost:8080/api/admin/bootstrap-first-admin?email=your_email@example.com&secret=my_bootstrap_secret"
```
3. Once successful, change `admin.bootstrap.enabled=false` in your backend properties and restart the backend to lock down the system.
