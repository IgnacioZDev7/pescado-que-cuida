# Pescado que cuida: especificación técnica y arquitectura

Versión 0.1 · 27/11/2026 · Estado: propuesta del equipo, para revisar y aprobar antes de programar.

---

## 1. Qué debe hacer la app (requisitos)

### 1.1 Usuarios
| Usuario | Necesidad | Contexto |
|---|---|---|
| **Personal de salud de la posta** (principal) | Orientar a la familia sobre qué pescado elegir, aunque no conozca los peces locales ni hable la lengua | Celular Android común, sin internet estable, poco tiempo por consulta, alta rotación |
| **Promotor de salud o docente** | Explicar la tarjeta con audios en lengua | Celular propio, a veces sin señal |
| **Monitoreo participativo** (fase 2) | Registrar peces enviados al laboratorio | Pescadores con apoyo del promotor |
| **Administrador de datos** (UMSA, IRD, OPS) | Actualizar la tabla de especies sin programar | Computadora con Excel |

### 1.2 Requisitos funcionales
| ID | Requisito | Fase |
|---|---|---|
| RF-01 | Elegir **quién va a comer** (embarazada o lactancia, niño, adulto) con íconos y audio | Demo |
| RF-02 | Elegir el **río o zona** (al inicio, solo río Beni) | Demo |
| RF-03 | Elegir el **pez** en una cuadrícula de fotos con nombre común y local | Demo |
| RF-04 | Mostrar el **resultado del semáforo** (color, mensaje, frecuencia orientativa, "cámbielo por…") y **la fuente del dato** | Demo |
| RF-05 | **Reconocer el pez con la cámara**: top-3 especies con confianza, **confirmación humana obligatoria** y opción "otro / no sé" | Demo (4–6 especies) |
| RF-06 | **Frases de voz**: lista de frases clave; al tocar una, se reproduce en la lengua elegida; respuestas con pictogramas (sí / no / peces) | Demo (frases de prueba) |
| RF-07 | Funcionar **100 % sin internet** después de la primera instalación | Demo |
| RF-08 | **Generar tarjetas imprimibles** (PDF) por río desde la misma tabla | Fase 1 |
| RF-09 | Mostrar la **versión de los datos** y la fecha de actualización | Fase 1 |
| RF-10 | **Registro de monitoreo**: foto, especie confirmada, tamaño con tarjeta de referencia, lugar y fecha, guardado sin conexión | Fase 2 |
| RF-11 | Sincronizar los registros cuando haya conexión | Fase 2 |

### 1.3 Requisitos no funcionales
| ID | Requisito | Meta medible |
|---|---|---|
| RNF-01 | Sin conexión | Todas las funciones de la demo operan en modo avión |
| RNF-02 | Dispositivo mínimo | Android 8 o superior, 2 GB de RAM, Chrome |
| RNF-03 | Peso | App (sin modelo) < 3 MB; modelo de visión < 6 MB; audios < 10 MB por lengua |
| RNF-04 | Velocidad | Inferencia de visión < 1,5 s en un celular de gama baja; primera carga < 5 s con 4G |
| RNF-05 | Accesible para quien no lee | Todo paso clave tiene ícono + audio; botones ≥ 48 px; alto contraste |
| RNF-06 | Seguridad clínica | La app **nunca** da un consejo sin confirmación de la especie; siempre muestra la fuente; verde ≠ "sin riesgo" |
| RNF-07 | Privacidad | Sin datos personales de salud; sin cuentas de usuario en fase 1; registros de monitoreo anónimos |
| RNF-08 | Mantenibilidad | Datos editables en CSV sin tocar código; reglas de riesgo en un archivo de configuración |
| RNF-09 | Costo | Software libre, sin licencias; hosting gratuito |

---

## 2. Arquitectura

### 2.1 Decisión principal: offline-first, sin servidor en la fase 1
Todo corre **en el teléfono**. La app es una **PWA**: se instala desde el navegador y luego funciona sin internet. No hay backend en la fase 1 porque el usuario no tiene conexión estable y un servidor agrega costo y puntos de falla. El backend llega en la fase 2, solo para sincronizar el monitoreo.

