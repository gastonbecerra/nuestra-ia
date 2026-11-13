# Arquitectura de Nuestra IA

## 1. Propósito y estado

Nuestra IA organiza una casuística curada de desarrollo, adopción, controversias y
riesgos de inteligencia artificial vinculados con América Latina. No es un censo
ni una medida representativa de adopción. La versión inicial publicada contiene
107 casos aprobados editorialmente; el número no debe codificarse en la interfaz.

Dos repositorios tienen responsabilidades distintas:

| Repositorio | Responsabilidad |
| --- | --- |
| `gastonbecerra/nuestra-ia` | Código fuente, copia de datos, pruebas y documentación |
| `gastonbecerra/sociologia-uflo`, rama `gh-pages` | Sitio Jekyll y archivos compilados en `nuestra-ia/` |

URL de la app: `https://www.recursossociologicos.ar/nuestra-ia/`.
Ejemplo de ficha: `/nuestra-ia/#/casos/IA-001`.

## 2. Stack y responsabilidades

- React 19 + TypeScript: componentes, navegación y analítica interactiva.
- Vite 6: servidor local y compilación estática.
- Tailwind CSS 4 + CSS propio: identidad blanca/violeta y diseño responsive.
- React Router: BrowserRouter local y HashRouter en GitHub Pages.
- Recharts: panel descriptivo de portada.
- Leaflet + topojson-client: cartografía local world-atlas/Natural Earth.
- Lucide: iconos.
- R: sincronización con Sheets, validación, normalización y análisis reproducible.
- ellmer/OpenRouter: herramienta editorial opcional; no se ejecuta en el navegador.

No hay backend ni base SQL. El navegador no recibe credenciales ni consulta Sheets
en cada visita. La publicación es un conjunto de archivos estáticos.

## 3. Árbol del proyecto

```text
src/
  main.tsx                 carga y valida el corpus; elige router
  App.tsx                  cabecera, navegación, rutas y pie
  navigation.ts            rutas/URLs compatibles con subcarpeta y hash
  data.ts                  tipos, filtros, frecuencias y cruces
  geo.ts                   códigos de país y puntos provinciales aproximados
  styles.css               identidad visual y responsive
  components/
    UI.tsx                 títulos, selects, etiquetas, tarjetas y estado vacío
    TerritoryMap.tsx        mapa país/provincia y panel de nacionales
  pages/
    Panorama.tsx            portada y panel descriptivo rotativo
    Comparisons.tsx         tres heatmaps entre países
    Cases.tsx              filtros, tarjetas y paginación
    Detail.tsx             ficha con URL permanente y evidencias
    Project.tsx            fundamentación, origen, metodología y referencias
data/casuistica.csv         copia editorial versionada, no editar en paralelo
public/data/
  corpus.json              paquete único generado por R
  world.json               cartografía local
scripts/
  actualizar_datos.R       rutina de actualización principal
  estadisticas.R           descriptivos de investigación
  cruces.R                 comparaciones y reportes exploratorios
  clasificar_llm.R         propuestas/aplicación territorial asistida
  autenticar.R             primera autorización interactiva de Google
  run-r.mjs                lanzador portable de R desde npm
  prepare-map.mjs          descarga reproducible de cartografía
  export-pages.mjs         copia compilado al checkout del sitio
  R/
    comunes.R              configuración, lectura, validación y OAuth
    territorios.R          normalización país–unidad subnacional
    campos_llm.R           catálogos e instrucciones versionadas
    revision_llm.R         tabla de revisión y preservación de notas
tests/
  analytics.test.ts        integridad y equivalencia con R
  data.R                   casos límite de territorios
  browser/app.spec.ts      recorridos desktop/móvil, local y Pages
config/base.json            origen editorial público y CSV de recuperación
docs/APLICACION.md          manual operativo
```

Carpetas locales ignoradas: `node_modules`, `dist`, `dist-pages`, `outputs`,
`test-results`, `backups`. No subir `.Renviron`, `.Renviron.local`, `.env`, tokens
ni claves. `.Renviron.example` solo contiene nombres y ejemplos sin secretos.

