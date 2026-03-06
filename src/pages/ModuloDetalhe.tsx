import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Block } from '../components/BlockEditor';
import './Detalhe.css';
import './ModuloDetalhe.css';

type Material = { url?: string; label?: string; icon?: string };

type Modulo = {
  id: string;
  titulo: string;
  ordem: number;
  emoji: string | null;
  descricao: string | null;
  blocos: Block[];
  topicos: string[];
  subtopicos: string[];
  video_youtube_embed_url: string | null;
  materiais: Material[] | null;
  imagem_banner_url: string | null;
  programa_id: string;
};

export default function ModuloDetalhe() {
  const { programaId, moduloId } = useParams<{ programaId: string; moduloId: string }>();
  const { user } = useAuth();
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [childModulos, setChildModulos] = useState<{ id: string; titulo: string; emoji: string | null }[]>([]);
  const [programaTitulo, setProgramaTitulo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [studentState, setStudentState] = useState<{ anotacoes: string; checklist: Record<string, boolean> }>({ anotacoes: '', checklist: {} });

  useEffect(() => {
    if (!moduloId || !programaId) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data: modData, error: modErr } = await supabase
        .from('modulos')
        .select('id, titulo, ordem, emoji, descricao, blocos, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, programa_id')
        .eq('id', moduloId)
        .eq('programa_id', programaId)
        .single();
      
      if (modErr || !modData) {
        setError(modErr?.message ?? 'Módulo não encontrado.');
        setModulo(null);
        setLoading(false);
        return;
      }
      const m = modData as any;
      setModulo({
        ...m,
        descricao: m.descricao ?? null,
        blocos: Array.isArray(m.blocos) ? m.blocos : [],
        topicos: Array.isArray(m.topicos) ? m.topicos : [],
        subtopicos: Array.isArray(m.subtopicos) ? m.subtopicos : [],
        materiais: Array.isArray(m.materiais) ? m.materiais : [],
      });
      
      const { data: progData } = await supabase
        .from('programas')
        .select('titulo, organization_id')
        .eq('id', programaId)
        .single();
      
      const prog = progData as { titulo?: string; organization_id?: string } | null;
      setProgramaTitulo(prog?.titulo ?? 'Programa');

      if (user?.id) {
        if (prog?.organization_id) {
          const { data: orgMember } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', prog.organization_id)
            .eq('user_id', user.id)
            .single();
          setIsAdmin(orgMember?.role === 'lidera_admin');
        }
        
        const { data: stateData } = await supabase
          .from('aluno_modulo_state')
          .select('anotacoes, checklist')
          .eq('user_id', user.id)
          .eq('modulo_id', moduloId)
          .single();
          
        if (stateData) {
          setStudentState({ anotacoes: stateData.anotacoes || '', checklist: stateData.checklist || {} });
        }
      }

      // Load children modulos (subpages)
      const { data: childrenData } = await supabase
        .from('modulos')
        .select('id, titulo, emoji')
        .eq('parent_id', moduloId)
        .order('ordem', { ascending: true });
        
      setChildModulos(childrenData || []);

      setLoading(false);
    }
    load();
  }, [programaId, moduloId, user?.id]);

  const updateChecklist = async (taskId: string, checked: boolean) => {
    if (!user?.id || !moduloId) return;
    const newChecklist = { ...studentState.checklist, [taskId]: checked };
    setStudentState(prev => ({ ...prev, checklist: newChecklist }));
    
    await supabase.from('aluno_modulo_state').upsert({
      user_id: user.id,
      modulo_id: moduloId,
      checklist: newChecklist
    });
  };

  const saveAnotacoes = async (texto: string) => {
    if (!user?.id || !moduloId) return;
    setStudentState(prev => ({ ...prev, anotacoes: texto }));
    await supabase.from('aluno_modulo_state').upsert({
      user_id: user.id,
      modulo_id: moduloId,
      anotacoes: texto
    });
  };

  if (!programaId || !moduloId) {
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

  if (error || !modulo) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder detalhe-error">{error ?? 'Página não encontrada.'}</p>
        <Link to={`/programas/${programaId}`} className="detalhe-link">← Voltar ao programa</Link>
      </div>
    );
  }

  const materiais = modulo.materiais ?? [];

  return (
    <div className="page-content detalhe-page modulo-detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/">Início</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to={`/programas/${programaId}`}>{programaTitulo}</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>{modulo.titulo}</span>
      </nav>
      {modulo.imagem_banner_url && (
        <div className="modulo-detalhe-banner-wrap">
          <img
            src={modulo.imagem_banner_url}
            alt=""
            className="modulo-detalhe-banner"
          />
        </div>
      )}
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          {modulo.emoji && modulo.emoji.trim() && (
            <span className="modulo-detalhe-title-emoji" aria-hidden>{modulo.emoji}</span>
          )}
          <h1 className="detalhe-title">{modulo.titulo}</h1>
          {modulo.descricao && (
            <p className="detalhe-meta" style={{ marginTop: 'var(--space-2)' }}>{modulo.descricao}</p>
          )}
        </div>
        {isAdmin && (
          <Link
            to={`/programas/${programaId}/modulos/${moduloId}/editar`}
            className="btn btn--secondary"
          >
            Editar página
          </Link>
        )}
      </header>

      {modulo.video_youtube_embed_url && (
        <section className="detalhe-section modulo-detalhe-video-section">
          <div className="modulo-detalhe-video-wrap">
            <iframe
              src={modulo.video_youtube_embed_url}
              title="Vídeo do módulo"
              className="modulo-detalhe-video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Blocos Dinâmicos */}
      {modulo.blocos && modulo.blocos.length > 0 && (
        <section className="detalhe-section modulo-blocos-section">
          {modulo.blocos.map((bloco) => {
            switch (bloco.type) {
              case 'heading':
                return <h2 key={bloco.id} className="bloco-heading">{bloco.content}</h2>;
              case 'text':
                return <p key={bloco.id} className="bloco-text">{bloco.content}</p>;
              case 'link':
                return (
                  <a key={bloco.id} href={bloco.url} target="_blank" rel="noreferrer" className="bloco-link card card--hover">
                    🔗 {bloco.content}
                  </a>
                );
              case 'video':
                return (
                  <div key={bloco.id} className="modulo-detalhe-video-wrap">
                    <iframe src={bloco.url} className="modulo-detalhe-video-iframe" allowFullScreen />
                  </div>
                );
              case 'task':
                return (
                  <label key={bloco.id} className="bloco-task">
                    <input 
                      type="checkbox" 
                      checked={!!studentState.checklist[bloco.id]} 
                      onChange={(e) => updateChecklist(bloco.id, e.target.checked)}
                      className="bloco-checkbox"
                    />
                    <span className={studentState.checklist[bloco.id] ? 'bloco-task-done' : ''}>{bloco.content}</span>
                  </label>
                );
              case 'subpage':
                return (
                  <Link key={bloco.id} to={bloco.url || '#'} className="bloco-subpage card card--hover">
                    📄 {bloco.content}
                  </Link>
                );
              default:
                return null;
            }
          })}
        </section>
      )}

      {/* Subpáginas Reais (Hierarquia) */}
      {childModulos.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Subpáginas</h2>
          <div className="modulo-subpages-grid">
            {childModulos.map(child => (
              <Link key={child.id} to={`/programas/${programaId}/modulos/${child.id}`} className="card card--hover modulo-subpage-card">
                <span className="modulo-subpage-emoji">{child.emoji || '📄'}</span>
                <span>{child.titulo}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Materiais Anexos */}
      {materiais.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Anexos e Materiais</h2>
          <div className="modulo-materiais-grid">
            {materiais.map((item, i) => (
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

      {/* Campo de Anotações */}
      {!isAdmin && (
        <section className="detalhe-section modulo-anotacoes-section">
          <h2 className="detalhe-section-title">📝 Minhas Anotações</h2>
          <textarea 
            className="input-textarea"
            placeholder="Faça suas anotações aqui. Elas são salvas automaticamente."
            value={studentState.anotacoes}
            onChange={(e) => setStudentState(prev => ({ ...prev, anotacoes: e.target.value }))}
            onBlur={(e) => saveAnotacoes(e.target.value)}
            style={{ minHeight: '150px' }}
          />
        </section>
      )}

      <Link to={`/programas/${programaId}`} className="detalhe-link" style={{ marginTop: 'var(--space-8)' }}>
        ← Voltar ao programa
      </Link>
    </div>
  );
}