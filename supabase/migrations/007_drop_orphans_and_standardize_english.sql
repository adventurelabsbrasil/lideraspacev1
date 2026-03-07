-- =============================================================================
-- LideraSpace: Drop orphan tables (from other template) then standardize to English
-- Idempotent: safe to run after 006 (which may have already renamed some tables).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Drop orphan tables (order: respect FKs)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- -----------------------------------------------------------------------------
-- 2. Rename LideraSpace tables to English (only if source table exists)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programas') THEN
    ALTER TABLE public.programas RENAME TO programs;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modulos') THEN
    ALTER TABLE public.modulos RENAME TO modules;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tarefas') THEN
    ALTER TABLE public.tarefas RENAME TO tasks;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ativos') THEN
    ALTER TABLE public.ativos RENAME TO assets;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'aluno_modulo_state') THEN
    ALTER TABLE public.aluno_modulo_state RENAME TO student_module_states;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. Rename columns (programs) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'titulo') THEN
    ALTER TABLE public.programs RENAME COLUMN titulo TO title;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'imagem_banner_url') THEN
    ALTER TABLE public.programs RENAME COLUMN imagem_banner_url TO banner_image_url;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'favicon_programa_url') THEN
    ALTER TABLE public.programs RENAME COLUMN favicon_programa_url TO program_favicon_url;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'favicon_criador_url') THEN
    ALTER TABLE public.programs RENAME COLUMN favicon_criador_url TO creator_favicon_url;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Rename columns (modules) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'programa_id') THEN
    ALTER TABLE public.modules RENAME COLUMN programa_id TO program_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'titulo') THEN
    ALTER TABLE public.modules RENAME COLUMN titulo TO title;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'ordem') THEN
    ALTER TABLE public.modules RENAME COLUMN ordem TO sort_order;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'topicos') THEN
    ALTER TABLE public.modules RENAME COLUMN topicos TO topics;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'subtopicos') THEN
    ALTER TABLE public.modules RENAME COLUMN subtopicos TO subtopics;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'materiais') THEN
    ALTER TABLE public.modules RENAME COLUMN materiais TO materials;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'imagem_banner_url') THEN
    ALTER TABLE public.modules RENAME COLUMN imagem_banner_url TO banner_image_url;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'favicon_programa_url') THEN
    ALTER TABLE public.modules RENAME COLUMN favicon_programa_url TO program_favicon_url;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'conteudo') THEN
    ALTER TABLE public.modules RENAME COLUMN conteudo TO content;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'descricao') THEN
    ALTER TABLE public.modules RENAME COLUMN descricao TO description;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'blocos') THEN
    ALTER TABLE public.modules RENAME COLUMN blocos TO blocks;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. Rename columns (tasks) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'programa_id') THEN
    ALTER TABLE public.tasks RENAME COLUMN programa_id TO program_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'modulo_id') THEN
    ALTER TABLE public.tasks RENAME COLUMN modulo_id TO module_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'titulo') THEN
    ALTER TABLE public.tasks RENAME COLUMN titulo TO title;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. Rename columns (assets) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'programa_id') THEN
    ALTER TABLE public.assets RENAME COLUMN programa_id TO program_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'modulo_id') THEN
    ALTER TABLE public.assets RENAME COLUMN modulo_id TO module_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'titulo') THEN
    ALTER TABLE public.assets RENAME COLUMN titulo TO title;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'tipo_icone') THEN
    ALTER TABLE public.assets RENAME COLUMN tipo_icone TO icon_type;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 7. Rename columns (student_module_states) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'modulo_id') THEN
    ALTER TABLE public.student_module_states RENAME COLUMN modulo_id TO module_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'anotacoes') THEN
    ALTER TABLE public.student_module_states RENAME COLUMN anotacoes TO notes;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. Rename columns (profiles) - only if column exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_completo') THEN
    ALTER TABLE public.profiles RENAME COLUMN nome_completo TO full_name;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 9. Update triggers (set_updated_at) - only on tables that exist
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programs') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.programs;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.modules;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.assets;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_module_states') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.student_module_states;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_module_states FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 10. Recreate RLS policy for student_module_states - only if table exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_module_states') THEN
    DROP POLICY IF EXISTS "Users can manage their own modulo state" ON public.student_module_states;
    CREATE POLICY "Users can manage their own module state"
      ON public.student_module_states
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 11. Update handle_new_user to use full_name (profiles column renamed)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
