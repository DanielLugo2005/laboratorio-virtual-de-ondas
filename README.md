# Laboratorio Virtual de Ondas

**Exploración interactiva de los fenómenos ondulatorios.**

Laboratorio universitario en español con nueve simulaciones, modelos matemáticos, gráficas, actividades guiadas, registros CSV y nueve videos educativos. Funciona sin cuentas, suscripciones, servicios de pago ni claves de API.

La integración local está preparada para publicar. **El repositorio y el sitio aún no se han publicado.** La autorización de publicación debe darse expresamente; el workflow tampoco se activa mediante un simple push.

## Ejecutar en Windows

En este equipo las dependencias ya están instaladas. Abre `iniciar-laboratorio.cmd` desde el Explorador. Se abre el navegador en la dirección local que imprime Vite, bajo `/laboratorio-virtual-de-ondas/`. Mantén la terminal abierta; Ctrl+C detiene el servidor. Si la página ya estaba abierta, recarga.

Para otro equipo, instala Node.js 24 y pnpm 11.25.0:

```powershell
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

El archivo de inicio busca Node en el sistema y, como alternativa, en el runtime local de Codex. Esa alternativa solo sirve para el equipo donde está instalado; una copia independiente requiere Node.

## Tecnologías y organización

React, TypeScript, Vite, CSS, SVG, Canvas 2D y lucide-react. Las escenas de agua y campos usan coordenadas tridimensionales con proyección; no necesitan WebGL avanzado. Solo se monta la simulación seleccionada, y los módulos más grandes se cargan por separado.

```text
src/
  main.tsx                    Inicio, navegación hash y primeros tres modelos
  modules.ts                  Catálogo de las nueve simulaciones
  physics.mjs                 Matemática de cuerda y ondas longitudinales
  phase2-physics.mjs           Acústica, sismos y electromagnetismo
  phase3-physics.mjs           Agua, óptica y muestreo
  hooks.ts                    Visibilidad y movimiento reducido
  video-files.mjs              Correspondencia y rutas multimedia
  video-explanations.ts        Interpretación del contenido revisado
  components/
    LabTools.tsx              Controles, gráficas, indicadores y cuaderno reutilizables
    Shared.tsx                Deslizador y acceso al componente de video
    VideoSlot.tsx             Reproductor, volumen y explicaciones A–D
    PhaseTwoLab.tsx            Tres módulos intermedios
    PhaseThreeLab.tsx          Agua, prisma y rotor
    WaterScene.tsx             Malla 3D dibujada en Canvas
    PrismScene.tsx             Trazado óptico
    Rotor.tsx                  Representación del rotor
public/
  videos/                     Nueve MP4 originales
  posters/                    Miniaturas extraídas de esos mismos videos
scripts/                      Verificación multimedia y pruebas de navegador
 tests/                       Pruebas matemáticas y de publicación
