import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'principal' | 'secundario' };

const VARIANTES = {
  principal: 'bg-marino text-white active:bg-[#0b2840]',
  secundario: 'border-2 border-marino bg-white text-marino active:bg-marino/10',
};

/** Botón accesible: al menos 48 px de alto y texto grande (RNF-05). */
export function BotonGrande({ className = '', type = 'button', variante = 'principal', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`min-h-12 w-full rounded-xl px-4 py-3 text-xl font-semibold disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...resto}
    />
  );
}
