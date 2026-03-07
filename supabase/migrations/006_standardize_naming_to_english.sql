-- =============================================================================
-- LideraSpace: Padronização do Banco de Dados para Inglês
-- Script inteligente e seguro: só renomeia se o objeto de origem existir
-- E se o objeto de destino (o novo nome) ainda NÃO existir.
-- =============================================================================

DO $$
BEGIN

  -- ==========================================
  -- 1. Renomeação de Tabelas
  -- ==========================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programas') 
     AND NOT EXISTS (SELECT FROM pg_class WHERE relname = 'programs' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.programas RENAME TO programs;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modulos') 
     AND NOT EXISTS (SELECT FROM pg_class WHERE relname = 'modules' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.modulos RENAME TO modules;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tarefas') 
     AND NOT EXISTS (SELECT FROM pg_class WHERE relname = 'tasks' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.tarefas RENAME TO tasks;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ativos') 
     AND NOT EXISTS (SELECT FROM pg_class WHERE relname = 'assets' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.ativos RENAME TO assets;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'aluno_modulo_state') 
     AND NOT EXISTS (SELECT FROM pg_class WHERE relname = 'student_module_states' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.aluno_modulo_state RENAME TO student_module_states;
  END IF;

  -- ==========================================
  -- 2. Renomeação de Colunas
  -- NOTA: O script tenta renomear na tabela em inglês (caso a tabela já tenha sido renomeada com sucesso ou já existisse).
  -- ==========================================

  -- programs (antiga programas)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programs') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'titulo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'title') THEN
      ALTER TABLE public.programs RENAME COLUMN titulo TO title;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'imagem_banner_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'banner_image_url') THEN
      ALTER TABLE public.programs RENAME COLUMN imagem_banner_url TO banner_image_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'favicon_programa_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'program_favicon_url') THEN
      ALTER TABLE public.programs RENAME COLUMN favicon_programa_url TO program_favicon_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'favicon_criador_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' AND column_name = 'creator_favicon_url') THEN
      ALTER TABLE public.programs RENAME COLUMN favicon_criador_url TO creator_favicon_url;
    END IF;
  END IF;

  -- modules (antiga modulos)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'programa_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'program_id') THEN
      ALTER TABLE public.modules RENAME COLUMN programa_id TO program_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'titulo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'title') THEN
      ALTER TABLE public.modules RENAME COLUMN titulo TO title;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'ordem') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'sort_order') THEN
      ALTER TABLE public.modules RENAME COLUMN ordem TO sort_order;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'topicos') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'topics') THEN
      ALTER TABLE public.modules RENAME COLUMN topicos TO topics;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'subtopicos') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'subtopics') THEN
      ALTER TABLE public.modules RENAME COLUMN subtopicos TO subtopics;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'materiais') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'materials') THEN
      ALTER TABLE public.modules RENAME COLUMN materiais TO materials;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'imagem_banner_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'banner_image_url') THEN
      ALTER TABLE public.modules RENAME COLUMN imagem_banner_url TO banner_image_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'favicon_programa_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'program_favicon_url') THEN
      ALTER TABLE public.modules RENAME COLUMN favicon_programa_url TO program_favicon_url;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'conteudo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'content') THEN
      ALTER TABLE public.modules RENAME COLUMN conteudo TO content;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'descricao') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'description') THEN
      ALTER TABLE public.modules RENAME COLUMN descricao TO description;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'blocos') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'blocks') THEN
      ALTER TABLE public.modules RENAME COLUMN blocos TO blocks;
    END IF;
  END IF;

  -- tasks (antiga tarefas)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'programa_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'program_id') THEN
      ALTER TABLE public.tasks RENAME COLUMN programa_id TO program_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'modulo_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'module_id') THEN
      ALTER TABLE public.tasks RENAME COLUMN modulo_id TO module_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'titulo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'title') THEN
      ALTER TABLE public.tasks RENAME COLUMN titulo TO title;
    END IF;
  END IF;

  -- assets (antiga ativos)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'programa_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'program_id') THEN
      ALTER TABLE public.assets RENAME COLUMN programa_id TO program_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'modulo_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'module_id') THEN
      ALTER TABLE public.assets RENAME COLUMN modulo_id TO module_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'titulo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'title') THEN
      ALTER TABLE public.assets RENAME COLUMN titulo TO title;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'tipo_icone') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'icon_type') THEN
      ALTER TABLE public.assets RENAME COLUMN tipo_icone TO icon_type;
    END IF;
  END IF;

  -- student_module_states (antiga aluno_modulo_state)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_module_states') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'modulo_id') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'module_id') THEN
      ALTER TABLE public.student_module_states RENAME COLUMN modulo_id TO module_id;
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'anotacoes') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_module_states' AND column_name = 'notes') THEN
      ALTER TABLE public.student_module_states RENAME COLUMN anotacoes TO notes;
    END IF;
  END IF;

  -- profiles
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_completo') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles RENAME COLUMN nome_completo TO full_name;
    END IF;
  END IF;

END $$;

-- ==========================================
-- 3. Atualização de Triggers
-- ==========================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programs') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.programs;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.modules;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets') THEN
    DROP TRIGGER IF EXISTS set_updated_at ON public.assets;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END $$;