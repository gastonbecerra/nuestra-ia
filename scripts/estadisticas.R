source('scripts/R/comunes.R', encoding = 'UTF-8')
corpus <- leer_datos()
d <- seleccionar(corpus)
campos <- c(ambitos = 'ambito_no_exc', herramientas = 'nombre_herramienta_ia_no_exc',
  tecnologias = 'tipo_herramienta_ia_no_exc', riesgos = 'riesgos_no_exc',
  promesas = 'promesa_no_exc', actores = 'actores_institucionales_no_exc')
resumen <- data.frame(indicador = c('casos_corpus', 'casos_seleccionados'),
  valor = c(nrow(corpus), nrow(d)))
for (nombre in names(campos)) {
  campo <- campos[[nombre]]
  tabla <- frecuencias(d, campo)
  guardar(tabla, paste0('frecuencia_', nombre))
  resumen <- rbind(resumen, data.frame(indicador = paste0(nombre, '_distintos'), valor = nrow(tabla)))
  # Cobertura separada de frecuencia: una ausencia no equivale a un negativo.
  registrados <- if (campo %in% names(d)) sum(!vapply(d[[campo]], vacio, logical(1))) else 0L
  resumen <- rbind(resumen, data.frame(indicador = paste0(nombre, '_casos_con_dato'), valor = registrados))
}
anios <- if ('caso_anio' %in% names(d)) trimws(d$caso_anio) else rep('', nrow(d))
validos <- grepl('^[12][0-9]{3}$', anios)
guardar(data.frame(anio = sort(unique(anios[validos])),
  n_casos = as.integer(table(anios[validos]))), 'serie_temporal')
loc <- if ('caso_provincia' %in% names(d)) vapply(d$caso_provincia, function(x)
  !vacio(x) && !tolower(trimws(x)) %in% c('nacional', 'global', 'regional'), logical(1)) else rep(FALSE, nrow(d))
claves <- if (any(loc)) paste(d$caso_pais[loc], d$caso_provincia[loc], sep = ' / ') else character()
a <- auditar(d)
resumen <- rbind(resumen, data.frame(indicador = c('anios_distintos', 'casos_sin_anio_valido',
  'unidades_subnacionales_distintas', 'casos_con_unidad_subnacional', 'casos_con_url'),
  valor = c(length(unique(anios[validos])), sum(!validos), length(unique(claves)),
    sum(loc), sum(!a$sin_url))))
guardar(resumen, 'indicadores')
print(resumen, row.names = FALSE)
message('País: ', opcion('pais', 'todos'))
