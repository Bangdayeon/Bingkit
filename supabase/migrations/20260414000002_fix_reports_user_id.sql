-- reports 테이블에 user_id 컬럼이 없는 경우 추가
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- RLS 활성화 (이미 활성화된 경우 무시됨)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
