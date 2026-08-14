# MEDIFLOW — Technical Interview Preparation & Architecture Guide

This document contains deep-dive architectural answers to common senior Java Full Stack developer interview questions based on the MEDIFLOW platform design.

---

### 1. Why Spring Boot?
- **Enterprise Ecosystem & Auto-Configuration**: Spring Boot 3 provides robust dependency injection, declarative transactions (`@Transactional`), integrated security filters, and production-ready Actuator metrics out of the box.
- **Convention over Configuration**: Eliminates boilerplate XML configuration while allowing full customization via `@Configuration` beans.
- **Native GraalVM & Modern Java Support**: Built on Spring Framework 6 and Java 17+, delivering virtual thread concurrency (Project Loom compatibility) and low memory overhead.

---

### 2. Why PostgreSQL?
- **ACID Compliance & Relational Integrity**: Essential for healthcare billing and appointment reservations where partial failures or dirty reads cannot be tolerated.
- **Advanced Indexing & Constraint Engines**: PostgreSQL supports multi-column unique constraints (`(doctor_id, appointment_date, time_slot)`), partial indexes, and transactional DDL (perfect for Flyway schema migrations).
- **JSONB Capabilities**: Allows mixing structured relational data (users, invoices) with semi-structured audit logs or AI JSON outputs without schema migration overhead.

---

### 3. Why Redis?
- **Low Latency Caching**: Caches doctor slot availability and system dashboard metrics, avoiding expensive database queries during peak morning appointment booking hours.
- **Token State Management**: Serves as a fast, volatile store for blacklisted access tokens and active refresh token sessions.
- **Pub/Sub Notification Dispatch**: Enables async event broadcasting to connected frontend clients for real-time waiting room queue updates.

---

### 4. How JWT Authentication Works?
1. User provides email and password at `/api/auth/login`.
2. `AuthenticationManager` verifies credentials against BCrypt-hashed password stored in PostgreSQL.
3. Upon validation, `JwtTokenProvider` builds a cryptographically signed HMAC-SHA256 JWT containing subject (`email`), claims (`role`, `userId`), issue timestamp, and expiration time (15 minutes).
4. `RefreshTokenService` issues a long-lived UUID refresh token (7 days) stored securely in the database and returned to the client.
5. On subsequent HTTP requests, `JwtAuthenticationFilter` intercepts the request header (`Authorization: Bearer <token>`), verifies the signature, and sets the Spring Security Context (`SecurityContextHolder.getContext().setAuthentication(...)`).

---

### 5. Where are JWT Tokens Stored on Frontend and Security Tradeoffs?
- **Access Tokens**: Kept in memory (React state / AuthContext) or `localStorage` for SPA ease of integration.
  - *Tradeoff*: Vulnerable to XSS if third-party scripts execute malicious code, but immune to CSRF because headers are attached explicitly via Axios interceptor.
