// Ejecuta `assembleDebug` con el wrapper de Gradle que corresponde al sistema:
// gradlew.bat en Windows (vía cmd.exe) y ./gradlew en macOS/Linux.
// No fija JAVA_HOME: cada entorno debe tener un JDK compatible configurado.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const directorioAndroid = join(raiz, 'android');
const esWindows = process.platform === 'win32';
const wrapper = join(directorioAndroid, esWindows ? 'gradlew.bat' : 'gradlew');
// Ruta absoluta (cmd.exe puede no buscar en el directorio actual); entre
// comillas en Windows porque con shell la ruta puede contener espacios.
const comando = esWindows ? `"${wrapper}"` : wrapper;

const resultado = spawnSync(comando, ['assembleDebug'], {
  cwd: directorioAndroid,
  stdio: 'inherit',
  shell: esWindows,
});

if (resultado.error) {
  console.error(`No se pudo ejecutar ${wrapper}: ${resultado.error.message}`);
  process.exit(1);
}

if (resultado.status !== 0 && !process.env.JAVA_HOME) {
  console.error(
    '\nAviso: JAVA_HOME no está definido. Gradle necesita un JDK compatible ' +
      '(por ejemplo el que trae Android Studio en su carpeta jbr).',
  );
}

process.exit(resultado.status ?? 1);
