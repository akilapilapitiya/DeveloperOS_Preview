# ── Stage 1: Build ─────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for dependency layer caching
COPY pom.xml .
RUN mvn -B dependency:go-offline -q

# Copy source and build (skip tests – already run in CI)
COPY src ./src
RUN mvn -B clean package -DskipTests -q

# ── Stage 2: Runtime ────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -S devos && adduser -S devos -G devos

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set file ownership
RUN chown devos:devos app.jar

USER devos

# Expose the default Spring Boot port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
