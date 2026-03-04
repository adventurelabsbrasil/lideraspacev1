import { Link, useParams } from 'react-router-dom';
import './Detalhe.css';

export default function ModuloDetalhe() {
  const { programaId, moduloId } = useParams<{ programaId: string; moduloId: string }>();

  return (
    <div className="page-content detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <Link to={`/programas/${programaId}`}>Programa</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Módulo</span>
      </nav>
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          <h1 className="detalhe-title">Módulo</h1>
          <p className="detalhe-meta">Programa: {programaId ?? '—'} · Módulo: {moduloId ?? '—'}</p>
        </div>
      </header>
      <section className="detalhe-section">
        <h2 className="detalhe-section-title">Conteúdo</h2>
        <p className="detalhe-placeholder">
          Tópicos, subtópicos, vídeo e materiais serão exibidos aqui (conectados ao Supabase).
        </p>
        <Link to={programaId ? `/programas/${programaId}` : '/programas'} className="detalhe-link">
          ← Voltar ao programa
        </Link>
      </section>
    </div>
  );
}
