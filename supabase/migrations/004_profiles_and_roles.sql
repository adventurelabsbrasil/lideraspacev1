-- =============================================================================
-- LideraSpace: Módulo 5 — Perfis de usuário, bucket de avatares e novos papéis
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tabela profiles (Perfil do Matriculado)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS e criar políticas (quando o RLS for ativado globalmente)
-- Por enquanto garantimos que o usuário possa ler o próprio perfil e outros,
-- e atualizar o próprio.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Trigger para criar perfil automaticamente no sign up
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir perfis para usuários já existentes
INSERT INTO public.profiles (id, nome_completo)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Atualização de Papéis (Roles) em organization_members
-- -----------------------------------------------------------------------------
-- Remover a restrição antiga (admin, member)
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- Atualizar dados legados para os novos papéis
UPDATE public.organization_members SET role = 'lidera_admin' WHERE role = 'admin';
UPDATE public.organization_members SET role = 'aluno' WHERE role = 'member';

-- Adicionar a nova restrição
ALTER TABLE public.organization_members 
ADD CONSTRAINT organization_members_role_check 
CHECK (role IN ('lidera_admin', 'org_admin', 'aluno'));

COMMENT ON COLUMN public.organization_members.role IS 'lidera_admin (Dono da Lidera/Acesso Total), org_admin (Dono da Organização Cliente), aluno (Matriculado/Membro)';

-- -----------------------------------------------------------------------------
-- 4. Bucket Storage para avatares (Perfis)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas para avatares
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read for avatars" ON storage.objects;
CREATE POLICY "Public read for avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- -----------------------------------------------------------------------------
-- Trigger: updated_at em profiles
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
