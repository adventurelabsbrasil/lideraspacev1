import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import MeusProgramas from './pages/MeusProgramas';
import ProgramaDetalhe from './pages/ProgramaDetalhe';
import ModuloDetalhe from './pages/ModuloDetalhe';
import MinhasTarefas from './pages/MinhasTarefas';
import TarefaDetalhe from './pages/TarefaDetalhe';
import MeusAtivos from './pages/MeusAtivos';
import AtivoDetalhe from './pages/AtivoDetalhe';
import Ajuda from './pages/Ajuda';

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
        <Route path="programas" element={<MeusProgramas />} />
        <Route path="programas/:id" element={<ProgramaDetalhe />} />
        <Route path="programas/:programaId/modulos/:moduloId" element={<ModuloDetalhe />} />
        <Route path="tarefas" element={<MinhasTarefas />} />
        <Route path="tarefas/:id" element={<TarefaDetalhe />} />
        <Route path="ativos" element={<MeusAtivos />} />
        <Route path="ativos/:id" element={<AtivoDetalhe />} />
        <Route path="ajuda" element={<Ajuda />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
