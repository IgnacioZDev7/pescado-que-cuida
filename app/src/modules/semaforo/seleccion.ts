import { create } from 'zustand';
import type { Perfil } from '../../domain/tipos';

interface EstadoSeleccion {
  perfil?: Perfil;
  rio?: string;
  especieId?: string;
  setPerfil: (perfil: Perfil) => void;
  setRio: (rio: string) => void;
  setEspecieId: (especieId: string) => void;
  reiniciar: () => void;
}

export const useSeleccion = create<EstadoSeleccion>()((set) => ({
  perfil: undefined,
  rio: undefined,
  especieId: undefined,
  setPerfil: (perfil) => set({ perfil }),
  // Al cambiar de río, la especie elegida deja de ser válida.
  setRio: (rio) => set({ rio, especieId: undefined }),
  setEspecieId: (especieId) => set({ especieId }),
  reiniciar: () => set({ perfil: undefined, rio: undefined, especieId: undefined }),
}));
