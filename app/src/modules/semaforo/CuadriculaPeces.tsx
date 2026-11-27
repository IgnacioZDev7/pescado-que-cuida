import type { Especie } from '../../domain/tipos';
import { FotoPez } from '../../ui/FotoPez';

interface Props {
  especies: Especie[];
  onElegir: (especie: Especie) => void;
  seleccionadoId?: string;
}

/** Cuadrícula de tarjetas de peces, tocables. La usan Evaluación y Cámara. */
export function CuadriculaPeces({ especies, onElegir, seleccionadoId }: Props) {
  if (especies.length === 0) {
    return <p className="text-lg">Sin datos de peces para este río.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {especies.map((especie) => {
        const elegido = especie.id === seleccionadoId;
        const locales = Object.values(especie.nombresLocales);
        return (
          <li key={especie.id}>
            <button
              type="button"
              aria-pressed={elegido}
              onClick={() => onElegir(especie)}
              className={`flex min-h-12 w-full flex-col overflow-hidden rounded-xl border-2 bg-white pb-2 text-left ${
                elegido ? 'border-marino ring-2 ring-marino' : 'border-marino/30'
              }`}
            >
              <FotoPez key={especie.foto} foto={especie.foto} className="h-24 w-full" />
              <span className="px-2 pt-2 text-lg font-bold text-marino">{especie.nombreComun}</span>
              {locales.length > 0 && <span className="px-2 text-sm text-gray-700">{locales.join(' · ')}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
