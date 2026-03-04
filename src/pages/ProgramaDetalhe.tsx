import { Link, useParams } from 'react-router-dom';
import './Detalhe.css';

export default function ProgramaDetalhe() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="page-content detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/programas">Programas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Detalhe</span>
      </nav>
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          <h1 className="detalhe-title">Programa</h1>
          <p className="detalhe-meta">ID: {id ?? '—'}</p>
        </div>
      </header>
      <section className="detalhe-section">
        <h2 className="detalhe-section-title">Módulos</h2>
        <p className="detalhe-placeholder">
          Lista de módulos do programa será exibida aqui (conectada ao Supabase).
        </p>
        <Link to="/programas" className="detalhe-link">← Voltar aos programas</Link>
      </section>
    </div>
  );
}
