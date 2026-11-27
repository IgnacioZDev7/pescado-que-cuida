import type { ComponentType, SVGProps } from 'react';
import type { Color } from '../domain/tipos';
import { IconoCheck, IconoCruz, IconoExclamacion, IconoPregunta } from './Iconos';

interface Estilo {
  texto: string;
  clases: string;
  Icono: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Cada color se muestra con color + ícono + texto, nunca solo color. */
const ESTILO_SEMAFORO: Record<Color, Estilo> = {
  verde: { texto: 'Mejor opción', clases: 'bg-verde text-white', Icono: IconoCheck },
  amarillo: { texto: 'Con cuidado', clases: 'bg-ambar text-gray-950', Icono: IconoExclamacion },
  rojo: { texto: 'Mejor cambiarlo', clases: 'bg-rojo text-white', Icono: IconoCruz },
  sin_datos: { texto: 'Sin datos', clases: 'bg-gray-700 text-white', Icono: IconoPregunta },
};

/** Indicador grande del semáforo. Solo presenta el color que recibe del dominio. */
export function Semaforo({ color, mensaje }: { color: Color; mensaje: string }) {
  const { texto, clases, Icono } = ESTILO_SEMAFORO[color];
  return (
    <div role="status" className={`flex items-center gap-4 rounded-2xl p-5 ${clases}`}>
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-current">
        <Icono width={52} height={52} strokeWidth={3} />
      </span>
      <div>
        <p className="text-3xl font-extrabold leading-tight">{texto}</p>
        <p className="mt-1 text-xl font-semibold">{mensaje}</p>
      </div>
    </div>
  );
}
