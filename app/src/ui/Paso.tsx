import type { ReactNode } from 'react';
import { IconoCheck } from './Iconos';

/** Sección numerada de un formulario paso a paso. */
export function Paso({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="animar-entrada flex flex-col gap-4" aria-labelledby={`paso-${numero}`}>
      <h2 id={`paso-${numero}`} className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-marino">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marino/10 text-base font-black text-marino">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Opción de una lista de selección única, como tarjeta grande. Elegida: fondo marino, texto blanco y check. */
export function Opcion({
  elegida,
  onClick,
  children,
}: {
  elegida: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={elegida}
      onClick={onClick}
      className={`tactil flex min-h-[72px] w-full items-center gap-4 rounded-tarjeta border-2 px-4 py-4 text-left text-lg font-bold shadow-tarjeta ${
        elegida ? 'border-marino bg-marino text-white' : 'border-transparent bg-white text-marino'
      }`}
    >
      {children}
      {elegida && <IconoCheck className="ml-auto shrink-0" width={28} height={28} strokeWidth={2.5} />}
    </button>
  );
}

/** Ícono dentro de un recuadro suave, para tarjetas de opción. */
export function IconoOpcion({ elegida, children }: { elegida: boolean; children: ReactNode }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
        elegida ? 'bg-white/15 text-white' : 'bg-marino/10 text-marino'
      }`}
    >
      {children}
    </span>
  );
}

/** Chip (botón píldora) de selección única. Elegido: relleno marino y texto blanco. */
export function Chip({
  elegido,
  onClick,
  children,
}: {
  elegido: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={elegido}
      onClick={onClick}
      className={`tactil inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-5 py-2 text-base font-bold ${
        elegido ? 'border-marino bg-marino text-white shadow-suave' : 'border-marino/20 bg-white text-marino'
      }`}
    >
      {children}
    </button>
  );
}
