import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
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
              onClick={closeSidebar}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user" title={user?.email ?? ''}>
            {user?.email ?? 'Usuário'}
          </span>
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
