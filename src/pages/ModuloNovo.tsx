import { useParams } from 'react-router-dom';
import ModuloForm from './ModuloForm';

export default function ModuloNovo() {
  const { id: programaId } = useParams<{ id: string }>();
  if (!programaId) return null;
  return <ModuloForm programaId={programaId} />;
}
