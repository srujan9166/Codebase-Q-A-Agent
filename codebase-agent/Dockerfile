# ==========================================
# Stage 1: Build the Application
# ==========================================
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Step A: Copy Maven wrapper and pom.xml first (Docker Layer Caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Give execution permission to the maven wrapper script
RUN chmod +x ./mvnw

# Download dependencies (this layer is cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Step B: Copy source code and build the jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ==========================================
# Stage 2: Minimal Runtime Image
# ==========================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Create a non-root user for security (best practice in production)
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Copy the built jar from Stage 1
COPY --from=builder /app/target/*.jar app.jar

# Expose the Spring Boot default port
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