.github/workflows/pages.yml   Flujo manual de publicación
```

## Los nueve módulos

| Módulo | Parámetros y modelo principal |
|---|---|
| Transversal | A, f, v; onda continua o pulso. y = A sen(kx − ωt), λ = v/f. Partícula perpendicular al avance. |
| Longitudinal | A, f, v; ξ = A sen(kx − ωt), posiciones de equilibrio más desplazamiento. Rangos con Ak < 1. |
| Estacionaria | Modos de cuerda fija, L = 12 m. y = 2A sen(kx) cos(ωt), fₙ = nv/(2L), λₙ = 2L/n. |
| Sonora | Aire a distintas temperaturas; Δp = −ρv²∂ξ/∂x. Intensidad media proporcional a A² a frecuencia y medio fijos. |
| Sísmica | Trayectoria hipocentral d, profundidad fija de 10 km, vP y vS. tP = d/vP, tS = d/vS. |
| Electromagnética | E y B perpendiculares y en fase, B₀ = E₀/c y λ = c/f. Cámara rotatoria; unidades físicas separadas de la escala visual. |
| Agua | Fuentes radiales causales, atenuación finita, superposición. Frente r = v(t − tactivación), λ = v/f. |
| Luz visible | Snell vectorial, prismas triangulares y Sellmeier para N-BK7/N-SF11. Incluye reflexión interna total. |
| Estroboscopia | θ(t) = ωt; muestreo tₙ = n/fs y simetría 2π/N. Rama de aliasing explícita, sin flashes. |

Cada módulo permite iniciar, pausar, reiniciar y restablecer; incluye gráficas o comparaciones, resultados calculados y actividades con predicción y análisis. La cámara lenta y la reproducción afectan al tiempo visual, no a v o c. En sonido y electromagnetismo se explica la conversión entre tiempo de reproducción y tiempo físico. El tiempo del prisma es explicativo, no tiempo de vuelo.

El **Modo presentación** amplía el panel y oculta elementos secundarios. Conserva reproducción y etiquetas esenciales. Sal con el botón o Escape. Con preferencia de movimiento reducido, las simulaciones comienzan pausadas. También se suspenden cuando el panel o la pestaña no son visibles.

## Videos: archivos originales y correspondencia

Los nueve archivos duran 20 s, tienen resolución 1280 × 720, codec H.264 (`avc1`) y no contienen pista de audio. Se revisaron visualmente cuatro momentos de cada video y se comprobó su reproducción.

| Módulo | Archivo en `public/videos/` |
|---|---|
| Transversal | `Onda_transversal_simulacion_20s.mp4` |
| Longitudinal | `Onda_longitudinal_simulacion_20s.mp4` |
| Estacionaria | `Onda_estacionaria_simulacion_20s.mp4` |
| Sonora | `Onda_sonora_simulacion_20s.mp4` |
| Sísmica | `Onda_sismica_simulacion_20s.mp4` |
| Electromagnética | `Onda_electromagnetica_simulacion_20s.mp4` |
| Agua: analogía de onda mecánica | `Onda_mecanica_simulacion_20s.mp4` |
| Luz visible | `Onda_luz_visible_simulacion_20s.mp4` |
| Estroboscopia | `Efecto_estroboscopico_simulacion_20s.mp4` |

**Diferencias que se explican en la web:** el MP4 mecánico muestra una membrana elástica, no agua. El MP4 estroboscópico sigue una marca individual, mientras el modelo interactivo tiene N aspas idénticas. El MP4 electromagnético usa otra asignación de colores para E/B. Los originales se conservaron sin renombrar, convertir o reemplazar.

No hay reproducción automática. El reproductor solo recibe su fuente al acercarse a la vista; incluye controles HTML5, búsqueda temporal, pausa, reinicio, volumen y pantalla completa. Las miniaturas son fotogramas reales, no videos sustitutos.

Las URL se construyen con `import.meta.env.BASE_URL` y el nombre exacto de `src/video-files.mjs`. No se utilizan rutas Windows ni localhost en las fuentes multimedia publicables.

### Reemplazar un video posteriormente

1. Conserva una copia del original fuera del material que publicarás.
2. Coloca el nuevo MP4 en `public/videos/` con el nombre configurado, o cambia su correspondencia en `src/video-files.mjs`. No cambies archivos existentes sin autorización.
3. Usa H.264 en MP4 para compatibilidad amplia. Actualiza la miniatura JPEG correspondiente en `public/posters/`.
4. Revisa el contenido antes de actualizar `src/video-explanations.ts`; no atribuyas al clip observaciones que no contiene.
5. Ejecuta verificación multimedia, pruebas y compilación. Repite la prueba de reproducción en los navegadores objetivo.

## Pruebas y compilación

```powershell
pnpm test
pnpm check:media
pnpm build
node scripts/check-media.mjs --dist
pnpm preview
```

La previsualización de la compilación también usa `/laboratorio-virtual-de-ondas/`. `dist/` contiene el sitio publicable, incluidos los MP4. No abras `index.html` con doble clic.

Herramientas de auditoría opcionales:

```powershell
node scripts/browser-check.mjs RUTA_A_PLAYWRIGHT_INDEX_MJS
node scripts/final-audit.mjs RUTA_A_PLAYWRIGHT_INDEX_MJS
```

Requieren Playwright y Microsoft Edge. Inician servidores temporales de previsualización y los cierran al terminar. `scripts/inspect-videos.mjs` revisa los archivos desde desarrollo y extrae fotogramas y miniaturas; no modifica los MP4. Los resultados locales se guardan en `verification/`, excluido de Git.

Resultados concretos y límites de verificación: consulta `AUDITORIA.md`. El código de navegador se probó en Edge/Chromium de Windows, con emulación de tamaños y controles táctiles. Google Chrome y Safari reales no estaban disponibles y no se afirma haberlos probado. La publicación real y su workflow tampoco se han ejecutado todavía.

## GitHub Pages: preparación sin publicar

Repositorio previsto: `DanielLugo2005/laboratorio-virtual-de-ondas`.

`vite.config.ts` declara `base: '/laboratorio-virtual-de-ondas/'`. La navegación hash (`#sound`, `#water`, etc.) evita rutas de servidor que necesiten redirecciones. El prefijo y los nueve MP4 se verificaron en la compilación local de producción. Si cambia el nombre del repositorio, actualiza `base` y repite esa prueba.

