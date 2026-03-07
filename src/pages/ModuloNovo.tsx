import { useParams } from 'react-router-dom';
import ModuloForm from './ModuloForm';

export default function ModuloNovo() {
  const { programId } = useParams<{ programId: string }>();
  if (!programId) return null;
  return <ModuloForm programId={programId} />;
}
