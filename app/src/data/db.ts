// Almacenamiento local en IndexedDB. Única capa que toca la persistencia del dispositivo.
import Dexie, { type EntityTable } from 'dexie';

export interface Preferencia {
  clave: string;
  valor: unknown;
}

export const db = new Dexie('pescado-que-cuida') as Dexie & {
  preferencias: EntityTable<Preferencia, 'clave'>;
};

db.version(1).stores({
  preferencias: 'clave',
});
