import { describe, expect, it } from 'vitest';
import { reglaRiesgo } from './reglaRiesgo';
import type { Color, Config, Especie, Perfil } from './tipos';

const config: Config = {
  version_datos: '2026-11-27',
  referencia: 'JECFA 2006',
  porcion_g: 150,
  cortes_ug_g: { verde_max: 0.2, amarillo_max: 0.5 },
  perfiles: ['embarazada', 'nino', 'adulto'],
  umbral_confianza_vision: 0.75,
};

const perfiles: Perfil[] = ['embarazada', 'nino', 'adulto'];

function crearEspecie(cambios: Partial<Especie> = {}): Especie {
  return {
    id: 'pez-prueba',
    rio: 'Beni',
    nombreComun: 'Pez de prueba',
    nombresLocales: {},
    hgUgG: 0.1,
    hgTipo: 'total',
    base: 'humedo',
    fuente: 'Fuente de prueba 2026',
    anio: 2026,
    foto: 'pez-prueba.webp',
    ...cambios,
  };
}

describe('reglaRiesgo: color por valor exacto', () => {
  it.each<[number, Color]>([
    [0.1, 'verde'],
    [0.2, 'verde'],
    [0.3, 'amarillo'],
    [0.5, 'amarillo'],
    [1.7, 'rojo'],
  ])('hg %s µg/g da %s', (hg, esperado) => {
    const r = reglaRiesgo(crearEspecie({ hgUgG: hg }), 'adulto', config);
    expect(r.color).toBe(esperado);
  });
});

describe('reglaRiesgo: valor "<X" usa el color de X (peor caso)', () => {
  it.each<[number, Color]>([
    [0.1, 'verde'],
    [0.5, 'amarillo'],
    [1.0, 'rojo'],
  ])('<%s da %s', (cota, esperado) => {
    const r = reglaRiesgo(crearEspecie({ hgUgG: null, hgMenorQue: cota }), 'adulto', config);
    expect(r.color).toBe(esperado);
  });
});

describe('reglaRiesgo: sin datos nunca es verde', () => {
  const casos: [string, Especie | undefined][] = [
    ['especie inexistente', undefined],
    ['hg null sin hgMenorQue', crearEspecie({ hgUgG: null })],
    ['hg NaN', crearEspecie({ hgUgG: Number.NaN })],
  ];

  for (const [nombre, especie] of casos) {
    it.each(perfiles)(`${nombre} con perfil %s da sin_datos`, (perfil) => {
      const r = reglaRiesgo(especie, perfil, config);
      expect(r.color).toBe('sin_datos');
      expect(r.color).not.toBe('verde');
      expect(r.mensajeClave).toBe('sin_datos');
      expect(r.reemplazos).toEqual([]);
    });
  }

  it('sin especie la fuente queda vacía', () => {
    expect(reglaRiesgo(undefined, 'adulto', config).fuente).toBe('');
  });
});

describe('reglaRiesgo: el color depende solo de la especie', () => {
  it.each([0.1, 0.3, 1.7])('hg %s da el mismo color para los 3 perfiles', (hg) => {
    const especie = crearEspecie({ hgUgG: hg });
    const colores = perfiles.map((p) => reglaRiesgo(especie, p, config).color);
    expect(new Set(colores).size).toBe(1);
  });
});

describe('reglaRiesgo: mensajeClave por color y perfil', () => {
  const hgPorColor: Record<'verde' | 'amarillo' | 'rojo', number> = {
    verde: 0.1,
    amarillo: 0.3,
    rojo: 1.7,
  };

  it.each<['verde' | 'amarillo' | 'rojo', Perfil, string]>([
    ['rojo', 'embarazada', 'evitar_cambiar'],
    ['rojo', 'nino', 'evitar_cambiar'],
    ['rojo', 'adulto', 'con_moderacion'],
    ['amarillo', 'embarazada', 'con_moderacion'],
    ['amarillo', 'nino', 'con_moderacion'],
    ['amarillo', 'adulto', 'con_moderacion'],
    ['verde', 'embarazada', 'elegir_primero'],
    ['verde', 'nino', 'elegir_primero'],
    ['verde', 'adulto', 'elegir_primero'],
  ])('%s con perfil %s da %s', (color, perfil, mensaje) => {
    const r = reglaRiesgo(crearEspecie({ hgUgG: hgPorColor[color] }), perfil, config);
    expect(r.color).toBe(color);
    expect(r.mensajeClave).toBe(mensaje);
  });
});

