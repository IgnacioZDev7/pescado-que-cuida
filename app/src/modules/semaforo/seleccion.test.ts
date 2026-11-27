import { describe, expect, it } from 'vitest';
import { buscarEspecie } from '../../data/catalogo';
import { sanearSeleccion, useSeleccion } from './seleccion';

const especie = buscarEspecie('bagre');

describe('sanearSeleccion', () => {
  it('conserva una selección que existe en el catálogo', () => {
    expect(especie).toBeDefined();
    const guardado = { perfil: 'adulto', rio: especie?.rio, especieId: especie?.id };
    expect(sanearSeleccion(guardado)).toEqual(guardado);
  });

  it('descarta una especie que ya no existe', () => {
    expect(sanearSeleccion({ perfil: 'nino', rio: especie?.rio, especieId: 'pez-inexistente' })).toEqual({
      perfil: 'nino',
      rio: especie?.rio,
      especieId: undefined,
    });
  });

  it('descarta un río que ya no existe y la especie que dependía de él', () => {
    expect(sanearSeleccion({ perfil: 'adulto', rio: 'Río inexistente', especieId: especie?.id })).toEqual({
      perfil: 'adulto',
      rio: undefined,
      especieId: undefined,
    });
  });

  it('descarta un perfil desconocido', () => {
    expect(sanearSeleccion({ perfil: 'abuelo' }).perfil).toBeUndefined();
  });

  it('lo guardado con forma inválida queda sin selección', () => {
    expect(sanearSeleccion(null)).toEqual({});
    expect(sanearSeleccion('texto')).toEqual({});
  });
});

describe('useSeleccion sin localStorage', () => {
  it('sigue funcionando en memoria', () => {
    useSeleccion.getState().setPerfil('adulto');
    expect(useSeleccion.getState().perfil).toBe('adulto');
    useSeleccion.getState().reiniciar();
    expect(useSeleccion.getState().perfil).toBeUndefined();
  });
});
