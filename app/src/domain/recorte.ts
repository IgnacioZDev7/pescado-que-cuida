export interface Tamano {
  ancho: number;
  alto: number;
}

/** Cuadrado a recortar, en píxeles de la imagen fuente. */
export interface Recorte {
  x: number;
  y: number;
  lado: number;
}

function esValido(tamano: Tamano): boolean {
  return Number.isFinite(tamano.ancho) && Number.isFinite(tamano.alto) && tamano.ancho > 0 && tamano.alto > 0;
}

/**
 * Calcula qué parte de la imagen fuente queda dentro del recuadro guía de la cámara.
 *
 * La vista muestra la fuente con `object-fit: cover` (escalada para cubrir la vista y centrada).
 * El recuadro es un cuadrado centrado en la vista de lado `fraccion × vista.ancho`,
 * limitado al menor lado de la vista. El resultado se expresa en píxeles de la fuente
 * y nunca sale de sus bordes.
 *
 * Para una foto elegida de la galería (sin vista) se usa `vista = fuente`.
 *
 * Entradas inválidas:
 * - fuente con ancho o alto ≤ 0 (o no numérico): lanza RangeError.
 * - fracción fuera de (0, 1]: lanza RangeError.
 * - vista con ancho o alto ≤ 0 (por ejemplo, un elemento oculto): se usa `vista = fuente`.
 */
export function calcularRecorte(fuente: Tamano, vista: Tamano, fraccion = 0.75): Recorte {
  if (!esValido(fuente)) throw new RangeError('El tamaño de la imagen fuente debe ser mayor que cero');
  if (!(fraccion > 0 && fraccion <= 1)) throw new RangeError('La fracción del recuadro debe estar entre 0 y 1');
  const vistaUsada = esValido(vista) ? vista : fuente;

  // object-fit: cover → escala para cubrir la vista, imagen centrada (desplazamiento ≤ 0).
  const escala = Math.max(vistaUsada.ancho / fuente.ancho, vistaUsada.alto / fuente.alto);
  const desplazamientoX = (vistaUsada.ancho - fuente.ancho * escala) / 2;
  const desplazamientoY = (vistaUsada.alto - fuente.alto * escala) / 2;

  // Recuadro guía en coordenadas de la vista.
  const ladoVista = Math.min(fraccion * vistaUsada.ancho, vistaUsada.alto);
  const xVista = (vistaUsada.ancho - ladoVista) / 2;
  const yVista = (vistaUsada.alto - ladoVista) / 2;

  // Paso a coordenadas de la fuente, limitado a sus bordes.
  const lado = Math.min(ladoVista / escala, fuente.ancho, fuente.alto);
  const x = Math.min(Math.max((xVista - desplazamientoX) / escala, 0), fuente.ancho - lado);
  const y = Math.min(Math.max((yVista - desplazamientoY) / escala, 0), fuente.alto - lado);

  return { x, y, lado };
}
