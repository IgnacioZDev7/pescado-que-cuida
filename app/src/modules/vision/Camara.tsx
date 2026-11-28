import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarEspecie, config, especiesDelRio, rios } from '../../data/catalogo';
import { decidirVision } from '../../domain/decidirVision';
import { calcularRecorte, type Tamano } from '../../domain/recorte';
import type { Especie, Prediccion } from '../../domain/tipos';
import { cargarModelo, clasificar } from '../../ml/clasificador';
import { BotonGrande } from '../../ui/BotonGrande';
import { FotoPez } from '../../ui/FotoPez';
import { IconoCamara, IconoRio } from '../../ui/Iconos';
import { Chip, IconoOpcion, Opcion, Paso } from '../../ui/Paso';
import { CuadriculaPeces } from '../semaforo/CuadriculaPeces';
import { OPCIONES_PERFIL } from '../semaforo/perfiles';
import { useSeleccion } from '../semaforo/seleccion';

type Etapa =
  | { tipo: 'captura' }
  | { tipo: 'procesando' }
  | { tipo: 'confirmar'; opciones: Prediccion[] }
  | { tipo: 'manual' }
  | { tipo: 'perfil' };

/** Fracción del ancho de la vista que ocupa el recuadro guía (debe coincidir con w-3/4). */
const FRACCION_RECUADRO = 0.75;
/** Lado máximo de la foto recortada; el clasificador la reduce a 224 px de todos modos. */
const LADO_MAXIMO_SALIDA = 512;

function detener(stream: MediaStream | null) {
  stream?.getTracks().forEach((pista) => pista.stop());
}

/** Dibuja en el canvas, cuadrado, solo la zona de la fuente que cae dentro del recuadro guía. */
function dibujarRecorte(canvas: HTMLCanvasElement, imagen: CanvasImageSource, fuente: Tamano, vista: Tamano) {
  const recorte = calcularRecorte(fuente, vista, FRACCION_RECUADRO);
  const lado = Math.max(1, Math.min(Math.round(recorte.lado), LADO_MAXIMO_SALIDA));
  canvas.width = lado;
  canvas.height = lado;
  canvas.getContext('2d')?.drawImage(imagen, recorte.x, recorte.y, recorte.lado, recorte.lado, 0, 0, lado, lado);
}

/** Esquina destacada del recuadro guía. */
function Esquina({ posicion }: { posicion: string }) {
  return <span aria-hidden="true" className={`absolute h-9 w-9 border-white ${posicion}`} />;
}

/**
 * Cámara: toma una foto, el clasificador propone hasta 3 peces y la persona confirma.
 * Nunca se llega al resultado sin que la persona toque una especie.
 * Sin modelo o con baja confianza, se pasa a la elección manual.
 */
