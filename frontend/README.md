# Developer OS - Frontend Interface (v1.0)

The web application layer of the Developer OS platform, explicitly engineered for speed, streamlined developer workflows, and centralized project governance.

## Technologies & Methodologies
- **Core Library**: React 18+ via Vite compilation
- **State & Structure**: TypeScript
- **Client Routing**: React Router DOM (v6+)
- **IAM Identity**: Official Keycloak JavaScript Adapter (OIDC)
- **Design System**: Tailwind CSS paired with strict organizational CSS Variables Theme abstraction

## User Interface Architecture

The frontend routing hierarchy is separated cleanly between global discovery pages and secure tenant-scoped administration panels.

- **`/organizations`**: Global organizational directory enabling real-time search and cross-tenant exploration.
- **`/projects`**: Public portal for repository and project lookups, including visibility status markers and custom tag filtration.
- **`/organizations/:orgSlug`**: Admin-facing organizational management board. Hub for configuring team RBAC controls, customizing CSS branding, and managing the organization's nested projects.
- **`/projects/:projectSlug`**: Public landing page generated for all projects automatically displaying automated GitHub metrics, external website routing, and contributor tracking.
- **`/projects/:projectSlug/settings`**: Dedicated owner-centric panel for Environment variables tracking, integration rules, and visibility switches.
- **`/profile`**: Scoped user administration layer for managing Biographies, Skills (integrated with DevIcon SVGs), automated GitHub Personal Access Token connections, and multi-tenant organization memberships.
- **`/u/:username`**: Instantly generated Public Developer Portfolios highlighting technology stacks, organization affiliation, follower statistics, and automated external links.

## Current Platform Capabilities

- **Secure Session Routing**: Client-side protected boundaries redirect unauthenticated users to the Keycloak instance. API calls are automatically intercepted and injected with Bearer JWT mechanisms. The global `preferred_username` dictates all public and protected URL namespaces.
- **Asset Integration**: Instant configuration of application UI parameters through local avatar and banner image uploads cleanly passed to the backend server.
- **GitHub PAT Configuration**: Streamlined Personal Access Token interface allowing highly scoped integrations without relying on complex, global OAuth App secrets.
- **Adaptive Responsive Layouts**: Deep multi-column layout structures employing `Sticky` positioning and `max-w-7xl` constraints, ensuring the platform scales elegantly from mobile screens to ultra-wide desktop monitors based on `index.css` root variables.

## Local Development Execution

Assuming necessary platform requirements (`backend` and `docker-compose` dependencies) are live, execute the interactive Vite server accessible via `localhost:5173`.

```bash
cd frontend
npm install
npm run dev
```
