import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './Detalhe.css';
import './ProgramaDetalhe.css';

type Program = {
  id: string;
  title: string;
  banner_image_url: string | null;
  program_favicon_url: string | null;
  created_at: string;
  updated_at: string;
};

type Module = {
  id: string;
  title: string;
  sort_order: number;
  emoji: string | null;
};

export default function ProgramaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data: progData, error: progErr } = await supabase
        .from('programs')
        .select('id, organization_id, title, banner_image_url, program_favicon_url, created_at, updated_at')
        .eq('id', id)
        .single();
      if (progErr) {
        setError(progErr.message);
        setProgram(null);
        setModules([]);
        setLoading(false);
        return;
      }
      setProgram(progData as Program);

      if (user?.id && progData?.organization_id) {
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', progData.organization_id)
          .eq('user_id', user.id)
          .single();
        setIsAdmin(['lidera_admin', 'org_admin'].includes(orgMember?.role ?? ''));
      }

      const { data: modData, error: modErr } = await supabase
        .from('modules')
        .select('id, title, sort_order, emoji')
        .eq('program_id', id)
        .order('sort_order', { ascending: true });
      if (!modErr) setModules((modData ?? []) as Module[]);
      else setModules([]);
      setLoading(false);
    }
    load();
  }, [id]);

  if (!id) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder">Programa não identificado.</p>
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

  if (error || !program) {
    return (
      <div className="page-content detalhe-page">
        <p className="detalhe-placeholder detalhe-error">{error ?? 'Programa não encontrado.'}</p>
        <Link to="/programas" className="detalhe-link">← Voltar aos programas</Link>
      </div>
    );
  }

  return (
    <div className="page-content detalhe-page programa-detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/">Início</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>{program.title}</span>
      </nav>
      {program.banner_image_url && (
        <div className="programa-detalhe-banner-wrap">
          <img
            src={program.banner_image_url}
            alt=""
            className="programa-detalhe-banner"
          />
        </div>
      )}
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          <h1 className="detalhe-title">{program.title}</h1>
          <p className="detalhe-meta">
            Atualizado em {new Date(program.updated_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        {isAdmin && (
          <div className="detalhe-actions">
            <Link to={`/programas/${id}/editar`} className="btn btn--secondary">
              Editar programa
            </Link>
            <Link to={`/programas/${id}/modulos/novo`} className="btn btn--primary">
              Novo módulo
            </Link>
          </div>
        )}
      </header>
      <section className="detalhe-section">
        <h2 className="detalhe-section-title">Módulos</h2>
        {modules.length === 0 ? (
          <p className="detalhe-placeholder">Nenhum módulo ainda.</p>
        ) : (
          <ul className="programa-detalhe-modulos">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/programas/${id}/modulos/${m.id}`}
                  className="programa-detalhe-modulo-link"
                >
                  <span className="programa-detalhe-modulo-emoji">
                    {m.emoji && m.emoji.trim() ? m.emoji : '📄'}
                  </span>
                  <span className="programa-detalhe-modulo-ordem">{m.sort_order}</span>
                  <span className="programa-detalhe-modulo-titulo">{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/programas" className="detalhe-link">← Voltar aos programas</Link>
      </section>
    </div>
  );
}
