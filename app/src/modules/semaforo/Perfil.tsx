import { useNavigate } from 'react-router-dom';
import type { Perfil as TipoPerfil } from '../../domain/tipos';
import { BotonGrande } from '../../ui/BotonGrande';
import { useSeleccion } from './seleccion';

const OPCIONES: { perfil: TipoPerfil; etiqueta: string }[] = [
  { perfil: 'embarazada', etiqueta: 'Embarazada o lactancia' },
  { perfil: 'nino', etiqueta: 'Niño' },
  { perfil: 'adulto', etiqueta: 'Adulto' },
];

export function Perfil() {
  const navegar = useNavigate();
  const setPerfil = useSeleccion((s) => s.setPerfil);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">¿Quién va a comer?</h1>
      {OPCIONES.map(({ perfil, etiqueta }) => (
        <BotonGrande
          key={perfil}
          onClick={() => {
            setPerfil(perfil);
            navegar('/rio');
          }}
        >
          {etiqueta}
        </BotonGrande>
      ))}
    </section>
  );
}
