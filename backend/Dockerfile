# --- Stage 1: Build ---
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Build application
COPY src/ src/
RUN ./mvnw package -DskipTests -B

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S synora && adduser -S synora -G synora

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

RUN chown -R synora:synora /app
USER synora

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
