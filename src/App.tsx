import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import MeusProgramas from './pages/MeusProgramas';
import ProgramaDetalhe from './pages/ProgramaDetalhe';
import ProgramaEditar from './pages/ProgramaEditar';
import ProgramaNovo from './pages/ProgramaNovo';
import ModuloDetalhe from './pages/ModuloDetalhe';
import ModuloNovo from './pages/ModuloNovo';
import ModuloEditar from './pages/ModuloEditar';
import MinhasTarefas from './pages/MinhasTarefas';
import TarefaDetalhe from './pages/TarefaDetalhe';
import MeusAtivos from './pages/MeusAtivos';
import AtivoDetalhe from './pages/AtivoDetalhe';
import Ajuda from './pages/Ajuda';
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Inicio />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="programas" element={<MeusProgramas />} />
        <Route path="programas/novo" element={<ProgramaNovo />} />
        <Route path="programas/:id/editar" element={<ProgramaEditar />} />
        <Route path="programas/:programId/modulos/novo" element={<ModuloNovo />} />
        <Route path="programas/:programId/modulos/:moduleId/editar" element={<ModuloEditar />} />
        <Route path="programas/:id" element={<ProgramaDetalhe />} />
        <Route path="programas/:programId/modulos/:moduleId" element={<ModuloDetalhe />} />
        <Route path="tarefas" element={<MinhasTarefas />} />
        <Route path="tarefas/:id" element={<TarefaDetalhe />} />
        <Route path="ativos" element={<MeusAtivos />} />
        <Route path="ativos/:id" element={<AtivoDetalhe />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="ajuda" element={<Ajuda />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
