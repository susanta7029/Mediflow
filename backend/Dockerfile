# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
RUN apk add --no-cache maven
WORKDIR /app
COPY . .

RUN if [ -f "backend/pom.xml" ]; then \
        cd backend && mvn clean package -DskipTests && mkdir -p /app/target && cp target/mediflow-backend-1.0.0.jar /app/target/mediflow-backend-1.0.0.jar; \
    else \
        mvn clean package -DskipTests && mkdir -p /app/target && cp target/mediflow-backend-1.0.0.jar /app/target/mediflow-backend-1.0.0.jar; \
    fi

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/mediflow-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