El workflow usa Node 24 y pnpm 11.25.0, instalación con lockfile, pruebas, verificación de originales, compilación y publicación de `dist/`. Las acciones están fijadas a hashes de la guía oficial de Vite. **Solo admite `workflow_dispatch` y exige marcar `publicar = true`. No se despliega con push.**

Después de autorizar la publicación:

1. Crear o seleccionar el repositorio previsto; comprobar antes si ya contiene archivos. No sobrescribir una historia remota existente.
2. Configurar la identidad de Git y subir código, configuración, documentación, pruebas y `public/`. No incluir `.local-backups/`, `.git/`, `node_modules/`, `dist/`, `.env*`, cachés o `verification/`.
3. En GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. En **Actions → Publicar laboratorio en GitHub Pages → Run workflow**, elegir la rama que contiene la versión revisada y marcar la confirmación `publicar`.
5. Esperar a que ambos trabajos terminen. Abrir la URL devuelta por el trabajo `deploy`, sin sesión, y comprobar inicio, las nueve simulaciones, controles, experimentos y los nueve videos.
6. Solo después registrar la URL pública definitiva. La dirección prevista sería `https://DanielLugo2005.github.io/laboratorio-virtual-de-ondas/`; no es una publicación verificada actualmente.
7. Generar un QR PNG únicamente de esa URL definitiva, después de comprobarla. No se generó un QR provisional.

Al publicar, el código y los videos quedarán públicamente accesibles; los registros personales del cuaderno permanecen en el navegador y no se suben.

Multimedia original: **49 410 893 bytes (49.41 MB; 47.12 MiB)**. Archivo mayor: 14 471 794 bytes. El sitio compilado ocupa aproximadamente 50.1 MB. Está por debajo de los límites actuales de 100 MiB por archivo Git y 1 GB para el sitio Pages; no se utiliza Git LFS. Vigila las restricciones de ancho de banda si el uso crece.

## Limitaciones físicas

Todos los valores son calculados, no mediciones experimentales. Los modelos son educativos y las escalas visuales se identifican en cada módulo.

- Cuerdas: medios lineales ideales, sin pérdidas o dispersión. Los modos estacionarios tienen extremos fijos; la onda viajera es un tramo sin reflexiones.
- Sonido: onda plana y perturbaciones pequeñas en aire ideal; sin atenuación ni percepción psicoacústica completa.
- Sismos: medio homogéneo e isótropo, trayectorias rectas y paquetes esquemáticos. No predice terremotos ni reproduce instrumentación profesional.
- Electromagnetismo: onda plana monocromática en el vacío, polarización lineal. Los colores identifican campos.
- Agua: modelo radial escalar no dispersivo con atenuación regularizada y frente causal. No calcula hidrodinámica ni movimientos orbitales completos.
- Óptica: rayos y superficies ideales; sin Fresnel, absorción, difracción o colorimetría exacta. El índice depende de longitud de onda con parámetros nominales de catálogo.
- Estroboscopia: exposición instantánea y aspas idénticas; la velocidad aparente depende de una rama elegida. El refresco de pantalla también introduce muestreo.

Los detalles de implementación anteriores se conservan en `FASE-2.md` y `FASE-3.md` como documentación técnica histórica, no como etiquetas de la interfaz.

## Referencias

- OpenStax. *University Physics*, volúmenes 1 y 3: [ondas](https://openstax.org/books/university-physics-volume-1/pages/16-introduction), [sonido](https://openstax.org/books/university-physics-volume-1/pages/17-1-sound-waves), [Snell y reflexión interna total](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection).
- OpenStax. [*College Physics 2e*: ondas electromagnéticas](https://openstax.org/books/college-physics-2e/pages/24-2-production-of-electromagnetic-waves).
- USGS. [*The Science of Earthquakes*](https://www.usgs.gov/programs/earthquake-hazards/science-earthquakes).
- SCHOTT. Datos ópticos de N-BK7 y [N-SF11](https://media.schott.com/api/public/content/78e83df5ca2c4da4ad4490a52c80a146?v=1a468147).
- Halliday, Resnick y Walker. *Fundamentos de física*.
- Serway y Jewett. *Física para ciencias e ingeniería*.
- [Guía oficial de Vite para GitHub Pages](https://vite.dev/guide/static-deploy#github-pages), [límites de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [archivos grandes en GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

Los videos fueron proporcionados para el proyecto. No se asignan autores, licencias ni créditos no confirmados.
