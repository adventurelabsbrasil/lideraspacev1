import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Block } from '../components/BlockEditor';
import RichTextContent from '../components/RichTextContent';
import { youtubeToEmbedUrl } from '../lib/youtube';
import './Detalhe.css';
import './ModuloDetalhe.css';

type Material = { url?: string; label?: string; icon?: string };

type Module = {
  id: string;
  title: string;
  sort_order: number;
  emoji: string | null;
  description: string | null;
  content: string | null;
  blocks: Block[];
  topics: string[];
  subtopics: string[];
  video_youtube_embed_url: string | null;
  materials: Material[] | null;
  banner_image_url: string | null;
  program_id: string;
};

export default function ModuloDetalhe() {
  const { programId, moduleId } = useParams<{ programId: string; moduleId: string }>();
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [childModules, setChildModules] = useState<{ id: string; title: string; emoji: string | null }[]>([]);
  const [programTitle, setProgramTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [studentState, setStudentState] = useState<{ notes: string; checklist: Record<string, boolean> }>({ notes: '', checklist: {} });

  useEffect(() => {
    if (!moduleId || !programId) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data: modData, error: modErr } = await supabase
        .from('modules')
        .select('id, title, sort_order, emoji, description, content, blocks, topics, subtopics, video_youtube_embed_url, materials, banner_image_url, program_id')
        .eq('id', moduleId)
        .eq('program_id', programId)
        .single();
      
      if (modErr || !modData) {
        setError(modErr?.message ?? 'Módulo não encontrado.');
        setModule(null);
        setLoading(false);
        return;
      }
      const m = modData as any;
      setModule({
        ...m,
        description: m.description ?? null,
        content: m.content ?? null,
        blocks: Array.isArray(m.blocks) ? m.blocks : [],
        topics: Array.isArray(m.topics) ? m.topics : [],
        subtopics: Array.isArray(m.subtopics) ? m.subtopics : [],
        materials: Array.isArray(m.materials) ? m.materials : [],
      });
      
      const { data: progData } = await supabase
        .from('programs')
        .select('title, organization_id')
        .eq('id', programId)
        .single();
      
      const prog = progData as { title?: string; organization_id?: string } | null;
      setProgramTitle(prog?.title ?? 'Programa');

      if (user?.id) {
        if (prog?.organization_id) {
          const { data: orgMember } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', prog.organization_id)
            .eq('user_id', user.id)
            .single();
          setIsAdmin(['lidera_admin', 'org_admin'].includes(orgMember?.role ?? ''));
        }
        
        const { data: stateData } = await supabase
          .from('student_module_states')
          .select('notes, checklist')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .single();
          
        if (stateData) {
          setStudentState({ notes: stateData.notes || '', checklist: stateData.checklist || {} });
        }
      }

      // Load child modules (subpages)
      const { data: childrenData } = await supabase
        .from('modules')
        .select('id, title, emoji')
        .eq('parent_id', moduleId)
        .order('sort_order', { ascending: true });
        
      setChildModules(childrenData || []);

      setLoading(false);
    }
    load();
  }, [programId, moduleId, user?.id]);

  const updateChecklist = async (taskId: string, checked: boolean) => {
    if (!user?.id || !moduleId) return;
    const newChecklist = { ...studentState.checklist, [taskId]: checked };
    setStudentState(prev => ({ ...prev, checklist: newChecklist }));
    
    await supabase.from('student_module_states').upsert(
      { user_id: user.id, module_id: moduleId, checklist: newChecklist },
      { onConflict: 'user_id,module_id' }
    );
  };

  const saveNotes = async (texto: string) => {
    if (!user?.id || !moduleId) return;
    setStudentState(prev => ({ ...prev, notes: texto }));
    await supabase.from('student_module_states').upsert(
      { user_id: user.id, module_id: moduleId, notes: texto },
      { onConflict: 'user_id,module_id' }
    );
  };

  if (!programId || !moduleId) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder">Programa ou módulo não identificado.</p>
        <Link to="/programas" className="detalhe-link">← Voltar aos programas</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder">Carregando…</p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder detalhe-error">{error ?? 'Página não encontrada.'}</p>
        <Link to={`/programas/${programId}`} className="detalhe-link">← Voltar ao programa</Link>
      </div>
    );
  }

  const materials = module.materials ?? [];

  return (
    <div className="page-content detalhe-page modulo-detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/">Início</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to={`/programas/${programId}`}>{programTitle}</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>{module.title}</span>
      </nav>
      {module.banner_image_url && (
        <div className="modulo-detalhe-banner-wrap">
          <img
            src={module.banner_image_url}
            alt=""
            className="modulo-detalhe-banner"
          />
        </div>
      )}
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          {module.emoji && module.emoji.trim() && (
            <span className="modulo-detalhe-title-emoji" aria-hidden>{module.emoji}</span>
          )}
          <h1 className="detalhe-title">{module.title}</h1>
          {module.description && (
            <p className="detalhe-meta" style={{ marginTop: 'var(--space-2)' }}>{module.description}</p>
          )}
        </div>
        {isAdmin && (
          <Link
            to={`/programas/${programId}/modulos/${moduleId}/editar`}
            className="btn btn--secondary"
          >
            Editar página
          </Link>
        )}
      </header>

      {module.video_youtube_embed_url && (
        <section className="detalhe-section modulo-detalhe-video-section">
          <div className="modulo-detalhe-video-wrap">
            <iframe
              src={module.video_youtube_embed_url}
              title="Vídeo do módulo"
              className="modulo-detalhe-video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Markdown content (priority over blocks when present) */}
      {module.content && module.content.trim() && (
        <section className="detalhe-section">
          <RichTextContent content={module.content} />
        </section>
      )}

      {/* Dynamic blocks (shown when no content, or in addition - plan says content has priority) */}
      {!module.content?.trim() && module.blocks && module.blocks.length > 0 && (
        <section className="detalhe-section modulo-blocos-section">
          {module.blocks.map((block) => {
            switch (block.type) {
              case 'heading':
                return <h2 key={block.id} className="bloco-heading">{block.content}</h2>;
              case 'text':
                return (
                  <div key={block.id} className="bloco-text">
                    <RichTextContent content={block.content || ''} />
                  </div>
                );
              case 'link':
                return (
                  <a key={block.id} href={block.url} target="_blank" rel="noreferrer" className="bloco-link card card--hover">
                    🔗 {block.content}
                  </a>
                );
              case 'video':
                return (
                  <div key={block.id} className="modulo-detalhe-video-wrap">
                    <iframe
                      src={youtubeToEmbedUrl(block.url || '')}
                      title="Vídeo"
                      className="modulo-detalhe-video-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              case 'task':
                return (
                  <label key={block.id} className="bloco-task">
                    <input 
                      type="checkbox" 
                      checked={!!studentState.checklist[block.id]} 
                      onChange={(e) => updateChecklist(block.id, e.target.checked)}
                      className="bloco-checkbox"
                    />
                    <span className={studentState.checklist[block.id] ? 'bloco-task-done' : ''}>{block.content}</span>
                  </label>
                );
              case 'subpage': {
                const childModule = block.url && childModules.some((c) => c.id === block.url);
                const href = childModule ? `/programas/${programId}/modulos/${block.url}` : (block.url || '#');
                return childModule ? (
                  <Link key={block.id} to={href} className="bloco-subpage card card--hover">
                    📄 {block.content || 'Subpágina'}
                  </Link>
                ) : (
                  <a key={block.id} href={block.url || '#'} target="_blank" rel="noreferrer" className="bloco-subpage card card--hover">
                    📄 {block.content || 'Link externo'}
                  </a>
                );
              }
              default:
                return null;
            }
          })}
        </section>
      )}

      {/* Child modules (hierarchy) */}
      {childModules.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Subpáginas</h2>
          <div className="modulo-subpages-grid">
            {childModules.map(child => (
              <Link key={child.id} to={`/programas/${programId}/modulos/${child.id}`} className="card card--hover modulo-subpage-card">
                <span className="modulo-subpage-emoji">{child.emoji || '📄'}</span>
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Attachments and materials */}
      {materials.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Anexos e Materiais</h2>
          <div className="modulo-materiais-grid">
            {materials.map((item, i) => (
              <a
                key={i}
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="card card--hover modulo-material-card"
              >
                <span className="modulo-material-icon">
                  {item.icon === 'planilha' && '📊'}
                  {item.icon === 'docs' && '📄'}
                  {item.icon === 'pdf' && '📕'}
                  {item.icon === 'video' && '🎬'}
                  {!['planilha', 'docs', 'pdf', 'video'].includes(item.icon || '') && '🔗'}
                </span>
                <span className="modulo-material-label">{item.label || item.url || 'Link'}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Notes field */}
      {!isAdmin && (
        <section className="detalhe-section modulo-anotacoes-section">
          <h2 className="detalhe-section-title">📝 Minhas Anotações</h2>
          <textarea 
            className="input-textarea"
            placeholder="Faça suas anotações aqui. Elas são salvas automaticamente."
            value={studentState.notes}
            onChange={(e) => setStudentState(prev => ({ ...prev, notes: e.target.value }))}
            onBlur={(e) => saveNotes(e.target.value)}
            style={{ minHeight: '150px' }}
          />
        </section>
      )}

      <Link to={`/programas/${programId}`} className="detalhe-link" style={{ marginTop: 'var(--space-8)' }}>
        ← Voltar ao programa
      </Link>
    </div>
  );
}