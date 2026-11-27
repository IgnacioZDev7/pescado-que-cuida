// Contratos del dominio (ver docs/ARQUITECTURA.md §5.3).

export type Perfil = 'embarazada' | 'nino' | 'adulto';
export type Color = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';
export type Base = 'humedo' | 'seco' | 'por_confirmar';
export type HgTipo = 'total' | 'metilmercurio';

export interface Especie {
  id: string;
  rio: string;
  nombreComun: string;
  nombreCientifico?: string;
  nombresLocales: Record<string, string>;
  /** Valor exacto de mercurio en µg/g; null si solo se conoce una cota "<X". */
  hgUgG: number | null;
  /** Cota superior cuando el dato viene como "<X". */
  hgMenorQue?: number;
  hgTipo: HgTipo;
  base: Base;
  nMuestras?: number;
  tamanoCm?: string;
  fuente: string;
  anio: number;
  foto: string;
  validadoPor?: string;
  nota?: string;
}

export interface Resultado {
  color: Color;
  /** Id de la frase (con audio) que resume la recomendación. */
  mensajeClave: string;
  /** Ids de especies verdes del mismo río. */
  reemplazos: string[];
  fuente: string;
  advertencia?: string;
}

export interface Config {
  version_datos: string;
  referencia: string;
  porcion_g: number;
  cortes_ug_g: { verde_max: number; amarillo_max: number };
  perfiles: Perfil[];
  umbral_confianza_vision: number;
  nota?: string;
}

/** Frase de data/frases.csv; los campos vacíos quedan sin definir. */
export interface Frase {
  id: string;
  es: string;
  lengua?: string;
  archivoAudio?: string;
  pictograma?: string;
  validadoPor?: string;
}

/** Salida del clasificador de visión: nunca devuelve un color. */
export interface Prediccion {
  especieId: string | 'otro';
  confianza: number;
}
