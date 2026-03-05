# Módulo 4 — Rich text (estilo Notion) e imagens (URL + upload)

Escopo do quarto módulo: conteúdo de módulos com formatação rica (negrito, itálico, listas, links, tabelas) via Markdown com editor de toolbar; e opção de upload de banners e favicons no Supabase Storage, mantendo a opção de URL.

## Objetivos

1. **Rich text estilo Notion** — Formatação de texto nos módulos (negrito, itálico, listas, hyperlinks, tabelas), com editor que possui toolbar e renderização segura.
2. **Banners e favicons** — Manter campo de URL e adicionar upload opcional para Supabase Storage, com limites de tamanho e tipo.

---

## 1. Rich text (conteúdo formatado)

### 1.1 Modelo de dados

- Nova coluna **`conteudo`** (tipo `text`, nullable) na tabela `modulos`.
- O valor é armazenado em **Markdown** (suporta negrito, itálico, listas, links, tabelas via GFM).
- Se `conteudo` estiver preenchido, a tela de detalhe do módulo prioriza sua exibição; caso contrário, continua mostrando `topicos` e `subtopicos` (compatibilidade).

### 1.2 Edição

- No formulário de módulo ([ModuloForm.tsx](src/pages/ModuloForm.tsx)) foi adicionado um **editor Markdown com toolbar** ([@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor)).
- O usuário usa os botões da barra de ferramentas para negrito, itálico, listas, link, tabela, etc., sem precisar decorar sintaxe.
- O tema do editor (claro/escuro) segue o tema do app.

### 1.3 Visualização

- Componente [RichTextContent.tsx](src/components/RichTextContent.tsx): renderiza Markdown com **react-markdown**, **remark-gfm** (tabelas, listas) e **rehype-sanitize** (segurança contra XSS).
- Links externos são exibidos com ícone conforme o tipo (documento, planilha, PDF, vídeo, link genérico), com base no domínio do `href`.
- Estilos em [RichTextContent.css](src/components/RichTextContent.css) para parágrafos, listas, tabelas e links.

### 1.4 Onde aparece

- **Edição**: Em “Editar módulo” / “Novo módulo”, seção “Conteúdo (rich text)”.
- **Leitura**: Em [ModuloDetalhe.tsx](src/pages/ModuloDetalhe.tsx), seção “Conteúdo” quando `conteudo` existe; senão, “Tópicos” e “Subtópicos” como antes.

---

## 2. Banners e favicons: URL + upload

### 2.1 Abordagem híbrida

- O campo continua sendo uma **URL** (texto) no banco.
- Na interface, o usuário pode:
  - **Informar uma URL** (como antes), ou
  - **Enviar um arquivo**: o arquivo é enviado ao Supabase Storage e a URL pública retornada é gravada no mesmo campo.

### 2.2 Storage (Supabase)

- **Bucket**: `programas` (público para leitura).
- **Limites**: 2 MB por arquivo no bucket; tipos permitidos: JPEG, PNG, WebP, GIF.
- **Estrutura de pastas** (exemplos):
  - `banners/{programa_id}/` — banner do programa
  - `favicons/programa/{programa_id}/` — favicon do programa
  - `favicons/criador/{programa_id}/` — favicon do criador
  - `modulos/banner/{modulo_id}/` — banner do módulo
- Políticas: usuários autenticados podem inserir/atualizar/remover; leitura pública para exibição.

### 2.3 Componente ImageUrlOrUpload

- [ImageUrlOrUpload.tsx](src/components/ImageUrlOrUpload.tsx): input de URL + botão “Enviar arquivo” (quando há contexto de upload) + preview da imagem.
- **Variantes**: `banner` (máx. 2 MB) e `favicon` (máx. 256 KB).
- **uploadContext**: quando informado (ex.: `{ pathPrefix: 'banners', contextId: programaId }`), o botão de upload é exibido; caso contrário, apenas a URL (ex.: em “Novo programa”, até não haver id ainda).

### 2.4 Onde está na UI

- **Programa (novo)**: apenas URL (sem upload até o programa ser criado).
- **Programa (editar)**: URL + “Enviar arquivo” para banner e para os dois favicons.
- **Módulo (editar)**: URL + “Enviar arquivo” para banner do módulo (quando já existe `moduloId`) e para favicon do programa no contexto do módulo (usando `programaId`).
- **Módulo (novo)**: banner só URL; favicon do programa com upload usando `programaId`.

---

## 3. Migration e dependências

### 3.1 SQL

- [supabase/migrations/002_modulo_conteudo_and_storage.sql](supabase/migrations/002_modulo_conteudo_and_storage.sql):
  - `ALTER TABLE modulos ADD COLUMN conteudo text;`
  - Criação do bucket `programas` e políticas de Storage.

Rodar no SQL Editor do Supabase após a migration 001.

### 3.2 Pacotes npm

- `react-markdown`, `remark-gfm`, `rehype-sanitize` — renderização e sanitização do Markdown.
- `@uiw/react-md-editor` — editor Markdown com toolbar.

---

## 4. Arquivos principais

| Área | Arquivos |
|------|----------|
| Schema / Storage | `supabase/migrations/002_modulo_conteudo_and_storage.sql` |
| Rich text (view) | `src/components/RichTextContent.tsx`, `RichTextContent.css` |
| Rich text (edit) | `src/pages/ModuloForm.tsx` (campo conteudo + MDEditor) |
| Detalhe | `src/pages/ModuloDetalhe.tsx` (exibe `conteudo` com RichTextContent quando preenchido) |
| Upload | `src/components/ImageUrlOrUpload.tsx`, `ImageUrlOrUpload.css` |
| Uso do upload | `ProgramaNovo.tsx`, `ProgramaEditar.tsx`, `ModuloForm.tsx` |

---

## Próximos passos (sugestão)

- Redimensionamento ou crop de imagens antes do upload (ex.: favicon 128×128).
- Suporte a imagens inline no Markdown (upload para Storage + URL no conteúdo).
- Limitar tamanho de `conteudo` (ex.: 100 KB) no banco ou na validação do form.
