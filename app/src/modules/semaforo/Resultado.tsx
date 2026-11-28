import { useEffect } from 'react';
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

/** Valor de mercurio tal como viene en los datos: exacto, cota "<X" o sin dato. */
function textoMercurio(especie: Especie): string {
  const formato = (v: number) => String(v).replace('.', ',');
  if (typeof especie.hgUgG === 'number' && Number.isFinite(especie.hgUgG)) return `${formato(especie.hgUgG)} µg/g`;
  if (typeof especie.hgMenorQue === 'number' && Number.isFinite(especie.hgMenorQue)) {
    return `< ${formato(especie.hgMenorQue)} µg/g`;
  }
  return 'Sin datos';
}

export function Resultado() {
  const navegar = useNavigate();
  const { perfil, rio, especieId, setEspecieId, reiniciar } = useSeleccion();

  // Al llegar desde la cuadrícula, la página conserva el scroll anterior y la banda del semáforo quedaría oculta.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Lo guardado en el dispositivo puede no existir ya en el catálogo: se trata como sin selección.
  const especie = especieId ? buscarEspecie(especieId) : undefined;
  if (!perfil || !rio || !rios.includes(rio) || !especie || especie.rio !== rio) {
    return (
      <section className="tarjeta animar-entrada flex flex-col gap-4 p-5">
        <h1 className="text-3xl font-black tracking-tight text-marino">Resultado</h1>
        <p className="text-lg text-tenue">Elija primero quién come y el pescado</p>
        <Link
          to="/evaluacion"
          className="tactil flex min-h-14 items-center justify-center rounded-2xl bg-marino px-5 py-3 text-lg font-bold text-white shadow-suave active:bg-marino-oscuro"
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
  const fuente = especie
    ? resultado.fuente.includes(String(especie.anio))
      ? resultado.fuente
      : `${resultado.fuente} (${especie.anio})`
    : 'Sin datos';

  return (
    <section className="flex flex-col gap-6">
      <article key={especie.id} className="tarjeta animar-entrada overflow-hidden">
        <div className="relative">
          <FotoPez key={especie.foto} foto={especie.foto} className="aspect-[4/3] w-full" />
          <ul className="absolute left-3 top-3 flex flex-wrap gap-2 text-sm font-bold">
            <li className="rounded-full bg-marino px-3 py-1.5 text-white shadow-suave">{etiquetaPerfil}</li>
            <li className="rounded-full bg-white px-3 py-1.5 text-marino shadow-suave">Río {rio}</li>
          </ul>
        </div>

        <div className="px-5 pb-4 pt-4">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-marino">
            {especie?.nombreComun ?? 'Pez sin datos'}
          </h1>
          {locales.map(([lengua, nombre]) => (
            <p key={lengua} className="text-base text-tenue">
              {NOMBRE_LENGUA[lengua] ?? lengua}: {nombre}
            </p>
          ))}
        </div>

        <Semaforo
          color={resultado.color}
          mensaje={TEXTO_MENSAJE[resultado.mensajeClave] ?? resultado.mensajeClave}
        />

        <div className="flex flex-col gap-3 px-5 pb-5 pt-3">
          {resultado.advertencia && (
            <p className="rounded-2xl border-2 border-ambar bg-ambar/15 px-4 py-3 text-base font-bold text-ambar-tinta">
              ⚠ {resultado.advertencia}
            </p>
          )}
          <p className="text-sm leading-relaxed text-tenue">
            Promedio en estudios: {textoMercurio(especie)} · {fuente} · referencia, no medición
          </p>
        </div>
      </article>

      {reemplazos.length > 0 && (
        <div className="animar-entrada flex min-w-0 flex-col gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-marino">Mejor elija uno de estos</h2>
          {/* Carrusel horizontal: el desplazamiento queda dentro de la lista, no en la página. */}
          <ul className="sin-barra -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 pt-1">
            {reemplazos.map((otra) => (
              <li key={otra.id} className="w-[70%] shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => {
                    setEspecieId(otra.id);
                    window.scrollTo({ top: 0 });
                  }}
                  className="tactil flex h-full min-h-12 w-full flex-col overflow-hidden rounded-tarjeta bg-white text-left shadow-tarjeta"
                >
                  <FotoPez key={otra.foto} foto={otra.foto} className="aspect-[4/3] w-full" />
                  <span className="flex flex-col items-start gap-2 px-4 pb-4 pt-3">
                    <span className="text-lg font-extrabold leading-tight tracking-tight text-marino">
                      {otra.nombreComun}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-verde px-2.5 py-1 text-sm font-bold text-white">
                      <IconoCheck width={16} height={16} strokeWidth={2.5} /> Mejor opción
                    </span>
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
