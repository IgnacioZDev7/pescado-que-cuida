import { Link, useNavigate } from 'react-router-dom';
import { buscarEspecie, config, especies, rios } from '../../data/catalogo';
import { reglaRiesgo } from '../../domain/reglaRiesgo';
import type { Especie } from '../../domain/tipos';
import { BotonGrande } from '../../ui/BotonGrande';
import { FotoPez } from '../../ui/FotoPez';
import { IconoCheck } from '../../ui/Iconos';
import { Semaforo } from '../../ui/Semaforo';
import { OPCIONES_PERFIL } from './perfiles';
import { useSeleccion } from './seleccion';

const TEXTO_MENSAJE: Record<string, string> = {
  elegir_primero: 'Puede elegirlo primero',
  con_moderacion: 'Comer con moderación',
  evitar_cambiar: 'Mejor cambiarlo por otro pescado',
  sin_datos: 'No tenemos análisis de este pez en su río',
};

const NOMBRE_LENGUA: Record<string, string> = {
  ese_ejja: 'Ese Ejja',
  tacana: 'Tacana',
  tsimane: 'Tsimane',
};

export function Resultado() {
  const navegar = useNavigate();
  const { perfil, rio, especieId, setEspecieId, reiniciar } = useSeleccion();

  // Lo guardado en el dispositivo puede no existir ya en el catálogo: se trata como sin selección.
  const especie = especieId ? buscarEspecie(especieId) : undefined;
  if (!perfil || !rio || !rios.includes(rio) || !especie || especie.rio !== rio) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-marino">Resultado</h1>
        <p className="text-xl">Elija primero quién come y el pescado</p>
        <Link
          to="/evaluacion"
          className="flex min-h-12 items-center justify-center rounded-xl bg-marino px-4 py-3 text-xl font-semibold text-white"
        >
          Ir a Evaluación
        </Link>
      </section>
    );
  }

  // El riesgo lo decide solo el dominio; esta pantalla solo lo presenta.
  const resultado = reglaRiesgo(especie, perfil, config, especies);
  const reemplazos = resultado.reemplazos
    .map((id) => buscarEspecie(id))
    .filter((e): e is Especie => e !== undefined);
  const etiquetaPerfil = OPCIONES_PERFIL.find((o) => o.perfil === perfil)?.etiqueta ?? perfil;
  const locales = Object.entries(especie?.nombresLocales ?? {});

  return (
    <section className="flex flex-col gap-5">
      <ul className="flex flex-wrap gap-2 text-base font-semibold">
        <li className="rounded-full bg-marino px-3 py-1 text-white">{etiquetaPerfil}</li>
        <li className="rounded-full border border-marino px-3 py-1 text-marino">Río {rio}</li>
      </ul>

      <div className="flex items-center gap-4">
        {especie && (
          <FotoPez
            key={especie.foto}
            foto={especie.foto}
            nombre={especie.nombreComun}
            className="h-20 w-24 shrink-0 rounded-xl"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-marino">{especie?.nombreComun ?? 'Pez sin datos'}</h1>
          {locales.map(([lengua, nombre]) => (
            <p key={lengua} className="text-base text-gray-700">
              {NOMBRE_LENGUA[lengua] ?? lengua}: {nombre}
            </p>
          ))}
        </div>
      </div>

      <Semaforo
        color={resultado.color}
        mensaje={TEXTO_MENSAJE[resultado.mensajeClave] ?? resultado.mensajeClave}
      />

      {resultado.advertencia && (
        <p className="rounded-xl border-2 border-ambar bg-ambar/15 p-3 text-lg font-semibold text-gray-950">
          ⚠ {resultado.advertencia}
        </p>
      )}

      <p className="text-base text-gray-800">
        Fuente:{' '}
        {especie
          ? resultado.fuente.includes(String(especie.anio))
            ? resultado.fuente
            : `${resultado.fuente} (${especie.anio})`
          : 'Sin datos'}
      </p>

      {reemplazos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-marino">Mejor elija uno de estos</h2>
          <ul className="flex flex-col gap-3">
            {reemplazos.map((otra) => (
              <li key={otra.id}>
                <button
                  type="button"
                  onClick={() => {
                    setEspecieId(otra.id);
                    window.scrollTo({ top: 0 });
                  }}
                  className="flex min-h-12 w-full items-center gap-3 overflow-hidden rounded-xl border-2 border-verde bg-white text-left"
                >
                  <FotoPez key={otra.foto} foto={otra.foto} nombre={otra.nombreComun} className="h-20 w-24 shrink-0" />
                  <span className="flex-1 text-xl font-bold text-marino">{otra.nombreComun}</span>
                  <span className="mr-3 flex items-center gap-1 rounded-full bg-verde px-2 py-1 text-sm font-bold text-white">
                    <IconoCheck width={18} height={18} /> Mejor opción
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BotonGrande
        onClick={() => {
          reiniciar();
          navegar('/evaluacion');
        }}
      >
        Nueva evaluación
      </BotonGrande>
    </section>
  );
}
