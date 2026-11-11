# Auditoría final del Laboratorio Virtual de Ondas

Fecha de comprobación: 11 de noviembre de 2026. Entorno: Windows, Node.js 24.22.1, pnpm 11.25.0, Microsoft Edge automatizado mediante Playwright.

## Estado

- Nueve simulaciones funcionales, conservando identidad visual, controles y navegación.
- Nueve videos originales integrados, sin reproducción automática, con miniaturas extraídas y explicación A–D.
- Instalación reproducible desde lockfile, TypeScript, pruebas, compilación y rutas de producción comprobados.
- Publicación preparada, pero no ejecutada. No se crearon ni modificaron recursos remotos y no hay URL pública comprobada ni QR.

## Punto de recuperación e integridad

Antes de modificar el código se creó `.local-backups/antes-integracion-20261111-131927.zip`, con 38 entradas y los nueve MP4. El repositorio Git no tenía commits, identidad de autor ni remoto configurados. Se usó este ZIP como recuperación local, sin inventar una identidad de Git. La carpeta se excluye de publicación.

Se guardaron SHA-256 de los MP4 antes de la integración. Los nueve hashes originales coinciden después del trabajo; las copias de `dist/videos/` también coinciden byte por byte. No se renombró, convirtió ni reemplazó ningún MP4.

## Revisión física y funcional por módulo

| Módulo | Verificación |
|---|---|
| Transversal | v = λf, T = 1/f, perfil viajero y pulso gaussiano; desplazamiento vertical con posiciones horizontales de equilibrio fijas. |
| Longitudinal | ξ paralelo a x, compresiones/rarefacciones y orden de partículas. En el límite A = 0.3 m, f = 1 Hz, v = 2 m/s, Ak ≈ 0.942 < 1. |
| Estacionaria | Superposición de dos viajeras, extremos fijos, nodos en jL/n, n vientres, fₙ = nv/(2L), amplitud de vientre 2A. |
| Sonora | Presión igual al negativo del gradiente espacial de ξ multiplicado por ρv²; λf = v, I proporcional a A². |
| Sísmica | d² = r² + h², tP = d/vP, tS = d/vS, P antes que S y señal nula antes de cada llegada. |
| Electromagnética | E perpendicular a B y a x, campos en fase, E₀ = cB₀, λf = c y E × B hacia +x. |
| Agua | Simetría radial, amplitud finita en el origen, llegada retardada, superposición de fuentes coherentes y apagado causal. |
| Luz | Índices coincidentes con líneas de catálogo, Snell vectorial, intersecciones reales, reflexión interna total y conservación de frecuencia. |
| Estroboscopia | Conversión RPM→Hz, ω, muestras exactas y retenidas, simetría 2π/N, reposo, avance, retroceso y ambigüedad de Nyquist. |

No se detectaron errores adicionales en esas relaciones matemáticas. Las simplificaciones se conservan explícitas en los módulos. Los valores registrados se identifican como resultados calculados del modelo, no mediciones experimentales.

## Videos

Los nueve se identificaron como MP4/H.264 (`avc1`), 1280 × 720, 20 segundos y sin pista de audio. Se inspeccionaron fotogramas aproximadamente en 1.2, 7, 13.2 y 18.4 s y se comprobó que el tiempo avanza durante la reproducción.

En los reproductores integrados de la compilación se probaron: carga desde la URL exacta, reproducción, pausa con tiempo detenido, búsqueda a 10 s, volumen al 35 %, pantalla completa, salida de pantalla completa y reinicio en pausa a t = 0. Los nueve pasaron.

Las rutas se verificaron bajo `/laboratorio-virtual-de-ondas/videos/` en previsualización local de producción, no solo en desarrollo. No hubo respuestas HTTP de error ni errores JavaScript en la auditoría final.

Diferencias documentadas, sin alterar originales:

- `Onda_mecanica_simulacion_20s.mp4` muestra una membrana elástica. Se presenta como analogía mecánica dentro de agua, no como un video acuático o demostración del ensayo de interferencia.
- El video electromagnético identifica E turquesa y B magenta, mientras la simulación usa E rojo y B turquesa. Se explica esa diferencia y la proyección espacial.
- El video estroboscópico sigue una marca individual y usa 3 Hz reales frente a 3, 2.8 y 3.2 Hz de observación. El modelo interactivo usa N aspas idénticas; se explica por qué no se debe trasladar sin más la misma fórmula entre ambos casos.

Los nombres exactos y la correspondencia están en `src/video-files.mjs` y README. Evidencia local: `verification/video-review/metadata.json`, hojas de fotogramas y `verification/final/browser-audit.json`.

## Experimentos y presentación

Se completaron dos actividades guiadas en cada uno de los tres primeros módulos, con objetivo, parámetros iniciales, predicción y resultado esperado. Se conservaron las actividades de los seis restantes, sus registros y formatos de almacenamiento.