## 4. Datos: edición, recuperación y publicación

La fuente editorial única es el Google Sheet configurado en `config/base.json`,
pestaña `Casuística`. Todos sus registros están aprobados para aparecer; no se
exige ni se reconstruye una columna de revisión. Eliminar una fila en Sheets
la elimina de la siguiente versión publicada; no se recupera de bases antiguas.

```text
Sheets / Casuística
        │ una lectura
        ▼
validación + normalización de aliases, multivalores y territorios
        ├── data/casuistica.csv              copia cruda portable
        ├── public/data/corpus.json           casos + indicadores + cruces
        ├── outputs/analisis_actualizado.csv  inspección local
        └── Sheets / Análisis                tabla generada
```

`npm run data:update` ejecuta este circuito. `npm run data:local` usa explícitamente
el CSV versionado sin escribir en Google. No hay retorno silencioso a una base vieja
si falla Sheets. Si falla lectura/validación, se conserva el corpus anterior.
Si falla solo la escritura de `Análisis`, puede existir ya una copia local nueva;
el comando informa el fallo y se puede repetir sin crear casos duplicados.

El JSON es una instantánea autocontenida: `version`, `generado_en`, `fuente`,
`casos`, `indicadores`, `cruces`. El hash identifica el contenido normalizado y
la fecha indica sincronización, no revisión individual de todos los registros.
No mezclar manualmente piezas de dos versiones ni editar el JSON a mano.

## 5. Modelo editorial

ID persistente: `id_caso`, por ejemplo `IA-001`. Nunca renumerar IDs para cerrar huecos.

| Grupo | Columnas principales |
| --- | --- |
| Identidad | `id_caso`, `titulo`, `resumen_caso_100_palabras` |
| Geografía | `pais_actual`, `provincia_actual`, `alcance_territorial` |
| Fecha | `caso_anio` (año del caso, no fecha de captura) |
| Procedencia/evidencia | `fuente`, `autor` si existe, `curso`, `url`, `tipo_fuente` |
| Dimensiones | `ambito_no_exc`, `riesgos_no_exc`, `promesa_no_exc`, tecnologías, herramientas, actores |
| Contexto | población, condiciones, implementación, `comentarios` |

Se conservan campos adicionales en el CSV. El frontend recibe una proyección con
nombres estables (`id`, `resumen`, `anio`, `ambitos`, `riesgos`, etc.). Si se agrega
un campo para mostrarlo en la app, incorporarlo explícitamente a la rutina R, al
tipo `Case` de TypeScript y a la ficha.

La lectura conserva todo como texto y no convierte automáticamente `NA` en nulo.
Las etiquetas se separan por ` | `, se recortan y se cuentan una vez por caso.
Los valores ausentes/no aplicables no se cuentan como etiquetas analíticas.
Riesgos/promesas originales se conservan para distinguir desconocido y no aplica.
`fuente` puede ser estudiante, Atlas de Beliz u otra procedencia; `url` es evidencia.

## 6. Territorio y casos multinacionales

- Unidad subnacional de primer nivel: provincia, estado, departamento o región.
- `Nacional` significa alcance registrado a nivel país. No es una provincia ni
  se representa como un punto en la capital.
- Listas paralelas: `Argentina | Colombia` y `Nacional | Antioquia`.
- Para dos provincias del mismo país puede repetirse el país. Se admite también
  un país único acompañado de varias unidades, y `/` heredado como separador.
- Varios países y un único `Nacional` se vinculan a nivel nacional con esos países.
- Si no puede establecerse correspondencia, se conservan los países y se señala
  `territorio_pendiente`; no se inventa la asignación provincial.
- Un caso con varios territorios sigue siendo un caso en el total.

Portada: modo país con intensidad por cantidad; modo provincia con puntos
administrativos aproximados y nacionales en panel separado. No son coordenadas
de los acontecimientos. La tabla de referencia está en `src/geo.ts`; lo no
representable sigue disponible en Casuística. Natural Earth es de dominio público.

## 7. Páginas y decisiones de producto

