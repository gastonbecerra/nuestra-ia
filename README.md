# Nuestra IA

Casuística regional de inteligencia artificial. Proyecto de la Licenciatura en
Sociología UFLO: panorama descriptivo, comparación entre países y explorador de casos.

- **Aplicación:** https://www.recursossociologicos.ar/nuestra-ia/
- **Código:** https://github.com/gastonbecerra/nuestra-ia
- **Base editorial:** [Google Sheets](https://docs.google.com/spreadsheets/d/16BfWHSFpgo00CUWoYjt3RzA1Q9PMp9lWHH2l7l_yV_8/edit), pestaña `Casuística`.

## Ejecutar en local

Node.js 22.12+ o 24 y npm. Desde VS Code:

```powershell
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173 (o el puerto informado). No hace falta R ni autenticación
para navegar: se incluyen datos y cartografía locales.

## Editar datos y actualizar

Editar **solo Google Sheets** y luego:

```powershell
npm run data:update
npm test
```

R descarga una vez la base, valida los IDs, actualiza `data/casuistica.csv`, genera
`public/data/corpus.json` y escribe los cruces en la pestaña `Análisis`.
La actualización no publica automáticamente la web.

## Comandos principales

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con recarga automática |
| `npm run data:update` | Sheets → datos y análisis de una misma versión |
| `npm run data:local` | Regenerar desde `data/casuistica.csv`, sin Google |
| `npm run data:stats` | Estadísticas descriptivas en `outputs/` |
| `npm run data:crosses` | Cruces y comparación del foco Argentina/Colombia/Perú |
| `npm test` | Integridad y coincidencia de cálculos R/TypeScript |
| `npm run test:r` | Normalización territorial y copia editorial |
| `npm run build` | Compilación local en `dist/` |
| `npm run build:pages` | Compilación para `/nuestra-ia/` en `dist-pages/` |
| `npm run preview:pages` | Probar el paquete que se publica |
| `npm run export:pages -- --site=../sociologia-uflo` | Copiar el paquete al repositorio del sitio |

## Documentación para retomar

- **[ARQUITECTURA.md](ARQUITECTURA.md):** estructura, modelo de datos, reglas,
  decisiones, flujo editorial y puntos de entrada para continuar el desarrollo.
- **[docs/APLICACION.md](docs/APLICACION.md):** autenticación, comandos y publicación.

Stack: React 19, TypeScript, Vite, Tailwind 4, Recharts, Leaflet y R.
El código fuente se respalda en `nuestra-ia`; el sitio Jekyll `sociologia-uflo`
recibe únicamente el compilado en `nuestra-ia/`.
