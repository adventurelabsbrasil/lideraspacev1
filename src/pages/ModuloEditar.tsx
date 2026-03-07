import { useParams } from 'react-router-dom';
import ModuloForm from './ModuloForm';

export default function ModuloEditar() {
  const { programId, moduleId } = useParams<{ programId: string; moduleId: string }>();
  if (!programId || !moduleId) return null;
  return <ModuloForm programId={programId} moduleId={moduleId} />;
}
