# MEDIFLOW — Smart Hospital Workflow Management Platform

MEDIFLOW is a production-quality full-stack SaaS healthcare application built with **Spring Boot 3 (Java 17/21)** and **Next.js 15 (React 19 + TypeScript + Tailwind CSS)**. It provides role-based clinical hospital management, real-time waiting room queue tracking, double-booking prevention, AI consultation summarization (Google Gemini API), and integrated medical billing.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Design & ER Diagram](#database-design--er-diagram)
6. [API Architecture & Swagger](#api-architecture--swagger)
7. [Authentication & Security Flow](#authentication--security-flow)
8. [AI Architecture & Resilience](#ai-architecture--resilience)
9. [Pre-Seeded Demo Credentials](#pre-seeded-demo-credentials)
10. [Windows Setup Guide (Step-by-Step)](#windows-setup-guide-step-by-step)
11. [Docker Setup](#docker-setup)
12. [Environment Variables](#environment-variables)
13. [Running Automated Tests](#running-automated-tests)
14. [Future Enhancements](#future-enhancements)

---

## Project Overview
MEDIFLOW is engineered for enterprise healthcare providers to streamline patient check-in queues, doctor consultation notes, prescription dispatch, and invoice payments while offering administrative oversight through real-time operational analytics dashboards.

---

## Key Features
- **Role-Based Access Control (RBAC)**: Enforced backend security for `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT`.
- **Double Booking Prevention**: Multi-layered protection using JPA `@Version` optimistic locking, pre-booking availability verification, and PostgreSQL multi-column unique constraints `(doctor_id, appointment_date, time_slot)`.
- **Real-Time Queue Management**: Automatic token generation (`Q-101`, `Q-102`), receptionist check-in, and doctor caller system.
- **AI Clinical Assistant**: Powered by Google Gemini API for automated consultation clinical summaries, medical report text summarization, and natural language appointment slot parsing.
- **Digital Prescriptions & Invoices**: Itemized medication lists with print-friendly layout and mock payment gateway checkout.
- **Automated Flyway Migrations**: Pre-seeded with 5 departments, doctors, patients, active appointments, queue entries, and audit trails out of the box.

---

## Technology Stack

### Backend
- **Core**: Java 17 / 21, Spring Boot 3.3.4, Spring Web
- **Data & Persistence**: Spring Data JPA, Hibernate, PostgreSQL, H2 (Local profile), Flyway DB Migrations
- **Security**: Spring Security 6, JWT (JJWT 0.12.6), BCrypt Password Hashing
- **Cache & Async**: Redis (Spring Data Redis)
- **Documentation & Testing**: Springdoc OpenAPI (Swagger 3), JUnit 5, Mockito

### Frontend
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Lucide React Icons, Custom Glassmorphism Theme
- **State & Data Fetching**: TanStack React Query v5, Axios, React Hook Form, Zod
- **Data Visualization**: Recharts

---

## System Architecture

```
[ Next.js 15 Frontend ] <---> [ REST APIs / JWT ] <---> [ Spring Boot 3 Backend ]
                                                               |
                                   +---------------------------+---------------------------+
                                   |                           |                           |
                           [ PostgreSQL DB ]            [ Redis Cache ]             [ Gemini AI API ]
```

---

## Database Design & ER Diagram

The database schema is managed via Flyway (`V1__initial_schema.sql` and `V2__seed_data.sql`).

```
+---------------+       +---------------+       +------------------+
|     Users     | <---> |    Doctors    | ----> |   Departments    |
+---------------+       +---------------+       +------------------+
        ^                       ^
        |                       |
        v                       v
+---------------+       +---------------+       +------------------+
|   Patients    | <---> | Appointments  | <---> |  Queue Entries   |
+---------------+       +---------------+       +------------------+
                                ^
                                |
                                v
                        +---------------+       +------------------+
                        | Consultations | ----> |  Prescriptions   |
                        +---------------+       +------------------+
                                |
                                v
                        +---------------+
                        |   Invoices    |
                        +---------------+
```

---

## API Architecture & Swagger

Swagger UI is available at:
👉 **`http://localhost:8080/swagger-ui.html`**

OpenAPI JSON specification:
👉 **`http://localhost:8080/v3/api-docs`**

### Key REST Endpoints
- `POST /api/auth/login` — Authenticate user and issue JWT Access + Refresh Tokens
- `POST /api/auth/register` — User self-registration
- `GET /api/appointments/available-slots` — Retrieve available time slots for doctor & date
- `POST /api/appointments` — Book new appointment (double-booking protected)
- `POST /api/queue/check-in/{appointmentId}` — Check in patient and assign queue token
- `POST /api/queue/call-next/{doctorId}` — Doctor calls next waiting patient
- `POST /api/consultations` — Finalize doctor consultation & diagnosis
- `POST /api/prescriptions` — Issue digital medication prescription
- `POST /api/invoices/{id}/pay` — Process invoice payment
- `POST /api/ai/consultation-summary` — Auto-generate AI clinical summary

---

## Authentication & Security Flow

1. User logs in with email & password.
2. Spring Security authenticates credentials using BCrypt.
3. Backend returns a short-lived **Access Token** (15 mins) and a long-lived **Refresh Token** (7 days).
4. Axios interceptor automatically attaches `Authorization: Bearer <token>` to all HTTP requests.
5. On token expiry, client invokes `/api/auth/refresh` to rotate tokens without requiring re-login.

---

## AI Architecture & Resilience

All AI calls are routed through the `AIService` interface (`GeminiAIService` implementation).
- If `AI_API_KEY` is provided, calls Google Gemini REST API (`gemini-1.5-flash`).
- If `AI_API_KEY` is **absent or unreachable**, the application gracefully falls back to deterministic local rule-based summarizers without throwing exceptions or crashing!

---

## Pre-Seeded Demo Credentials

Default Password for all demo accounts: **`Password123!`**

| Role | Email | Capabilities |
|---|---|---|
| **ADMIN** | `admin@mediflow.com` | View system analytics, audit logs, all departments |
| **DOCTOR** | `doctor@mediflow.com` | View queue, call patients, write consultation notes, AI summaries |
| **RECEPTIONIST** | `reception@mediflow.com` | Patient registration, check-in, appointment queue management |
| **PATIENT** | `patient@mediflow.com` | Book appointments, view prescriptions, medical history, pay invoices |

---

## Windows Setup Guide (Step-by-Step)

Follow these exact steps to run MEDIFLOW on Windows without Docker:

### Step 1: Verify Java 17 / 21
Ensure JDK 17 or 21 is installed:
```powershell
java -version
```

### Step 2: Verify Node.js (v18+)
Ensure Node.js and npm are installed:
```powershell
node -v
npm -v
```

### Step 3: Clone / Navigate to Project Directory
```powershell
cd C:\Users\susan\.gemini\antigravity\scratch\mediflow
```

### Step 4: Configure Environment Variables (Optional)
Copy `.env.example` to `.env` if custom database settings or AI API keys are desired:
```powershell
Copy-Item .env.example .env
```

### Step 5: Build & Start Spring Boot Backend
The backend uses Maven Wrapper out of the box with embedded H2 profile (zero DB install needed for local testing):
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Backend will start on `http://localhost:8080`.*

### Step 6: Install Frontend Dependencies & Start Next.js
In a new PowerShell window:
```powershell
cd C:\Users\susan\.gemini\antigravity\scratch\mediflow\frontend
npm install
npm run dev
```
*Frontend will start on `http://localhost:3000`.*

### Step 7: Open Application
Open your browser and navigate to:
👉 **`http://localhost:3000`**

Click any of the **Quick Demo Credentials** buttons (`ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PATIENT`) on the login screen to sign in instantly!

---

## Docker Setup

To run the full production stack (PostgreSQL + Redis + Spring Boot + Next.js) using Docker Compose:

```powershell
docker compose up --build
```

Access Points:
- **Frontend App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8080`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

---

## Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `jdbc:h2:mem:mediflowdb` (local) | Database JDBC URL |
| `DATABASE_USERNAME` | `sa` / `mediflow_user` | Database user |
| `DATABASE_PASSWORD` | `mediflow_password` | Database password |
| `REDIS_HOST` | `localhost` | Redis host |
| `JWT_SECRET` | `9a4f2...` | 256-bit HMAC secret |
| `AI_API_KEY` | *(empty)* | Google Gemini API key |

---

## Running Automated Tests

Run Spring Boot unit and integration tests (including double-booking concurrency tests):

```powershell
cd backend
.\mvnw.cmd test
```

---

## Future Enhancements
- WebSockets for real-time waiting room TV queue display.
- Razorpay / Stripe payment gateway integration.
- FHIR / DICOM medical record exchange standard compatibility.
