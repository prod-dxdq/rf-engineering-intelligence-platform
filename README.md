# RF Engineering Intelligence Platform

RF Engineering Intelligence Platform is a modular starter project for building a modern RF systems engineering workspace that combines:

- RFIC concepts and RF systems engineering workflows
- RF cascade analysis and receiver chain simulation
- Noise figure, gain, and IP3 analysis
- PLL and phase noise visualization
- Smith chart tools
- Future SDR analysis and ML signal classification

This scaffold uses:

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, shadcn/ui-ready structure
- Backend: Python + FastAPI
- RF/DSP libraries: NumPy, SciPy, scikit-rf, matplotlib
- Workflow: VS Code + GitHub + Vercel/v0 + Vercel CLI

## Project Structure

The repository is intentionally scaffold-only and beginner-friendly.

- `frontend/` contains UI scaffolding for Vercel/v0-generated pages and components.
- `backend/` contains FastAPI endpoint and RF analysis service placeholders.

## Current Status

- Placeholder components and API routes are created.
- Core RF equations are intentionally NOT implemented yet.
- TODO comments are placed throughout the code so we can build step by step together.

## Getting Started

1. Frontend setup: see `frontend/README.md`
2. Backend setup: see `backend/README.md`

## Run Frontend and Backend Together

Open 2 terminals from the repository root.

Terminal 1 (backend):

```bash
cd backend
.venv\Scripts\Activate.ps1
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

URLs:

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- Backend docs: http://127.0.0.1:8000/docs

## Roadmap (High Level)

- Implement cascade RF calculations in backend services
- Connect frontend dashboard panels to backend API
- Paste and adapt Vercel/v0-generated UI into `frontend/app` and `frontend/components`
- Add advanced RF visualization and simulation modules
- Add ML signal classification pipelines later
