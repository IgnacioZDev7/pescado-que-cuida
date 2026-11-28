import { useEffect, useRef, useState } from 'react';
import { frases } from '../../data/catalogo';
import type { Frase } from '../../domain/tipos';
import { IconoSonido } from '../../ui/Iconos';

const NOMBRE_LENGUA: Record<string, string> = {
  ese_ejja: 'Ese Ejja',
  tacana: 'Tacana',
  tsimane: 'Tsimane',
};

type EstadoAudio = 'listo' | 'sonando' | 'pendiente';

function Pictograma({ ruta }: { ruta: string }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) return null;
  return (
    <img
      src={`${import.meta.env.BASE_URL}${ruta}`}
      alt=""
      onError={() => setFallo(true)}
      className="h-20 w-20 shrink-0 object-contain"
    />
  );
}

function TarjetaFrase({
  frase,
  onEscuchar,
  estado,
}: {
  frase: Frase;
  onEscuchar: () => void;
  estado: EstadoAudio;
}) {
  const sinAudio = !frase.archivoAudio || estado === 'pendiente';
  return (
    <li className="tarjeta animar-entrada flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        {frase.pictograma && <Pictograma ruta={frase.pictograma} />}
        <div className="flex flex-col gap-1">
          <p className="text-xl font-extrabold tracking-tight text-tinta">{frase.es}</p>
          {frase.textoLengua && (
            <p lang="ese" className="text-2xl font-bold text-marino">
              {frase.textoLengua}
            </p>
          )}
          <p className="text-base font-medium text-tenue">
            {frase.lengua ? (NOMBRE_LENGUA[frase.lengua] ?? frase.lengua) : 'Pendiente de grabación'}
          </p>
          {frase.textoLengua && frase.fuenteTraduccion && (
            <p className="text-sm text-tenue">Fuente: {frase.fuenteTraduccion}</p>
          )}
          {frase.textoLengua && !frase.validadoPor && (
            <span className="w-fit rounded-full border border-ambar bg-ambar/15 px-2.5 py-0.5 text-sm font-semibold text-ambar-tinta">
              Texto por validar con hablante nativo
            </span>
          )}
          {!frase.validadoPor && (
            <span className="w-fit rounded-full border border-ambar bg-ambar/15 px-2.5 py-0.5 text-sm font-semibold text-ambar-tinta">
              Audio de prueba
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onEscuchar}
        disabled={sinAudio}
        className="tactil flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-marino px-5 py-3 text-lg font-bold text-white shadow-suave active:bg-marino-oscuro disabled:border-2 disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700 disabled:shadow-none"
      >
        <IconoSonido />
        {sinAudio ? 'Audio pendiente' : estado === 'sonando' ? 'Escuchando…' : 'Escuchar'}
      </button>
    </li>
  );
}

/** Frases para conversar con la familia, con su audio en lengua cuando existe. */
export function Lenguas() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [estados, setEstados] = useState<Record<string, EstadoAudio>>({});

  // Al salir de la pantalla se detiene el audio que esté sonando.
  useEffect(() => () => audioRef.current?.pause(), []);

  function marcar(id: string, estado: EstadoAudio) {
    setEstados((actuales) => ({ ...actuales, [id]: estado }));
  }

  function escuchar(frase: Frase) {
    if (!frase.archivoAudio) return;
    audioRef.current?.pause();
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${frase.archivoAudio}`);
    audioRef.current = audio;
    // Si el archivo no existe o no se puede reproducir, se muestra "Audio pendiente".
    audio.onerror = () => marcar(frase.id, 'pendiente');
    audio.onended = () => marcar(frase.id, 'listo');
    marcar(frase.id, 'sonando');
    audio.play().catch(() => marcar(frase.id, 'pendiente'));
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-black tracking-tight text-marino">Frases en lenguas</h1>
      {frases.length === 0 ? (
        <p className="text-lg text-tenue">Sin datos</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {frases.map((frase) => (
            <TarjetaFrase
              key={frase.id}
              frase={frase}
              estado={estados[frase.id] ?? 'listo'}
              onEscuchar={() => escuchar(frase)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
