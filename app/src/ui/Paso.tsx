import type { ReactNode } from 'react';
import { IconoCheck } from './Iconos';

/** Sección numerada de un formulario paso a paso. */
export function Paso({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={`paso-${numero}`}>
      <h2 id={`paso-${numero}`} className="flex items-center gap-3 text-xl font-bold text-marino">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marino text-white">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Opción de una lista de selección única. Elegida: fondo marino, texto blanco y check. */
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
      className={`flex min-h-16 w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left text-xl font-semibold ${
        elegida ? 'border-marino bg-marino text-white' : 'border-marino/30 bg-white text-marino'
      }`}
    >
      {children}
      {elegida && <IconoCheck className="ml-auto shrink-0" width={30} height={30} />}
    </button>
  );
}
