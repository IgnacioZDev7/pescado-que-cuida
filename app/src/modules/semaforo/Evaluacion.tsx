import { useNavigate } from 'react-router-dom';
import { especiesDelRio, rios } from '../../data/catalogo';
import { BotonGrande } from '../../ui/BotonGrande';
import { IconoCamara, IconoRio } from '../../ui/Iconos';
import { Opcion, Paso } from '../../ui/Paso';
import { CuadriculaPeces } from './CuadriculaPeces';
import { OPCIONES_PERFIL } from './perfiles';
import { useSeleccion } from './seleccion';

/** Evaluación paso a paso: quién come → río → pez. Al elegir el pez muestra el resultado. */
export function Evaluacion() {
  const navegar = useNavigate();
  const { perfil, rio, especieId, setPerfil, setRio, setEspecieId } = useSeleccion();

  return (
    <div className="flex flex-col gap-8">
      <Paso numero={1} titulo="¿Quién va a comer?">
        {OPCIONES_PERFIL.map(({ perfil: valor, etiqueta, Icono }) => (
          <Opcion key={valor} elegida={perfil === valor} onClick={() => setPerfil(valor)}>
            <Icono width={40} height={40} className="shrink-0" />
            {etiqueta}
          </Opcion>
        ))}
      </Paso>

      {perfil && (
        <Paso numero={2} titulo="¿De qué río es el pez?">
          {rios.map((valor) => (
            <Opcion key={valor} elegida={rio === valor} onClick={() => setRio(valor)}>
              <IconoRio width={36} height={36} className="shrink-0" />
              Río {valor}
            </Opcion>
          ))}
        </Paso>
      )}

      {perfil && rio && (
        <Paso numero={3} titulo="¿Qué pez es?">
          <CuadriculaPeces
            especies={especiesDelRio(rio)}
            seleccionadoId={especieId}
            onElegir={(especie) => {
              setEspecieId(especie.id);
              navegar('/resultado');
            }}
          />
          <BotonGrande variante="secundario" onClick={() => navegar('/camara')}>
            <span className="flex items-center justify-center gap-2">
              <IconoCamara /> Tomar foto del pez
            </span>
          </BotonGrande>
        </Paso>
      )}
    </div>
  );
}