export function Camara() {
  const navegar = useNavigate();
  const { perfil, rio, setPerfil, setRio, setEspecieId } = useSeleccion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [etapa, setEtapa] = useState<Etapa>({ tipo: 'captura' });
  const [sinCamara, setSinCamara] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  // Foto recortada (data URL) solo en memoria para mostrarla; nunca se guarda.
  const [fotoTomada, setFotoTomada] = useState<string | null>(null);
  const procesando = etapa.tipo === 'procesando';

  // Precarga el modelo en segundo plano; si no existe, queda en null sin errores.
  useEffect(() => {
    void cargarModelo();
  }, []);

  // Abre la cámara solo en la etapa de captura y la libera al salir.
  useEffect(() => {
    if (etapa.tipo !== 'captura' || sinCamara) return;
    let cancelado = false;
    setCamaraLista(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setSinCamara(true);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelado) {
          detener(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => undefined);
        }
        setCamaraLista(true);
      })
      .catch(() => {
        if (!cancelado) setSinCamara(true);
      });

    return () => {
      cancelado = true;
      detener(streamRef.current);
      streamRef.current = null;
    };
  }, [etapa.tipo, sinCamara]);

  async function procesar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setFotoTomada(canvas.toDataURL('image/jpeg', 0.85));
    } catch {
      setFotoTomada(null);
    }
    setEtapa({ tipo: 'procesando' });
    const predicciones = await clasificar(canvas);
    const decision = decidirVision(predicciones, config.umbral_confianza_vision);
    setEtapa(decision.modo === 'confirmar' ? { tipo: 'confirmar', opciones: decision.opciones } : { tipo: 'manual' });
  }

  function tomarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (procesando || !video || !canvas || video.videoWidth === 0) return;
    const enPantalla = video.getBoundingClientRect();
    dibujarRecorte(
      canvas,
      video,
      { ancho: video.videoWidth, alto: video.videoHeight },
      { ancho: enPantalla.width, alto: enPantalla.height },
    );
    detener(streamRef.current);
    streamRef.current = null;
    void procesar();
  }

  function elegirArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    const canvas = canvasRef.current;
    if (procesando || !archivo || !canvas) return;
    setEtapa({ tipo: 'procesando' });
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      if (imagen.naturalWidth === 0 || imagen.naturalHeight === 0) {
        setEtapa({ tipo: 'manual' });
        return;
      }
      // Sin vista previa: mismo recorte cuadrado centrado sobre la imagen completa.
      const tamano = { ancho: imagen.naturalWidth, alto: imagen.naturalHeight };
      dibujarRecorte(canvas, imagen, tamano, tamano);
      void procesar();
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      setEtapa({ tipo: 'manual' });
    };
    imagen.src = url;
  }

  /** La persona confirmó una especie: completa río y perfil antes del resultado. */
  function confirmarEspecie(especie: Especie) {
    if (rio !== especie.rio) setRio(especie.rio);
    setEspecieId(especie.id);
    if (perfil) navegar('/resultado');
    else setEtapa({ tipo: 'perfil' });
  }

  function otraFoto() {
    setFotoTomada(null);
    setSinCamara(false);
    setEtapa({ tipo: 'captura' });
  }

  const opciones =
    etapa.tipo === 'confirmar'
      ? etapa.opciones
          .map((p) => ({ prediccion: p, especie: buscarEspecie(p.especieId) }))
          .filter((o): o is { prediccion: Prediccion; especie: Especie } => o.especie !== undefined)
      : [];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-black tracking-tight text-marino">Foto del pescado</h1>

      {etapa.tipo === 'captura' && !sinCamara && (
        <div className="animar-entrada flex flex-col items-center gap-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-tarjeta bg-black shadow-tarjeta">
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            {/* Recuadro guía: lo que queda dentro es lo único que se analiza. */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 aspect-square w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            >
              <Esquina posicion="-left-1 -top-1 rounded-tl-2xl border-l-4 border-t-4" />
              <Esquina posicion="-right-1 -top-1 rounded-tr-2xl border-r-4 border-t-4" />
              <Esquina posicion="-bottom-1 -left-1 rounded-bl-2xl border-b-4 border-l-4" />
              <Esquina posicion="-bottom-1 -right-1 rounded-br-2xl border-b-4 border-r-4" />
            </div>
            <p className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/75 px-4 py-2.5 text-center text-lg font-bold text-white">
              Ponga el pez dentro del recuadro
            </p>
          </div>
          {/* Disparador circular grande. */}
          <button
            type="button"
            onClick={tomarFoto}
            disabled={!camaraLista || procesando}
            aria-label="Tomar foto"
            className="tactil flex h-20 w-20 items-center justify-center rounded-full bg-white p-1.5 shadow-tarjeta ring-4 ring-marino disabled:opacity-50"
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-marino text-white">
              <IconoCamara width={30} height={30} strokeWidth={1.8} />
            </span>
          </button>
          <p aria-hidden="true" className="-mt-2 text-base font-bold text-marino">
            Tomar foto
          </p>
        </div>
      )}

      {etapa.tipo === 'captura' && sinCamara && (
        <div className="flex flex-col gap-3">
          <p className="text-lg text-tenue">No se pudo abrir la cámara. Puede elegir una foto.</p>
          <label className="tactil flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-marino px-5 py-3 text-lg font-bold text-white shadow-suave focus-within:outline focus-within:outline-4 focus-within:outline-marino/50 active:bg-marino-oscuro">
            <IconoCamara /> Elegir foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={elegirArchivo}
              disabled={procesando}
              className="sr-only"
            />
          </label>
          <BotonGrande variante="secundario" onClick={() => setEtapa({ tipo: 'manual' })}>
            Elegir el pez de la lista
          </BotonGrande>
        </div>
      )}

      {/* Lienzo de trabajo: aquí se dibuja el recorte que se pasa al clasificador. */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {etapa.tipo === 'procesando' && (
        <div className="flex flex-col items-center gap-4">
          {fotoTomada && (
            <img src={fotoTomada} alt="Su foto" className="aspect-square w-3/4 rounded-tarjeta object-cover shadow-tarjeta" />
          )}
          <div role="status" aria-live="polite" className="flex items-center gap-3 text-xl font-semibold text-marino">
            <span
              aria-hidden="true"
              className="h-8 w-8 animate-spin rounded-full border-4 border-marino/25 border-t-marino"
            />
            Reconociendo...
          </div>
        </div>
      )}

      {etapa.tipo === 'confirmar' && (
        <section className="animar-entrada flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-marino">¿Es este pez?</h2>
          {fotoTomada && (
            <figure className="flex flex-col items-center gap-1">
              <img src={fotoTomada} alt="Su foto" className="aspect-square w-1/2 rounded-tarjeta object-cover shadow-tarjeta" />
              <figcaption className="text-sm font-semibold text-tenue">Su foto</figcaption>
            </figure>
          )}
          <ul className="flex flex-col gap-3">
            {opciones.map(({ prediccion, especie }) => (
              <li key={especie.id}>
                <button
                  type="button"
                  onClick={() => confirmarEspecie(especie)}
                  className="tactil flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-tarjeta bg-white text-left shadow-tarjeta"
                >
                  <FotoPez key={especie.foto} foto={especie.foto} className="h-20 w-24 shrink-0" />
                  <span className="flex-1 text-lg font-extrabold tracking-tight text-marino">{especie.nombreComun}</span>
                  <span className="mr-4 text-base font-bold text-tenue">
                    {Math.round(prediccion.confianza * 100)} %
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <BotonGrande variante="secundario" onClick={() => setEtapa({ tipo: 'manual' })}>
            Otro / no sé
          </BotonGrande>
        </section>
      )}

      {etapa.tipo === 'manual' && (
        <div className="flex flex-col gap-6">
          {fotoTomada && (
            <figure className="flex flex-col items-center gap-1">
              <img src={fotoTomada} alt="Su foto" className="aspect-square w-1/2 rounded-tarjeta object-cover shadow-tarjeta" />
              <figcaption className="text-sm font-semibold text-tenue">Su foto</figcaption>
            </figure>
          )}
          <p className="rounded-tarjeta bg-marino/10 px-5 py-4 text-lg font-bold text-marino">
            Elija el pez de la lista
          </p>
          {!rio && (
            <Paso numero={1} titulo="¿De qué río es el pez?">
              <div className="flex flex-wrap gap-2">
                {rios.map((valor) => (
                  <Chip key={valor} elegido={false} onClick={() => setRio(valor)}>
                    <IconoRio width={22} height={22} strokeWidth={1.8} className="shrink-0" />
                    Río {valor}
                  </Chip>
                ))}
              </div>
            </Paso>
          )}
          {rio && <CuadriculaPeces especies={especiesDelRio(rio)} onElegir={confirmarEspecie} />}
        </div>
      )}

      {etapa.tipo === 'perfil' && (
        <Paso numero={1} titulo="¿Quién va a comer?">
          {OPCIONES_PERFIL.map(({ perfil: valor, etiqueta, Icono }) => (
            <Opcion
              key={valor}
              elegida={false}
              onClick={() => {
                setPerfil(valor);
                navegar('/resultado');
              }}
            >
              <IconoOpcion elegida={false}>
                <Icono width={30} height={30} strokeWidth={1.8} />
              </IconoOpcion>
              {etiqueta}
            </Opcion>
          ))}
        </Paso>
      )}

      {etapa.tipo !== 'captura' && etapa.tipo !== 'procesando' && (
        <BotonGrande variante="secundario" onClick={otraFoto}>
          Tomar otra foto
        </BotonGrande>
      )}
    </div>
  );
}
