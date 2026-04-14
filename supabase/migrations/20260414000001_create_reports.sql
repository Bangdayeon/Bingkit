CREATE TABLE IF NOT EXISTS public.reports (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT        NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
