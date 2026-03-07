import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageUrlOrUpload from '../components/ImageUrlOrUpload';
import BlockEditor, { type Block } from '../components/BlockEditor';
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
  const { user } = useAuth();
  const isEdit = Boolean(moduloId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [availableParents, setAvailableParents] = useState<{ id: string; title: string }[]>([]);

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState('');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [programFaviconUrl, setProgramFaviconUrl] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      
      const { data: progData } = await supabase
        .from('programs')
        .select('organization_id')
        .eq('id', programaId)
        .single();

      if (user?.id && progData?.organization_id) {
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', progData.organization_id)
          .eq('user_id', user.id)
          .single();
        setIsAdmin(orgMember?.role === 'lidera_admin');
      } else {
        setIsAdmin(false);
      }

      let query = supabase.from('modules').select('id, title').eq('program_id', programaId);
      if (moduloId) {
        query = query.neq('id', moduloId);
      }
      const { data: parentsData } = await query;
      setAvailableParents(parentsData || []);

      if (isEdit && moduloId) {
        const { data, error: err } = await supabase
          .from('modules')
          .select('title, sort_order, emoji, parent_id, description, blocks, topics, subtopics, video_youtube_embed_url, materials, banner_image_url, program_favicon_url')
          .eq('id', moduloId)
          .eq('program_id', programaId)
          .single();
        if (err || !data) {
          setError(err?.message ?? 'Módulo não encontrado.');
          setLoading(false);
          return;
        }
        const row = data as any;
        setTitle(row.title ?? '');
        setEmoji(row.emoji ?? '');
        setSortOrder(row.sort_order ?? 0);
        setParentId(row.parent_id ?? '');
        setDescription(row.description ?? '');
        setBlocks(Array.isArray(row.blocks) ? row.blocks : []);
        setTopics(Array.isArray(row.topics) ? row.topics : []);
        setSubtopics(Array.isArray(row.subtopics) ? row.subtopics : []);
        setVideoYoutubeUrl(row.video_youtube_embed_url ?? '');
        setMaterials(Array.isArray(row.materials) ? row.materials : []);
        setBannerImageUrl(row.banner_image_url ?? '');
        setProgramFaviconUrl(row.program_favicon_url ?? '');
      }
      setLoading(false);
    }
    load();
  }, [programaId, moduloId, isEdit, user?.id]);

  function addTopic() { setTopics((prev) => [...prev, '']); }
  function setTopicAt(i: number, v: string) {
    setTopics((prev) => { const next = [...prev]; next[i] = v; return next; });
  }
  function removeTopic(i: number) { setTopics((prev) => prev.filter((_, j) => j !== i)); }

  function addSubtopics() { setSubtopics((prev) => [...prev, '']); }
  function setSubtopicAt(i: number, v: string) {
    setSubtopics((prev) => { const next = [...prev]; next[i] = v; return next; });
  }
  function removeSubtopic(i: number) { setSubtopics((prev) => prev.filter((_, j) => j !== i)); }

  function addMaterial() { setMaterials((prev) => [...prev, { url: '', label: '', icon: 'link' }]); }
  function setMaterialAt(i: number, field: keyof MaterialItem, value: string) {
    setMaterials((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  }
  function removeMaterial(i: number) { setMaterials((prev) => prev.filter((_, j) => j !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o título da página.');
      return;
    }
    const embedUrl = videoYoutubeUrl.trim() ? youtubeToEmbedUrl(videoYoutubeUrl) : null;
    const materialsClean = materials
      .filter((m) => (m.url || '').trim())
      .map((m) => ({ url: m.url.trim(), label: (m.label || '').trim() || m.url.trim(), icon: (m.icon || 'link').trim() }));

    setError(null);
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      sort_order: Number(sortOrder) || 0,
      emoji: emoji.trim() || null,
      parent_id: parentId || null,
      description: description.trim() || null,
      blocks: blocks,
      topics: topics.filter((t) => t.trim()).map((t) => t.trim()),
      subtopics: subtopics.filter((s) => s.trim()).map((s) => s.trim()),
      video_youtube_embed_url: embedUrl,
      materials: materialsClean,
      banner_image_url: bannerImageUrl.trim() || null,
      program_favicon_url: programFaviconUrl.trim() || null,
    };

    if (isEdit && moduloId) {
      const { error: err } = await supabase
        .from('modules')
        .update(payload)
        .eq('id', moduloId)
        .eq('program_id', programaId);
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Erro ao salvar.');
        return;
      }
      navigate(`/programas/${programaId}/modulos/${moduloId}`);
    } else {
      const { data, error: err } = await supabase
        .from('modules')
        .insert({ ...payload, program_id: programaId })
        .select('id')
        .single();
      setSubmitting(false);
      if (err) {
        setError(err.message ?? 'Erro ao criar página.');
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

  if (isAdmin === false) {
    return (
      <div className="page-content programa-novo-page">
        <div className="programa-novo-empty">
          <p>Você precisa ser <strong>lidera_admin</strong> para editar ou criar páginas.</p>
          <Link to={`/programas/${programaId}`} className="programa-novo-link">← Voltar ao programa</Link>
        </div>
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
        <span>{isEdit ? 'Editar Página' : 'Nova Página'}</span>
      </nav>
      <h1 className="programa-novo-title">{isEdit ? 'Editar Página' : 'Nova Página'}</h1>
      <p className="programa-novo-desc">
        {isEdit ? 'Altere os dados da página.' : 'Preencha os dados para criar uma nova página (módulo).'}
      </p>

      <form onSubmit={handleSubmit} className="programa-novo-form modulo-form">
        {error && <p className="programa-novo-error" role="alert">{error}</p>}
        
        <div className="programa-novo-field">
          <label htmlFor="modulo-titulo">Título *</label>
          <input
            id="modulo-titulo"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Introdução ao Lidera"
            required
          />
        </div>
        
        <div className="programa-novo-field">
          <label htmlFor="modulo-emoji">Emoji (opcional)</label>
          <input
            id="modulo-emoji"
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Ex: 📖 ou 🎯"
            maxLength={4}
            className="modulo-form-emoji-input"
          />
        </div>

        <div className="programa-novo-field">
          <label htmlFor="modulo-parent">Página Pai (opcional - para hierarquia)</label>
          <select
            id="modulo-parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="input-select"
          >
            <option value="">-- Nenhuma (Raiz) --</option>
            {availableParents.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        
        <div className="programa-novo-field">
          <label htmlFor="modulo-ordem">Ordem (Posição)</label>
          <input
            id="modulo-ordem"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          />
        </div>

        <div className="programa-novo-field">
          <label>Descrição Curta</label>
          <textarea
            className="input-textarea"
            placeholder="Um breve resumo sobre o conteúdo desta página..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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

        <div className="programa-novo-field modulo-form-rich-field" style={{ marginTop: 'var(--space-4)' }}>
          <label>Área de Conteúdo Livre (Blocos Dinâmicos)</label>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <div className="modulo-form-group">
          <div className="modulo-form-group-header">
            <label>Materiais Anexos</label>
            <button type="button" className="modulo-form-add-btn" onClick={addMaterial}>
              + Adicionar
            </button>
          </div>
          {materials.map((m, i) => (
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

        <ImageUrlOrUpload
          label="URL da imagem banner da página"
          value={bannerImageUrl}
          onChange={setBannerImageUrl}
          placeholder="https://..."
          variant="banner"
          uploadContext={moduloId ? { pathPrefix: 'modulos/banner', contextId: moduloId } : undefined}
        />
        
        <div className="modulo-form-group" style={{ marginTop: 'var(--space-8)' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Campos Legados (Tópicos/Subtópicos)</summary>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="modulo-form-group-header">
                <label>Tópicos</label>
                <button type="button" className="modulo-form-add-btn" onClick={addTopic}>+ Adicionar</button>
              </div>
              {topics.map((t, i) => (
                <div key={i} className="modulo-form-row">
                  <input type="text" value={t} onChange={(e) => setTopicAt(i, e.target.value)} placeholder="Tópico" />
                  <button type="button" className="modulo-form-remove-btn" onClick={() => removeTopic(i)}>×</button>
                </div>
              ))}

              <div className="modulo-form-group-header">
                <label>Subtópicos</label>
                <button type="button" className="modulo-form-add-btn" onClick={addSubtopics}>+ Adicionar</button>
              </div>
              {subtopics.map((s, i) => (
                <div key={i} className="modulo-form-row">
                  <input type="text" value={s} onChange={(e) => setSubtopicAt(i, e.target.value)} placeholder="Subtópico" />
                  <button type="button" className="modulo-form-remove-btn" onClick={() => removeSubtopic(i)}>×</button>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="programa-novo-actions">
          <Link to={isEdit && moduloId ? `/programas/${programaId}/modulos/${moduloId}` : `/programas/${programaId}`} className="programa-novo-btn programa-novo-btn-cancel">
            Cancelar
          </Link>
          <button type="submit" className="programa-novo-btn programa-novo-btn-submit" disabled={submitting}>
            {submitting ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar Página'}
          </button>
        </div>
      </form>
    </div>
  );
}