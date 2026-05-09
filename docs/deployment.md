# Deployment

[Back to Wiki](README.md)

## Prerequisites

| Tool | Version | Required for |
|------|---------|-------------|
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend dependencies |
| Python | 3.10+ | Backend (Prophet only) |
| Docker | latest | Production deployment |

## Development Setup

### Quick Start (helper script)

```bash
./dev.sh
```

This starts both backend and frontend with hot reload, and handles cleanup on Ctrl+C.

### Manual Start

**Terminal 1 — Backend** (only needed for Prophet):

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Linux/Mac
# .\venv\Scripts\activate      # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm start
# Open http://localhost:3000
```

### Running Tests

```bash
cd frontend
npm test              # Single run
npm run test:watch    # Watch mode

# Or use the helper:
./test.sh
```

## Docker (Production)

```bash
docker compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8001
```

### Docker Architecture

```
docker-compose.yml
  |
  |-- backend (Python)
  |     Dockerfile: python:3.x
  |     Port: 8001
  |     Command: uvicorn main:app --host 0.0.0.0 --port 8001
  |
  |-- frontend (Node build + Nginx)
  |     Dockerfile: multi-stage
  |       Stage 1: node:20-alpine → npm ci && npm run build
  |       Stage 2: nginx:alpine → serve dist/ on port 3000
  |     Depends on: backend
```

### Nginx Configuration

The frontend Nginx config handles:
- **SPA routing:** `try_files $uri /index.html` — all routes fall back to index.html
- **API proxy:** `/api/*` requests are forwarded to `http://backend:8001`
- **Headers:** Sets `Host` and `X-Real-IP` for the backend

## Environment Variables

| Variable | Default | Where | Purpose |
|----------|---------|-------|---------|
| `VITE_API_URL` | `http://localhost:8001` | Frontend | Backend URL for Prophet API calls |
| `VITE_GOOGLE_CLIENT_ID` | — | Frontend | Google OAuth client ID (optional) |

Set these before building the frontend:

```bash
VITE_API_URL=https://api.example.com npm run build
```

## Ports

| Service | Port | Configurable |
|---------|------|-------------|
| Frontend (dev) | 3000 | `vite.config.mjs` |
| Frontend (Docker) | 3000 | `nginx.conf` + `docker-compose.yml` |
| Backend | 8001 | CLI arg: `--port XXXX` |

> Port 8001 is used instead of the default 8000 because 8000 was occupied on the development machine.

## Platform Notes

### Arch Linux
```bash
sudo pacman -S python nodejs npm
```

### Windows
```powershell
# Use PowerShell for venv activation:
.\venv\Scripts\activate
```

See [DEV-RAW.md](../DEV-RAW.md) for full platform-specific setup instructions.

## Related Pages

- [Architecture](architecture.md) — system design overview
- [Backend](backend.md) — backend server details
- [API Reference](api.md) — endpoint documentation
