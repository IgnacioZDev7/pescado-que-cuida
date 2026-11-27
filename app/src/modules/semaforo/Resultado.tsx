import { Navigate, useNavigate } from 'react-router-dom';
import { buscarEspecie, config, especies } from '../../data/catalogo';
import { reglaRiesgo } from '../../domain/reglaRiesgo';
import type { Color } from '../../domain/tipos';
import { BotonGrande } from '../../ui/BotonGrande';
import { Pill } from '../../ui/Pill';
import { useSeleccion } from './seleccion';

// Textos provisorios hasta tener frases con audio.
const TEXTO_COLOR: Record<Color, string> = {
  verde: 'Verde',
  amarillo: 'Amarillo',
  rojo: 'Rojo',
  sin_datos: 'Sin datos',
};

const TEXTO_MENSAJE: Record<string, string> = {
  elegir_primero: 'Elegir primero',
  con_moderacion: 'Con moderación',
  evitar_cambiar: 'Mejor cambiarlo',
  sin_datos: 'No tenemos análisis de este pez en su río',
};

export function Resultado() {
  const navegar = useNavigate();
  const perfil = useSeleccion((s) => s.perfil);
  const rio = useSeleccion((s) => s.rio);
  const especieId = useSeleccion((s) => s.especieId);
  const reiniciar = useSeleccion((s) => s.reiniciar);

  if (!perfil || !rio || !especieId) return <Navigate to="/perfil" replace />;

  const especie = buscarEspecie(especieId);
  // El riesgo lo decide solo el dominio; esta pantalla solo lo presenta.
  const resultado = reglaRiesgo(especie, perfil, config, especies);
  const reemplazos = resultado.reemplazos.map((id) => ({
    id,
    nombre: buscarEspecie(id)?.nombreComun ?? id,
  }));

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{especie?.nombreComun ?? 'Pez sin datos'}</h1>
      <div>
        <Pill color={resultado.color}>{TEXTO_COLOR[resultado.color]}</Pill>
      </div>
      <p className="text-xl font-semibold">
        {TEXTO_MENSAJE[resultado.mensajeClave] ?? resultado.mensajeClave}
      </p>
      {reemplazos.length > 0 && (
        <div>
          <p className="text-lg font-semibold">Cámbielo por:</p>
          <ul className="list-disc pl-6 text-lg">
            {reemplazos.map(({ id, nombre }) => (
              <li key={id}>{nombre}</li>
            ))}
          </ul>
        </div>
      )}
      {resultado.advertencia && (
        <p className="rounded-lg bg-yellow-100 p-3 text-lg">{resultado.advertencia}</p>
      )}
      {resultado.fuente && <p className="text-sm text-gray-600">Fuente: {resultado.fuente}</p>}
      <BotonGrande
        onClick={() => {
          reiniciar();
          navegar('/');
        }}
      >
        Volver a empezar
      </BotonGrande>
    </section>
  );
}
