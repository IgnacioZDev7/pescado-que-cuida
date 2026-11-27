import { describe, expect, it } from 'vitest';
import { decidirVision } from './decidirVision';
import type { Prediccion } from './tipos';

const UMBRAL = 0.75;

describe('decidirVision', () => {
  it('sin modelo (null) pasa a elección manual', () => {
    expect(decidirVision(null, UMBRAL)).toEqual({ modo: 'manual' });
  });

  it('sin predicciones pasa a elección manual', () => {
    expect(decidirVision([], UMBRAL)).toEqual({ modo: 'manual' });
  });

  it('top-1 bajo el umbral pasa a elección manual', () => {
    const predicciones: Prediccion[] = [
      { especieId: 'bagre', confianza: 0.6 },
      { especieId: 'pacu', confianza: 0.3 },
    ];
    expect(decidirVision(predicciones, UMBRAL)).toEqual({ modo: 'manual' });
  });

  it('top-1 igual al umbral pide confirmar', () => {
    const predicciones: Prediccion[] = [
      { especieId: 'bagre', confianza: 0.75 },
      { especieId: 'pacu', confianza: 0.2 },
    ];
    expect(decidirVision(predicciones, UMBRAL)).toEqual({ modo: 'confirmar', opciones: predicciones });
  });

  it('top-1 "otro" pasa a elección manual aunque tenga alta confianza', () => {
    const predicciones: Prediccion[] = [
      { especieId: 'otro', confianza: 0.95 },
      { especieId: 'bagre', confianza: 0.03 },
    ];
    expect(decidirVision(predicciones, UMBRAL)).toEqual({ modo: 'manual' });
  });

  it('caso normal: confirma el top-3 sin las "otro"', () => {
    const predicciones: Prediccion[] = [
      { especieId: 'sabalo', confianza: 0.85 },
      { especieId: 'otro', confianza: 0.08 },
      { especieId: 'pacu', confianza: 0.04 },
      { especieId: 'bagre', confianza: 0.02 },
      { especieId: 'paiche', confianza: 0.01 },
    ];
    expect(decidirVision(predicciones, UMBRAL)).toEqual({
      modo: 'confirmar',
      opciones: [
        { especieId: 'sabalo', confianza: 0.85 },
        { especieId: 'pacu', confianza: 0.04 },
      ],
    });
  });

  it('ordena por confianza antes de decidir', () => {
    const predicciones: Prediccion[] = [
      { especieId: 'pacu', confianza: 0.1 },
      { especieId: 'sabalo', confianza: 0.9 },
    ];
    expect(decidirVision(predicciones, UMBRAL)).toEqual({
      modo: 'confirmar',
      opciones: [
        { especieId: 'sabalo', confianza: 0.9 },
        { especieId: 'pacu', confianza: 0.1 },
      ],
    });
  });
});
