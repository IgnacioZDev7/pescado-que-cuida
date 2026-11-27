import type { ComponentType, SVGProps } from 'react';
import type { Perfil } from '../../domain/tipos';
import { IconoAdulto, IconoEmbarazada, IconoNino } from '../../ui/Iconos';

export const OPCIONES_PERFIL: {
  perfil: Perfil;
  etiqueta: string;
  Icono: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { perfil: 'embarazada', etiqueta: 'Embarazada o lactancia', Icono: IconoEmbarazada },
  { perfil: 'nino', etiqueta: 'Niño o niña', Icono: IconoNino },
  { perfil: 'adulto', etiqueta: 'Adulto', Icono: IconoAdulto },
];
