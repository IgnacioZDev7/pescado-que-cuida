import { useState } from 'react';
import { IconoPez } from './Iconos';

interface Props {
  foto: string;
  nombre: string;
  className?: string;
}

/**
 * Foto de una especie desde public/img/peces. Si la imagen no existe o falla,
 * muestra una silueta neutra con el nombre en lugar de romper la pantalla.
 */
export function FotoPez({ foto, nombre, className = '' }: Props) {
  const [fallo, setFallo] = useState(false);

  if (fallo || foto === '') {
    return (
      <div
        role="img"
        aria-label={nombre}
        className={`flex flex-col items-center justify-center gap-1 bg-marino/10 p-2 text-marino ${className}`}
      >
        <IconoPez width={48} height={48} />
        <span className="text-center text-sm font-semibold leading-tight">{nombre}</span>
      </div>
    );
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}img/peces/${foto}`}
      alt={nombre}
      onError={() => setFallo(true)}
      className={`object-cover ${className}`}
    />
  );
}
