# Developer OS - Backend Service (v1.0)

The backend service acts as the resource server and control plane for the Developer OS platform. Built on Spring Boot 3.x and Java 21, it enforces multi-tenant identity governance, orchestrates Secure CI/CD triggers, and integrates seamlessly with robust Identity and Access Management (IAM) infrastructure.

## Core Domain Model & Resource Governance

The service strictly adheres to a multi-tenant data model, relying heavily on hierarchical scopes:

- **Organizational Tenancy**: Secure grouping of projects, tracking of user memberships, and definition of broad RBAC policies.
- **Projects**: Scoped instances for managing development meta-information (Repositories, Tags, Visibility Rules). Supports personal project creation devoid of organizational ownership.
- **Role-Based Access Control (RBAC)**: Fine-grained roles (`OWNER`, `ADMIN`, `MEMBER`, `CONTRIBUTOR`) enforced at both the organization and project levels.

## Security Architecture

The backend operates as a stateless OAuth2 Resource Server. Access requires a valid JSON Web Token (JWT) issued by the configured IAM provider (Keycloak).

### Method-Level Data Isolation
Data extraction and manipulation are protected by Spring Security's `@PreAuthorize` mechanisms:
- `@security.hasOrgRole(orgId, roles...)`: Ensures the requesting identity holds one of the specified membership roles within the target organization.
- `@security.hasProjectRole(projectId, roles...)`: Authenticates project-level governance and access rights.

### Extensible User Profiles & Identity Sync
The platform ensures identity consistency by directly syncing Keycloak's `preferred_username` globally across the application. Profile enrichment involves customizable Skills (with varied proficiency levels), Biographies, Location tracking, and dynamic connections to Organizations.

### Encrypted External Integrations
External integrations for automated metadata synchronization are powered by Personal Access Tokens (PATs) and governed by AES-256 GCM encryption. The `EncryptionService` dynamically handles the encryption and decryption processes within the database persistence layer to prevent secret exposure.

## Webhooks & Automated DevOps Integration

The service handles custom DevOps orchestration through a "Shadow CI" architectural pattern:

- **Intercept Mechanism**: `GitHubWebhookController.java` listens to configured `Push` events from the GitHub repository.
- **Payload Verification**: All incoming webhooks are strictly validated using configurable HMAC-SHA256 (`X-Hub-Signature-256`) request signatures.
- **Pipeline Invocation**: The `GitLabTriggerService` subsequently fires identical triggers to the Developer OS GitLab mirror to initiate comprehensive CI/CD pipelines (SAST, Security, Runtime Tests, Docker Containerization).

## API & File Management

All programmatic interaction is versioned and secured under `/api/v1/`.

### Generic File Asset Handling
`FileUploadService` securely manages physical disk storage (avatars, banners) using deterministic pathing and serves files dynamically via `FileController` with MIME type inference.

### Available Endpoint Resources
- `GET /api/status`: Health checks
- `/api/v1/projects/*`: Resource tracking, project membership, and external repository synchronization triggers.
- `/api/v1/organizations/*`: Organization membership, project aggregation, and event orchestration.
- `/api/v1/profile/*`: Individual developer profile management, external integration connections (e.g., GitHub PATs), and public portfolio generation.
- `/api/v1/skills/*`: Global technology catalog and individualized skill assignment with proficiency tracking.
- `/api/v1/webhooks/github`: Specialized endpoint exempted from JWT validation but enforced by cryptographic signature, used for routing GitHub Webhooks into GitLab Pipeline triggers.

## Local Development Execution

The service requires an available Keycloak identity provider and an underlying PostgreSQL 16 database. Both of these are bundled within the root `docker-compose.yml`.

To initialize the Spring Boot context locally on port 8081:

```bash
cd backend
./mvnw clean spring-boot:run
```
