-- =============================================================================
-- LideraSpace: coluna emoji em modulos (estilo Notion)
-- Rodar após 002_modulo_conteudo_and_storage.sql
-- =============================================================================

ALTER TABLE public.modulos
  ADD COLUMN IF NOT EXISTS emoji text;

COMMENT ON COLUMN public.modulos.emoji IS 'Emoji ou ícone exibido ao lado do título do módulo (ex: 📖, 🎯).';
