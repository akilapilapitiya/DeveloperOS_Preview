#!/usr/bin/env bash

# ------------------------------------------------------------
# Script: setup_gitlab_mirroring.sh
# Purpose: Create a GitLab project and configure repository mirroring
#          from an existing GitHub repository.
# ------------------------------------------------------------
# Prerequisites:
#   1. GitLab Personal Access Token (with "api" scope)
#   2. GitLab group ID or namespace where the project will live
#   3. GitHub repository URL (HTTPS)
#   4. curl installed
#   5. jq installed (for pretty JSON parsing, optional)
# ------------------------------------------------------------

set -euo pipefail

# ---- Load config from .env ----
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  die ".env file not found at $ENV_FILE. Copy .env.example to .env and fill in your credentials."
fi

# shellcheck disable=SC1090
source "$ENV_FILE"
# --------------------------------


# Helper: exit with message
function die() { echo "Error: $*" >&2; exit 1; }

# Create the GitLab project
echo "Creating GitLab project '$PROJECT_NAME'..."
CREATE_RESP=$(curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data "name=$PROJECT_NAME&namespace_id=$GITLAB_GROUP_ID&visibility=private" \
  "$GITLAB_URL/api/v4/projects")

PROJECT_ID=$(echo "$CREATE_RESP" | jq -r .id || echo "")
if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "null" ]]; then
  die "Failed to create project. Response: $CREATE_RESP"
fi

echo "Project created with ID $PROJECT_ID"

# Enable repository mirroring from GitHub
echo "Setting up repository mirroring from GitHub..."
MIRROR_RESP=$(curl -sS --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  --data-urlencode "url=$GITHUB_REPO_URL" \
  --data "enabled=true&only_protected_branches=false&keep_divergent_refs=true" \
  "$GITLAB_URL/api/v4/projects/$PROJECT_ID/remote_mirrors")

# Check for errors
if echo "$MIRROR_RESP" | grep -qi '"message".*error\|"error"'; then
  die "Failed to configure mirroring. Response: $MIRROR_RESP"
fi

echo "Mirroring configured successfully."

echo "You can now push to GitLab and GitLab will sync with the GitHub repo."

# Optional: trigger a manual sync now
# curl -X POST "$GITLAB_URL/api/v4/projects/$PROJECT_ID/remote_mirrors/$MIRROR_ID/update" \
#   --header "PRIVATE-TOKEN: $GITLAB_TOKEN"

echo "Done."
