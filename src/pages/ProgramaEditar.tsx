import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageUrlOrUpload from '../components/ImageUrlOrUpload';
import './Detalhe.css';
import './ProgramaNovo.css';

export default function ProgramaEditar() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [imagemBannerUrl, setImagemBannerUrl] = useState('');
  const [faviconProgramaUrl, setFaviconProgramaUrl] = useState('');
  const [faviconCriadorUrl, setFaviconCriadorUrl] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('programas')
        .select('id, titulo, imagem_banner_url, favicon_programa_url, favicon_criador_url')
        .eq('id', id)
        .single();
      setLoading(false);
      if (err || !data) {
        setError(err?.message ?? 'Programa não encontrado.');
        return;
      }
      const row = data as { titulo: string; imagem_banner_url?: string | null; favicon_programa_url?: string | null; favicon_criador_url?: string | null };
      setTitulo(row.titulo ?? '');
      setImagemBannerUrl(row.imagem_banner_url ?? '');
      setFaviconProgramaUrl(row.favicon_programa_url ?? '');
      setFaviconCriadorUrl(row.favicon_criador_url ?? '');
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !id) return;
    if (!titulo.trim()) {
      setError('Informe o título do programa.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase
      .from('programas')
      .update({
        titulo: titulo.trim(),
        imagem_banner_url: imagemBannerUrl.trim() || null,
        favicon_programa_url: faviconProgramaUrl.trim() || null,
        favicon_criador_url: faviconCriadorUrl.trim() || null,
      })
      .eq('id', id);
    setSubmitting(false);
    if (err) {
      setError(err.message ?? 'Erro ao salvar.');
      return;
    }
    navigate(`/programas/${id}`);
  }

  if (!id) {
    return (
      <div className="page-content programa-novo-page">
        <p className="programa-novo-error">Programa não identificado.</p>
        <Link to="/programas" className="programa-novo-link">← Voltar aos programas</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-content programa-novo-page">
        <p className="programa-novo-loading">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="page-content programa-novo-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to={`/programas/${id}`}>Detalhe</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Editar</span>
      </nav>
      <h1 className="programa-novo-title">Editar programa</h1>
      <p className="programa-novo-desc">Altere os dados do programa.</p>

      <form onSubmit={handleSubmit} className="programa-novo-form">
        {error && <p className="programa-novo-error" role="alert">{error}</p>}
        <div className="programa-novo-field">
          <label htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Liderança em Ação"
            required
            autoFocus
          />
        </div>
        <ImageUrlOrUpload
          label="URL da imagem banner"
          value={imagemBannerUrl}
          onChange={setImagemBannerUrl}
          placeholder="https://..."
          variant="banner"
          uploadContext={id ? { pathPrefix: 'banners', contextId: id } : undefined}
        />
        <ImageUrlOrUpload
          label="URL do favicon do programa"
          value={faviconProgramaUrl}
          onChange={setFaviconProgramaUrl}
          placeholder="https://..."
          variant="favicon"
          uploadContext={id ? { pathPrefix: 'favicons/programa', contextId: id } : undefined}
        />
        <ImageUrlOrUpload
          label="URL do favicon do criador"
          value={faviconCriadorUrl}
          onChange={setFaviconCriadorUrl}
          placeholder="https://..."
          variant="favicon"
          uploadContext={id ? { pathPrefix: 'favicons/criador', contextId: id } : undefined}
        />
        <div className="programa-novo-actions">
          <Link to={`/programas/${id}`} className="programa-novo-btn programa-novo-btn-cancel">Cancelar</Link>
          <button type="submit" className="programa-novo-btn programa-novo-btn-submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