### 2.2 Vista general
```
┌────────────────────────── CELULAR (sin internet) ──────────────────────────┐
│                                                                            │
│  UI (React)                                                                │
│  ├─ Módulo Semáforo   ─┐                                                   │
│  ├─ Módulo Visión     ─┼──►  Dominio (TypeScript puro)                     │
│  └─ Módulo Voz        ─┘      ├─ reglaRiesgo(especie, perfil, config)      │
│                               └─ catálogo de especies y frases            │
│                                        ▲                                   │
│  Visión: TensorFlow.js ──► especie top-3 ──► confirmación humana ──┘        │
│                                                                            │
│  Datos empaquetados: especies.json · frases.json · config.json · audios    │
│  Almacenamiento local: IndexedDB (Dexie): preferencias y registros         │
│  Service Worker (Workbox): precarga app + modelo + audios                  │
└────────────────────────────────────────────────────────────────────────────┘
          ▲ build (CI)                                     │ fase 2: sync
┌─────────┴──────────────┐                     ┌───────────▼──────────────┐
│ data/*.csv  (fuente)   │                     │ API (FastAPI) + PostgreSQL│
│ ml/ (entrenamiento)    │                     │ + PostGIS (monitoreo)     │
└────────────────────────┘                     └──────────────────────────┘
```

### 2.3 Capas y responsabilidades
| Capa | Responsabilidad | Regla |
|---|---|---|
| **UI** (`src/modules/*`) | Pantallas e interacción | No calcula riesgo ni lee archivos directamente |
| **Dominio** (`src/domain`) | Regla de riesgo, tipos, validaciones | Funciones puras, 100 % testeadas, sin dependencias de React |
| **Datos** (`src/data`) | Carga de JSON, IndexedDB | Única capa que toca el almacenamiento |
| **ML** (`src/ml`) | Carga del modelo, preprocesado, inferencia | Devuelve **especie + confianza**, nunca un color |

**Decisión clave:** la visión predice la **especie**. El color lo calcula el dominio con la tabla de datos y el perfil de quien come. Así, cuando cambian los datos de mercurio no se reentrena el modelo, y la cámara siempre coincide con la tarjeta impresa.

---

## 3. Stack tecnológico

| Área | Tecnología (versión) | Por qué |
|---|---|---|
| Lenguaje | TypeScript 5.6 | Tipos para los contratos entre módulos y menos errores |
| UI | React 18.3 + Vite 5.4 | Estándar, rápido, el equipo lo conoce |
| Estilos | Tailwind CSS 3.4 | Botones grandes y accesibles rápido, CSS liviano |
| Navegación | React Router 6 | 4 o 5 pantallas simples |
| Estado | Zustand 4.5 | Estado global mínimo (perfil, río, especie elegida) |
| PWA / offline | vite-plugin-pwa 0.20 (Workbox) | Precarga del modelo, audios y datos |
| Almacenamiento local | Dexie 4 (IndexedDB) | Registros de monitoreo y preferencias sin conexión |
| Visión en el teléfono | @tensorflow/tfjs 4.22 (backend WebGL, con WASM de respaldo) | Inferencia local sin servidor |
| Entrenamiento | Python 3.11 + TensorFlow/Keras 2.x, MobileNetV3-Small preentrenado en ImageNet | Liviano, pensado para móviles |
| Conversión | tensorflowjs_converter → GraphModel, cuantizado a uint8 | Modelo de unos 3 a 5 MB |
| Audio | Archivos .ogg (Opus, 32 kbps) + `<audio>` HTML | Pocos KB por frase, sin dependencias |
| Tarjetas PDF | Script Node + Playwright (HTML → PDF) | Una tarjeta por río desde el mismo JSON |
| Calidad | ESLint + Prettier + Vitest + Playwright (e2e) | Reglas probadas; prueba e2e en modo avión |
| CI/CD | GitHub Actions → GitHub Pages | Gratis; cada merge a main publica la demo |
| Fase 2 backend | FastAPI + PostgreSQL 16 + PostGIS | Datos geográficos del monitoreo; libre y barato |

**Lo que NO usamos, y por qué:** LLM o chatbot generativo para el usuario final (no hay internet; riesgo de errores en salud); traducción automática de lenguas indígenas (no existen modelos confiables); app nativa en Android Studio (más lenta de construir; la PWA cubre lo necesario y luego se puede envolver con Capacitor); Firebase (depende de conexión y de un proveedor).

---

