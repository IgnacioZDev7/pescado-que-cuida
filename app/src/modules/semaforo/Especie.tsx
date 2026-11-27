import { Navigate, useNavigate } from 'react-router-dom';
import { especiesDelRio } from '../../data/catalogo';
import { BotonGrande } from '../../ui/BotonGrande';
import { useSeleccion } from './seleccion';

export function Especie() {
  const navegar = useNavigate();
  const perfil = useSeleccion((s) => s.perfil);
  const rio = useSeleccion((s) => s.rio);
  const setEspecieId = useSeleccion((s) => s.setEspecieId);

  if (!perfil || !rio) return <Navigate to="/perfil" replace />;

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">¿Qué pez es?</h1>
      <p className="text-lg">Río {rio}</p>
      {especiesDelRio(rio).map((especie) => (
        <BotonGrande
          key={especie.id}
          onClick={() => {
            setEspecieId(especie.id);
            navegar('/resultado');
          }}
        >
          {especie.nombreComun}
        </BotonGrande>
      ))}
    </section>
  );
}
