# Root Dockerfile for Backend Deployment
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .

RUN if [ -f "mvnw" ]; then \
        chmod +x mvnw && ./mvnw clean package -DskipTests; \
    elif [ -f "backend/mvnw" ]; then \
        cd backend && chmod +x mvnw && ./mvnw clean package -DskipTests && mkdir -p /app/target && cp target/mediflow-backend-1.0.0.jar /app/target/mediflow-backend-1.0.0.jar; \
    else \
        echo "mvnw not found!" && exit 1; \
    fi

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/mediflow-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
