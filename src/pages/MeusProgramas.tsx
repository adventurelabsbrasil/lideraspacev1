import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import './MeusProgramas.css';

type Program = {
  id: string;
  title: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
};

export default function MeusProgramas() {
  const { user, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      setError('Supabase não configurado. Crie um .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e reinicie o servidor (npm run dev).');
      return;
    }
    if (authLoading || !user) {
      setLoading(false);
      setPrograms([]);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('programs')
        .select('id, title, organization_id, created_at, updated_at')
        .order('updated_at', { ascending: false });
      setLoading(false);
      if (import.meta.env.DEV) {
        console.log('[MeusProgramas] Resposta:', err ? { error: err.message, code: err.code } : { total: (data ?? []).length, programs: data });
      }
      if (err) {
        console.error('[MeusProgramas] Supabase error:', err);
        setError(`Erro ao carregar: ${err.message}. Verifique .env (URL e Anon key) e o console (F12).`);
        return;
      }
      setPrograms(data ?? []);
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
      ) : programs.length === 0 ? (
        <div className="meus-programas-empty">
          <p>Nenhum programa ainda.</p>
          <Link to="/programas/novo" className="meus-programas-link">Criar o primeiro programa</Link>
        </div>
      ) : (
        <ul className="meus-programas-list">
          {programs.map((p) => (
            <li key={p.id}>
              <Link to={`/programas/${p.id}`} className="meus-programas-card">
                <span className="meus-programas-card-titulo">{p.title}</span>
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
