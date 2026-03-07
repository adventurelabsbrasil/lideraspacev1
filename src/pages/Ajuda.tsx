import { useState } from 'react';
import './Ajuda.css';

type SectionId =
  | 'visao-geral'
  | 'roles'
  | 'equipe'
  | 'programas'
  | 'modulos'
  | 'blocos'
  | 'estado-aluno'
  | 'storage'
  | 'temas'
  | 'rotas';

const sections: { id: SectionId; label: string; icon: string }[] = [
  { id: 'visao-geral', label: 'Visão geral', icon: '📋' },
  { id: 'roles', label: 'Roles e permissões', icon: '🔐' },
  { id: 'equipe', label: 'Equipe e membros', icon: '👥' },
  { id: 'programas', label: 'Programas', icon: '📚' },
  { id: 'modulos', label: 'Módulos', icon: '📄' },
  { id: 'blocos', label: 'Blocos dinâmicos', icon: '🧩' },
  { id: 'estado-aluno', label: 'Estado do aluno', icon: '📝' },
  { id: 'storage', label: 'Storage e imagens', icon: '🖼️' },
  { id: 'temas', label: 'Temas', icon: '🎨' },
  { id: 'rotas', label: 'Rotas e navegação', icon: '🧭' },
];

export default function Ajuda() {
  const [activeSection, setActiveSection] = useState<SectionId>('visao-geral');

  return (
    <div className="page-content ajuda-page">
      <div className="ajuda-layout">
        <aside className="ajuda-sidebar">
          <h2 className="ajuda-sidebar-title">Guia do Admin</h2>
          <nav className="ajuda-nav">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`ajuda-nav-item ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="ajuda-nav-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="ajuda-content">
          <header className="ajuda-header">
            <h1>Documentação LideraSpace</h1>
            <p className="ajuda-subtitle">
              Guia de referência para administradores. Use o menu à esquerda para navegar.
            </p>
          </header>

          {activeSection === 'visao-geral' && (
            <section id="visao-geral" className="ajuda-section">
              <h2>Visão geral</h2>
              <p>
                O LideraSpace é uma plataforma de gestão de programas de liderança com autenticação,
                organizações multitenant, programas, módulos hierárquicos e blocos dinâmicos estilo Notion.
              </p>
              <h3>Stack técnico</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Camada</th>
                    <th>Tecnologia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Frontend</td><td>React 19, Vite 7, TypeScript 5.9, React Router 7</td></tr>
                  <tr><td>Backend</td><td>Supabase (PostgreSQL, Auth, Storage)</td></tr>
                  <tr><td>Editor</td><td>@uiw/react-md-editor (Markdown com toolbar)</td></tr>
                  <tr><td>Markdown</td><td>react-markdown, remark-gfm, rehype-sanitize</td></tr>
                </tbody>
              </table>
              <h3>Funcionalidades principais</h3>
              <ul>
                <li>Login com email/senha e Google OAuth</li>
                <li>Organizações multitenant com roles (lidera_admin, org_admin, aluno)</li>
                <li>Programas por organização com banner e favicon</li>
                <li>Módulos hierárquicos (parent_id) e subpáginas</li>
                <li>Blocos dinâmicos: título, texto Markdown, link, vídeo YouTube, tarefa, subpágina</li>
                <li>Estado do aluno: anotações e checklist por módulo</li>
                <li>Storage: avatares e imagens de programas</li>
                <li>Temas: Original (Deep Navy + Dourado), Dark, Light</li>
              </ul>
            </section>
          )}

          {activeSection === 'roles' && (
            <section id="roles" className="ajuda-section">
              <h2>Roles e permissões</h2>
              <p>
                O acesso é controlado por <strong>RLS (Row Level Security)</strong> no Supabase.
                As funções auxiliares <code>user_in_organization</code> e{' '}
                <code>user_can_admin_program</code> definem quem pode ver e editar.
              </p>
              <h3>Roles disponíveis</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Descrição</th>
                    <th>Permissões</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>lidera_admin</code></td>
                    <td>Admin geral (Adventure Labs) ou admin da organização cliente</td>
                    <td>Acesso completo a programas e módulos da org</td>
                  </tr>
                  <tr>
                    <td><code>org_admin</code></td>
                    <td>Admin da organização</td>
                    <td>Criar/editar programas e módulos da org</td>
                  </tr>
                  <tr>
                    <td><code>aluno</code></td>
                    <td>Membro matriculado</td>
                    <td>Visualizar conteúdo, salvar anotações e checklist</td>
                  </tr>
                </tbody>
              </table>
              <h3>Super admin</h3>
              <p>
                Usuários com <code>profiles.is_super_admin = true</code> veem todas as organizações
                (bypass RLS para SELECT). Útil para suporte e auditoria.
              </p>
              <pre className="ajuda-code">
{`-- Definir super admin (ajuste o UUID)
UPDATE public.profiles
SET is_super_admin = true
WHERE id = 'seu-user-uuid'::uuid;`}
              </pre>
            </section>
          )}

          {activeSection === 'equipe' && (
            <section id="equipe" className="ajuda-section">
              <h2>Equipe e membros</h2>
              <p>
                Admins podem gerenciar membros em <strong>Equipe</strong> (menu lateral). Lá você
                adiciona usuários pelo e-mail e define o nível de acesso.
              </p>
              <h3>Como adicionar um usuário</h3>
              <ol>
                <li>Acesse <strong>Equipe</strong> na sidebar.</li>
                <li>Selecione a organização.</li>
                <li>Informe o e-mail (o usuário precisa já ter feito login ou cadastro no app).</li>
                <li>Escolha o acesso: Aluno, Admin da organização ou Admin geral.</li>
                <li>Clique em Adicionar.</li>
              </ol>
              <h3>Roles ao adicionar</h3>
              <ul>
                <li><strong>Aluno</strong> — visualiza programas e módulos, salva anotações.</li>
                <li><strong>Admin da organização</strong> — cria/edita programas e módulos da org.</li>
                <li><strong>Admin geral</strong> — acesso total à organização.</li>
              </ul>
            </section>
          )}

          {activeSection === 'programas' && (
            <section id="programas" className="ajuda-section">
              <h2>Programas</h2>
              <p>
                Programas pertencem a uma organização e contêm módulos. Apenas admins podem criar e editar.
              </p>
              <h3>Campos principais</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>title</code></td><td>text</td><td>Título do programa</td></tr>
                  <tr><td><code>organization_id</code></td><td>uuid</td><td>Organização dona</td></tr>
                  <tr><td><code>banner_image_url</code></td><td>text</td><td>URL do banner (Storage)</td></tr>
                  <tr><td><code>program_favicon_url</code></td><td>text</td><td>Favicon do programa</td></tr>
                  <tr><td><code>creator_favicon_url</code></td><td>text</td><td>Favicon do criador</td></tr>
                  <tr><td><code>created_by</code></td><td>uuid</td><td>Usuário criador</td></tr>
                </tbody>
              </table>
              <h3>Fluxos</h3>
              <ul>
                <li><strong>Criar:</strong> <code>/programas/novo</code> → seleciona org → preenche título e imagens</li>
                <li><strong>Editar:</strong> <code>/programas/:id/editar</code> → altera título, banner, favicons</li>
                <li><strong>Detalhe:</strong> <code>/programas/:id</code> → lista módulos e permite criar novo</li>
              </ul>
            </section>
          )}

          {activeSection === 'modulos' && (
            <section id="modulos" className="ajuda-section">
              <h2>Módulos</h2>
              <p>
                Módulos pertencem a um programa e podem ter hierarquia via <code>parent_id</code>.
                Contêm blocos dinâmicos ou conteúdo Markdown em <code>content</code> como fallback.
              </p>
              <h3>Campos principais</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>title</code></td><td>text</td><td>Título do módulo</td></tr>
                  <tr><td><code>program_id</code></td><td>uuid</td><td>Programa pai</td></tr>
                  <tr><td><code>parent_id</code></td><td>uuid</td><td>Módulo pai (subpágina)</td></tr>
                  <tr><td><code>sort_order</code></td><td>int</td><td>Ordem de exibição</td></tr>
                  <tr><td><code>emoji</code></td><td>text</td><td>Emoji na sidebar</td></tr>
                  <tr><td><code>description</code></td><td>text</td><td>Descrição curta</td></tr>
                  <tr><td><code>blocks</code></td><td>jsonb</td><td>Array de blocos dinâmicos</td></tr>
                  <tr><td><code>content</code></td><td>text</td><td>Markdown (fallback se blocks vazio)</td></tr>
                  <tr><td><code>video_youtube_embed_url</code></td><td>text</td><td>URL YouTube → embed automático</td></tr>
                  <tr><td><code>banner_image_url</code></td><td>text</td><td>Banner do módulo</td></tr>
                </tbody>
              </table>
              <h3>Fluxos</h3>
              <ul>
                <li><strong>Criar:</strong> <code>/programas/:programId/modulos/novo</code> → define pai, título, emoji, blocos</li>
                <li><strong>Editar:</strong> <code>/programas/:programId/modulos/:moduleId/editar</code></li>
                <li><strong>Detalhe:</strong> <code>/programas/:programId/modulos/:moduleId</code> → exibe blocos e permite anotações</li>
              </ul>
            </section>
          )}

          {activeSection === 'blocos' && (
            <section id="blocos" className="ajuda-section">
              <h2>Blocos dinâmicos</h2>
              <p>
                Cada módulo pode ter um array de blocos em <code>blocks</code>. Cada bloco tem um{' '}
                <code>type</code> e campos específicos.
              </p>
              <h3>Tipos de bloco</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Descrição</th>
                    <th>Campos principais</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>title</code></td>
                    <td>Título grande</td>
                    <td><code>text</code></td>
                  </tr>
                  <tr>
                    <td><code>text</code></td>
                    <td>Texto Markdown</td>
                    <td><code>content</code></td>
                  </tr>
                  <tr>
                    <td><code>link</code></td>
                    <td>Link externo</td>
                    <td><code>url</code>, <code>label</code></td>
                  </tr>
                  <tr>
                    <td><code>video</code></td>
                    <td>Vídeo YouTube</td>
                    <td><code>url</code> (YouTube) → embed automático</td>
                  </tr>
                  <tr>
                    <td><code>task</code></td>
                    <td>Item de checklist</td>
                    <td><code>text</code>, <code>checked</code></td>
                  </tr>
                  <tr>
                    <td><code>subpage</code></td>
                    <td>Link para subpágina real</td>
                    <td><code>module_id</code>, <code>label</code></td>
                  </tr>
                </tbody>
              </table>
              <h3>Exemplo de estrutura</h3>
              <pre className="ajuda-code">
{`[
  { "type": "title", "text": "Introdução" },
  { "type": "text", "content": "## Subtítulo\\nParágrafo com **negrito**." },
  { "type": "video", "url": "https://www.youtube.com/watch?v=VIDEO_ID" },
  { "type": "subpage", "module_id": "uuid", "label": "Ver detalhes" }
]`}
              </pre>
            </section>
          )}

          {activeSection === 'estado-aluno' && (
            <section id="estado-aluno" className="ajuda-section">
              <h2>Estado do aluno</h2>
              <p>
                A tabela <code>student_module_states</code> armazena anotações e checklist por
                usuário e módulo. Cada aluno tem seu próprio estado.
              </p>
              <h3>Campos</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>user_id</code></td><td>uuid</td><td>Usuário</td></tr>
                  <tr><td><code>module_id</code></td><td>uuid</td><td>Módulo</td></tr>
                  <tr><td><code>notes</code></td><td>text</td><td>Anotações do aluno</td></tr>
                  <tr><td><code>checklist</code></td><td>jsonb</td><td>Array de itens {`{ text, checked }`}</td></tr>
                </tbody>
              </table>
              <p>
                O upsert usa <code>onConflict: 'user_id,module_id'</code> para evitar duplicatas.
              </p>
            </section>
          )}

          {activeSection === 'storage' && (
            <section id="storage" className="ajuda-section">
              <h2>Storage e imagens</h2>
              <p>
                O Supabase Storage fornece dois buckets para upload de imagens.
              </p>
              <h3>Buckets</h3>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Uso</th>
                    <th>Políticas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>avatars</code></td>
                    <td>Avatar do perfil do usuário</td>
                    <td>Upload/update/delete: autenticados; SELECT: público</td>
                  </tr>
                  <tr>
                    <td><code>programas</code></td>
                    <td>Banners, favicons de programas e módulos</td>
                    <td>Upload/update/delete: autenticados; SELECT: público</td>
                  </tr>
                </tbody>
              </table>
              <h3>Componente ImageUrlOrUpload</h3>
              <p>
                O app usa um componente que permite inserir URL direta ou fazer upload. O caminho
                é salvo como URL pública do Supabase Storage.
              </p>
            </section>
          )}

          {activeSection === 'temas' && (
            <section id="temas" className="ajuda-section">
              <h2>Temas</h2>
              <p>
                O LideraSpace oferece três temas. O botão de alternar fica no header da sidebar.
              </p>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Tema</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>original</code></td>
                    <td>Deep Navy + Dourado (Lidera Experience)</td>
                  </tr>
                  <tr>
                    <td><code>dark</code></td>
                    <td>Escala de cinza escuro neutro</td>
                  </tr>
                  <tr>
                    <td><code>light</code></td>
                    <td>Minimalista estilo Notion</td>
                  </tr>
                </tbody>
              </table>
              <p>
                O tema é persistido em <code>localStorage</code> e aplicado via CSS variables
                (<code>data-theme</code>).
              </p>
            </section>
          )}

          {activeSection === 'rotas' && (
            <section id="rotas" className="ajuda-section">
              <h2>Rotas e navegação</h2>
              <p>
                Todas as rotas (exceto <code>/login</code>) exigem autenticação.
              </p>
              <table className="ajuda-table">
                <thead>
                  <tr>
                    <th>Rota</th>
                    <th>Página</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>/login</code></td><td>Login</td><td>Autenticação</td></tr>
                  <tr><td><code>/</code></td><td>Inicio</td><td>Dashboard inicial</td></tr>
                  <tr><td><code>/perfil</code></td><td>Perfil</td><td>Nome e avatar</td></tr>
                  <tr><td><code>/equipe</code></td><td>Equipe</td><td>Gerenciar membros (admins)</td></tr>
                  <tr><td><code>/programas</code></td><td>MeusProgramas</td><td>Lista de programas</td></tr>
                  <tr><td><code>/programas/novo</code></td><td>ProgramaNovo</td><td>Criar programa</td></tr>
                  <tr><td><code>/programas/:id</code></td><td>ProgramaDetalhe</td><td>Detalhe do programa</td></tr>
                  <tr><td><code>/programas/:id/editar</code></td><td>ProgramaEditar</td><td>Editar programa</td></tr>
                  <tr><td><code>/programas/:programId/modulos/novo</code></td><td>ModuloNovo</td><td>Novo módulo</td></tr>
                  <tr><td><code>/programas/:programId/modulos/:moduleId</code></td><td>ModuloDetalhe</td><td>Detalhe do módulo</td></tr>
                  <tr><td><code>/programas/:programId/modulos/:moduleId/editar</code></td><td>ModuloEditar</td><td>Editar módulo</td></tr>
                  <tr><td><code>/tarefas</code></td><td>MinhasTarefas</td><td>Tarefas (em construção)</td></tr>
                  <tr><td><code>/ativos</code></td><td>MeusAtivos</td><td>Ativos (em construção)</td></tr>
                  <tr><td><code>/ajuda</code></td><td>Ajuda</td><td>Esta documentação</td></tr>
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
