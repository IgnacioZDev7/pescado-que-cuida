import { useNavigate } from 'react-router-dom';
import { config } from '../../data/catalogo';
import { BotonGrande } from '../../ui/BotonGrande';

export function Inicio() {
  const navegar = useNavigate();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Pescado que cuida</h1>
      <p className="text-lg">Elija quién va a comer, el río y el pez para ver el semáforo.</p>
      <BotonGrande onClick={() => navegar('/perfil')}>Empezar</BotonGrande>
      <p className="text-sm text-gray-600">Datos: versión {config.version_datos}</p>
    </section>
  );
}