| Ruta interna | Función |
| --- | --- |
| `/` | Indicadores, mapa y panel que rota cada ocho segundos, con pausa |
| `/comparaciones` | Países × ámbitos, riesgos y promesas, siempre todas las localizaciones |
| `/casos` | Búsqueda, filtros combinables, tarjetas y paginación; sin exportación |
| `/casos/:id` | Ficha, enlaces a evidencia y retorno con la selección |
| `/proyecto` | Texto editorial y referencias; anchors accesibles |

Comparaciones comparte selección de países, año y conteo/porcentaje entre los
tres heatmaps; muestra hasta doce categorías de mayor frecuencia en cada uno.
No hay selector de escala, localización ni dimensión. Los parámetros viejos se
limpian de la URL. Las celdas enlazan a Casuística con filtros exactos.

No reintroducir textos o controles retirados sin revisar la intención del producto:
portada compacta, sin logo tipográfico adicional; Casuística sin exportar; pocas
aclaraciones en vistas analíticas y explicación extensa concentrada en metodología.

## 8. Reglas analíticas

El navegador recalcula a partir de casos, no intentando filtrar una tabla agregada.
R produce tablas reproducibles y resultados de referencia. `npm test` compara
TODOS los cruces precalculados del paquete contra TypeScript.

- Conteos por combinación = IDs únicos, no apariciones de palabras.
- Porcentajes = casos de la categoría / total de casos del grupo filtrado.
- La cobertura (`casos_con_dato`) se informa aparte; faltantes no son negativos.
- Un caso puede pertenecer a varias categorías: sumas mayores que N o 100% son posibles.
- Los alcances se evalúan por vínculo territorial, no se transfieren entre países.
- El eje temporal respeta el año numérico y no interpreta frecuencias como prevalencia.

La pregunta «¿concentrar el relevamiento en Argentina, Colombia y Perú?» queda abierta.
`scripts/cruces.R` genera un reporte por grupos excluyentes, sin imponer ese recorte.

## 9. Publicación en GitHub Pages

Desarrollo: `BrowserRouter`, base `/`. Pages: modo Vite `pages`, base `/nuestra-ia/`
y `HashRouter`. Esto evita depender de una regla de servidor que Pages no ofrece.

Siempre usar `assetUrl()` para archivos públicos; `currentSearchParams()` y
`currentRoute()` para leer la ruta actual; `routeHref()` para enlaces DOM fuera
de React Router (popups del mapa). En componentes usar `Link`/`NavLink`, incluyendo
anchors de Proyecto. No construir rutas con `/data/...` ni `location.search` crudo.

```text
fuente + datos validados → build:pages → dist-pages/
       → export-pages.mjs → sociologia-uflo/nuestra-ia/
       → commit/push gh-pages → Jekyll/GitHub Pages
```

La exportación valida el remote destino y solo reemplaza una carpeta identificada
como Nuestra IA. `version.json` registra commit fuente, versión de datos, fecha y N.
No modifica `CNAME`, tema ni configuración general del sitio. La integración agrega
un enlace desde el listado de herramientas de la portada de Recursos Sociológicos.

El workflow de este repo verifica y produce un artefacto Pages; no tiene secretos
de Google/OpenRouter ni publica automáticamente en otro repositorio.
Las credenciales de GitHub y el token OAuth siguen en los almacenes locales del usuario.

## 10. Retomar el trabajo

1. Leer este documento y `docs/APLICACION.md`.
2. `git pull --ff-only`, `npm ci`, `npm run dev`.
3. Confirmar si el cambio es editorial (Sheets), de análisis (R y TS) o visual (`src/`).
4. No usar los CSV históricos como una segunda base de edición.
5. Tras cambios de datos: sincronizar, verificar tests y revisar la UI.
6. Tras cambios de navegación: probar local y Pages, incluyendo recarga de ficha
   y anchors en Proyecto.
7. Commit/push en el repo fuente; exportar; commit/push en el sitio; verificar URL.

Los importadores TS→CSV→Sheets y pruebas de migración se retiraron. El respaldo
local previo está en `backups/pre-limpieza-2026-11-13.zip` (ignorado por Git).
El estado actual reproducible queda en GitHub con CSV editorial y paquete JSON.
