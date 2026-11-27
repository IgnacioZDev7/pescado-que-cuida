import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { buscarEspecie, rios } from '../../data/catalogo';
import type { Perfil } from '../../domain/tipos';

interface DatosSeleccion {
  perfil?: Perfil;
  rio?: string;
  especieId?: string;
}

interface EstadoSeleccion extends DatosSeleccion {
  setPerfil: (perfil: Perfil) => void;
  setRio: (rio: string) => void;
  setEspecieId: (especieId: string) => void;
  reiniciar: () => void;
}

const PERFILES: readonly Perfil[] = ['embarazada', 'nino', 'adulto'];

/**
 * Descarta lo guardado que ya no existe en el catálogo (otra versión de los datos)
 * o que no tiene la forma esperada. Una especie solo vale si es del río guardado.
 */
export function sanearSeleccion(guardado: unknown): DatosSeleccion {
  if (typeof guardado !== 'object' || guardado === null) return {};
  const { perfil, rio, especieId } = guardado as Record<string, unknown>;
  const perfilValido = PERFILES.find((p) => p === perfil);
  const rioValido = typeof rio === 'string' && rios.includes(rio) ? rio : undefined;
  const especie = typeof especieId === 'string' ? buscarEspecie(especieId) : undefined;
  return {
    perfil: perfilValido,
    rio: rioValido,
    especieId: especie && especie.rio === rioValido ? especie.id : undefined,
  };
}

/** Acceso a localStorage sin depender de los tipos del DOM (este módulo también corre en los tests). */
function localStorageDelDispositivo(): StateStorage {
  return (globalThis as unknown as { localStorage: StateStorage }).localStorage;
}

/** localStorage que nunca lanza: si está bloqueado, lleno o no existe, la app sigue sin guardar. */
const almacenamientoSeguro: StateStorage = {
  getItem: (nombre) => {
    try {
      return localStorageDelDispositivo().getItem(nombre);
    } catch {
      return null;
    }
  },
  setItem: (nombre, valor) => {
    try {
      localStorageDelDispositivo().setItem(nombre, valor);
    } catch {
      // Sin almacenamiento disponible: la selección vive solo en memoria.
    }
  },
  removeItem: (nombre) => {
    try {
      localStorageDelDispositivo().removeItem(nombre);
    } catch {
      // Ídem.
    }
  },
};

/** Última selección (perfil, río y pez). Se guarda en el dispositivo para volver al resultado. */
export const useSeleccion = create<EstadoSeleccion>()(
  persist(
    (set) => ({
      perfil: undefined,
      rio: undefined,
      especieId: undefined,
      setPerfil: (perfil) => set({ perfil }),
      // Al cambiar de río, la especie elegida deja de ser válida.
      setRio: (rio) => set({ rio, especieId: undefined }),
      setEspecieId: (especieId) => set({ especieId }),
      reiniciar: () => set({ perfil: undefined, rio: undefined, especieId: undefined }),
    }),
    {
      name: 'pescado-que-cuida-seleccion',
      version: 1,
      storage: createJSONStorage(() => almacenamientoSeguro),
      partialize: ({ perfil, rio, especieId }) => ({ perfil, rio, especieId }),
      merge: (guardado, actual) => ({ ...actual, ...sanearSeleccion(guardado) }),
    },
  ),
);
