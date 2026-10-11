-- ============================================================
-- StrayLink – Database Schema
-- Safe to run more than once (idempotent)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email      text,
    full_name  text,
    role       text NOT NULL DEFAULT 'reporter'
                   CHECK (role IN ('reporter', 'rescuer', 'pet-owner')),
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile, created automatically on signup via trigger.';

-- ─────────────────────────────────────────────────────────────
-- 2. REPORTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    animal_type    text NOT NULL
                       CHECK (animal_type IN ('Dog', 'Cat', 'Other')),
    condition      text NOT NULL
                       CHECK (condition IN ('Injured', 'Sick', 'Healthy')),
    description    text,
    location_label text,
    latitude       double precision,
    longitude      double precision,
    status         text NOT NULL DEFAULT 'Reported'
                       CHECK (status IN ('Reported', 'Claimed', 'En Route', 'Collected', 'At Vet')),
    rescuer_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    rating         integer CHECK (rating >= 1 AND rating <= 5),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reports IS 'Stray animal reports submitted by reporters.';

-- ─────────────────────────────────────────────────────────────
-- 3. INDEXES on reports
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_user_id    ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at);

-- ─────────────────────────────────────────────────────────────
-- 4. TRIGGER – auto-create profile row on auth.users INSERT
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'reporter')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY – enabled, NO public policies
--    The Supabase public API (anon key) cannot read these tables.
--    Only the backend, which connects via DATABASE_URL, can reach
--    the data.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports  ENABLE ROW LEVEL SECURITY;