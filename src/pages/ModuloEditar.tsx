import { useParams } from 'react-router-dom';
import ModuloForm from './ModuloForm';

export default function ModuloEditar() {
  const { programaId, moduloId } = useParams<{ programaId: string; moduloId: string }>();
  if (!programaId || !moduloId) return null;
  return <ModuloForm programaId={programaId} moduloId={moduloId} />;
}
