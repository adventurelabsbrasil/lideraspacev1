import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import MeusProgramas from './pages/MeusProgramas';
import MinhasTarefas from './pages/MinhasTarefas';
import MeusAtivos from './pages/MeusAtivos';
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
        <Route path="tarefas" element={<MinhasTarefas />} />
        <Route path="ativos" element={<MeusAtivos />} />
        <Route path="ajuda" element={<Ajuda />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
