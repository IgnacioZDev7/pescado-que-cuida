// Catálogo de datos empaquetado en la app. Los JSON se generan con `npm run build-data`
// a partir de data/especies.csv y data/config.json (no se editan a mano).
import type { Config, Especie } from '../domain/tipos';
import configGenerada from './generado/config.json';
import especiesGeneradas from './generado/especies.json';

export const especies: Especie[] = especiesGeneradas as Especie[];

export const config: Config = configGenerada as Config;

/** Ríos con al menos una especie, sin repetir y en el orden del CSV. */
export const rios: string[] = [...new Set(especies.map((e) => e.rio))];

export function especiesDelRio(rio: string): Especie[] {
  return especies.filter((e) => e.rio === rio);
}

export function buscarEspecie(id: string): Especie | undefined {
  return especies.find((e) => e.id === id);
}
