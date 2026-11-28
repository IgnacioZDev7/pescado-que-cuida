import { useState, type ReactNode } from 'react';
import { BotonGrande } from '../../ui/BotonGrande';
import { IconoCheck } from '../../ui/Iconos';

type Zona = 'cabeza' | 'pecho' | 'panza' | 'brazos' | 'piernas';

const RESPUESTAS = [
  { id: 'si', texto: 'Sí', picto: '👍' },
  { id: 'no', texto: 'No', picto: '👎' },
  { id: 'dolor', texto: 'Dolor', picto: '😣' },
  { id: 'mareo', texto: 'Mareo', picto: '😵' },
  { id: 'nausea', texto: 'Náusea', picto: '🤢' },
  { id: 'temblor', texto: 'Temblor', picto: '🥶' },
] as const;

const ZONAS: { id: Zona; texto: string }[] = [
  { id: 'cabeza', texto: 'Cabeza' },
  { id: 'pecho', texto: 'Pecho' },
  { id: 'panza', texto: 'Panza' },
  { id: 'brazos', texto: 'Brazos' },
  { id: 'piernas', texto: 'Piernas' },
];

const TIEMPOS = [
  { id: 'hoy', texto: 'Hoy', picto: '☀️' },
  { id: 'dias', texto: 'Días', picto: '📅' },
  { id: 'semanas', texto: 'Semanas', picto: '🗓️' },
  { id: 'meses', texto: 'Meses', picto: '🌙' },
] as const;

/** Silueta del cuerpo con la zona indicada resaltada. */
function Cuerpo({ zona }: { zona: Zona }) {
  const relleno = (z: Zona) => (z === zona ? 'currentColor' : 'none');
  return (
    <svg viewBox="0 0 40 60" width="40" height="60" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="20" cy="8" r="6" fill={relleno('cabeza')} />
      <rect x="12" y="16" width="16" height="11" rx="2" fill={relleno('pecho')} />
      <rect x="12" y="27" width="16" height="9" rx="2" fill={relleno('panza')} />
      <rect x="4" y="16" width="6" height="20" rx="3" fill={relleno('brazos')} />
      <rect x="30" y="16" width="6" height="20" rx="3" fill={relleno('brazos')} />
      <rect x="13" y="38" width="6" height="20" rx="3" fill={relleno('piernas')} />
      <rect x="21" y="38" width="6" height="20" rx="3" fill={relleno('piernas')} />
    </svg>
  );
}

/** Botón de pictograma: seleccionado = fondo marino, texto blanco y check. */
function Pictograma({
  elegido,
  onClick,
  picto,
  texto,
}: {
  elegido: boolean;
  onClick: () => void;
  picto: ReactNode;
  texto: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={elegido}
      onClick={onClick}
      className={`tactil relative flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-tarjeta border-2 p-2 text-lg font-bold shadow-tarjeta ${
        elegido ? 'border-marino bg-marino text-white' : 'border-transparent bg-white text-marino'
      }`}
    >
      {elegido && <IconoCheck className="absolute right-1 top-1" width={22} height={22} strokeWidth={3} />}
      <span className="text-4xl leading-none" aria-hidden="true">
        {picto}
      </span>
      <span>{texto}</span>
    </button>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="animar-entrada flex flex-col gap-3">
      <h2 className="text-2xl font-extrabold tracking-tight text-marino">{titulo}</h2>
      {children}
    </section>
  );
}

/** Respuestas del paciente con pictogramas, para conversar sin depender del idioma. */
export function Paciente() {
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [zona, setZona] = useState<Zona | undefined>();
  const [tiempo, setTiempo] = useState<string | undefined>();

  function alternarRespuesta(id: string) {
    setRespuestas((actuales) => {
      if (actuales.includes(id)) return actuales.filter((r) => r !== id);
      // Sí y No se excluyen entre sí.
      const sinOpuesta = id === 'si' ? actuales.filter((r) => r !== 'no') : id === 'no' ? actuales.filter((r) => r !== 'si') : actuales;
      return [...sinOpuesta, id];
    });
  }

  const partes = [
    ...RESPUESTAS.filter((r) => respuestas.includes(r.id)).map((r) => r.texto),
    ...(zona ? [ZONAS.find((z) => z.id === zona)?.texto ?? ''] : []),
    ...(tiempo ? [TIEMPOS.find((t) => t.id === tiempo)?.texto ?? ''] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="tarjeta sticky top-[70px] z-[5] flex flex-col gap-3 p-4">
        <p aria-live="polite" className="text-xl font-bold text-marino">
          {partes.length > 0 ? partes.join(' · ') : 'Sin respuestas todavía'}
        </p>
        <BotonGrande
          variante="secundario"
          onClick={() => {
            setRespuestas([]);
            setZona(undefined);
            setTiempo(undefined);
          }}
        >
          Borrar
        </BotonGrande>
      </div>

      <Seccion titulo="¿Qué siente?">
        <div className="grid grid-cols-3 gap-3">
          {RESPUESTAS.map((r) => (
            <Pictograma
              key={r.id}
              elegido={respuestas.includes(r.id)}
              onClick={() => alternarRespuesta(r.id)}
              picto={r.picto}
              texto={r.texto}
            />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Zona del cuerpo">
        <div className="grid grid-cols-3 gap-3">
          {ZONAS.map((z) => (
            <Pictograma
              key={z.id}
              elegido={zona === z.id}
              onClick={() => setZona(zona === z.id ? undefined : z.id)}
              picto={<Cuerpo zona={z.id} />}
              texto={z.texto}
            />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Cuánto tiempo">
        <div className="grid grid-cols-2 gap-3">
          {TIEMPOS.map((t) => (
            <Pictograma
              key={t.id}
              elegido={tiempo === t.id}
              onClick={() => setTiempo(tiempo === t.id ? undefined : t.id)}
              picto={t.picto}
              texto={t.texto}
            />
          ))}
        </div>
      </Seccion>
    </div>
  );
}
