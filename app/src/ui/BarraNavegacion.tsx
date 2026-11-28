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

/** Navegación fija abajo. La pestaña activa se marca con fondo suave y negrita. */
export function BarraNavegacion() {
  return (
    <nav
      aria-label="Secciones"
      className="pb-seguro fixed inset-x-0 bottom-0 z-20 border-t border-marino/10 bg-white/95 shadow-[0_-4px_20px_rgba(18,59,92,.06)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
        {PESTANAS.map(({ ruta, texto, Icono }) => (
          <li key={ruta}>
            <NavLink
              to={ruta}
              className={({ isActive }) =>
                `tactil flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-xs ${
                  isActive ? 'bg-marino/10 font-extrabold text-marino' : 'font-medium text-tenue'
                }`
              }
            >
              <Icono width={24} height={24} strokeWidth={1.8} />
              <span>{texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
