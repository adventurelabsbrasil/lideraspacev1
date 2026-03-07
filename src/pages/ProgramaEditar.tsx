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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [programFaviconUrl, setProgramFaviconUrl] = useState('');
  const [creatorFaviconUrl, setCreatorFaviconUrl] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('programs')
        .select('id, organization_id, title, banner_image_url, program_favicon_url, creator_favicon_url')
        .eq('id', id)
        .single();
      
      if (err || !data) {
        setError(err?.message ?? 'Programa não encontrado.');
        setLoading(false);
        return;
      }
      const row = data as { organization_id: string; title: string; banner_image_url?: string | null; program_favicon_url?: string | null; creator_favicon_url?: string | null };
      setTitle(row.title ?? '');
      setBannerImageUrl(row.banner_image_url ?? '');
      setProgramFaviconUrl(row.program_favicon_url ?? '');
      setCreatorFaviconUrl(row.creator_favicon_url ?? '');

      if (user?.id && row.organization_id) {
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', row.organization_id)
          .eq('user_id', user.id)
          .single();
        setIsAdmin(orgMember?.role === 'lidera_admin');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    load();
  }, [id, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !id) return;
    if (!title.trim()) {
      setError('Informe o título do programa.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase
      .from('programs')
      .update({
        title: title.trim(),
        banner_image_url: bannerImageUrl.trim() || null,
        program_favicon_url: programFaviconUrl.trim() || null,
        creator_favicon_url: creatorFaviconUrl.trim() || null,
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

  if (isAdmin === false) {
    return (
      <div className="page-content programa-novo-page">
        <div className="programa-novo-empty">
          <p>Você precisa ser <strong>admin</strong> para editar programas.</p>
          <Link to={`/programas/${id}`} className="programa-novo-link">← Voltar ao programa</Link>
        </div>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Liderança em Ação"
            required
            autoFocus
          />
        </div>
        <ImageUrlOrUpload
          label="URL da imagem banner"
          value={bannerImageUrl}
          onChange={setBannerImageUrl}
          placeholder="https://..."
          variant="banner"
          uploadContext={id ? { pathPrefix: 'banners', contextId: id } : undefined}
        />
        <ImageUrlOrUpload
          label="URL do favicon do programa"
          value={programFaviconUrl}
          onChange={setProgramFaviconUrl}
          placeholder="https://..."
          variant="favicon"
          uploadContext={id ? { pathPrefix: 'favicons/programa', contextId: id } : undefined}
        />
        <ImageUrlOrUpload
          label="URL do favicon do criador"
          value={creatorFaviconUrl}
          onChange={setCreatorFaviconUrl}
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
