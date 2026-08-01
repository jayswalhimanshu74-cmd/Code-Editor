# Multi-stage Dockerfile for HenceCode Backend Deployment on Render

# Stage 1: Build Java Application using Maven & JDK 22
FROM maven:3.9-eclipse-temurin-22-alpine AS build
WORKDIR /app

# Copy pom.xml and source code from Code-Editor_backend
COPY Code-Editor_backend/pom.xml .
COPY Code-Editor_backend/src ./src

# Build production executable JAR skipping unit tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java Runtime Environment
FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

# Create non-root application user for production container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from build stage
COPY --from=build /app/target/hence-code-0.0.1-SNAPSHOT.jar app.jar

# Set file ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
