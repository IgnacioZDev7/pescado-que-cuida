// Clasificador de peces en el dispositivo (modelo exportado de Teachable Machine).
// TensorFlow.js se importa de forma dinámica para no cargarlo en el arranque de la app.
// Devuelve solo especie + confianza: el color del semáforo lo decide el dominio.
import type { LayersModel, Tensor } from '@tensorflow/tfjs';
import { especies } from '../data/catalogo';
import { ETIQUETA_OTRO } from '../domain/decidirVision';
import type { Prediccion } from '../domain/tipos';

interface ModeloCargado {
  modelo: LayersModel;
  etiquetas: string[];
}

const TAMANO_ENTRADA = 224;

let cargaEnCurso: Promise<ModeloCargado | null> | undefined;

/** Convierte una etiqueta del modelo en un id del catálogo, o en 'otro' si no coincide. */
export function normalizarEtiqueta(etiqueta: string, idsValidos: ReadonlySet<string>): string {
  const limpia = etiqueta.trim().toLowerCase();
  if (limpia === ETIQUETA_OTRO || !idsValidos.has(limpia)) return ETIQUETA_OTRO;
  return limpia;
}

async function intentarCargar(): Promise<ModeloCargado | null> {
  try {
    const base = import.meta.env.BASE_URL;
    const respuesta = await fetch(`${base}model/metadata.json`);
    if (!respuesta.ok) return null;
    // Si el servidor devuelve HTML (archivo inexistente), json() falla y se trata como sin modelo.
    const metadata: unknown = await respuesta.json();
    const etiquetasCrudas = (metadata as { labels?: unknown })?.labels;
    if (!Array.isArray(etiquetasCrudas) || etiquetasCrudas.length === 0) return null;

    const idsValidos = new Set(especies.map((e) => e.id));
    const etiquetas = etiquetasCrudas.map((e) => normalizarEtiqueta(String(e), idsValidos));

    const tf = await import('@tensorflow/tfjs');
    const modelo = await tf.loadLayersModel(`${base}model/model.json`);
    return { modelo, etiquetas };
  } catch {
    return null;
  }
}

/** Carga el modelo una sola vez. Devuelve null si no hay modelo o si algo falla; nunca lanza. */
export function cargarModelo(): Promise<ModeloCargado | null> {
  cargaEnCurso ??= intentarCargar();
  return cargaEnCurso;
}

/**
 * Clasifica la imagen del canvas. Devuelve las 3 predicciones más probables,
 * o null si no hay modelo disponible o la clasificación falla.
 */
export async function clasificar(canvas: HTMLCanvasElement): Promise<Prediccion[] | null> {
  const cargado = await cargarModelo();
  if (!cargado) return null;

  try {
    const tf = await import('@tensorflow/tfjs');
    // Preprocesado de Teachable Machine: 224×224 y valores en [-1, 1].
    const salida = tf.tidy(() => {
      const imagen = tf.browser.fromPixels(canvas);
      const redimensionada = tf.image.resizeBilinear(imagen, [TAMANO_ENTRADA, TAMANO_ENTRADA]);
      const normalizada = redimensionada.toFloat().div(127.5).sub(1).expandDims(0);
      return cargado.modelo.predict(normalizada) as Tensor;
    });
    const valores = Array.from(await salida.data());
    salida.dispose();

    return valores
      .map((confianza, indice) => ({
        especieId: cargado.etiquetas[indice] ?? ETIQUETA_OTRO,
        confianza,
      }))
      .sort((a, b) => b.confianza - a.confianza)
      .slice(0, 3);
  } catch {
    return null;
  }
}
