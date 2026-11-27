import { IconoPez } from './Iconos';

/** Barra superior con el nombre de la app. */
export function Encabezado() {
  return (
    <header className="sticky top-0 z-10 border-b border-marino/20 bg-fondo">
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3 text-marino">
        <IconoPez width={32} height={32} />
        <p className="text-2xl font-bold">Pescado que cuida</p>
      </div>
    </header>
  );
}
