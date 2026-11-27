# Pescado que cuida

> **Sigue comiendo pescado. Elige cuál.**
> Gold4Good Hackathon 2026 · Desafío 03 (mercurio) · Subreto ORO-3.1 *Información verificada, riesgos y prevención*, con puente a ORO-3.2.

## El problema
El mercurio que usa la minería de oro se convierte en metilmercurio en los ríos y se acumula en los peces. El 89 % de 864 personas indígenas evaluadas en la Amazonía boliviana superan 1 µg/g de mercurio en cabello, y la media en el río Beni es de 6,4 µg/g. Dejar de comer pescado no es una opción: es alimento, cultura e ingreso.

## La idea
En el mismo río, el mercurio varía hasta 27 veces entre especies. Proponemos:
1. **Tarjeta-semáforo por río, especie y persona** (embarazada, niño, adulto), con nombres locales. Es impresa y funciona sin internet.
2. **App para el personal de salud**, que funciona sin conexión: reconoce la especie con visión artificial (siempre con confirmación humana), muestra el mismo color que la tarjeta con su fuente y reproduce frases grabadas por hablantes nativos (ese ejja, tacana, tsimane). No usa traducción automática.
3. **Tabla de datos abierta** que genera las tarjetas y alimenta la app.

> ⚠️ Prototipo. Las recomendaciones de salud deben ser validadas por la autoridad sanitaria. El color verde no significa "sin mercurio".

## Arquitectura (en desarrollo)
| Pieza | Tecnología |
|---|---|
| App | PWA: React + Vite + TypeScript, sin conexión (service worker) |
| Datos | CSV abierto convertido a JSON |
| Visión | Transfer learning con MobileNetV3 → TensorFlow.js en el teléfono, con un dataset propio |
| Audio | Frases pregrabadas + pictogramas |

El modelo predice la **especie**, nunca el color. El color sale de la tabla de datos según quién va a comer.

## Fuentes principales
- Loayza E. et al. *J. Food Comp. Anal.* 2026;150:108840
- Rodriguez-Levy I.E. et al. *Heliyon* 2022;8(11):e11649
- Valdivieso F. et al. *Rev. Bol. Química* 2025;42(2)
- JECFA 2006 · OMS 2024 · FAO/OMS 2024

## Equipo (Unifranz)
Yaroslava Alarcón (Bioquímica y Farmacia) · Danil Pacheco · Danner Pantoja · Ignacio Zarate (Ingeniería de Sistemas)
