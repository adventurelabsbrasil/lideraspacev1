import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Detalhe.css';
import './ProgramaNovo.css';
import './ModuloForm.css';

type MaterialItem = { url: string; label: string; icon: string };

function youtubeToEmbedUrl(url: string): string {
  const t = url.trim();
  if (!t) return '';
  const m = t.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (t.includes('youtube.com/embed/')) return t;
  return t;
}

type Props = {
  programaId: string;
  moduloId?: string | null;
};

export default function ModuloForm({ programaId, moduloId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(moduloId);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [ordem, setOrdem] = useState(0);
  const [topicos, setTopicos] = useState<string[]>([]);
  const [subtopicos, setSubtopicos] = useState<string[]>([]);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState('');
  const [materiais, setMateriais] = useState<MaterialItem[]>([]);
  const [imagemBannerUrl, setImagemBannerUrl] = useState('');
  const [faviconProgramaUrl, setFaviconProgramaUrl] = useState('');

  useEffect(() => {
    if (!isEdit || !moduloId) {
      if (!isEdit) setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('modulos')
        .select('titulo, ordem, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url')
        .eq('id', moduloId)
        .eq('programa_id', programaId)
        .single();
      setLoading(false);
      if (err || !data) {
        setError(err?.message ?? 'Módulo não encontrado.');
        return;
      }
      const row = data as {
        titulo: string;
        ordem: number;
        topicos: string[];
        subtopicos: string[];
        video_youtube_embed_url: string | null;
        materiais: MaterialItem[] | null;
        imagem_banner_url: string | null;
        favicon_programa_url: string | null;
      };
      setTitulo(row.titulo ?? '');
      setOrdem(row.ordem ?? 0);
      setTopicos(Array.isArray(row.topicos) ? row.topicos : []);
      setSubtopicos(Array.isArray(row.subtopicos) ? row.subtopicos : []);
      setVideoYoutubeUrl(row.video_youtube_embed_url ?? '');
      setMateriais(Array.isArray(row.materiais) ? row.materiais : []);
      setImagemBannerUrl(row.imagem_banner_url ?? '');
      setFaviconProgramaUrl(row.favicon_programa_url ?? '');
    }
    load();
  }, [programaId, moduloId, isEdit]);

  function addTopico() {
    setTopicos((prev) => [...prev, '']);
  }
  function setTopicoAt(i: number, v: string) {
    setTopicos((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }
  function removeTopico(i: number) {
    setTopicos((prev) => prev.filter((_, j) => j !== i));
  }

  function addSubtopicos() {
    setSubtopicos((prev) => [...prev, '']);
  }
  function setSubtopicAt(i: number, v: string) {
    setSubtopicos((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }
  function removeSubtopic(i: number) {
    setSubtopicos((prev) => prev.filter((_, j) => j !== i));
  }

  function addMaterial() {
    setMateriais((prev) => [...prev, { url: '', label: '', icon: 'link' }]);
  }
  function setMaterialAt(i: number, field: keyof MaterialItem, value: string) {
    setMateriais((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }
  function removeMaterial(i: number) {
    setMateriais((prev) => prev.filter((_, j) => j !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Informe o título do módulo.');
      return;
    }
    const embedUrl = videoYoutubeUrl.trim() ? youtubeToEmbedUrl(videoYoutubeUrl) : null;
    const materiaisClean = materiais
      .filter((m) => (m.url || '').trim())
      .map((m) => ({ url: m.url.trim(), label: (m.label || '').trim() || m.url.trim(), icon: (m.icon || 'link').trim() }));

    setError(null);
    setSubmitting(true);

    if (isEdit && moduloId) {
      const { error: err } = await supabase
        .from('modulos')
        .update({
          titulo: titulo.trim(),
          ordem: Number(ordem) || 0,
          topicos: topicos.filter((t) => t.trim()).map((t) => t.trim()),
          subtopicos: subtopicos.filter((s) => s.trim()).map((s) => s.trim()),
          video_youtube_embed_url: embedUrl,
          materiais: materiaisClean,
          imagem_banner_url: imagemBannerUrl.trim() || null,
          favicon_programa_url: faviconProgramaUrl.trim() || null,
        })
        .eq('id', moduloId)
        .eq('programa_id', programaId);
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Erro ao salvar.');
        return;
      }
      navigate(`/programas/${programaId}/modulos/${moduloId}`);
    } else {
      const { data, error: err } = await supabase
        .from('modulos')
        .insert({
          programa_id: programaId,
          titulo: titulo.trim(),
          ordem: Number(ordem) || 0,
          topicos: topicos.filter((t) => t.trim()).map((t) => t.trim()),
          subtopicos: subtopicos.filter((s) => s.trim()).map((s) => s.trim()),
          video_youtube_embed_url: embedUrl,
          materiais: materiaisClean,
          imagem_banner_url: imagemBannerUrl.trim() || null,
          favicon_programa_url: faviconProgramaUrl.trim() || null,
        })
        .select('id')
        .single();
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Erro ao criar módulo.');
        return;
      }
      if (data?.id) navigate(`/programas/${programaId}/modulos/${data.id}`);
      else navigate(`/programas/${programaId}`);
    }
  }

  if (loading) {
    return (
      <div className="page-content programa-novo-page">
        <p className="programa-novo-loading">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="page-content programa-novo-page modulo-form-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to={`/programas/${programaId}`}>Programa</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>{isEdit ? 'Editar módulo' : 'Novo módulo'}</span>
      </nav>
      <h1 className="programa-novo-title">{isEdit ? 'Editar módulo' : 'Novo módulo'}</h1>
      <p className="programa-novo-desc">
        {isEdit ? 'Altere os dados do módulo.' : 'Preencha os dados para criar um novo módulo.'}
      </p>

      <form onSubmit={handleSubmit} className="programa-novo-form modulo-form">
        {error && <p className="programa-novo-error" role="alert">{error}</p>}
        <div className="programa-novo-field">
          <label htmlFor="modulo-titulo">Título *</label>
          <input
            id="modulo-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Introdução"
            required
          />
        </div>
        <div className="programa-novo-field">
          <label htmlFor="modulo-ordem">Ordem</label>
          <input
            id="modulo-ordem"
            type="number"
            min={0}
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value) || 0)}
          />
        </div>
        <div className="programa-novo-field">
          <label>URL do vídeo (YouTube)</label>
          <input
            type="url"
            value={videoYoutubeUrl}
            onChange={(e) => setVideoYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="modulo-form-group">
          <div className="modulo-form-group-header">
            <label>Tópicos</label>
            <button type="button" className="modulo-form-add-btn" onClick={addTopico}>
              + Adicionar
            </button>
          </div>
          {topicos.map((t, i) => (
            <div key={i} className="modulo-form-row">
              <input
                type="text"
                value={t}
                onChange={(e) => setTopicoAt(i, e.target.value)}
                placeholder="Tópico"
              />
              <button type="button" className="modulo-form-remove-btn" onClick={() => removeTopico(i)} aria-label="Remover">
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="modulo-form-group">
          <div className="modulo-form-group-header">
            <label>Subtópicos</label>
            <button type="button" className="modulo-form-add-btn" onClick={addSubtopicos}>
              + Adicionar
            </button>
          </div>
          {subtopicos.map((s, i) => (
            <div key={i} className="modulo-form-row">
              <input
                type="text"
                value={s}
                onChange={(e) => setSubtopicAt(i, e.target.value)}
                placeholder="Subtópico"
              />
              <button type="button" className="modulo-form-remove-btn" onClick={() => removeSubtopic(i)} aria-label="Remover">
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="modulo-form-group">
          <div className="modulo-form-group-header">
            <label>Materiais (links)</label>
            <button type="button" className="modulo-form-add-btn" onClick={addMaterial}>
              + Adicionar
            </button>
          </div>
          {materiais.map((m, i) => (
            <div key={i} className="modulo-form-material-row">
              <input
                type="url"
                value={m.url}
                onChange={(e) => setMaterialAt(i, 'url', e.target.value)}
                placeholder="URL"
              />
              <input
                type="text"
                value={m.label}
                onChange={(e) => setMaterialAt(i, 'label', e.target.value)}
                placeholder="Label"
              />
              <select
                value={m.icon}
                onChange={(e) => setMaterialAt(i, 'icon', e.target.value)}
              >
                <option value="link">Link</option>
                <option value="planilha">Planilha</option>
                <option value="docs">Docs</option>
                <option value="pdf">PDF</option>
                <option value="video">Vídeo</option>
              </select>
              <button type="button" className="modulo-form-remove-btn" onClick={() => removeMaterial(i)} aria-label="Remover">
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="programa-novo-field">
          <label htmlFor="modulo-banner">URL da imagem banner do módulo</label>
          <input
            id="modulo-banner"
            type="url"
            value={imagemBannerUrl}
            onChange={(e) => setImagemBannerUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="programa-novo-field">
          <label htmlFor="modulo-favicon">URL do favicon do programa (módulo)</label>
          <input
            id="modulo-favicon"
            type="url"
            value={faviconProgramaUrl}
            onChange={(e) => setFaviconProgramaUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="programa-novo-actions">
          <Link to={isEdit && moduloId ? `/programas/${programaId}/modulos/${moduloId}` : `/programas/${programaId}`} className="programa-novo-btn programa-novo-btn-cancel">
            Cancelar
          </Link>
          <button type="submit" className="programa-novo-btn programa-novo-btn-submit" disabled={submitting}>
            {submitting ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar módulo'}
          </button>
        </div>
      </form>
    </div>
  );
}
