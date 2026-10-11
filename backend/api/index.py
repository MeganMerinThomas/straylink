import os
import re
import time
from pathlib import Path
from typing import Optional

import httpx
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator

# ── Env ──────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "")

AUTH_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json",
}

# ── App ──────────────────────────────────────────────────────────────
app = FastAPI(title="StrayLink API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────────────
def _get_db():
    """Open a psycopg2 connection (bypasses RLS via service role)."""
    return psycopg2.connect(DATABASE_URL)


def _load_profile(user_id: str) -> Optional[dict]:
    """Fetch a single profile row by auth user id."""
    conn = _get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT id, email, full_name, role, created_at "
            "FROM public.profiles WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        cur.close()
        return dict(row) if row else None
    finally:
        conn.close()


async def _supabase_user(token: str) -> dict:
    """Validate a Bearer token with Supabase Auth and return the user dict."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {token}",
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return resp.json()


# ── Auth dependency ──────────────────────────────────────────────────
async def current_user(request: Request) -> dict:
    """Extract Bearer token → validate with Supabase → return profile row."""
    auth_header: str = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = auth_header[7:]
    supa_user = await _supabase_user(token)
    profile = _load_profile(supa_user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile


# ── Request / response models ────────────────────────────────────────
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role")
    @classmethod
    def role_valid(cls, v: str) -> str:
        if v not in ("reporter", "rescuer", "pet-owner"):
            raise ValueError("Role must be reporter, rescuer, or pet-owner")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str
    user: dict


class CreateReportRequest(BaseModel):
    animal_type: str
    condition: str
    description: str
    location_label: str = ""
    latitude: float | None = None
    longitude: float | None = None

    @field_validator("animal_type")
    @classmethod
    def animal_type_valid(cls, v: str) -> str:
        if v not in ("Dog", "Cat", "Other"):
            raise ValueError("animal_type must be Dog, Cat, or Other")
        return v

    @field_validator("condition")
    @classmethod
    def condition_valid(cls, v: str) -> str:
        if v not in ("Injured", "Sick", "Healthy"):
            raise ValueError("condition must be Injured, Sick, or Healthy")
        return v


class UpdateStatusRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        if v not in ("Reported", "Claimed", "En Route", "Collected", "At Vet"):
            raise ValueError("Invalid status")
        return v


class UpdateRatingRequest(BaseModel):
    rating: int

    @field_validator("rating")
    @classmethod
    def rating_valid(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


# ── Endpoints ────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(body: SignupRequest):
    """Create a new user via Supabase Auth, then return tokens + profile."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers=AUTH_HEADERS,
            json={
                "email": body.email,
                "password": body.password,
                "data": {
                    "full_name": body.full_name,
                    "role": body.role,
                },
            },
        )

    if resp.status_code not in (200, 201):
        error_body = resp.json()
        msg = error_body.get("msg", error_body.get("message", "Signup failed"))
        if "already registered" in msg.lower() or "already been registered" in msg.lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        raise HTTPException(status_code=resp.status_code, detail=msg)

    data = resp.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token", "")
    expires_in = data.get("expires_in", 3600)
    token_type = data.get("token_type", "bearer")

    supa_user = data.get("user")
    if not supa_user and access_token:
        supa_user = await _supabase_user(access_token)

    user_id = supa_user["id"]

    # The DB trigger should have created the profile; wait briefly if needed
    profile = _load_profile(user_id)
    if not profile:
        time.sleep(0.5)
        profile = _load_profile(user_id)
    if not profile:
        raise HTTPException(status_code=500, detail="Profile was not created")

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        token_type=token_type,
        user=profile,
    )


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Authenticate an existing user via Supabase Auth."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=AUTH_HEADERS,
            json={"email": body.email, "password": body.password},
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    data = resp.json()
    access_token = data["access_token"]
    refresh_token = data.get("refresh_token", "")
    expires_in = data.get("expires_in", 3600)
    token_type = data.get("token_type", "bearer")
    supa_user = data.get("user", {})

    profile = _load_profile(supa_user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        token_type=token_type,
        user=profile,
    )


@app.get("/api/auth/me")
async def me(profile: dict = Depends(current_user)):
    """Return the authenticated user's profile."""
    return profile


# ── Report endpoints ─────────────────────────────────────────────────
@app.post("/api/reports")
async def create_report(
    body: CreateReportRequest,
    profile: dict = Depends(current_user),
):
    """Create a new stray report for the logged-in user."""
    conn = _get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            INSERT INTO public.reports
                (user_id, animal_type, condition, description,
                 location_label, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                profile["id"],
                body.animal_type,
                body.condition,
                body.description,
                body.location_label,
                body.latitude,
                body.longitude,
            ),
        )
        row = dict(cur.fetchone())
        conn.commit()
        cur.close()
    finally:
        conn.close()
    return row


@app.get("/api/reports")
async def list_reports(profile: dict = Depends(current_user)):
    """
    List reports.
    Rescuers see every report (newest first) with the reporter's name.
    Reporters and pet-owners see only their own reports.
    """
    conn = _get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if profile["role"] == "rescuer":
            cur.execute(
                """
                SELECT r.*, p.full_name AS reporter_name
                  FROM public.reports r
                  LEFT JOIN public.profiles p ON r.user_id = p.id
                 ORDER BY r.created_at DESC
                """,
            )
        else:
            cur.execute(
                """
                SELECT r.*, p.full_name AS reporter_name
                  FROM public.reports r
                  LEFT JOIN public.profiles p ON r.user_id = p.id
                 WHERE r.user_id = %s
                 ORDER BY r.created_at DESC
                """,
                (profile["id"],),
            )
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
    finally:
        conn.close()
    return rows


@app.patch("/api/reports/{report_id}/status")
async def update_report_status(
    report_id: str,
    body: UpdateStatusRequest,
    profile: dict = Depends(current_user),
):
    """Rescuers only: set report status and record rescuer_id."""
    if profile["role"] != "rescuer":
        raise HTTPException(status_code=403, detail="Only rescuers can update report status")

    conn = _get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            UPDATE public.reports
               SET status     = %s,
                   rescuer_id = %s,
                   updated_at = now()
             WHERE id = %s
             RETURNING *
            """,
            (body.status, profile["id"], report_id),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Report not found")
        conn.commit()
        cur.close()
        return dict(row)
    finally:
        conn.close()


@app.patch("/api/reports/{report_id}/rating")
async def rate_report(
    report_id: str,
    body: UpdateRatingRequest,
    profile: dict = Depends(current_user),
):
    """Only the report owner can rate it, 1 to 5."""
    conn = _get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT user_id FROM public.reports WHERE id = %s",
            (report_id,),
        )
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Report not found")
        if str(existing["user_id"]) != str(profile["id"]):
            raise HTTPException(status_code=403, detail="Only the report owner can rate it")

        cur.execute(
            """
            UPDATE public.reports
               SET rating     = %s,
                   updated_at = now()
             WHERE id = %s
             RETURNING *
            """,
            (body.rating, report_id),
        )
        row = dict(cur.fetchone())
        conn.commit()
        cur.close()
        return row
    finally:
        conn.close()