## 4. Estructura del repositorio
```
pescado-que-cuida/
├── .github/workflows/ci.yml      # lint, test, build, deploy a Pages
├── data/
│   ├── especies.csv              # FUENTE DE VERDAD (editable en Excel)
│   ├── frases.csv
│   └── config.json               # cortes del semáforo, porción, referencia
├── app/
│   ├── public/
│   │   ├── model/                # model.json + shards (exportado de ml/)
│   │   ├── audio/<lengua>/*.ogg
│   │   └── img/peces/*.webp
│   ├── src/
│   │   ├── domain/               # tipos.ts, reglaRiesgo.ts (+ tests)
│   │   ├── data/                 # carga de JSON, db.ts (Dexie)
│   │   ├── ml/                   # clasificador.ts
│   │   ├── modules/
│   │   │   ├── semaforo/         # Perfil, Rio, Especie, Resultado
│   │   │   ├── vision/           # Camara, Confirmacion
│   │   │   └── voz/              # Frases, Pictogramas
│   │   ├── ui/                   # componentes comunes (BotonGrande, Pill)
│   │   └── App.tsx
│   └── tests/e2e/                # Playwright, incluye modo offline
├── ml/
│   ├── README.md                 # cómo armar el dataset y entrenar
│   ├── train.ipynb
│   ├── export_tfjs.sh
│   └── labels.json
├── scripts/
│   ├── build-data.ts             # CSV → JSON validado
│   └── generar-tarjetas.ts       # JSON → PDF por río
└── docs/                         # ARQUITECTURA.md, decisiones, fuentes
```
El **dataset de fotos no va al repo**: va en Drive, y en el repo solo `labels.json` y el modelo exportado.

---

## 5. Modelo de datos

### 5.1 `especies.csv` (fuente de verdad)
| Campo | Tipo | Ejemplo | Obligatorio |
|---|---|---|---|
| id | slug | `pacu` | Sí |
| rio | texto | `Beni` | Sí |
| nombre_comun | texto | `Pacú` | Sí |
| nombre_cientifico | texto | `Piaractus brachypomus` | Sí, si se conoce |
| nombre_local_ese_ejja / _tacana / _tsimane | texto | | No |
| hg_ug_g | número o `<0.5` | `0.1` | Sí |
| hg_tipo | `total` \| `metilmercurio` | `total` | Sí |
| base | `humedo` \| `seco` \| `por_confirmar` | `humedo` | Sí |
| n_muestras | entero | | No |
| tamano_cm | rango | | No |
| fuente | texto + DOI | `Loayza et al. 2026` | Sí |
| anio | entero | `2026` | Sí |
| foto | archivo | `pacu.webp` | Sí |
| validado_por | texto | | No |
| nota | texto | `media; base por confirmar` | No |

`build-data.ts` **rechaza** filas sin fuente o sin base, para que no entre un dato sin respaldo.

### 5.2 `config.json`
```json
{
  "version_datos": "2026-11-27",
  "referencia": "JECFA 2006 · 1,6 µg/kg pc/semana (metilmercurio)",
  "porcion_g": 150,
  "cortes_ug_g": { "verde_max": 0.2, "amarillo_max": 0.5 },
  "perfiles": ["embarazada", "nino", "adulto"],
  "umbral_confianza_vision": 0.75
}
```

### 5.3 Contratos (TypeScript)
```ts
type Perfil = 'embarazada' | 'nino' | 'adulto';
type Color = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';
type Base = 'humedo' | 'seco' | 'por_confirmar';
type HgTipo = 'total' | 'metilmercurio';

interface Especie { id: string; rio: string; nombreComun: string; nombreCientifico?: string;
  nombresLocales: Record<string, string>; hgUgG: number | null; hgMenorQue?: number;
  hgTipo: HgTipo; base: Base; nMuestras?: number; tamanoCm?: string;
  fuente: string; anio: number; foto: string; validadoPor?: string; nota?: string; }

interface Resultado { color: Color; mensajeClave: string;   // id de frase con audio
  reemplazos: string[];                                       // ids de especies verdes del mismo río
  fuente: string; advertencia?: string; }

interface Config { version_datos: string; referencia: string; porcion_g: number;
  cortes_ug_g: { verde_max: number; amarillo_max: number }; perfiles: Perfil[];
  umbral_confianza_vision: number; nota?: string; }

// Dominio: función pura y testeada.
// El catálogo se recibe como parámetro para calcular los reemplazos en forma pura.
function reglaRiesgo(e: Especie | undefined, p: Perfil, c: Config, catalogo?: Especie[]): Resultado;

// ML: nunca devuelve color
interface Prediccion { especieId: string | 'otro'; confianza: number; }
function clasificar(img: HTMLCanvasElement): Promise<Prediccion[]>; // top-3
```

### 5.4 Reglas de riesgo (validar con la estudiante de BYF antes de programar)
- `hg ≤ verde_max` → verde; `≤ amarillo_max` → amarillo; mayor → rojo.
- Valor `<0.5` sin número exacto → **amarillo** (prudente) hasta tener el dato.
- `base = por_confirmar` → se muestra con advertencia "dato por confirmar".
- Perfil embarazada o niño con color rojo → mensaje "mejor cambiarlo" + reemplazos verdes del mismo río.
- **No se muestran porciones numéricas** hasta que haya un cálculo validado por la autoridad sanitaria. Solo se muestran mensajes de frecuencia ("elegir primero", "con moderación", "mejor cambiarlo").
- Sin datos de la especie → `sin_datos`: "No tenemos análisis de este pez en su río".

