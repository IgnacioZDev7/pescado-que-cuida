// Convierte data/especies.csv y data/config.json en JSON validado para la app.
// Uso (desde app/): npm run build-data
// La variable de entorno ESPECIES_CSV permite validar otra copia del CSV.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type PapaTipos from 'papaparse';
import { validarEspecies } from '../app/src/domain/validarEspecies.ts';

const dirScript = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(dirScript, '..');
const dirApp = resolve(raiz, 'app');

// papaparse vive en app/node_modules; se resuelve desde app/ porque este script está fuera.
const requerirDesdeApp = createRequire(resolve(dirApp, 'package.json'));
const Papa = requerirDesdeApp('papaparse') as typeof PapaTipos;

const rutaCsv = process.env.ESPECIES_CSV ? resolve(process.env.ESPECIES_CSV) : resolve(raiz, 'data/especies.csv');
const rutaConfig = resolve(raiz, 'data/config.json');
const dirSalida = resolve(dirApp, 'src/data/generado');
const nombreCsv = basename(rutaCsv);

function fallar(mensajes: string[]): never {
  for (const mensaje of mensajes) console.error(mensaje);
  console.error(`build-data: ${mensajes.length} error(es); no se generaron datos.`);
  process.exit(1);
}

function validarConfig(config: unknown): string[] {
  const errores: string[] = [];
  const c = config as { cortes_ug_g?: { verde_max?: unknown; amarillo_max?: unknown }; perfiles?: unknown };
  const verde = c?.cortes_ug_g?.verde_max;
  const amarillo = c?.cortes_ug_g?.amarillo_max;
  if (typeof verde !== 'number' || !Number.isFinite(verde)) errores.push('config.json: cortes_ug_g.verde_max debe ser numérico');
  if (typeof amarillo !== 'number' || !Number.isFinite(amarillo)) errores.push('config.json: cortes_ug_g.amarillo_max debe ser numérico');
  if (typeof verde === 'number' && typeof amarillo === 'number' && !(verde < amarillo)) {
    errores.push('config.json: cortes_ug_g.verde_max debe ser menor que amarillo_max');
  }
  if (!Array.isArray(c?.perfiles) || c.perfiles.length === 0) errores.push('config.json: perfiles debe ser una lista no vacía');
  return errores;
}

let textoCsv: string;
let config: unknown;
try {
  textoCsv = readFileSync(rutaCsv, 'utf8');
} catch {
  fallar([`No se pudo leer ${rutaCsv}`]);
}
try {
  config = JSON.parse(readFileSync(rutaConfig, 'utf8'));
} catch (error) {
  fallar([`No se pudo leer o interpretar ${rutaConfig}: ${(error as Error).message}`]);
}

const parseo = Papa.parse<Record<string, string>>(textoCsv, { header: true, skipEmptyLines: true });
const erroresParseo = parseo.errors.map(
  (e) => `${nombreCsv} fila ${typeof e.row === 'number' ? e.row + 2 : '?'}: ${e.message}`,
);
const { especies, errores } = validarEspecies(parseo.data);
const mensajes = [
  ...erroresParseo,
  ...errores.map((e) => `${nombreCsv} fila ${e.fila}: ${e.mensaje}`),
  ...validarConfig(config),
];

if (mensajes.length > 0) fallar(mensajes);

mkdirSync(dirSalida, { recursive: true });
writeFileSync(resolve(dirSalida, 'especies.json'), JSON.stringify(especies, null, 2) + '\n');
writeFileSync(resolve(dirSalida, 'config.json'), JSON.stringify(config, null, 2) + '\n');

const rios = [...new Set(especies.map((e) => e.rio))];
console.log(
  `${especies.length} especies validadas (ríos: ${rios.join(', ')}) desde ${nombreCsv}; datos escritos en app/src/data/generado/`,
);
