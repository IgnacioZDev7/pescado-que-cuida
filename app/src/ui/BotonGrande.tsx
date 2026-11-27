import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

/** Botón accesible: al menos 48 px de alto y texto grande (RNF-05). */
export function BotonGrande({ className = '', type = 'button', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 text-xl font-semibold text-white active:bg-teal-900 disabled:opacity-50 ${className}`}
      {...resto}
    />
  );
}
