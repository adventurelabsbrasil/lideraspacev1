-- =============================================================================
-- LideraSpace: Módulo 6 — Blocos Infinitos, Hierarquia e Estado do Aluno
-- =============================================================================

-- 1. Hierarquia de Módulos (Páginas dentro de páginas)
ALTER TABLE public.modulos 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.modulos(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_modulos_parent_id ON public.modulos(parent_id);

-- 2. Novos campos de conteúdo estruturado
ALTER TABLE public.modulos 
ADD COLUMN IF NOT EXISTS descricao text;

ALTER TABLE public.modulos 
ADD COLUMN IF NOT EXISTS blocos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Estado persistente do Aluno (Anotações e Checklist por página)
CREATE TABLE IF NOT EXISTS public.aluno_modulo_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  anotacoes text DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, modulo_id)
);

ALTER TABLE public.aluno_modulo_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own modulo state" ON public.aluno_modulo_state;
CREATE POLICY "Users can manage their own modulo state"
  ON public.aluno_modulo_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at ON public.aluno_modulo_state;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.aluno_modulo_state
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
