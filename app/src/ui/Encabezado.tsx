import { IconoPez } from './Iconos';

/** Barra superior con el nombre de la app y su lema. */
export function Encabezado() {
  return (
    <header className="sticky top-0 z-10 border-b border-marino/10 bg-fondo/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-marino text-white shadow-suave">
          <IconoPez width={26} height={26} />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-black leading-tight tracking-tight text-marino">Pescado que cuida</p>
          <p className="text-sm font-medium leading-tight text-tenue">Sigue comiendo pescado, elige cuál</p>
        </div>
      </div>
    </header>
  );
}
