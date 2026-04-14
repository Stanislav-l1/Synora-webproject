# --- Stage 1: Build ---
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Cache Maven wrapper and dependencies separately
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Build application
COPY src/main/ src/main/
RUN ./mvnw package -DskipTests -B && \
    mv target/*.jar app.jar

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S synora && adduser -S synora -G synora

# curl needed for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build /app/app.jar app.jar

RUN chown -R synora:synora /app
USER synora

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=40s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
