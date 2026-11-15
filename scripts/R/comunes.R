# Utilidades del pipeline de lectura de Google Sheets.
if (file.exists('.Renviron')) readRenviron('.Renviron')
if (file.exists('.Renviron.local')) readRenviron('.Renviron.local')
requerir <- function(pkgs) {
  faltan <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  if (length(faltan)) stop('Instalar paquetes: ', paste(faltan, collapse = ', '))
}
requerir(c('readr', 'googlesheets4', 'jsonlite', 'digest'))
sheet_id <- function() Sys.getenv('GOOGLE_SHEET_ID',
  '16BfWHSFpgo00CUWoYjt3RzA1Q9PMp9lWHH2l7l_yV_8')
sheet_tab <- function() Sys.getenv('GOOGLE_SHEET_TAB', 'Casuística')
args <- commandArgs(trailingOnly = TRUE)
opcion <- function(nombre, defecto = NULL) {
  x <- args[startsWith(args, paste0('--', nombre, '='))]
  if (length(x)) sub(paste0('^--', nombre, '='), '', x[[1]]) else defecto
}
bandera <- function(nombre) paste0('--', nombre) %in% args
salida <- opcion('salida', 'outputs')
guardar <- function(datos, nombre) {
  dir.create(salida, recursive = TRUE, showWarnings = FALSE)
  readr::write_excel_csv(datos, file.path(salida, paste0(nombre, '.csv')), na = '')
}
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
  pais = 'caso_pais', provincia = 'caso_provincia')
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
leer_sheet <- function(crudo = FALSE) {
  googlesheets4::gs4_deauth()
  d <- as.data.frame(googlesheets4::read_sheet(sheet_id(), sheet = sheet_tab(), col_types = 'c', .name_repair = 'minimal'))
  d[] <- lapply(d, function(x) { x[is.na(x)] <- ''; x })
  if (crudo) d else validar(normalizar_base(d))
}
leer_datos <- function() leer_sheet()
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
