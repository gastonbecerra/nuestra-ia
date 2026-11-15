# Lee Casuística y genera el paquete estático del dashboard. Nunca escribe en Sheets.
source('scripts/R/comunes.R', encoding = 'UTF-8')
source('scripts/R/territorios.R', encoding = 'UTF-8')
destino <- 'public/data'
dir.create(destino, recursive = TRUE, showWarnings = FALSE)
d <- validar(normalizar_base(leer_sheet()))
if (!nrow(d)) stop('La fuente está vacía; se conserva la versión anterior')
campo <- function(i, n) if (n %in% names(d)) d[[n]][i] else ''
registros <- lapply(seq_len(nrow(d)), function(i) {
  geo <- normalizar_territorios(d$caso_pais[i], campo(i, 'caso_provincia'))
  list(id = d$id_caso[i], titulo = d$titulo[i], resumen = campo(i, 'resumen_caso_100_palabras'),
    anio = campo(i, 'caso_anio'), fuente = campo(i, 'fuente'),
    urls = as.list(valores(d$url[i])), territorios = geo$territorios,
    pais_original = d$caso_pais[i], provincia_original = campo(i, 'caso_provincia'),
    ambitos = as.list(valores(campo(i, 'ambito_no_exc'))),
    tecnologias = as.list(valores(campo(i, 'tipo_herramienta_ia_no_exc'))),
    herramientas = as.list(valores(campo(i, 'nombre_herramienta_ia_no_exc'))),
    actores = as.list(valores(campo(i, 'actores_institucionales_no_exc'))),
    riesgos = as.list(valores(campo(i, 'riesgos_no_exc'))),
    promesas = as.list(valores(campo(i, 'promesa_no_exc'))),
    riesgos_original = campo(i, 'riesgos_no_exc'), promesas_original = campo(i, 'promesa_no_exc'),
    poblaciones = as.list(valores(campo(i, 'poblacion_involucrada_no_exc'))),
    condiciones = as.list(valores(campo(i, 'condiciones_no_exc'))),
    implementacion = as.list(valores(campo(i, 'tipo_implementacion_no_exc'))),
    tipo_fuente = campo(i, 'tipo_fuente'), comentarios = campo(i, 'comentarios'),
    territorio_pendiente = geo$pendiente)
})
dimensiones <- c('ambitos', 'tecnologias', 'herramientas', 'actores', 'riesgos', 'promesas')
frecuencia <- function(casos, dimension) {
  x <- table(unlist(lapply(casos, function(c) unique(unlist(c[[dimension]])))))
  lapply(names(x), function(n) list(categoria = n, n_casos = unname(as.integer(x[[n]]))))
}
indicadores <- list(casos = length(registros), anios = length(unique(d$caso_anio[grepl('^[12][0-9]{3}$', d$caso_anio)])),
  con_url = sum(lengths(lapply(registros, function(c) c$urls)) > 0))
for (dim in dimensiones) indicadores[[dim]] <- length(frecuencia(registros, dim))
cruces <- list()
todos_paises <- sort(unique(unlist(lapply(registros, function(c) vapply(c$territorios, `[[`, '', 'pais')))))
for (pais in todos_paises) {
  subconjunto <- Filter(function(c) pais %in% vapply(c$territorios, `[[`, '', 'pais'), registros)
  for (dim in dimensiones) for (f in frecuencia(subconjunto, dim))
    cruces[[length(cruces) + 1L]] <- list(cruce = paste0('pais_x_', dim), grupo = pais,
      categoria = f$categoria, n_casos = f$n_casos, denominador = length(subconjunto),
      casos_con_dato = sum(vapply(subconjunto, function(c) length(c[[dim]]) > 0, logical(1))),
      porcentaje = round(100 * f$n_casos / length(subconjunto), 6))
}
fecha <- format(Sys.time(), tz = 'UTC', usetz = TRUE)
version <- substr(digest::digest(d, algo = 'sha256'), 1, 12)
bundle <- list(version = version, generado_en = fecha, fuente = 'Google Sheets',
  casos = registros, indicadores = indicadores, cruces = cruces)
temporal <- file.path(destino, 'corpus.pending.json')
jsonlite::write_json(bundle, temporal, auto_unbox = TRUE, pretty = TRUE, null = 'null', digits = NA)
verificado <- jsonlite::read_json(temporal, simplifyVector = FALSE)
stopifnot(length(verificado$casos) == nrow(d), verificado$version == version)
if (!file.copy(temporal, file.path(destino, 'corpus.json'), overwrite = TRUE)) stop('No se pudo actualizar corpus.json')
unlink(temporal)
message('Versión ', version, ': ', nrow(d), ' casos. Datos locales listos en public/data/corpus.json')
