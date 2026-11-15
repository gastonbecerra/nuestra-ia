# Nuestra IA

Dashboard de la casuística regional de inteligencia artificial.

- Aplicación: https://www.recursossociologicos.ar/nuestra-ia/
- Repositorio: https://github.com/gastonbecerra/nuestra-ia
- Fuente editorial: [Google Sheets, pestaña Casuística](https://docs.google.com/spreadsheets/d/16BfWHSFpgo00CUWoYjt3RzA1Q9PMp9lWHH2l7l_yV_8/edit)

## Desarrollo

```powershell
npm ci
npm run dev
```

La aplicación usa el paquete local `public/data/corpus.json`; no consulta Google
Sheets desde el navegador.

## Actualizar datos

La planilla es externa y de solo lectura para este proyecto. El pipeline no
escribe ninguna pestaña de Google Sheets.

```powershell
npm run data:update
```

El comando lee `Casuística`, valida los IDs, normaliza territorios y genera
`public/data/corpus.json`. Los análisis opcionales se guardan en `outputs/`,
una carpeta temporal ignorada por Git:

```powershell
npm run data:stats
npm run data:crosses
```

La edición, incorporación y matching de registros se realiza fuera de este
repositorio, directamente en Google Sheets.

## Compilar y publicar

```powershell
npm run build
npm run build:pages
npm run export:pages -- --site=../sociologia-uflo
```

`export:pages` copia el compilado al repositorio del sitio. Revisar el cambio,
hacer commit y publicar desde `sociologia-uflo`.

## Estructura mínima

```text
src/                    Dashboard React
public/data/corpus.json Datos generados para la aplicación
public/data/world.json  Cartografía local
scripts/actualizar_datos.R
scripts/estadisticas.R
scripts/cruces.R
scripts/R/              Utilidades del pipeline
scripts/export-pages.mjs
```

No se versionan credenciales, datos intermedios, respaldos, resultados de
análisis ni compilados.
