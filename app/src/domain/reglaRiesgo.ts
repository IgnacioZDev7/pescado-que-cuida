import type { Color, Config, Especie, Perfil, Resultado } from './tipos';

export const ADVERTENCIA_POR_CONFIRMAR = 'Dato por confirmar';

/** Perfiles más sensibles al metilmercurio. */
const PERFILES_SENSIBLES: readonly Perfil[] = ['embarazada', 'nino'];

/**
 * Color del semáforo de una especie. Depende solo de la especie y de los cortes,
 * nunca del perfil. Los cortes son inclusivos. Un valor "<X" usa el color de X
 * (peor caso). Sin un valor utilizable devuelve 'sin_datos', nunca 'verde'.
 */
export function colorDeEspecie(e: Especie, c: Config): Color {
  const valor = valorDeReferencia(e);
  if (valor === undefined) return 'sin_datos';
  if (valor <= c.cortes_ug_g.verde_max) return 'verde';
  if (valor <= c.cortes_ug_g.amarillo_max) return 'amarillo';
  return 'rojo';
}

/**
 * Regla de riesgo del semáforo (ver docs/ARQUITECTURA.md §5.4). Función pura:
 * el catálogo se recibe como parámetro para calcular los reemplazos.
 */
export function reglaRiesgo(
  e: Especie | undefined,
  p: Perfil,
  c: Config,
  catalogo: Especie[] = [],
): Resultado {
  const advertencia = e?.base === 'por_confirmar' ? { advertencia: ADVERTENCIA_POR_CONFIRMAR } : {};

  if (e === undefined) {
    return { color: 'sin_datos', mensajeClave: 'sin_datos', reemplazos: [], fuente: '' };
  }

  const color = colorDeEspecie(e, c);
  if (color === 'sin_datos') {
    return { color, mensajeClave: 'sin_datos', reemplazos: [], fuente: e.fuente, ...advertencia };
  }

  return {
    color,
    mensajeClave: mensajeClave(color, p),
    reemplazos: llevaReemplazos(color, p) ? reemplazosVerdes(e, c, catalogo) : [],
    fuente: e.fuente,
    ...advertencia,
  };
}

function valorDeReferencia(e: Especie): number | undefined {
  if (typeof e.hgUgG === 'number' && Number.isFinite(e.hgUgG)) return e.hgUgG;
  if (typeof e.hgMenorQue === 'number' && Number.isFinite(e.hgMenorQue)) return e.hgMenorQue;
  return undefined;
}

function esSensible(p: Perfil): boolean {
  return PERFILES_SENSIBLES.includes(p);
}

function mensajeClave(color: Exclude<Color, 'sin_datos'>, p: Perfil): string {
  switch (color) {
    case 'rojo':
      return esSensible(p) ? 'evitar_cambiar' : 'con_moderacion';
    case 'amarillo':
      return esSensible(p) ? 'con_moderacion' : 'elegir_primero';
    case 'verde':
      return 'elegir_primero';
  }
}

function llevaReemplazos(color: Color, p: Perfil): boolean {
  return color === 'rojo' || (color === 'amarillo' && esSensible(p));
}

function reemplazosVerdes(e: Especie, c: Config, catalogo: Especie[]): string[] {
  return catalogo
    .filter((otra) => otra.rio === e.rio && otra.id !== e.id && colorDeEspecie(otra, c) === 'verde')
    .map((otra) => otra.id);
}
