import type { Prediccion } from './tipos';

export type DecisionVision = { modo: 'manual' } | { modo: 'confirmar'; opciones: Prediccion[] };

export const ETIQUETA_OTRO = 'otro';

/**
 * Decide qué hacer con las predicciones del clasificador. Nunca elige por la persona:
 * en el mejor caso propone hasta 3 opciones para que ella confirme.
 * Manual si no hay modelo o predicciones, si la mejor está bajo el umbral o si es "otro".
 */
export function decidirVision(predicciones: Prediccion[] | null, umbral: number): DecisionVision {
  if (!predicciones || predicciones.length === 0) return { modo: 'manual' };

  const ordenadas = [...predicciones].sort((a, b) => b.confianza - a.confianza);
  const mejor = ordenadas[0];
  if (mejor.especieId === ETIQUETA_OTRO || mejor.confianza < umbral) return { modo: 'manual' };

  const opciones = ordenadas.slice(0, 3).filter((p) => p.especieId !== ETIQUETA_OTRO);
  return { modo: 'confirmar', opciones };
}
