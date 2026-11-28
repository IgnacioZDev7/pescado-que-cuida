import type { ComponentType, SVGProps } from 'react';
import type { Color } from '../domain/tipos';
import { IconoCheck, IconoCruz, IconoExclamacion, IconoPregunta } from './Iconos';

interface Estilo {
  texto: string;
  /** Fondo + texto con contraste AA. */
  clases: string;
  /** Solo el color de fondo, para el punto del semáforo. */
  punto: string;
  Icono: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Cada color se muestra con color + ícono + texto, nunca solo color. */
export const ESTILO_SEMAFORO: Record<Color, Estilo> = {
  verde: { texto: 'Mejor opción', clases: 'bg-verde text-white', punto: 'bg-verde', Icono: IconoCheck },
  amarillo: { texto: 'Con cuidado', clases: 'bg-ambar text-ambar-tinta', punto: 'bg-ambar', Icono: IconoExclamacion },
  rojo: { texto: 'Mejor cambiarlo', clases: 'bg-rojo text-white', punto: 'bg-rojo', Icono: IconoCruz },
  sin_datos: { texto: 'Sin datos', clases: 'bg-gray-700 text-white', punto: 'bg-gray-500', Icono: IconoPregunta },
};

/**
 * Banda grande del semáforo (ícono + texto) y debajo el mensaje.
 * Solo presenta el color que recibe del dominio.
 */
export function Semaforo({ color, mensaje }: { color: Color; mensaje: string }) {
  const { texto, clases, Icono } = ESTILO_SEMAFORO[color];
  return (
    <div role="status">
      <div className={`flex items-center gap-4 px-5 py-4 ${clases}`}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-current">
          <Icono width={34} height={34} strokeWidth={3} />
        </span>
        <p className="text-3xl font-black leading-tight tracking-tight">{texto}</p>
      </div>
      <p className="px-5 pt-4 text-xl font-bold leading-snug text-tinta">{mensaje}</p>
    </div>
  );
}

/** Punto pequeño con el color del semáforo y su equivalente en texto para lectores de pantalla. */
export function PuntoSemaforo({ color, className = '' }: { color: Color; className?: string }) {
  const { texto, punto } = ESTILO_SEMAFORO[color];
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 rounded-full ${punto}`} />
      <span className="sr-only">Semáforo: {texto}</span>
    </span>
  );
}
