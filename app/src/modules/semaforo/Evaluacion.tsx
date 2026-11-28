import { useNavigate } from 'react-router-dom';
import { especiesDelRio, rios } from '../../data/catalogo';
import { BotonGrande } from '../../ui/BotonGrande';
import { IconoCamara, IconoRio } from '../../ui/Iconos';
import { Chip, IconoOpcion, Opcion, Paso } from '../../ui/Paso';
import { CuadriculaPeces } from './CuadriculaPeces';
import { OPCIONES_PERFIL } from './perfiles';
import { useSeleccion } from './seleccion';

/** Evaluación paso a paso: quién come → río → pez. Al elegir el pez muestra el resultado. */
export function Evaluacion() {
  const navegar = useNavigate();
  const { perfil, rio, especieId, setPerfil, setRio, setEspecieId } = useSeleccion();

  return (
    <div className="flex flex-col gap-9">
      <Paso numero={1} titulo="¿Quién va a comer?">
        <div className="flex flex-col gap-3">
          {OPCIONES_PERFIL.map(({ perfil: valor, etiqueta, Icono }) => (
            <Opcion key={valor} elegida={perfil === valor} onClick={() => setPerfil(valor)}>
              <IconoOpcion elegida={perfil === valor}>
                <Icono width={30} height={30} strokeWidth={1.8} />
              </IconoOpcion>
              {etiqueta}
            </Opcion>
          ))}
        </div>
      </Paso>

      {perfil && (
        <Paso numero={2} titulo="¿De qué río es el pez?">
          <div className="flex flex-wrap gap-2">
            {rios.map((valor) => (
              <Chip key={valor} elegido={rio === valor} onClick={() => setRio(valor)}>
                <IconoRio width={22} height={22} strokeWidth={1.8} className="shrink-0" />
                Río {valor}
              </Chip>
            ))}
          </div>
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
              <IconoCamara strokeWidth={1.8} /> Tomar foto del pez
            </span>
          </BotonGrande>
        </Paso>
      )}
    </div>
  );
}
