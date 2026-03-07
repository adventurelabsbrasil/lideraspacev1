import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Inicio.css';

// Dados mock para a parte visual (serão substituídos por Supabase depois)
const programasMock = [
  { id: '1', title: 'Liderança em Ação', progresso: 65, totalTarefas: 12, concluidas: 8 },
  { id: '2', title: 'Gestão de Equipes', progresso: 30, totalTarefas: 10, concluidas: 3 },
  { id: '3', title: 'Comunicação Eficaz', progresso: 0, totalTarefas: 8, concluidas: 0 },
];

const tarefasResumoMock = [
  { id: '1', title: 'Módulo 1 - Introdução', programa: 'Liderança em Ação', status: 'Concluída', prazo: '15/02' },
  { id: '2', title: 'Feedback 360°', programa: 'Liderança em Ação', status: 'Em andamento', prazo: '28/03' },
  { id: '3', title: 'Planejamento de reuniões', programa: 'Gestão de Equipes', status: 'Pendente', prazo: '05/04' },
  { id: '4', title: 'Escuta ativa', programa: 'Comunicação Eficaz', status: 'Pendente', prazo: '12/04' },
];

const ativosRecentesMock = [
  { id: '1', tipo: 'Tarefa concluída', title: 'Módulo 1 - Introdução', quando: 'Hoje, 14:32' },
  { id: '2', tipo: 'Novo programa', title: 'Comunicação Eficaz', quando: 'Ontem' },
  { id: '3', tipo: 'Progresso', title: 'Feedback 360° — 60%', quando: '28/02' },
  { id: '4', tipo: 'Tarefa concluída', title: 'Dinâmica de equipe', quando: '27/02' },
];

function getNomeCurto(email: string | undefined): string {
  if (!email) return 'Usuário';
  const parte = email.split('@')[0];
  return parte.charAt(0).toUpperCase() + parte.slice(1).replace(/[._]/g, ' ');
}

export default function Inicio() {
  const { user } = useAuth();
  const nomeCurto = getNomeCurto(user?.email);

  return (
    <div className="page-content inicio-page">
      {/* 1. Boas-vindas */}
      <header className="inicio-welcome">
        <h1 className="inicio-welcome-title">Olá, {nomeCurto}!</h1>
        <p className="inicio-welcome-subtitle">
          Aqui está o resumo do seu progresso. Continue de onde parou ou explore um programa.
        </p>
      </header>

      {/* 2. Cards dos Programas */}
      <section className="inicio-section">
        <div className="inicio-section-header">
          <h2 className="inicio-section-title">Meus Programas</h2>
          <Link to="/programas/novo" className="inicio-btn-novo">Novo programa</Link>
        </div>
        <div className="inicio-cards">
          {programasMock.map((p) => (
            <Link key={p.id} to={`/programas/${p.id}`} className="inicio-card">
              <div className="inicio-card-header">
                <span className="inicio-card-nome">{p.title}</span>
                <span className="inicio-card-badge">{p.concluidas}/{p.totalTarefas}</span>
              </div>
              <div className="inicio-card-progress">
                <div className="inicio-card-progress-bar" style={{ width: `${p.progresso}%` }} />
              </div>
              <span className="inicio-card-pct">{p.progresso}% concluído</span>
            </Link>
          ))}
        </div>
        <div className="inicio-links-row">
          <Link to="/programas" className="inicio-link-more">Ver todos os programas →</Link>
        </div>
      </section>

      {/* 3. Tabela resumo de tarefas */}
      <section className="inicio-section">
        <div className="inicio-section-header">
          <h2 className="inicio-section-title">Resumo de Tarefas</h2>
          <Link to="/tarefas" className="inicio-link-more">Ver todas</Link>
        </div>
        <div className="inicio-table-wrap">
          <table className="inicio-table">
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Programa</th>
                <th>Status</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {tarefasResumoMock.map((t) => (
                <tr key={t.id}>
                  <td className="inicio-table-titulo">
                    <Link to={`/tarefas/${t.id}`} className="inicio-table-link">{t.title}</Link>
                  </td>
                  <td>{t.programa}</td>
                  <td>
                    <span className={`inicio-status inicio-status--${t.status.toLowerCase().replace(' ', '-')}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Scorecards últimos ativos */}
      <section className="inicio-section">
        <h2 className="inicio-section-title">Últimos ativos</h2>
        <div className="inicio-scorecards">
          {ativosRecentesMock.map((a) => (
            <Link key={a.id} to={`/ativos/${a.id}`} className="inicio-scorecard inicio-scorecard--link">
              <span className="inicio-scorecard-tipo">{a.tipo}</span>
              <span className="inicio-scorecard-titulo">{a.title}</span>
              <span className="inicio-scorecard-quando">{a.quando}</span>
            </Link>
          ))}
        </div>
        <Link to="/ativos" className="inicio-link-more">Ver todos os ativos →</Link>
      </section>
    </div>
  );
}
