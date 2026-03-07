import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import './Equipe.css';

type Organization = { id: string; nome: string };
type Member = {
  id: string;
  user_id: string;
  role: string;
  profiles: { full_name: string | null } | null;
};

const ROLES = [
  { value: 'aluno', label: 'Aluno' },
  { value: 'org_admin', label: 'Admin da organização' },
  { value: 'lidera_admin', label: 'Admin geral' },
] as const;

export default function Equipe() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('aluno');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig || !user) return;
    async function loadOrgs() {
      setLoadingOrgs(true);
      const { data, error: err } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(id, nome)')
        .eq('user_id', user.id)
        .in('role', ['lidera_admin', 'org_admin']);
      setLoadingOrgs(false);
      if (err) {
        setError('Erro ao carregar organizações.');
        return;
      }
      type Row = { organization_id: string; organizations: { id: string; nome: string } | null };
      const seen = new Set<string>();
      const orgs: Organization[] = (data ?? []).reduce<Organization[]>((acc, row: Row) => {
        const org = row.organizations;
        if (org?.id && org?.nome && !seen.has(org.id)) {
          seen.add(org.id);
          acc.push({ id: org.id, nome: org.nome });
        }
        return acc;
      }, []);
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrgId) setSelectedOrgId(orgs[0].id);
    }
    loadOrgs();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedOrgId) {
      setMembers([]);
      return;
    }
    async function loadMembers() {
      setLoadingMembers(true);
      const { data, error: err } = await supabase
        .from('organization_members')
        .select('id, user_id, role, profiles(full_name)')
        .eq('organization_id', selectedOrgId)
        .order('role', { ascending: false });
      setLoadingMembers(false);
      if (err) {
        setError('Erro ao carregar membros.');
        return;
      }
      setMembers((data ?? []) as Member[]);
    }
    loadMembers();
  }, [selectedOrgId]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !selectedOrgId || !email.trim()) return;
    setError(null);
    setSuccess(null);
    setSaving(true);

    const { data: userId, error: rpcErr } = await supabase.rpc('get_user_id_by_email', {
      p_email: email.trim().toLowerCase(),
    });

    if (rpcErr) {
      setError(rpcErr.message || 'Erro ao buscar usuário.');
      setSaving(false);
      return;
    }

    if (!userId) {
      setError(
        'Usuário não encontrado. A pessoa precisa fazer login ou cadastro no app primeiro. ' +
          'Confira se o e-mail está correto.'
      );
      setSaving(false);
      return;
    }

    const { error: insertErr } = await supabase.from('organization_members').insert({
      organization_id: selectedOrgId,
      user_id: userId,
      role: role,
    });

    setSaving(false);
    if (insertErr) {
      if (insertErr.code === '23505') {
        setError('Este usuário já é membro desta organização.');
      } else {
        setError(insertErr.message || 'Erro ao adicionar membro.');
      }
      return;
    }

    setSuccess('Membro adicionado com sucesso.');
    setEmail('');
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        user_id: userId,
        role,
        profiles: { full_name: null },
      } as Member,
    ]);
  }

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const isAdmin = organizations.length > 0;

  return (
    <div className="page-content equipe-page">
      <h1 className="equipe-title">Equipe</h1>
      <p className="equipe-desc">
        Gerencie os membros das organizações em que você é administrador. Adicione usuários pelo
        e-mail e defina o nível de acesso.
      </p>

      {loadingOrgs ? (
        <p className="equipe-loading">Carregando…</p>
      ) : !isAdmin ? (
        <div className="equipe-empty">
          <p>
            Você precisa ser <strong>admin</strong> (lidera_admin ou org_admin) de uma organização
            para gerenciar a equipe.
          </p>
          <p>
            Peça que um administrador adicione você como admin ou execute o seed no Supabase para
            configurar as organizações.
          </p>
        </div>
      ) : (
        <>
          <div className="equipe-org-select">
            <label htmlFor="org">Organização</label>
            <select
              id="org"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>

          <section className="equipe-section">
            <h2>Adicionar membro</h2>
            <p className="equipe-hint">
              O usuário precisa já ter feito login ou cadastro no app. Informe o e-mail cadastrado.
            </p>
            <form onSubmit={handleAddMember} className="equipe-form">
              <div className="equipe-form-row">
                <div className="equipe-field">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                </div>
                <div className="equipe-field">
                  <label htmlFor="role">Acesso</label>
                  <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="equipe-btn-add" disabled={saving}>
                  {saving ? 'Adicionando…' : 'Adicionar'}
                </button>
              </div>
              {error && <p className="equipe-error" role="alert">{error}</p>}
              {success && <p className="equipe-success" role="status">{success}</p>}
            </form>
          </section>

          <section className="equipe-section">
            <h2>Membros de {selectedOrg?.nome ?? '…'}</h2>
            {loadingMembers ? (
              <p className="equipe-loading">Carregando membros…</p>
            ) : members.length === 0 ? (
              <p className="equipe-no-members">Nenhum membro ainda.</p>
            ) : (
              <ul className="equipe-members-list">
                {members.map((m) => (
                  <li key={m.id} className="equipe-member">
                    <span className="equipe-member-name">
                      {m.profiles?.full_name || 'Usuário'}
                    </span>
                    <span className={`equipe-member-role equipe-member-role--${m.role}`}>
                      {ROLES.find((r) => r.value === m.role)?.label ?? m.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
