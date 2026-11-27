import type { Frase } from './tipos';
import type { ErrorDeFila } from './validarEspecies';

export interface ResultadoValidacionFrases {
  frases: Frase[];
  errores: ErrorDeFila[];
}

/**
 * Valida las filas de frases.csv (ya parseadas con encabezado). Obligatorios: id y es.
 * Los campos opcionales vacíos quedan sin definir. Una fila con errores no entra.
 */
export function validarFrases(filas: Record<string, string>[]): ResultadoValidacionFrases {
  const frases: Frase[] = [];
  const errores: ErrorDeFila[] = [];
  const idsVistos = new Set<string>();

  filas.forEach((filaCruda, indice) => {
    const numeroFila = indice + 2;
    const campo = (nombre: string): string => (filaCruda[nombre] ?? '').trim();
    const erroresFila: string[] = [];

    const id = campo('id');
    const es = campo('es');
    if (id === '') erroresFila.push('falta id');
    if (es === '') erroresFila.push('falta es');
    if (id !== '') {
      if (idsVistos.has(id)) erroresFila.push(`id duplicado: ${id}`);
      idsVistos.add(id);
    }

    if (erroresFila.length > 0) {
      for (const mensaje of erroresFila) errores.push({ fila: numeroFila, mensaje });
      return;
    }

    const frase: Frase = { id, es };
    const lengua = campo('lengua');
    const archivoAudio = campo('archivo_audio');
    const pictograma = campo('pictograma');
    const validadoPor = campo('validado_por');
    if (lengua !== '') frase.lengua = lengua;
    if (archivoAudio !== '') frase.archivoAudio = archivoAudio;
    if (pictograma !== '') frase.pictograma = pictograma;
    if (validadoPor !== '') frase.validadoPor = validadoPor;
    frases.push(frase);
  });

  return { frases, errores };
}
