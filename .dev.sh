cat > dev.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

# --- figure out your public 8080 url in Codespaces ---
# Codespaces exposes env vars we can use:
#   CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
# Example final URL: https://${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/api/v1

API_BASE=""
if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  API_BASE="https://${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/api/v1"
else
  # fallback: localhost (works if you run locally, not in a remote Codespace)
  API_BASE="http://localhost:8080/api/v1"
fi

echo "Using API base: ${API_BASE}"

# --- write frontend .env (idempotent) ---
mkdir -p frontend
printf "VITE_API_URL=%s\n" "$API_BASE" > frontend/.env

# --- start docker services (API + Mongo) ---
docker compose up -d --build

# quick health check
echo "Waiting for API health..."
for i in {1..30}; do
  if curl -fsS "${API_BASE}/healthz" >/dev/null 2>&1; then
    echo "API is healthy."
    break
  fi
  sleep 1
  if [[ $i -eq 30 ]]; then
    echo "API did not become healthy in time; check 'docker compose logs -f api'."
  fi
done

# --- start frontend (foreground) ---
cd frontend
npm run dev
SH
chmod +x dev.sh
