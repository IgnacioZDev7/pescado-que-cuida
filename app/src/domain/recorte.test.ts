import { describe, expect, it } from 'vitest';
import { calcularRecorte, type Recorte, type Tamano } from './recorte';

function esperarCerca(real: Recorte, esperado: Recorte) {
  expect(real.x).toBeCloseTo(esperado.x, 6);
  expect(real.y).toBeCloseTo(esperado.y, 6);
  expect(real.lado).toBeCloseTo(esperado.lado, 6);
}

function esperarDentro(recorte: Recorte, fuente: Tamano) {
  expect(recorte.x).toBeGreaterThanOrEqual(0);
  expect(recorte.y).toBeGreaterThanOrEqual(0);
  expect(recorte.lado).toBeGreaterThan(0);
  expect(recorte.lado).toBeLessThanOrEqual(Math.min(fuente.ancho, fuente.alto));
  expect(recorte.x + recorte.lado).toBeLessThanOrEqual(fuente.ancho + 1e-9);
  expect(recorte.y + recorte.lado).toBeLessThanOrEqual(fuente.alto + 1e-9);
}

describe('calcularRecorte', () => {
  it('vista igual a la fuente: cuadrado centrado del 75 % del ancho', () => {
    const fuente = { ancho: 800, alto: 1000 };
    esperarCerca(calcularRecorte(fuente, fuente), { x: 100, y: 200, lado: 600 });
  });

  it('fuente apaisada 1920×1080 en vista vertical 360×640: cover recorta los costados', () => {
    const fuente = { ancho: 1920, alto: 1080 };
    const recorte = calcularRecorte(fuente, { ancho: 360, alto: 640 });
    // Escala 640/1080: el recuadro de 270 px de la vista mide 455,625 px en la fuente.
    esperarCerca(recorte, { x: 732.1875, y: 312.1875, lado: 455.625 });
    // Sigue centrado en la fuente.
    expect(recorte.x + recorte.lado / 2).toBeCloseTo(960, 6);
    expect(recorte.y + recorte.lado / 2).toBeCloseTo(540, 6);
    esperarDentro(recorte, fuente);
  });

  it('fuente vertical 720×1280 en vista apaisada 640×360: cover recorta arriba y abajo', () => {
    const fuente = { ancho: 720, alto: 1280 };
    const recorte = calcularRecorte(fuente, { ancho: 640, alto: 360 });
    // El recuadro (75 % de 640 = 480) se limita al alto de la vista: 360 px.
    esperarCerca(recorte, { x: 157.5, y: 437.5, lado: 405 });
    esperarDentro(recorte, fuente);
  });

  it('fuente vertical con la misma proporción que la vista', () => {
    const fuente = { ancho: 1080, alto: 1920 };
    esperarCerca(calcularRecorte(fuente, { ancho: 360, alto: 640 }), { x: 135, y: 555, lado: 810 });
  });

  it('foto de galería apaisada (vista = fuente): se limita al alto', () => {
    const fuente = { ancho: 1920, alto: 1080 };
    const recorte = calcularRecorte(fuente, fuente);
    esperarCerca(recorte, { x: 420, y: 0, lado: 1080 });
    esperarDentro(recorte, fuente);
  });

  it('foto de galería vertical (vista = fuente)', () => {
    const fuente = { ancho: 1080, alto: 1920 };
    const recorte = calcularRecorte(fuente, fuente);
    esperarCerca(recorte, { x: 135, y: 555, lado: 810 });
    esperarDentro(recorte, fuente);
  });

  it('acepta una fracción distinta', () => {
    const fuente = { ancho: 1000, alto: 1000 };
    esperarCerca(calcularRecorte(fuente, fuente, 0.5), { x: 250, y: 250, lado: 500 });
    esperarCerca(calcularRecorte(fuente, fuente, 1), { x: 0, y: 0, lado: 1000 });
  });

  it('el recorte nunca sale de la fuente ni tiene coordenadas negativas', () => {
    const tamanos: Tamano[] = [
      { ancho: 1920, alto: 1080 },
      { ancho: 1080, alto: 1920 },
      { ancho: 640, alto: 480 },
      { ancho: 333, alto: 777 },
      { ancho: 1, alto: 1 },
    ];
    for (const fuente of tamanos) {
      for (const vista of tamanos) {
        for (const fraccion of [0.1, 0.75, 1]) {
          esperarDentro(calcularRecorte(fuente, vista, fraccion), fuente);
        }
      }
    }
  });

  it('una fuente inválida (ancho o alto ≤ 0) lanza un error', () => {
    expect(() => calcularRecorte({ ancho: 0, alto: 100 }, { ancho: 100, alto: 100 })).toThrow(RangeError);
    expect(() => calcularRecorte({ ancho: 100, alto: -1 }, { ancho: 100, alto: 100 })).toThrow(RangeError);
    expect(() => calcularRecorte({ ancho: Number.NaN, alto: 100 }, { ancho: 100, alto: 100 })).toThrow(RangeError);
  });

  it('una fracción fuera de (0, 1] lanza un error', () => {
    const fuente = { ancho: 100, alto: 100 };
    expect(() => calcularRecorte(fuente, fuente, 0)).toThrow(RangeError);
    expect(() => calcularRecorte(fuente, fuente, 1.5)).toThrow(RangeError);
  });

  it('una vista inválida (≤ 0, p. ej. elemento oculto) se trata como vista = fuente', () => {
    const fuente = { ancho: 800, alto: 1000 };
    esperarCerca(calcularRecorte(fuente, { ancho: 0, alto: 0 }), { x: 100, y: 200, lado: 600 });
  });
});
