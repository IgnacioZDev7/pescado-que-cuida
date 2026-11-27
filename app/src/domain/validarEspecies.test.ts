import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import type { Especie } from './tipos';
import { validarEspecies } from './validarEspecies';

function crearFila(cambios: Record<string, string> = {}): Record<string, string> {
  return {
    id: 'pacu',
    rio: 'Beni',
    nombre_comun: 'Pacú',
    nombre_cientifico: 'Piaractus brachypomus',
    nombre_local_ese_ejja: 'nombre ese ejja',
    nombre_local_tacana: '',
    nombre_local_tsimane: 'nombre tsimane',
    hg_ug_g: '0.1',
    hg_tipo: 'total',
    base: 'humedo',
    n_muestras: '12',
    tamano_cm: '30-45',
    fuente: 'Loayza et al. 2026',
    anio: '2026',
    foto: 'pacu.webp',
    validado_por: 'BYF',
    nota: 'media',
    ...cambios,
  };
}

describe('validarEspecies', () => {
  it('convierte una fila válida completa en una Especie', () => {
    const { especies, errores } = validarEspecies([crearFila()]);
    const esperada: Especie = {
      id: 'pacu',
      rio: 'Beni',
      nombreComun: 'Pacú',
      nombreCientifico: 'Piaractus brachypomus',
      nombresLocales: { ese_ejja: 'nombre ese ejja', tsimane: 'nombre tsimane' },
      hgUgG: 0.1,
      hgTipo: 'total',
      base: 'humedo',
      nMuestras: 12,
      tamanoCm: '30-45',
      fuente: 'Loayza et al. 2026',
      anio: 2026,
      foto: 'pacu.webp',
      validadoPor: 'BYF',
      nota: 'media',
    };
    expect(errores).toEqual([]);
    expect(especies).toEqual([esperada]);
  });

  it('omite los campos opcionales vacíos', () => {
    const fila = crearFila({
      nombre_cientifico: '',
      nombre_local_ese_ejja: '',
      nombre_local_tsimane: '',
      n_muestras: '',
      tamano_cm: '',
      validado_por: '',
      nota: '  ',
    });
    const { especies, errores } = validarEspecies([fila]);
    expect(errores).toEqual([]);
    const especie = especies[0];
    expect(especie.nombresLocales).toEqual({});
    for (const campo of ['nombreCientifico', 'nMuestras', 'tamanoCm', 'validadoPor', 'nota']) {
      expect(especie).not.toHaveProperty(campo);
    }
  });

  it('rechaza una fila sin fuente', () => {
    const { especies, errores } = validarEspecies([crearFila({ fuente: '  ' })]);
    expect(especies).toEqual([]);
    expect(errores).toEqual([{ fila: 2, mensaje: 'falta fuente' }]);
  });

  it('rechaza una fila sin base', () => {
    const { especies, errores } = validarEspecies([crearFila({ base: '' })]);
    expect(especies).toEqual([]);
    expect(errores).toEqual([{ fila: 2, mensaje: 'falta base' }]);
  });

  it('rechaza una base inválida', () => {
    const { especies, errores } = validarEspecies([crearFila({ base: 'peso humedo' })]);
    expect(especies).toEqual([]);
    expect(errores).toHaveLength(1);
    expect(errores[0].fila).toBe(2);
    expect(errores[0].mensaje).toContain('base inválida');
  });

  it('rechaza un hg_tipo inválido', () => {
    const { errores } = validarEspecies([crearFila({ hg_tipo: 'parcial' })]);
    expect(errores[0].mensaje).toContain('hg_tipo inválido');
  });

  it('rechaza un id que no es slug', () => {
    const { errores } = validarEspecies([crearFila({ id: 'Pacú Grande' })]);
    expect(errores[0].mensaje).toContain('id inválido');
  });

  it('interpreta "<0.5" como cota superior', () => {
    const { especies, errores } = validarEspecies([crearFila({ hg_ug_g: '<0.5' })]);
    expect(errores).toEqual([]);
    expect(especies[0].hgUgG).toBeNull();
    expect(especies[0].hgMenorQue).toBe(0.5);
  });

  it.each(['alto', '-0.1', '<', '<abc'])('rechaza hg_ug_g no numérico o negativo: %s', (valor) => {
    const { especies, errores } = validarEspecies([crearFila({ hg_ug_g: valor })]);
    expect(especies).toEqual([]);
    expect(errores[0].mensaje).toContain('hg_ug_g inválido');
  });

  it('rechaza un anio que no es entero', () => {
    const { errores } = validarEspecies([crearFila({ anio: '2026.5' })]);
    expect(errores[0].mensaje).toContain('anio inválido');
  });

  it('rechaza un n_muestras que no es entero', () => {
    const { errores } = validarEspecies([crearFila({ n_muestras: 'doce' })]);
    expect(errores[0].mensaje).toContain('n_muestras inválido');
  });

  it('rechaza un id duplicado y conserva la primera aparición', () => {
    const { especies, errores } = validarEspecies([crearFila(), crearFila({ nombre_comun: 'Otro' })]);
    expect(especies.map((e) => e.nombreComun)).toEqual(['Pacú']);
    expect(errores).toEqual([{ fila: 3, mensaje: 'id duplicado: pacu' }]);
  });

  it('informa el número de línea del CSV de cada fila con errores', () => {
    const { especies, errores } = validarEspecies([
      crearFila({ id: 'a' }),
      crearFila({ id: 'b', fuente: '' }),
      crearFila({ id: 'c', base: '' }),
    ]);
    expect(especies.map((e) => e.id)).toEqual(['a']);
    expect(errores).toEqual([
      { fila: 3, mensaje: 'falta fuente' },
      { fila: 4, mensaje: 'falta base' },
    ]);
  });

  it('acepta el CSV real del repositorio sin errores', () => {
    const ruta = fileURLToPath(new URL('../../../data/especies.csv', import.meta.url));
    const texto = readFileSync(ruta, 'utf8');
    const { data } = Papa.parse<Record<string, string>>(texto, { header: true, skipEmptyLines: true });
    const { especies, errores } = validarEspecies(data);
    expect(errores).toEqual([]);
    expect(especies).toHaveLength(6);
  });
});
