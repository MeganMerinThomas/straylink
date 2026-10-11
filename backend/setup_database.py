"""
Run backend/sql/setup.sql against the Supabase Postgres database.

Usage (from the repository root):
    python backend/setup_database.py
"""

import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
import psycopg2


def _redact(url: str) -> str:
    """Replace the password portion of a Postgres connection URL."""
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", url)


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL is not set. Check your .env file.", file=sys.stderr)
        sys.exit(1)

    sql_path = Path(__file__).resolve().parent / "sql" / "setup.sql"
    if not sql_path.exists():
        print(f"ERROR: SQL file not found at {sql_path}", file=sys.stderr)
        sys.exit(1)

    sql = sql_path.read_text(encoding="utf-8")

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        cur.close()
        conn.close()
    except Exception as exc:
        print(f"ERROR: Failed to initialise database – {exc}", file=sys.stderr)
        sys.exit(1)

    print("Database initialization completed successfully")


if __name__ == "__main__":
    main()