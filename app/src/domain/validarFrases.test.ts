import { describe, expect, it } from 'vitest';
import { validarFrases } from './validarFrases';

function fila(cambios: Record<string, string> = {}): Record<string, string> {
  return {
    id: 'saludo',
    es: 'Buenos días',
    lengua: '',
    archivo_audio: '',
    pictograma: '',
    validado_por: '',
    ...cambios,
  };
}

describe('validarFrases', () => {
  it('convierte una fila mínima en frase con opcionales indefinidos', () => {
    const { frases, errores } = validarFrases([fila()]);
    expect(errores).toEqual([]);
    expect(frases).toEqual([{ id: 'saludo', es: 'Buenos días' }]);
    expect(frases[0].lengua).toBeUndefined();
    expect(frases[0].archivoAudio).toBeUndefined();
  });

  it('copia los opcionales cuando existen', () => {
    const { frases } = validarFrases([
      fila({ lengua: 'tacana', archivo_audio: 'saludo.ogg', pictograma: 'img/saludo.svg', validado_por: 'Comunidad X' }),
    ]);
    expect(frases[0]).toEqual({
      id: 'saludo',
      es: 'Buenos días',
      lengua: 'tacana',
      archivoAudio: 'saludo.ogg',
      pictograma: 'img/saludo.svg',
      validadoPor: 'Comunidad X',
    });
  });

  it('quita espacios alrededor de los campos', () => {
    const { frases } = validarFrases([fila({ id: ' saludo ', es: ' Hola ', lengua: '  ' })]);
    expect(frases[0]).toEqual({ id: 'saludo', es: 'Hola' });
  });

  it('falta id es un error con número de fila', () => {
    const { frases, errores } = validarFrases([fila(), fila({ id: '' })]);
    expect(frases).toHaveLength(1);
    expect(errores).toEqual([{ fila: 3, mensaje: 'falta id' }]);
  });

  it('falta es es un error', () => {
    const { errores } = validarFrases([fila({ es: '' })]);
    expect(errores).toEqual([{ fila: 2, mensaje: 'falta es' }]);
  });

  it('id duplicado es un error y la fila repetida no entra', () => {
    const { frases, errores } = validarFrases([fila(), fila({ es: 'Otra' })]);
    expect(frases).toEqual([{ id: 'saludo', es: 'Buenos días' }]);
    expect(errores).toEqual([{ fila: 3, mensaje: 'id duplicado: saludo' }]);
  });
});
