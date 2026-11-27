import { Navigate, useNavigate } from 'react-router-dom';
import { rios } from '../../data/catalogo';
import { BotonGrande } from '../../ui/BotonGrande';
import { useSeleccion } from './seleccion';

export function Rio() {
  const navegar = useNavigate();
  const perfil = useSeleccion((s) => s.perfil);
  const setRio = useSeleccion((s) => s.setRio);

  if (!perfil) return <Navigate to="/perfil" replace />;

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">¿De qué río es el pez?</h1>
      {rios.map((rio) => (
        <BotonGrande
          key={rio}
          onClick={() => {
            setRio(rio);
            navegar('/especie');
          }}
        >
          {rio}
        </BotonGrande>
      ))}
    </section>
  );
}
