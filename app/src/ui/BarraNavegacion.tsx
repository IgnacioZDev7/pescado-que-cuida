import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { IconoCamara, IconoEscudo, IconoEvaluacion, IconoLenguas, IconoPaciente } from './Iconos';

interface Pestana {
  ruta: string;
  texto: string;
  Icono: ComponentType<SVGProps<SVGSVGElement>>;
}

const PESTANAS: Pestana[] = [
  { ruta: '/evaluacion', texto: 'Evaluación', Icono: IconoEvaluacion },
  { ruta: '/camara', texto: 'Cámara', Icono: IconoCamara },
  { ruta: '/resultado', texto: 'Resultado', Icono: IconoEscudo },
  { ruta: '/lenguas', texto: 'Lenguas', Icono: IconoLenguas },
  { ruta: '/paciente', texto: 'Paciente', Icono: IconoPaciente },
];

/** Navegación fija abajo. La pestaña activa se marca con fondo, subrayado y negrita. */
export function BarraNavegacion() {
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-20 border-t border-marino/20 bg-white">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {PESTANAS.map(({ ruta, texto, Icono }) => (
          <li key={ruta}>
            <NavLink
              to={ruta}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs ${
                  isActive
                    ? 'bg-marino font-bold text-white underline decoration-2 underline-offset-4'
                    : 'font-medium text-marino'
                }`
              }
            >
              <Icono width={26} height={26} />
              <span>{texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