- **Refresh Tokens**: Ideally stored in secure `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
  - *Tradeoff*: Prevents JavaScript access (XSS immune), but requires proper CORS cookie header configuration (`allowCredentials(true)`).

---

### 6. How Password Hashing Works?
- Uses **BCrypt** (`BCryptPasswordEncoder` with cost factor 10).
- BCrypt incorporates a 128-bit random salt automatically into the hash string to prevent rainbow table attacks.
- Slow hashing function prevents brute-force dictionary attacks even if the database credentials dump is compromised.

---

### 7. How Double Booking is Prevented?
MEDIFLOW implements a **3-tier concurrency defense strategy**:
1. **Pre-Check (Service Layer)**: `appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(...)` checks existing bookings before building the entity.
2. **Optimistic Locking (JPA Entity)**: `@Version private Long version;` on the `Appointment` entity guarantees that if two concurrent requests attempt to modify the same doctor's schedule, one will fail with `ObjectOptimisticLockingFailureException`.
3. **Database Level Unique Constraint (PostgreSQL)**: `CONSTRAINT uk_doctor_date_slot UNIQUE (doctor_id, appointment_date, time_slot)` acts as the absolute ultimate barrier. Even under high-concurrency race conditions, PostgreSQL rejects duplicate inserts and throws `DataIntegrityViolationException`, which `GlobalExceptionHandler` converts into a user-friendly 409 Conflict response.

---

### 8. How Transactions are Used?
- `@Transactional(isolation = Isolation.READ_COMMITTED)` is applied to service methods like `bookAppointment()`, `checkInAppointment()`, `createConsultation()`, and `processPayment()`.
- Guarantees **Atomicity**: If updating an appointment status succeeds but generating the queue entry fails, the entire transaction rolls back cleanly, leaving zero orphaned records.

---

### 9. How Role-Based Authorization Works?
- Enforced on backend controller endpoints using `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")`.
- Enabled via `@EnableMethodSecurity` in `SecurityConfig.java`.
- Spring Security checks the granted authorities derived from the JWT claims (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_RECEPTIONIST`, `ROLE_PATIENT`).

---

### 10. How AI Integration Works?
- Isolated behind a clean `AIService` interface (`GeminiAIService` implementation).
- Interacts with Google Gemini REST API using `RestTemplate`.
- Generates consultation clinical summaries, medical document summaries, and parses natural language appointment intent strings into structured criteria.

---

### 11. How Frontend Communicates with Backend?
- Uses Next.js 15 App Router with Axios client (`src/lib/axios.ts`).
- Requests are proxied via `next.config.ts` rewrite or direct CORS configuration.
- Axios request interceptor attaches `Authorization: Bearer <token>` automatically.
- TanStack Query (`@tanstack/react-query`) handles caching, refetching, and loading/error states for React components.

---

### 12. How Database Relationships Work?
- `User` 1-to-1 with `Patient` and `Doctor`.
- `Doctor` M-to-1 with `Department`.
- `Appointment` M-to-1 with `Patient`, `Doctor`, and `Department`.
- `QueueEntry` 1-to-1 with `Appointment`.
- `Consultation` 1-to-1 with `Appointment`, 1-to-1 optional with `Prescription`.
- `Prescription` 1-to-Many with `PrescriptionItem`.
- `Invoice` 1-to-Many with `InvoiceItem`.

---

### 13. How the Project Could Scale?
- **Stateless Backend**: The Spring Boot app is completely stateless due to JWT authentication and can be horizontally scaled behind an NGINX / AWS ALB load balancer.
- **Read Replicas**: Separate read-heavy traffic (listing doctors, viewing history) to PostgreSQL Read Replicas.
- **Message Broker**: Introduce Apache Kafka or RabbitMQ for async notification processing and audit logging.

---

### 14. What Happens if Redis Goes Down?
- The application is architected with **graceful degraded fallbacks**.
- If Redis is unreachable, the system bypasses Redis caching and fetches availability directly from PostgreSQL without crashing.

---

### 15. What Happens if the AI API Goes Down?
- `GeminiAIService` wraps external API calls inside try-catch blocks.
- If the Gemini API key is missing or the external service times out, `GeminiAIService` falls back to a deterministic, local structured summarizer logic, ensuring the core hospital workflow remains 100% operational.

---

### 16. How Would You Deploy This?
- **Containerized Deployment**: Using Docker Compose or Kubernetes (EKS/GKE).
- **CI/CD Pipeline**: GitHub Actions for automated Maven test execution, SonarQube quality gates, Docker image building, and pushing to Amazon ECR.
- **Frontend**: Deployed to Vercel or Cloudflare Pages.

---

### 17. Security Improvements for Production
- Implement Rate Limiting (Bucket4j / Redis Rate Limiter) against brute force login attacks.
- Store JWT secrets in AWS Secrets Manager or HashiCorp Vault.
- Enforce Content Security Policy (CSP) and CORS origin strict white-listing.

---

### 18. Improvements for Version 2
- WebSockets / STOMP integration for real-time live queue screen updates on waiting room TVs.
- Integrated Stripe / Razorpay Webhooks for real credit card billing.
- DICOM Medical Imaging viewer integration for radiology scans.
