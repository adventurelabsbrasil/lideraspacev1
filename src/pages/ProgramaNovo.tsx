import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ImageUrlOrUpload from '../components/ImageUrlOrUpload';
import './Detalhe.css';
import './ProgramaNovo.css';

type Organization = { id: string; nome: string };

export default function ProgramaNovo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [imagemBannerUrl, setImagemBannerUrl] = useState('');
  const [faviconProgramaUrl, setFaviconProgramaUrl] = useState('');
  const [faviconCriadorUrl, setFaviconCriadorUrl] = useState('');

  useEffect(() => {
    async function loadOrganizations() {
      if (!user?.id) return;
      setLoadingOrgs(true);
      const { data, error: err } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(id, nome)')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      setLoadingOrgs(false);
      if (err) {
        setError('Não foi possível carregar as organizações.');
        return;
      }
      type Row = { organization_id: string; organizations: { id: string; nome: string } | { id: string; nome: string }[] | null };
      const seen = new Set<string>();
      const orgs: Organization[] = (data ?? []).reduce<Organization[]>((acc, row: Row) => {
        const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
        if (org?.id && org?.nome && !seen.has(org.id)) {
          seen.add(org.id);
          acc.push({ id: org.id, nome: org.nome });
        }
        return acc;
      }, []);
      setOrganizations(orgs);
      if (orgs.length > 0 && !organizationId) setOrganizationId(orgs[0].id);
    }
    loadOrganizations();
  }, [user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    if (!titulo.trim()) {
      setError('Informe o título do programa.');
      return;
    }
    if (!organizationId) {
      setError('Selecione uma organização.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: err } = await supabase
      .from('programas')
      .insert({
        organization_id: organizationId,
        titulo: titulo.trim(),
        created_by: user.id,
        imagem_banner_url: imagemBannerUrl.trim() || null,
        favicon_programa_url: faviconProgramaUrl.trim() || null,
        favicon_criador_url: faviconCriadorUrl.trim() || null,
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Erro ao criar programa.');
      return;
    }
    if (data?.id) navigate(`/programas/${data.id}`);
    else navigate('/programas');
  }

  return (
    <div className="page-content programa-novo-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Novo programa</span>
      </nav>
      <h1 className="programa-novo-title">Novo programa</h1>
      <p className="programa-novo-desc">Preencha os dados para criar um novo programa.</p>

      {loadingOrgs ? (
        <p className="programa-novo-loading">Carregando organizações…</p>
      ) : organizations.length === 0 ? (
        <div className="programa-novo-empty">
          <p>Você precisa ser <strong>admin</strong> de uma organização para criar programas.</p>
          <p>Crie uma organização ou peça que um administrador adicione você como admin.</p>
          <Link to="/programas" className="programa-novo-link">← Voltar aos programas</Link>
        </div>
      ) : (
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
          <div className="programa-novo-field">
            <label htmlFor="organization_id">Organização *</label>
            <select
              id="organization_id"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.nome}</option>
              ))}
            </select>
          </div>
          <ImageUrlOrUpload
            label="URL da imagem banner"
            value={imagemBannerUrl}
            onChange={setImagemBannerUrl}
            placeholder="https://... ou salve o programa e use Enviar arquivo"
            variant="banner"
          />
          <ImageUrlOrUpload
            label="URL do favicon do programa"
            value={faviconProgramaUrl}
            onChange={setFaviconProgramaUrl}
            placeholder="https://..."
            variant="favicon"
          />
          <ImageUrlOrUpload
            label="URL do favicon do criador"
            value={faviconCriadorUrl}
            onChange={setFaviconCriadorUrl}
            placeholder="https://..."
            variant="favicon"
          />
          <div className="programa-novo-actions">
            <Link to="/programas" className="programa-novo-btn programa-novo-btn-cancel">Cancelar</Link>
            <button type="submit" className="programa-novo-btn programa-novo-btn-submit" disabled={submitting}>
              {submitting ? 'Criando…' : 'Criar programa'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
