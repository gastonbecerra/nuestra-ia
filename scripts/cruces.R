source('scripts/R/comunes.R', encoding = 'UTF-8')
d <- seleccionar(leer_datos())
campos <- c(ambito = 'ambito_no_exc', riesgo = 'riesgos_no_exc',
  tecnologia = 'tipo_herramienta_ia_no_exc', actor = 'actores_institucionales_no_exc',
  alcance = 'alcance_territorial', fuente = 'fuente')
vacia <- function() data.frame(cruce = character(), grupo = character(), categoria = character(),
  n_casos = integer(), denominador = integer(), casos_con_dato = integer(),
  porcentaje = numeric(), generado_en = character())
resultado <- vacia()
fecha <- format(Sys.time(), tz = 'UTC', usetz = TRUE)
cruzar <- function(grupos, categorias, nombre) {
  r <- vacia()
  for (grupo in sort(unique(unlist(grupos)))) {
    idx <- which(vapply(grupos, function(x) grupo %in% x, logical(1)))
    cats <- categorias[idx]
    con_dato <- sum(lengths(cats) > 0L)
    etiquetas <- sort(unique(unlist(cats)))
    if (!length(etiquetas)) etiquetas <- '(sin dato)'
    for (cat in etiquetas) {
      n <- if (cat == '(sin dato)') sum(lengths(cats) == 0L) else
        sum(vapply(cats, function(x) cat %in% x, logical(1)))
      r <- rbind(r, data.frame(cruce = nombre, grupo = grupo, categoria = cat,
        n_casos = n, denominador = length(idx), casos_con_dato = con_dato,
        porcentaje = round(100 * n / length(idx), 2), generado_en = fecha))
    }
    if (length(etiquetas) && !'(sin dato)' %in% etiquetas && con_dato < length(idx))
      r <- rbind(r, data.frame(cruce = nombre, grupo = grupo, categoria = '(sin dato)',
        n_casos = length(idx) - con_dato, denominador = length(idx), casos_con_dato = con_dato,
        porcentaje = round(100 * (length(idx) - con_dato) / length(idx), 2), generado_en = fecha))
  }
  r
}
grupos <- lapply(d$caso_pais, function(x) {
  p <- intersect(paises(x), latam)
  if (length(p)) p else if (regional(x)) 'Regional sin país específico' else 'Fuera de región o sin determinar'
})
for (nombre in names(campos)) {
  col <- campos[[nombre]]
  cats <- if (col %in% names(d)) lapply(d[[col]], valores) else rep(list(character()), nrow(d))
  resultado <- rbind(resultado, cruzar(grupos, cats, paste0('pais_x_', nombre)))
}
if (all(c('ambito_no_exc', 'riesgos_no_exc') %in% names(d)))
  resultado <- rbind(resultado, cruzar(lapply(d$ambito_no_exc, valores),
    lapply(d$riesgos_no_exc, valores), 'ambito_x_riesgo'))

# Pregunta editorial: ¿conviene limitar el corpus a Argentina, Colombia y Perú?
# Los grupos son excluyentes para no ocultar los casos multinacionales mixtos.
foco <- c('Argentina', 'Colombia', 'Perú')
segmento <- vapply(d$caso_pais, function(x) {
  p <- intersect(paises(x), latam)
  dentro <- any(p %in% foco)
  fuera <- any(!p %in% foco)
  if (dentro && fuera) 'Mixtos: foco y otros países' else if (dentro) 'Argentina, Colombia y Perú' else
    if (fuera) 'Otros países latinoamericanos' else if (regional(x)) 'Regional sin país específico' else
      if (vacio(x)) 'Sin país determinado' else 'Extrarregional o vínculo por revisar'
}, character(1))
a <- auditar(d)
comparacion <- data.frame(segmento = character(), n_casos = integer(), porcentaje_corpus = numeric(),
  con_url = integer(), con_unidad_subnacional = integer())
for (g in sort(unique(segmento))) {
  i <- which(segmento == g)
  subnac <- if ('caso_provincia' %in% names(d)) sum(vapply(d$caso_provincia[i], function(x)
    !vacio(x) && !tolower(trimws(x)) %in% c('nacional', 'global', 'regional'), logical(1))) else 0L
  comparacion <- rbind(comparacion, data.frame(segmento = g, n_casos = length(i),
    porcentaje_corpus = round(100 * length(i) / nrow(d), 2), con_url = sum(!a$sin_url[i]),
    con_unidad_subnacional = subnac))
}
guardar(resultado, 'cruces')
guardar(comparacion, 'comparacion_foco_arg_col_per')
print(comparacion, row.names = FALSE)
if (bandera('escribir-sheet')) {
  if (!nrow(resultado)) stop('Sin datos para actualizar Análisis; se conserva la versión anterior')
  escribir_pestana(resultado, 'Análisis')
}
