#!/usr/bin/env bash
# Tunnel public HTTPS -> local Vite (default port 5173).
# 1) Start the app: cd frontend && npm run dev
# 2) Run: ./scripts/ngrok-frontend.sh
#    or:   ./scripts/ngrok-frontend.sh 5174
set -euo pipefail
PORT="${1:-5173}"
echo "Tunnel -> http://127.0.0.1:${PORT} (start Vite on this port first)"
exec ngrok http "127.0.0.1:${PORT}"
