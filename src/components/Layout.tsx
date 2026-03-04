import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavLink } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/programas', label: 'Meus Programas' },
  { to: '/tarefas', label: 'Minhas Tarefas' },
  { to: '/ativos', label: 'Meus Ativos' },
  { to: '/ajuda', label: 'Ajuda' },
] as const;

export default function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand">LideraSpace</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user" title={user?.email ?? ''}>
            {user?.email ?? 'Usuário'}
          </span>
          <button type="button" className="sidebar-logout" onClick={() => signOut()}>
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
