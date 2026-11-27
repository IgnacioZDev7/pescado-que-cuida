import { useState } from 'react';
import { IconoPez } from './Iconos';

interface Props {
  foto: string;
  className?: string;
}

/**
 * Foto de una especie desde public/img/peces. Si la imagen no existe o falla,
 * muestra una silueta neutra en lugar de romper la pantalla.
 * Es decorativa: el nombre del pez lo muestra siempre la tarjeta que la contiene,
 * así aparece una sola vez (en pantalla y para lectores de pantalla).
 */
export function FotoPez({ foto, className = '' }: Props) {
  const [fallo, setFallo] = useState(false);

  if (fallo || foto === '') {
    return (
      <div aria-hidden="true" className={`flex items-center justify-center bg-marino/10 p-2 text-marino ${className}`}>
        <IconoPez width={48} height={48} />
      </div>
    );
  }

  return (
    <img
      src={`${import.meta.env.BASE_URL}img/peces/${foto}`}
      alt=""
      onError={() => setFallo(true)}
      className={`object-cover ${className}`}
    />
  );
}
