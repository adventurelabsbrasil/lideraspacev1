import { Link, useParams } from 'react-router-dom';
import './Detalhe.css';

export default function TarefaDetalhe() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="page-content detalhe-page">
      <nav className="detalhe-breadcrumb">
        <Link to="/tarefas">Tarefas</Link>
        <span className="detalhe-breadcrumb-sep">/</span>
        <span>Detalhe</span>
      </nav>
      <header className="detalhe-header">
        <div className="detalhe-header-main">
          <h1 className="detalhe-title">Tarefa</h1>
          <p className="detalhe-meta">ID: {id ?? '—'}</p>
        </div>
      </header>
      <section className="detalhe-section">
        <h2 className="detalhe-section-title">Status e datas</h2>
        <p className="detalhe-placeholder">
          Status, data de criação, criador e data de atualização serão exibidos aqui (conectados ao Supabase).
        </p>
        <Link to="/tarefas" className="detalhe-link">← Voltar às tarefas</Link>
      </section>
    </div>
  );
}
