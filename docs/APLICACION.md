# Operación y publicación

Arquitectura y decisiones: [ARQUITECTURA.md](../ARQUITECTURA.md).

## Desarrollo

Node 22.12+ o 24 y npm:

```powershell
npm ci
npm run dev
```

URL habitual: http://127.0.0.1:5173. VS Code detecta scripts npm y dispone de tareas
en `.vscode/tasks.json`. No se necesita R para abrir la aplicación.

## Actualizar datos

Editar `Casuística` en Google Sheets. Todos sus registros se publican.

```powershell
npm run data:update
npm run test:r
npm test
```

R requiere `googlesheets4`, `readr`, `jsonlite`, `digest`. Configuración pública en
`config/base.json`; overrides en `.Renviron`/`.Renviron.local` siguiendo el ejemplo.
El lanzador usa `RSCRIPT_PATH`, la instalación conocida `D:/Rbin/R-4.4.1/bin/Rscript.exe`
o Rscript en PATH. Puede configurarse por sesión:

```powershell
$env:RSCRIPT_PATH="C:\Program Files\R\R-4.4.1\bin\Rscript.exe"
```

Lectura pública sin autenticación. Para escribir `Análisis`, autorizar una vez desde
R interactivo o RStudio con raíz del proyecto como directorio de trabajo:

```r
source("scripts/autenticar.R", encoding = "UTF-8")
```

Token OAuth en caché de usuario de gargle. Sin contraseña ni tokens en el repositorio.
Si solo se desea leer y generar localmente: `npm run data:update -- --sin-escribir-sheet`.
Si no hay red: `npm run data:local` usa el CSV versionado, explícitamente.
Los reportes y la copia anterior del paquete quedan en `outputs/`, ignorado por Git.

## Estadísticas y clasificación opcional

```powershell
npm run data:stats
npm run data:crosses
npm run data:stats -- --desde-local --pais=Argentina
```

Los reportes no cambian la selección editorial. Para la asistencia LLM instalar
`ellmer` y definir `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` en `.Renviron.local`:

```powershell
node scripts/run-r.mjs scripts/clasificar_llm.R --accion=preparar --limite=5
node scripts/run-r.mjs scripts/clasificar_llm.R --accion=clasificar --limite=5
node scripts/run-r.mjs scripts/clasificar_llm.R --accion=revision --escribir-sheet
node scripts/run-r.mjs scripts/clasificar_llm.R --accion=aplicar --escribir-sheet
```

Solo `clasificar` llama al modelo y puede tener costo. Guarda propuestas con
modelo, versión del prompt, contexto y evidencia. Revisar el CSV y marcar `aceptar=si`
para aplicar el conjunto país/provincia/alcance. La tabla `Revisión IA` incluye los
pendientes, URLs y notas; las correcciones definitivas se hacen en `Casuística`.
Cambiar criterios requiere incrementar versión en `scripts/R/campos_llm.R`.

## Verificar app

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Pruebas exactas de Pages:

```powershell
npm run build:pages
$env:APP_PAGES="1"
npm run test:e2e
Remove-Item Env:APP_PAGES
```

La configuración de Playwright inicia Vite/preview automáticamente.
En esta máquina puede reutilizarse el navegador temporal definiendo
`PLAYWRIGHT_BROWSERS_PATH=C:\Users\Gaston\AppData\Local\Temp\opencode\playwright`.
Los tests de navegador comprueban desktop, móvil, filtros, recargas y referencias.

## Publicar

Dos checkouts vecinos: este proyecto y `../sociologia-uflo`.

1. Actualizar datos si corresponde, comprobar y hacer commit/push en `nuestra-ia`.
2. En el checkout del sitio: `git status`, `git pull --ff-only` (debe estar limpio).
3. Desde este proyecto:

```powershell
npm run export:pages -- --site=../sociologia-uflo
```

4. En el sitio, revisar `git status` y `git diff`. Agregar `nuestra-ia/`, hacer
   commit y push a `gh-pages`. No reemplazar el sitio completo ni cambiar `CNAME`.
5. Esperar GitHub Pages y comprobar:
   - https://www.recursossociologicos.ar/nuestra-ia/
   - https://www.recursossociologicos.ar/nuestra-ia/#/casos/IA-001
   - https://www.recursossociologicos.ar/nuestra-ia/version.json

El paquete mantiene rutas con hash y base `/nuestra-ia/`. Se puede probar antes con
`npm run preview:pages` → http://127.0.0.1:4173/nuestra-ia/.
La exportación genera un manifiesto con el commit de origen para rastrear publicaciones.

## Recuperación

- Código/configuración: historial Git del repo fuente.
- Datos: CSV y JSON versionados; Sheets conserva su historial de versiones.
- Publicación: revertir el commit de actualización en `sociologia-uflo` y publicar.
- Intermedios previos a la limpieza: archivo local en `backups/`, no necesario para ejecutar.

Después de modificar R, CSV o la normalización, regenerar el paquete y ejecutar
tests antes de publicar. No editar directamente `dist-pages` ni el compilado del sitio.
