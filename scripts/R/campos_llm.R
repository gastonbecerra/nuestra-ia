# Agregar aquí futuras dimensiones; el ejecutor sirve para todos los campos.
campos_llm <- list(
  alcance_territorial = list(
    version = '3',
    valores = c('subnacional', 'nacional', 'multinacional', 'regional', 'no_determinado'),
    instrucciones = paste(
      'Clasificá el alcance del caso, no el domicilio del proveedor ni de la fuente.',
      'subnacional: una o varias provincias/departamentos/regiones/localidades de un país.',
      'nacional: política, regulación, programa o implementación de alcance nacional explícito.',
      'multinacional: caso concreto que abarca varios países identificados.',
      'regional: alcance explícito de América Latina sin países determinados.',
      'no_determinado: evidencia insuficiente o alcance global/extrarregional ambiguo.',
      'Que el campo país tenga un solo país NO basta para afirmar alcance nacional.',
      'El valor Nacional en provincia es un indicio heredado, no prueba suficiente por sí solo.',
      'No navegues ni supongas que leíste los enlaces. Usá solo los datos entregados.',
      'Devolvé evidencia como cita textual exacta del título o resumen; si no hay evidencia,',
      'usá no_determinado y evidencia vacía. No infieras causalidad.',
      'Además revisá caso_pais y caso_provincia. Devolvé pais y provincia propuestos,',
      'y evidencia_pais y evidencia_provincia como citas exactas que respalden cada cambio.',
      'Conservá los valores actuales si no existe evidencia suficiente para corregirlos.',
      'Provincia significa unidad de primer nivel: provincia argentina, departamento colombiano,',
      'departamento/región peruana o equivalente. No devuelvas ciudades ni distritos como provincias.',
      'No uses conocimiento externo para convertir ciudades en provincias: conservá y explicá la duda.',
      'Para alcance nacional no asignes la capital ni todas las provincias: usá Nacional.',
      'Si el alcance nacional está respaldado y provincia contiene Nacional o una capital asignada',
      'sin evidencia de implementación local, proponé provincia Nacional con evidencia y explicación.',
      'Múltiples territorios usan listas paralelas separadas por | en pais y provincia.',
      'Cada posición debe corresponder al mismo par; repetí país si hay varias provincias.',
      'Ejemplo: pais Argentina | Colombia y provincia Nacional | Antioquia.',
      'No confundas país del proveedor con el del caso. No asignes Nacional por ausencia de datos.',
      'Los datos actuales son antecedentes revisables, no hechos comprobados.',
      'Si conservás un territorio sin evidencia nueva, su evidencia puede ser vacía.'
    )
  )
)
entrada_llm <- function(d, i) {
  campos <- intersect(c('titulo', 'resumen_caso_100_palabras', 'caso_pais', 'caso_provincia',
    'alcance_territorial'), names(d))
  jsonlite::toJSON(as.list(d[i, campos, drop = FALSE]), auto_unbox = TRUE)
}
validar_territorio <- function(pais, provincia, evidencia_pais, evidencia_provincia, entrada) {
  previo <- jsonlite::fromJSON(entrada)
  for (par in list(c('caso_pais', pais, evidencia_pais), c('caso_provincia', provincia, evidencia_provincia))) {
    if (length(par) != 3L || anyNA(par)) stop('Territorio o evidencia inválidos')
    actual <- previo[[par[1]]]
    if (is.null(actual)) actual <- ''
    if (par[2] != actual) {
      if (!nzchar(trimws(par[3]))) stop('Corrección territorial sin evidencia')
      textos <- unlist(previo[c('titulo', 'resumen_caso_100_palabras')], use.names = FALSE)
      if (!any(vapply(textos, function(x) grepl(par[3], x, fixed = TRUE), logical(1))))
        stop('La evidencia de corrección territorial no aparece en título/resumen')
    }
  }
  invisible(TRUE)
}
validar_propuesta <- function(valor, evidencia, entrada, config) {
  if (length(valor) != 1L || is.na(valor) || !valor %in% config$valores)
    stop('Valor fuera de catálogo')
  if (length(evidencia) != 1L || is.na(evidencia)) stop('Evidencia inválida')
  textos <- unlist(jsonlite::fromJSON(entrada), use.names = FALSE)
  if (nzchar(evidencia) && !any(vapply(textos, function(x)
      grepl(evidencia, x, fixed = TRUE), logical(1)))) stop('La evidencia no es una cita del registro')
  if (valor != 'no_determinado' && !nzchar(trimws(evidencia))) stop('Clasificación sin evidencia')
  invisible(TRUE)
}