---

## 6. Visión artificial (pipeline)

1. **Clases de la demo:** 4 a 6 especies (pez ciego, blanquillo, bagre, sábalo, pacú, paiche) + **`otro`** (otros peces y fotos sin pez).
2. **Dataset:** 80 a 150 fotos por clase, de lados y ángulos distintos, con distinta luz, enteros y en el mercado. Fuentes: fotos propias (mercado Rodríguez) + iNaturalist o FishBase con licencia CC, que se registra en `ml/creditos.csv`.
3. **Estructura:** `dataset/<clase>/*.jpg`, con división 70/15/15 (train, validación, test) **por foto de origen**, para no repetir el mismo pez entre conjuntos.
4. **Entrenamiento:** MobileNetV3-Small (ImageNet), 224×224, aumento de datos (giro, brillo, recorte). Primero se entrena solo la cabeza y luego se ajustan las últimas capas.
5. **Métricas que se reportan:** exactitud top-1 y top-3, **matriz de confusión** (ojo con los bagres parecidos) y recall de la clase `otro`.
6. **Exportación:** GraphModel de TF.js cuantizado uint8, más `labels.json`.
7. **En la app:** si la confianza es menor a 0,75 o la clase es `otro`, se muestran las 3 opciones o la cuadrícula manual. **Siempre** se pregunta "¿Es este pez?".
8. **Demo de emergencia:** si el modelo propio no está listo, se usa Teachable Machine con las mismas clases. La interfaz no cambia.

---

## 7. Calidad, pruebas y CI
- **Pruebas unitarias (Vitest):** `reglaRiesgo` con todos los casos (cada color, `<0.5`, sin datos, por confirmar, cada perfil).
- **E2E (Playwright):** flujo completo y **el mismo flujo con la red desactivada**.
- **CI en cada PR:** lint, typecheck, pruebas y build. **Al hacer merge a main:** despliegue en GitHub Pages.
- **Ramas:** main (protegida) · develop · `feature/*`; PR obligatorio con revisión de otro integrante; commits `feat:`, `fix:`, `data:`, `docs:`.

---

## 8. Plan por ramas

| Rama | Responsable | Entrega para la demo |
|---|---|---|
| `feature/base` | Ignacio | Proyecto Vite + TS + Tailwind + PWA + Router + CI; pantalla de inicio |
| `data/especies` | Yaroslava + 1 | CSV con las especies con fuente, `config.json`, `build-data.ts` |
| `feature/semaforo` | Sistemas A | Perfil → río → pez → resultado, con `reglaRiesgo` y pruebas |
| `feature/vision` | Sistemas B (dataset) | Modelo exportado, cámara, top-3 y confirmación |
| `feature/voz` | Sistemas A o C | 10 frases con audio de prueba, pictogramas sí/no |
| `feature/tarjetas` | Después de la demo | Generador de PDF por río |

**Orden de integración:** `feature/base` → `data/especies` → `feature/semaforo` → `feature/vision` → `feature/voz`.

---

## 9. Hoja de ruta técnica
| Fase | Contenido |
|---|---|
| **Demo (sábado 28)** | RF-01 a RF-07 con datos del Beni; visión con 4 a 6 especies; audios de prueba |
| **Fase 1 (piloto, 0–6 meses)** | Audios reales en ese ejja grabados por hablantes nativos; generador de tarjetas; nombres locales; aval sanitario; métricas de uso anónimas en el dispositivo |
| **Fase 2 (6–18 meses)** | Monitoreo participativo (RF-10, RF-11) con FastAPI + PostgreSQL/PostGIS; más cuencas y lenguas; reentrenar el modelo con fotos reales; envolver la app con Capacitor si hace falta publicarla en Play Store |

## 10. Riesgos técnicos
| Riesgo | Mitigación |
|---|---|
| El modelo confunde especies parecidas | Confirmación humana obligatoria, top-3, clase `otro`, matriz de confusión publicada |
| Datos de mercurio incompletos o con base dudosa | Validación en `build-data`; advertencias en la interfaz; estado `sin_datos` |
| El celular no soporta WebGL | Respaldo con el backend WASM de TF.js; la selección manual siempre está disponible |
| Error clínico por un mal mensaje | Textos revisados por BYF y por la autoridad sanitaria; sin porciones numéricas hasta validarlas |
| Audios sin hablante nativo para la demo | Audios de prueba marcados como "prueba", sin presentarlos como traducción real |
