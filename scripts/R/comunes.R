# Utilidades operativas. Sheets es la fuente editorial; data/ es la copia versionada.
if (file.exists('.Renviron')) readRenviron('.Renviron')
if (file.exists('.Renviron.local')) readRenviron('.Renviron.local')
requerir <- function(pkgs) {
  faltan <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  if (length(faltan)) stop('Instalar paquetes: ', paste(faltan, collapse = ', '))
}
requerir(c('readr', 'googlesheets4', 'jsonlite'))
config_base <- function() jsonlite::read_json('config/base.json', simplifyVector = TRUE)
sheet_id <- function() Sys.getenv('GOOGLE_SHEET_ID', config_base()$sheet_id)
sheet_tab <- function() Sys.getenv('GOOGLE_SHEET_TAB', config_base()$pestana)
args <- commandArgs(trailingOnly = TRUE)
opcion <- function(nombre, defecto = NULL) {
  x <- args[startsWith(args, paste0('--', nombre, '='))]
  if (length(x)) sub(paste0('^--', nombre, '='), '', x[[1]]) else defecto
}
bandera <- function(nombre) paste0('--', nombre) %in% args
salida <- opcion('salida', 'outputs')
dir.create(salida, recursive = TRUE, showWarnings = FALSE)
guardar <- function(datos, nombre) readr::write_excel_csv(datos, file.path(salida, paste0(nombre, '.csv')), na = '')
lista <- function(x) {
  if (!length(x) || is.na(x) || !nzchar(trimws(x))) return(character())
  unique(trimws(strsplit(x, '|', fixed = TRUE)[[1]]))
}
valores <- function(x) {
  z <- lista(x)
  z[!tolower(z) %in% c('', 'na', 'n/a', 'n_a', 's/d', 's_d', 'sd', 'no aplica',
    'no_aplica', 'no especificada', 'no_especificada', 'no especificado', 'no_especificado')]
}
vacio <- function(x) !length(valores(x))
alias_base <- c(pais_actual = 'caso_pais', provincia_actual = 'caso_provincia',
  pais = 'caso_pais', provincia = 'caso_provincia', valor = 'alcance_territorial')
normalizar_base <- function(d) {
  for (destino in unique(alias_base)) {
    n <- intersect(names(alias_base)[alias_base == destino], names(d))
    if (length(n)) d[[destino]] <- d[[n[1]]]
  }
  d
}
validar <- function(d) {
  obligatorias <- c('id_caso', 'titulo', 'caso_pais', 'url')
  if (!all(obligatorias %in% names(d))) stop('Faltan columnas: ', paste(setdiff(obligatorias, names(d)), collapse = ', '))
  if (anyNA(names(d)) || any(!nzchar(names(d))) || anyDuplicated(names(d))) stop('Encabezados vacíos o duplicados')
  if (!nrow(d) || anyNA(d$id_caso) || any(!nzchar(trimws(d$id_caso))) || anyDuplicated(trimws(d$id_caso)))
    stop('IDs vacíos, duplicados o corpus vacío')
  d
}
leer_csv <- function(archivo) {
  d <- readr::read_csv(archivo, col_types = readr::cols(.default = readr::col_character()),
    na = character(), name_repair = 'minimal', show_col_types = FALSE)
  if (nrow(readr::problems(d))) stop('CSV con errores de estructura')
  as.data.frame(d)
}
autenticar <- function() {
  email <- Sys.getenv('GOOGLE_EMAIL', '')
  tryCatch(googlesheets4::gs4_auth(email = if (nzchar(email)) email else TRUE, cache = TRUE), error = function(e) {
    if (interactive()) stop(e)
    stop('Autorizar primero desde R interactivo: source("scripts/autenticar.R", encoding="UTF-8"). ',
      conditionMessage(e), call. = FALSE)
  })
}
leer_sheet <- function(crudo = FALSE) {
  googlesheets4::gs4_deauth()
  d <- as.data.frame(googlesheets4::read_sheet(sheet_id(), sheet = sheet_tab(), col_types = 'c', .name_repair = 'minimal'))
  d[] <- lapply(d, function(x) { x[is.na(x)] <- ''; x })
  if (crudo) d else validar(normalizar_base(d))
}
archivo_datos <- function() {
  archivo <- opcion('archivo', Sys.getenv('CASUISTICA_ARCHIVO', ''))
  if (nzchar(archivo)) return(archivo)
  if (bandera('desde-local') || !identical(config_base()$fuente, 'google_sheets')) return(config_base()$archivo)
  NULL
}
leer_datos <- function() {
  archivo <- archivo_datos()
  if (is.null(archivo)) leer_sheet() else validar(normalizar_base(leer_csv(archivo)))
}
latam <- c('Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'Guatemala', 'Haití', 'Honduras', 'México', 'Nicaragua',
  'Panamá', 'Paraguay', 'Perú', 'República Dominicana', 'Uruguay', 'Venezuela', 'Belice', 'Puerto Rico')
paises <- function(x) unique(trimws(unlist(strsplit(paste(valores(x), collapse = '/'), '/', fixed = TRUE))))
regional <- function(x) any(valores(x) %in% c('América Latina y el Caribe', 'América Latina'))
seleccionar <- function(d) {
  pais <- opcion('pais')
  if (!is.null(pais)) d <- d[vapply(d$caso_pais, function(x) pais %in% paises(x), logical(1)), , drop = FALSE]
  d
}
frecuencias <- function(d, campo) {
  etiquetas <- if (campo %in% names(d)) unlist(lapply(d[[campo]], valores), use.names = FALSE) else character()
  t <- sort(table(etiquetas), decreasing = TRUE)
  data.frame(categoria = names(t), n_casos = as.integer(t))
}
auditar <- function(d) data.frame(id_caso = d$id_caso,
  sin_url = !vapply(d$url, function(x) any(grepl('^https?://[^ /]+', valores(x))), logical(1)))
escribir_pestana <- function(d, nombre) {
  autenticar()
  if (!nombre %in% googlesheets4::sheet_names(sheet_id())) googlesheets4::sheet_add(sheet_id(), sheet = nombre)
  googlesheets4::sheet_write(d, ss = sheet_id(), sheet = nombre)
}
