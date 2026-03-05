import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import RichTextContent from '../components/RichTextContent';
import './Detalhe.css';
import './ModuloDetalhe.css';

type Material = { url?: string; label?: string; icon?: string };

type Modulo = {
  id: string;
  titulo: string;
  ordem: number;
  emoji: string | null;
  conteudo: string | null;
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
  const [programaTitulo, setProgramaTitulo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .select('id, titulo, ordem, emoji, conteudo, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, programa_id')
        .eq('id', moduloId)
        .eq('programa_id', programaId)
        .single();
      if (modErr || !modData) {
        setError(modErr?.message ?? 'Módulo não encontrado.');
        setModulo(null);
        setLoading(false);
        return;
      }
      const m = modData as Modulo;
      setModulo({
        ...m,
        conteudo: m.conteudo ?? null,
        topicos: Array.isArray(m.topicos) ? m.topicos : [],
        subtopicos: Array.isArray(m.subtopicos) ? m.subtopicos : [],
        materiais: Array.isArray(m.materiais) ? m.materiais : [],
      });
      const { data: progData } = await supabase
        .from('programas')
        .select('titulo')
        .eq('id', programaId)
        .single();
      setProgramaTitulo((progData as { titulo?: string } | null)?.titulo ?? 'Programa');
      setLoading(false);
    }
    load();
  }, [programaId, moduloId]);

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
        <p className="detalhe-placeholder detalhe-error">{error ?? 'Módulo não encontrado.'}</p>
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
          <p className="detalhe-meta">Módulo {modulo.ordem}</p>
        </div>
        {user && (
          <Link
            to={`/programas/${programaId}/modulos/${moduloId}/editar`}
            className="btn btn--secondary"
          >
            Editar módulo
          </Link>
        )}
      </header>

      {modulo.video_youtube_embed_url && (
        <section className="detalhe-section modulo-detalhe-video-section">
          <h2 className="detalhe-section-title">Vídeo</h2>
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

      {modulo.conteudo && modulo.conteudo.trim() ? (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Conteúdo</h2>
          <RichTextContent content={modulo.conteudo} />
        </section>
      ) : null}

      {!modulo.conteudo?.trim() && modulo.topicos.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Tópicos</h2>
          <ul className="modulo-detalhe-list">
            {modulo.topicos.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {!modulo.conteudo?.trim() && modulo.subtopicos.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Subtópicos</h2>
          <ul className="modulo-detalhe-list modulo-detalhe-sublist">
            {modulo.subtopicos.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {materiais.length > 0 && (
        <section className="detalhe-section">
          <h2 className="detalhe-section-title">Materiais</h2>
          <ul className="modulo-detalhe-materiais">
            {materiais.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modulo-detalhe-material-link"
                >
                  <span className="modulo-detalhe-material-icon">
                    {item.icon === 'planilha' && '📊'}
                    {item.icon === 'docs' && '📄'}
                    {item.icon === 'pdf' && '📕'}
                    {item.icon === 'video' && '🎬'}
                    {!['planilha', 'docs', 'pdf', 'video'].includes(item.icon || '') && '🔗'}
                  </span>
                  <span>{item.label || item.url || 'Link'}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to={`/programas/${programaId}`} className="detalhe-link">
        ← Voltar ao programa
      </Link>
    </div>
  );
}
