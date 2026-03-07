import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import './Layout.css';

type Program = { id: string; title: string };
type Module = { id: string; title: string; sort_order: number; emoji: string | null; program_id: string };

const navItems = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/equipe', label: 'Equipe', icon: '👥' },
  { to: '/tarefas', label: 'Minhas Tarefas', icon: '✅' },
  { to: '/ativos', label: 'Meus Ativos', icon: '📎' },
  { to: '/ajuda', label: 'Ajuda', icon: '❓' },
] as const;

export default function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [programsExpanded, setProgramsExpanded] = useState(false);
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modulesByProgram, setModulesByProgram] = useState<Record<string, Module[]>>({});
  
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig || !user) {
      setPrograms([]);
      setModulesByProgram({});
      setProfile(null);
      return;
    }
    
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data));

    supabase
      .from('programs')
      .select('id, title')
      .order('updated_at', { ascending: false })
      .then(({ data }) => setPrograms((data ?? []) as Program[]));
  }, [user?.id]);

  const loadModulesForProgram = async (programId: string) => {
    if (modulesByProgram[programId]) return;
    const { data } = await supabase
      .from('modules')
      .select('id, title, sort_order, emoji, program_id')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true });
    setModulesByProgram((prev) => ({ ...prev, [programId]: (data ?? []) as Module[] }));
  };

  const toggleProgram = (programId: string) => {
    setExpandedProgramId((prev) => {
      const next = prev === programId ? null : programId;
      if (next) loadModulesForProgram(next);
      return next;
    });
  };

  useEffect(() => {
    const m = location.pathname.match(/^\/programas\/([^/]+)(?:\/modulos\/[^/]+)?\/?$/);
    if (m) {
      const programId = m[1];
      setProgramsExpanded(true);
      setExpandedProgramId(programId);
      loadModulesForProgram(programId);
    }
  }, [location.pathname]);

  const isProgramActive = (id: string) => location.pathname === `/programas/${id}`;
  const isModuleActive = (programId: string, moduleId: string) =>
    location.pathname === `/programas/${programId}/modulos/${moduleId}`;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <header className="layout-mobile-header" aria-hidden="true">
        <button
          type="button"
          className="layout-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <span className="layout-menu-toggle-icon" aria-hidden>☰</span>
        </button>
        <span className="layout-mobile-brand">LideraSpace</span>
        <div className="layout-mobile-actions">
          <button
            type="button"
            className="theme-toggle theme-toggle--mobile"
            onClick={toggleTheme}
            title={`Tema atual: ${theme}`}
            aria-label="Alternar tema"
          >
            {theme === 'original' ? '✨' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div
        className={`layout-sidebar-backdrop ${sidebarOpen ? 'layout-sidebar-backdrop--open' : ''}`}
        onClick={closeSidebar}
        onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
        role="button"
        tabIndex={-1}
        aria-label="Fechar menu"
      />

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-brand">LideraSpace</span>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            ×
          </button>
          <button
            type="button"
            className="theme-toggle theme-toggle--sidebar"
            onClick={toggleTheme}
            title={`Tema atual: ${theme}`}
            aria-label="Alternar tema"
          >
            {theme === 'original' ? '✨' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
            onClick={closeSidebar}
          >
            <span className="sidebar-link-icon" aria-hidden>🏠</span>
            Início
          </NavLink>

          <div className="sidebar-tree-wrap">
            <button
              type="button"
              className="sidebar-tree-toggle"
              onClick={() => setProgramsExpanded((p) => !p)}
              aria-expanded={programsExpanded}
            >
              <span className={`sidebar-tree-chevron ${programsExpanded ? 'expanded' : ''}`}>▸</span>
              <span className="sidebar-link-icon">📚</span>
              Meus Programas
            </button>
            {programsExpanded && (
              <ul className="sidebar-tree-children">
                {programs.map((prog) => {
                  const modules = modulesByProgram[prog.id] ?? [];
                  const isExpanded = expandedProgramId === prog.id;
                  const programActive = isProgramActive(prog.id);
                  return (
                    <li key={prog.id} className="sidebar-program-wrap">
                      <div className="sidebar-program-row" style={{ marginLeft: 'var(--space-4)' }}>
                        <button
                          type="button"
                          className="sidebar-tree-chevron"
                          style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'none',
                            flexShrink: 0,
                          }}
                          onClick={() => toggleProgram(prog.id)}
                          aria-label={isExpanded ? 'Recolher módulos' : 'Expandir módulos'}
                        >
                          ▸
                        </button>
                        <NavLink
                          to={`/programas/${prog.id}`}
                          className={({ isActive }) =>
                            `sidebar-program-link ${isActive || programActive ? 'active' : ''}`
                          }
                          onClick={closeSidebar}
                        >
                          <span className="sidebar-link-icon">📁</span>
                          <span className="sidebar-program-title">{prog.title}</span>
                        </NavLink>
                      </div>
                      {isExpanded && (
                        <ul className="sidebar-modules">
                          {modules.map((mod) => (
                            <li key={mod.id}>
                              <NavLink
                                to={`/programas/${prog.id}/modulos/${mod.id}`}
                                className={({ isActive }) =>
                                  `sidebar-module-link ${isActive || isModuleActive(prog.id, mod.id) ? 'active' : ''}`
                                }
                                onClick={closeSidebar}
                              >
                                <span className="sidebar-module-emoji">
                                  {mod.emoji && mod.emoji.trim() ? mod.emoji : '📄'}
                                </span>
                                <span className="sidebar-module-title">{mod.title}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {navItems.slice(1).map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-link-icon" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink
            to="/perfil"
            className={({ isActive }) => `sidebar-user-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="sidebar-user-avatar" />
            ) : (
              <span className="sidebar-user-avatar-placeholder">
                {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={profile?.full_name || user?.email || ''}>
                {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
              </span>
              <span className="sidebar-user-email" title={user?.email || ''}>
                {user?.email || ''}
              </span>
            </div>
          </NavLink>
          <button type="button" className="sidebar-logout" onClick={() => { signOut(); closeSidebar(); }}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
