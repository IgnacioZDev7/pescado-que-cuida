import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'principal' | 'secundario' };

const VARIANTES = {
  principal: 'bg-marino text-white shadow-suave active:bg-marino-oscuro',
  secundario: 'border-2 border-marino/25 bg-white text-marino shadow-suave active:bg-marino/10',
};

/** Botón accesible: al menos 48 px de alto y texto grande (RNF-05). */
export function BotonGrande({ className = '', type = 'button', variante = 'principal', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`tactil min-h-14 w-full rounded-2xl px-5 py-3 text-lg font-bold disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...resto}
    />
  );
}
