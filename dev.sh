#!/usr/bin/env bash
# Start both frontend and backend dev servers.
# Usage: ./dev.sh

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo "Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

# Backend
echo "Starting backend on port 8001..."
cd "$ROOT/backend"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# Frontend
echo "Starting frontend on port 3000..."
cd "$ROOT/frontend"
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."
wait