Se comprobaron tablas, predicción/observación, guardado, recarga del navegador y descarga CSV. Los registros de las fases previas mantienen sus claves para no perder datos existentes. No hay envío de registros a ningún servidor.

El modo presentación y la salida con Escape pasaron en los nueve módulos. Se conservan controles de iniciar/pausar y etiquetas esenciales. Las referencias visibles al proceso de desarrollo se retiraron de la interfaz; las palabras técnicas sobre fase de una onda no se eliminaron.

## Rendimiento, accesibilidad y presentación visual

- Solo se monta la simulación activa; los dos grupos más grandes tienen importación diferida. Se comprobó que no se descargan sus chunks en la portada.
- La portada no solicita MP4. Los reproductores cercanos a la vista cargan metadatos y no empiezan a reproducir solos; las miniaturas son JPEG de fotogramas reales.
- El reloj de la simulación se suspende al pausar, ocultar el panel o esconder la pestaña. Se cancelan los bucles y observadores al desmontar.
- Con movimiento reducido, los nueve módulos empiezan pausados. El usuario puede iniciarlos expresamente.
- Se comprobó un control físico mediante teclado y los botones de iniciar/pausar mediante emulación táctil en los nueve módulos.
- Se revisaron capturas de escritorio, tablet a 768 px y móvil a 390 px; sin desbordamiento horizontal del documento. Los diagramas amplios conservan desplazamiento interno para mantener sus etiquetas.
- Reproductores y sus explicaciones se revisaron visualmente en escritorio y móvil. No se añadieron destellos de iluminación.

## Pruebas ejecutadas

- Instalación `pnpm install --frozen-lockfile`: correcta, sin dependencias nuevas.
- 30 pruebas automatizadas: 26 previas, tres de multimedia/publicación y una de orden de partículas longitudinales.
- TypeScript: correcto.
- Compilación Vite: correcta.
- Verificación de copias multimedia en `dist`: correcta para los nueve archivos.
- `scripts/browser-check.mjs`: navegación, parámetros, partículas, animaciones, pausa/reinicio, superposición, cámaras, actividades, persistencia, CSV y presentación de los nueve módulos; correcto, sin errores JavaScript.
- `scripts/final-audit.mjs`: nueve reproductores, prefijo de Pages, HTTP, carga diferida, teclado, movimiento reducido y controles táctiles; correcto.
- El test de regresión se adaptó para esperar la carga diferida antes de consultar tablas; no se modificó la persistencia para ocultar un error.

Los scripts de navegador emplean Edge y servidores locales temporales que cierran al finalizar. El servidor que el usuario haya abierto con el archivo de inicio no se detiene.

## Tamaños y GitHub Pages

MP4: **49 410 893 bytes = 49.41 MB = 47.12 MiB**. El archivo mayor es `Onda_sonora_simulacion_20s.mp4`, con 14 471 794 bytes. Los nueve JPEG suman 331 011 bytes. La compilación completa ocupa aproximadamente **50.1 MB**.

No hay archivos multimedia cercanos al máximo de 100 MiB por archivo de Git ni al límite de 1 GB del sitio Pages. No se configuró Git LFS. `node_modules`, cachés, archivos `.env`, respaldos, resultados locales y `dist` no se incluyen en el repositorio; `public/videos` y `public/posters` sí se incluyen.

`base` está fijado a `/laboratorio-virtual-de-ondas/` y se conserva navegación hash. El workflow manual incluye instalación, pruebas, comprobación de archivos, compilación, preparación del artefacto Pages y despliegue. Exige `publicar = true` y no se activa con push. Sus acciones se fijan por hashes de la documentación oficial de Vite.

Límites consultados en [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) y [archivos grandes](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). Flujo basado en [la guía oficial de Vite](https://vite.dev/guide/static-deploy#github-pages).

## Verificaciones pendientes y publicación

- Google Chrome real y Safari real no estaban instalados/disponibles; no se ejecutaron pruebas nativas en ellos. Edge usa Chromium, pero eso no sustituye una comprobación real de Safari ni de todos los códecs/controles de cada dispositivo.
- La emulación táctil y de pantalla no equivale a una prueba en tabletas y teléfonos físicos.
- No se hizo una auditoría exhaustiva con lector de pantalla ni mediciones de rendimiento en todos los equipos.
- GitHub Actions y el sitio público todavía no se han ejecutado. No se afirma éxito de despliegue a partir de una previsualización local.

Tras autorizar, se publicarán código, configuración, documentación y los nueve videos con sus miniaturas. La dirección prevista es `https://DanielLugo2005.github.io/laboratorio-virtual-de-ondas/`, siempre que se use ese propietario y repositorio. Aún no es una URL pública comprobada.

La confirmación de publicación es una condición expresa del usuario. Solo después se debe crear o usar el repositorio remoto, ejecutar el despliegue y verificar la URL real sin autenticación. El QR debe generarse exclusivamente después de esa comprobación.
