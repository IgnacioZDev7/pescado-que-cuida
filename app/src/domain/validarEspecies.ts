import type { Base, Especie, HgTipo } from './tipos';

export interface ErrorDeFila {
  /** Número de línea en el CSV: el encabezado es la 1, la primera fila de datos la 2. */
  fila: number;
  mensaje: string;
}

export interface ResultadoValidacion {
  especies: Especie[];
  errores: ErrorDeFila[];
}

const OBLIGATORIOS = [
  'id',
  'rio',
  'nombre_comun',
  'hg_ug_g',
  'hg_tipo',
  'base',
  'fuente',
  'anio',
  'foto',
] as const;

const BASES: readonly Base[] = ['humedo', 'seco', 'por_confirmar'];
const HG_TIPOS: readonly HgTipo[] = ['total', 'metilmercurio'];
const LENGUAS = ['ese_ejja', 'tacana', 'tsimane'] as const;

const PATRON_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PATRON_NUMERO = /^\d+(\.\d+)?$/;
const PATRON_MENOR_QUE = /^<\s*(\d+(\.\d+)?)$/;
const PATRON_ENTERO = /^\d+$/;

/**
 * Valida las filas de especies.csv (ya parseadas con encabezado) y las convierte
 * en especies del dominio. Una fila con cualquier error no entra al catálogo.
 */
export function validarEspecies(filas: Record<string, string>[]): ResultadoValidacion {
  const especies: Especie[] = [];
  const errores: ErrorDeFila[] = [];
  const idsVistos = new Set<string>();

  filas.forEach((filaCruda, indice) => {
    const numeroFila = indice + 2;
    const campo = (nombre: string): string => (filaCruda[nombre] ?? '').trim();
    const erroresFila: string[] = [];

    for (const nombre of OBLIGATORIOS) {
      if (campo(nombre) === '') erroresFila.push(`falta ${nombre}`);
    }

    const id = campo('id');
    if (id !== '') {
      if (!PATRON_SLUG.test(id)) {
        erroresFila.push(`id inválido: "${id}" (use minúsculas, números y guiones)`);
      }
      if (idsVistos.has(id)) erroresFila.push(`id duplicado: ${id}`);
      idsVistos.add(id);
    }

    const base = campo('base');
    if (base !== '' && !esUnoDe(BASES, base)) {
      erroresFila.push(`base inválida: "${base}" (valores permitidos: ${BASES.join(', ')})`);
    }

    const hgTipo = campo('hg_tipo');
    if (hgTipo !== '' && !esUnoDe(HG_TIPOS, hgTipo)) {
      erroresFila.push(`hg_tipo inválido: "${hgTipo}" (valores permitidos: ${HG_TIPOS.join(', ')})`);
    }

    const hgTexto = campo('hg_ug_g');
    const hg = hgTexto === '' ? undefined : interpretarMercurio(hgTexto);
    if (hgTexto !== '' && hg === undefined) {
      erroresFila.push(`hg_ug_g inválido: "${hgTexto}" (use un número ≥ 0 o "<número")`);
    }

    const anioTexto = campo('anio');
    if (anioTexto !== '' && !PATRON_ENTERO.test(anioTexto)) {
      erroresFila.push(`anio inválido: "${anioTexto}" (debe ser un número entero)`);
    }

    const nMuestrasTexto = campo('n_muestras');
    if (nMuestrasTexto !== '' && !PATRON_ENTERO.test(nMuestrasTexto)) {
      erroresFila.push(`n_muestras inválido: "${nMuestrasTexto}" (debe ser un número entero)`);
    }

    if (erroresFila.length > 0 || hg === undefined) {
      for (const mensaje of erroresFila) errores.push({ fila: numeroFila, mensaje });
      return;
    }

    const nombresLocales: Record<string, string> = {};
    for (const lengua of LENGUAS) {
      const nombre = campo(`nombre_local_${lengua}`);
      if (nombre !== '') nombresLocales[lengua] = nombre;
    }

    especies.push({
      id,
      rio: campo('rio'),
      nombreComun: campo('nombre_comun'),
      ...opcional('nombreCientifico', campo('nombre_cientifico')),
      nombresLocales,
      hgUgG: hg.hgUgG,
      ...(hg.hgMenorQue !== undefined ? { hgMenorQue: hg.hgMenorQue } : {}),
      hgTipo: hgTipo as HgTipo,
      base: base as Base,
      ...(nMuestrasTexto !== '' ? { nMuestras: Number(nMuestrasTexto) } : {}),
      ...opcional('tamanoCm', campo('tamano_cm')),
      fuente: campo('fuente'),
      anio: Number(anioTexto),
      foto: campo('foto'),
      ...opcional('validadoPor', campo('validado_por')),
      ...opcional('nota', campo('nota')),
    });
  });

  return { especies, errores };
}

function interpretarMercurio(texto: string): { hgUgG: number | null; hgMenorQue?: number } | undefined {
  if (PATRON_NUMERO.test(texto)) return { hgUgG: Number(texto) };
  const cota = PATRON_MENOR_QUE.exec(texto);
  if (cota) return { hgUgG: null, hgMenorQue: Number(cota[1]) };
  return undefined;
}

function esUnoDe<T extends string>(valores: readonly T[], valor: string): valor is T {
  return (valores as readonly string[]).includes(valor);
}

function opcional<K extends string>(clave: K, valor: string): Partial<Record<K, string>> {
  return valor === '' ? {} : ({ [clave]: valor } as Record<K, string>);
}
