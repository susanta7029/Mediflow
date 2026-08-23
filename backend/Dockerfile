# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
RUN apk add --no-cache maven
WORKDIR /app
COPY . .

RUN if [ -f "backend/pom.xml" ]; then cd backend; fi && mvn clean package -DskipTests && find . -name "mediflow-backend-1.0.0.jar" -exec cp {} /app/app.jar \;

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
