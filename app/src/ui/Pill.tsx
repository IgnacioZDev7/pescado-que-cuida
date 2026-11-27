import type { ReactNode } from 'react';
import type { Color } from '../domain/tipos';

const CLASES_POR_COLOR: Record<Color, string> = {
  verde: 'bg-green-600 text-white',
  amarillo: 'bg-yellow-400 text-black',
  rojo: 'bg-red-600 text-white',
  sin_datos: 'bg-gray-400 text-black',
};

interface Props {
  color: Color;
  children: ReactNode;
}

/** Etiqueta del color del semáforo. Solo presenta el color que recibe. */
export function Pill({ color, children }: Props) {
  return (
    <span className={`inline-block rounded-full px-4 py-1 text-lg font-bold ${CLASES_POR_COLOR[color]}`}>
      {children}
    </span>
  );
}
