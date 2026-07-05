# ============================================================
# Smart Expense Tracker — Backend Dockerfile
# Multi-stage build for minimal production image
# ============================================================

# Stage 1: Build with Maven
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -q 2>/dev/null || true

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests -q

# Stage 2: Minimal runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat jar
COPY --from=builder /app/target/*.jar app.jar

# Tessdata for OCR (optional — install if Tesseract OCR is needed)
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng 2>/dev/null || true

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# JVM tuning for containers
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
