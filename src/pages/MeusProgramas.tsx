import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, loading: authLoading } = useAuth();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      setProgramas([]);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        setError('Sessão não encontrada. Faça login novamente.');
        return;
      }
      const { data, error: err } = await supabase
        .from('programas')
        .select('id, titulo, organization_id, created_at, updated_at')
        .order('updated_at', { ascending: false });
      setLoading(false);
      if (err) {
        console.error('[MeusProgramas] Supabase error:', err);
        setError('Não foi possível carregar os programas. Abra o console (F12) para ver o erro. Se você entrou com Google, adicione seu usuário à organização (veja supabase/add_user_to_demo_org.sql).');
        return;
      }
      setProgramas(data ?? []);
    }
    load();
  }, [authLoading, user?.id]);

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