describe('reglaRiesgo: reemplazos', () => {
  const roja = crearEspecie({ id: 'roja', hgUgG: 1.7 });
  const amarilla = crearEspecie({ id: 'amarilla', hgUgG: 0.3 });
  const verdeMismoRio = crearEspecie({ id: 'verde-beni', hgUgG: 0.1 });
  const verdeCotaMismoRio = crearEspecie({ id: 'verde-cota-beni', hgUgG: null, hgMenorQue: 0.1 });
  const verdeOtroRio = crearEspecie({ id: 'verde-mamore', rio: 'Mamoré', hgUgG: 0.1 });
  const otraAmarilla = crearEspecie({ id: 'otra-amarilla', hgUgG: 0.4 });
  const sinDatos = crearEspecie({ id: 'sin-datos', hgUgG: null });
  const catalogo = [roja, amarilla, verdeMismoRio, verdeCotaMismoRio, verdeOtroRio, otraAmarilla, sinDatos];

  it.each(perfiles)('rojo con perfil %s sugiere solo verdes del mismo río', (perfil) => {
    const r = reglaRiesgo(roja, perfil, config, catalogo);
    expect(r.reemplazos).toEqual(['verde-beni', 'verde-cota-beni']);
  });

  it('excluye a la propia especie aunque sea verde', () => {
    const r = reglaRiesgo(verdeMismoRio, 'embarazada', config, catalogo);
    expect(r.reemplazos).toEqual([]);
  });

  it.each<Perfil>(['embarazada', 'nino'])('amarillo con perfil %s tiene reemplazos', (perfil) => {
    const r = reglaRiesgo(amarilla, perfil, config, catalogo);
    expect(r.reemplazos).toEqual(['verde-beni', 'verde-cota-beni']);
  });

  it('amarillo con perfil adulto no tiene reemplazos', () => {
    expect(reglaRiesgo(amarilla, 'adulto', config, catalogo).reemplazos).toEqual([]);
  });

  it.each(perfiles)('verde con perfil %s no tiene reemplazos', (perfil) => {
    const verde = crearEspecie({ id: 'otra-verde', hgUgG: 0.2 });
    expect(reglaRiesgo(verde, perfil, config, [...catalogo, verde]).reemplazos).toEqual([]);
  });

  it('sin catálogo los reemplazos quedan vacíos', () => {
    expect(reglaRiesgo(roja, 'embarazada', config).reemplazos).toEqual([]);
  });
});

describe('reglaRiesgo: advertencia y fuente', () => {
  it('base por_confirmar agrega advertencia', () => {
    const r = reglaRiesgo(crearEspecie({ base: 'por_confirmar' }), 'adulto', config);
    expect(r.advertencia).toBe('Dato por confirmar');
  });

  it('base por_confirmar sin datos también advierte', () => {
    const r = reglaRiesgo(crearEspecie({ base: 'por_confirmar', hgUgG: null }), 'adulto', config);
    expect(r.color).toBe('sin_datos');
    expect(r.advertencia).toBe('Dato por confirmar');
  });

  it('base humedo no tiene advertencia', () => {
    const r = reglaRiesgo(crearEspecie({ base: 'humedo' }), 'adulto', config);
    expect(r.advertencia).toBeUndefined();
  });

  it('propaga la fuente de la especie', () => {
    const r = reglaRiesgo(crearEspecie({ fuente: 'Loayza et al. 2026' }), 'nino', config);
    expect(r.fuente).toBe('Loayza et al. 2026');
  });
});
