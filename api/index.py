"""
Vercel serverless entry point.

Loads the FastAPI app from backend/api/index.py using path-based import
(importlib — same pattern as the Week 12 tutorial).  Vercel's Python
runtime discovers the ``app`` object in this file.
"""

import importlib.util
import sys
from pathlib import Path

# ── Load .env before importing the app ───────────────────────────────
# On Vercel this is a no-op (no .env file; env vars come from the
# dashboard).  Locally it picks up backend/.env so the app works
# when invoked via ``uvicorn api.index:app`` from the repo root.
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")

# ── Path-based import of backend/api/index.py ────────────────────────
_spec = importlib.util.spec_from_file_location(
    "backend.api.index",
    str(Path(__file__).resolve().parent.parent / "backend" / "api" / "index.py"),
)
_mod = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _mod
_spec.loader.exec_module(_mod)

app = _mod.app