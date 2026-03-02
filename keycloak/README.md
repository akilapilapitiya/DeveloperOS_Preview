# Developer OS - IAM & Security (v1.0)

This system module dictates the deployment structure for the centralized Identity and Access Management (IAM) systems underpinning the Developer OS platform.

## Infrastructure

Identity governance relies solely on a local instantiation of [Keycloak (v24.0)](https://www.keycloak.org/) automatically orchestrated by the platform's `docker-compose.yml`.

## Authentication Flow Details

Security is federated transparently across the decoupled architecture.

The core settings definition (`realm-export.json`) defines the `developer-os` ecosystem, enforcing the following behaviors automatically upon container spin-up:

- **Client Scopes**: Detailed claim generation enforcing access rules.
- **OIDC Standards**: OpenID Connect tokens defining strict session limitations.
- **Role Automation**: Generates expected platform roles utilized by the Spring Boot backend (`admin`, `developer`) within encoded JWT definitions.

## Keycloak Client Applications

- **`backend-api`**: Acts as the Spring Boot confidential client definition, interpreting JWT validity states internally.
- **`frontend-client`**: Defined as a Public web-centric client facilitating PKCE authentication challenges inside the React frontend logic securely, omitting insecure client-secret distribution risks.
