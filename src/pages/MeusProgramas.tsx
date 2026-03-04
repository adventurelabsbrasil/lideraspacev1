import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './MeusProgramas.css';

type Programa = {
  id: string;
  titulo: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
};

export default function MeusProgramas() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('programas')
        .select('id, titulo, organization_id, created_at, updated_at')
        .order('updated_at', { ascending: false });
      setLoading(false);
      if (err) {
        setError('Não foi possível carregar os programas.');
        return;
      }
      setProgramas(data ?? []);
    }
    load();
  }, []);

  return (
    <div className="page-content meus-programas-page">
      <div className="meus-programas-header">
        <h1 className="meus-programas-title">Meus Programas</h1>
        <Link to="/programas/novo" className="meus-programas-btn-novo">Novo programa</Link>
      </div>
      <p className="meus-programas-desc">Programas das organizações em que você participa.</p>

      {error && <p className="meus-programas-error" role="alert">{error}</p>}
      {loading ? (
        <p className="meus-programas-loading">Carregando…</p>
      ) : programas.length === 0 ? (
        <div className="meus-programas-empty">
          <p>Nenhum programa ainda.</p>
          <Link to="/programas/novo" className="meus-programas-link">Criar o primeiro programa</Link>
        </div>
      ) : (
        <ul className="meus-programas-list">
          {programas.map((p) => (
            <li key={p.id}>
              <Link to={`/programas/${p.id}`} className="meus-programas-card">
                <span className="meus-programas-card-titulo">{p.titulo}</span>
                <span className="meus-programas-card-meta">
                  Atualizado em {new Date(p.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
