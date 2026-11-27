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
import { Opcion, Paso } from '../../ui/Paso';
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
  return <span aria-hidden="true" className={`absolute h-10 w-10 border-white ${posicion}`} />;
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
  const [hayFoto, setHayFoto] = useState(false);

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
    setHayFoto(true);
    setEtapa({ tipo: 'procesando' });
    const predicciones = await clasificar(canvas);
    const decision = decidirVision(predicciones, config.umbral_confianza_vision);
    setEtapa(decision.modo === 'confirmar' ? { tipo: 'confirmar', opciones: decision.opciones } : { tipo: 'manual' });
  }

  function tomarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
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
    if (!archivo || !canvas) return;
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
    setHayFoto(false);
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
      <h1 className="text-2xl font-bold text-marino">Foto del pescado</h1>

      {etapa.tipo === 'captura' && !sinCamara && (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            {/* Recuadro guía: lo que queda dentro es lo único que se analiza. */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 aspect-square w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            >
              <Esquina posicion="-left-2 -top-2 rounded-tl-lg border-l-8 border-t-8" />
              <Esquina posicion="-right-2 -top-2 rounded-tr-lg border-r-8 border-t-8" />
              <Esquina posicion="-bottom-2 -left-2 rounded-bl-lg border-b-8 border-l-8" />
              <Esquina posicion="-bottom-2 -right-2 rounded-br-lg border-b-8 border-r-8" />
            </div>
            <p className="absolute inset-x-3 bottom-3 rounded-lg bg-black/80 px-3 py-2 text-center text-xl font-bold text-white">
              Ponga el pez dentro del recuadro
            </p>
          </div>
          <BotonGrande onClick={tomarFoto} disabled={!camaraLista}>
            <span className="flex items-center justify-center gap-2">
              <IconoCamara /> Tomar foto
            </span>
          </BotonGrande>
        </div>
      )}

      {etapa.tipo === 'captura' && sinCamara && (
        <div className="flex flex-col gap-3">
          <p className="text-lg">No se pudo abrir la cámara. Puede elegir una foto.</p>
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-marino px-4 py-3 text-xl font-semibold text-white focus-within:outline focus-within:outline-4 focus-within:outline-marino/50">
            <IconoCamara /> Elegir foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={elegirArchivo}
              className="sr-only"
            />
          </label>
          <BotonGrande variante="secundario" onClick={() => setEtapa({ tipo: 'manual' })}>
            Elegir el pez de la lista
          </BotonGrande>
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-label="Foto tomada"
        className={hayFoto && etapa.tipo !== 'captura' ? 'max-h-56 w-full rounded-xl object-contain' : 'hidden'}
      />

      {etapa.tipo === 'procesando' && <p className="text-xl font-semibold text-marino">Mirando la foto…</p>}

      {etapa.tipo === 'confirmar' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-marino">¿Es este pez?</h2>
          <ul className="flex flex-col gap-3">
            {opciones.map(({ prediccion, especie }) => (
              <li key={especie.id}>
                <button
                  type="button"
                  onClick={() => confirmarEspecie(especie)}
                  className="flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-xl border-2 border-marino/40 bg-white text-left"
                >
                  <FotoPez key={especie.foto} foto={especie.foto} nombre={especie.nombreComun} className="h-20 w-24 shrink-0" />
                  <span className="flex-1 text-xl font-bold text-marino">{especie.nombreComun}</span>
                  <span className="mr-3 text-lg font-semibold text-gray-800">
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
          <p className="rounded-xl border-2 border-marino bg-marino/10 p-3 text-xl font-semibold text-marino">
            Elija el pez de la lista
          </p>
          {!rio && (
            <Paso numero={1} titulo="¿De qué río es el pez?">
              {rios.map((valor) => (
                <Opcion key={valor} elegida={false} onClick={() => setRio(valor)}>
                  <IconoRio width={36} height={36} className="shrink-0" />
                  Río {valor}
                </Opcion>
              ))}
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
              <Icono width={40} height={40} className="shrink-0" />
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
