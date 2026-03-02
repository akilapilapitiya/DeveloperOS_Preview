# Developer OS (v1.0)

[![GitLab CI/CD Pipeline Status](https://gitlab.com/akilapilapitiya/developeros/badges/test/pipeline.svg)](https://gitlab.com/akilapilapitiya/developeros/-/pipelines)

Developer OS is a comprehensive, multi-tenant platform designed to centralize development workflows, resource management, and identity integration into a unified ecosystem. Version 1.0 establishes the core infrastructure for organization governance, project tracking, secure external integrations, and automated DevOps orchestration.

## Architecture & Technology Stack

The platform is designed using a modern, decoupled client-server architecture, secured by a dedicated Identity and Access Management (IAM) provider and orchestrated via containerization.

- **Frontend Application**: React 18, TypeScript, Vite, Tailwind CSS (V2 Design System via Shadcn UI)
- **Backend Service**: Spring Boot 3.x, Java 21, Spring Data JPA, Hibernate
- **Database Layer**: PostgreSQL 16
- **Identity & Access Management (IAM)**: Keycloak 24 (OIDC / OAuth2) with Custom V2 UI Theme
- **CI/CD & Orchestration**: Docker, Docker Compose, GitLab CI/CD, Custom Shadow CI Webhook

## Key Features (V2 Navigation & UI Architecture)

### 1. High-Density Enterprise Interface (v2.0)
- **Shadcn UI & Tailwind**: Fully refactored component architecture moving away from legacy HTML elements to a strict, headless component system (Radix Primitives).
- **Zod & React Hook Form**: Zero-lag form validation handling and strict TypeScript schema enforcement across all organizational and project creations.
- **Custom Keycloak Integration**: A bespoke Keycloak FreeMarker (`.ftl`) theme injected with Tailwind CSS to provide a seamless, dark-mode authentication experience identical to the main React application.

### 2. Multi-Tenant Governance & RBAC (v2.1)
- **Organizations & Events**: Hierarchical resource management allowing users to create organizations, manage membership, and scope events within them. Dedicated workspace tabs provide structured views for Members, Events, and Overview.
- **Event Lifecycle Tracking**: Events now feature an `OPEN`/`CLOSED` binary status. Only `OPEN` events are available for project association, allowing administrators to gate project onboarding flows dynamically.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (OWNER, ADMIN, DEVELOPER) at the organization level, and (ADMINISTRATOR, PARTICIPANT) at the event level. Roles define CRUD capabilities for resources, project associations, and member onboarding.
- **Global Identity Sync**: Seamless `preferred_username` extraction from Keycloak JWTs across all domain entities, synchronized via a centralized `UserService` that supports deep user search by username/email for participant management.

### 3. Project Ecosystem
- **Mandatory Event Association**: Organization-scoped projects are strictly bound to an active Event context, preventing orphaned resources and ensuring alignment with organizational activities.
- **Personal Projects**: Support for independent projects operating outside of organizational constraints.
- **GitHub Metadata Integration**: Import-driven creation with automated background synchronization of repository stats (Description, Topics, Forks, Stars) using AES-256 GCM encrypted token storage.
### 4. Cross-Platform DevOps Automation ("Shadow CI")
- **Custom Orchestration**: Spring Boot acts as a secure CI/CD bridge between GitHub and GitLab.
- **HMAC Verification**: Cryptographic validation (`X-Hub-Signature-256`) of real-time push events from GitHub.
- **GitLab Pipeline Execution**: Automated triggering of comprehensive GitLab CI/CD pipelines (SAST, Secret Detection, PostgreSQL Integration Testing, Multi-stage Docker Builds) upon code integration.

## Project Structure

- `/backend`: Spring Boot REST API, generic file asset serving, and Shadow CI controller.
- `/frontend`: React SPA, Keycloak JS integration, and Tailwind-based design system.
- `/keycloak`: Pre-configured Keycloak realm (`realm-export.json`) for instant localized IAM bootstrapping.
- `.gitlab-ci.yml`: Definition of the automated DevOps pipeline logic.
- `docker-compose.yml`: Local infrastructure orchestration for PostgreSQL, Keycloak, and ngrok (for local webhook testing).

## Local Development Setup

### 1. Start Infrastructure
Ensure Docker is running, then initialize the database, IAM, and optional webhook tunneling:
```bash
docker compose up -d
```

### 2. Start Backend Service
Requires Java 21. Navigates to the backend directory and starts the Spring Boot application on `localhost:8081`.
```bash
cd backend
source .env # (If utilizing local Shadow CI testing)
./mvnw spring-boot:run
```

### 3. Start Frontend Application
Requires Node.js. Navigates to the frontend directory and starts the Vite development server on `localhost:5173`.
```bash
cd frontend
npm install
npm run dev
```

## Access Credentials (Local Environment)

- **Keycloak Admin Console**: `http://localhost:8080` (admin / admin)
- **PostgreSQL Database**: `localhost:5433` (devuser / devpassword)
- **Application Access**: Users can dynamically register via the Keycloak login flow when attempting to access authenticated areas of the frontend application.