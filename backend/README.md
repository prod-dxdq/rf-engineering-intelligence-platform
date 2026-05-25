# Backend (FastAPI)

This backend is scaffold-only and organized for RF engineering calculations.

## Setup

Create and activate virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run development server:

```bash
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

PowerShell one-liner (from repository root):

```bash
cd backend; .venv\Scripts\Activate.ps1; .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Run a Python file directly

From the `backend/` folder, use the virtual environment Python executable:

```bash
.venv\Scripts\python.exe app\utils\conversions.py
```

Note: `conversions.py` defines helper functions and does not print output by default.

To run a quick example call from that file:

```bash
.venv\Scripts\python.exe -c "from app.utils.conversions import db_to_linear; print(db_to_linear(10))"
```

Open API docs at http://127.0.0.1:8000/docs.

## Notes

- Core RF equations are intentionally TODO placeholders.
- We will implement all RF logic step by step together.
