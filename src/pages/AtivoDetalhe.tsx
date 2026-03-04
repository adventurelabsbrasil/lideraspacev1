import { Link, useParams } from 'react-router-dom';
import './Detalhe.css';

export default function AtivoDetalhe() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="page-content detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/ativos">Ativos</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Detalhe</span>
      </nav>
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          <h1 className="detalhe-title">Ativo</h1>
          <p className="detalhe-meta">ID: {id ?? '—'}</p>
        </div>
      </header>
      <section className="detalhe-section">
        <h2 className="detalhe-section-title">Link e programa</h2>
        <p className="detalhe-placeholder">
          Título, link clicável, ícone (planilha, docs, pdf, etc.), programa e módulo relacionados serão exibidos aqui (conectados ao Supabase).
        </p>
        <Link to="/ativos" className="detalhe-link">← Voltar aos ativos</Link>
      </section>
    </div>
  );
}
