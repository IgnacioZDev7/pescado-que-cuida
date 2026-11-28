import { config } from '../../data/catalogo';
import { colorDeEspecie } from '../../domain/reglaRiesgo';
import type { Especie } from '../../domain/tipos';
import { FotoPez } from '../../ui/FotoPez';
import { PuntoSemaforo } from '../../ui/Semaforo';

interface Props {
  especies: Especie[];
  onElegir: (especie: Especie) => void;
  seleccionadoId?: string;
}

/** Cuadrícula de tarjetas de peces, tocables. La usan Evaluación y Cámara. */
export function CuadriculaPeces({ especies, onElegir, seleccionadoId }: Props) {
  if (especies.length === 0) {
    return <p className="text-lg text-tenue">Sin datos de peces para este río.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {especies.map((especie, indice) => {
        const elegido = especie.id === seleccionadoId;
        const locales = Object.values(especie.nombresLocales);
        // El color lo decide el dominio; aquí solo se muestra como un punto.
        const color = colorDeEspecie(especie, config);
        return (
          <li key={especie.id} className="animar-entrada" style={{ animationDelay: `${Math.min(indice, 8) * 30}ms` }}>
            <button
              type="button"
              aria-pressed={elegido}
              onClick={() => onElegir(especie)}
              className={`tactil flex h-full min-h-12 w-full flex-col overflow-hidden rounded-tarjeta border-2 bg-white text-left shadow-tarjeta ${
                elegido ? 'border-marino' : 'border-transparent'
              }`}
            >
              <FotoPez key={especie.foto} foto={especie.foto} className="aspect-square w-full" />
              <span className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5">
                <span className="flex items-start gap-2">
                  <PuntoSemaforo color={color} className="mt-1.5" />
                  <span className="text-lg font-extrabold leading-tight tracking-tight text-marino">
                    {especie.nombreComun}
                  </span>
                </span>
                {locales.length > 0 && (
                  <span className="pl-[22px] text-sm leading-snug text-tenue">{locales.join(' · ')}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
