-- =============================================================================
-- LideraSpace: Módulo 4 — campo conteudo (rich text) em modulos + bucket Storage
-- Rodar no SQL Editor do Supabase após 001_schema_organizacoes_programas.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Coluna conteudo (Markdown) em modulos
-- -----------------------------------------------------------------------------
ALTER TABLE public.modulos
  ADD COLUMN IF NOT EXISTS conteudo text;

COMMENT ON COLUMN public.modulos.conteudo IS 'Conteúdo formatado do módulo em Markdown (rich text estilo Notion). Se preenchido, a tela de detalhe prioriza este campo sobre topicos/subtopicos.';

-- -----------------------------------------------------------------------------
-- 2. Bucket Storage para banners e favicons (programas e módulos)
-- -----------------------------------------------------------------------------
-- Bucket público: URLs dos arquivos serão acessíveis sem auth para exibição.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'programas',
  'programas',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Limite 2MB para banners; favicons podem usar o mesmo bucket em subpastas.
-- Estrutura sugerida: programas/banners/{programa_id}/, programas/favicons/{programa_id}/, programas/modulos/{modulo_id}/banner

-- Políticas: usuários autenticados podem fazer upload/update/delete nos objetos.
-- (Quando RLS por organização existir, restringir por programa_id no path.)
DROP POLICY IF EXISTS "Authenticated users can upload program assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload program assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'programas');

DROP POLICY IF EXISTS "Authenticated users can update program assets" ON storage.objects;
CREATE POLICY "Authenticated users can update program assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'programas');

DROP POLICY IF EXISTS "Authenticated users can delete program assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete program assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'programas');

-- Leitura pública (bucket já é público; esta política garante SELECT para todos)
DROP POLICY IF EXISTS "Public read for program assets" ON storage.objects;
CREATE POLICY "Public read for program assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'programas');
