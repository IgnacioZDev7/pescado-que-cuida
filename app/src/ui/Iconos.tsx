// Íconos SVG en línea: no dependen de red ni de archivos externos.
import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

function Base({ children, ...resto }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

export function IconoEvaluacion(p: Props) {
  return (
    <Base {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Base>
  );
}

export function IconoCamara(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </Base>
  );
}

export function IconoEscudo(p: Props) {
  return (
    <Base {...p}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </Base>
  );
}

export function IconoLenguas(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 5h16v10H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </Base>
  );
}

export function IconoPaciente(p: Props) {
  return (
    <Base {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </Base>
  );
}

export function IconoPez(p: Props) {
  return (
    <Base {...p}>
      <path d="M3 12c3-5 9-6 13-3l5-3v12l-5-3c-4 3-10 2-13-3z" />
      <circle cx="8" cy="11" r="0.8" fill="currentColor" />
    </Base>
  );
}

export function IconoCheck(p: Props) {
  return (
    <Base {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Base>
  );
}

export function IconoExclamacion(p: Props) {
  return (
    <Base {...p}>
      <path d="M12 5v9" />
      <circle cx="12" cy="19" r="0.8" fill="currentColor" />
    </Base>
  );
}

export function IconoCruz(p: Props) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconoPregunta(p: Props) {
  return (
    <Base {...p}>
      <path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" />
      <circle cx="12" cy="18.5" r="0.8" fill="currentColor" />
    </Base>
  );
}

export function IconoSonido(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </Base>
  );
}
