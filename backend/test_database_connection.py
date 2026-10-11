"""
Verify that the Supabase Postgres database is reachable and that the
expected tables exist.

Usage (from the repository root):
    python backend/test_database_connection.py
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

    expected_tables = {"profiles", "reports"}

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        # Check connection
        cur.execute("SELECT 1")
        cur.fetchone()
        print("Database connection successful")

        # Verify tables exist in public schema
        cur.execute(
            """
            SELECT table_name
              FROM information_schema.tables
             WHERE table_schema = 'public'
               AND table_name = ANY(%s)
            """,
            (list(expected_tables),),
        )
        found = {row[0] for row in cur.fetchall()}

        cur.close()
        conn.close()
    except Exception as exc:
        print(f"ERROR: Database connection failed – {exc}", file=sys.stderr)
        sys.exit(1)

    for table in sorted(expected_tables):
        if table in found:
            print(f"Table found: {table}")
        else:
            print(f"Table MISSING: {table}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()