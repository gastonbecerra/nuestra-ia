# La tabla incluye todo el corpus, no solo respuestas exitosas del modelo.
tabla_revision <- function(d, propuestas, campo, version, errores = data.frame()) {
  filas <- lapply(seq_len(nrow(d)), function(i) {
    p <- if (nrow(propuestas)) propuestas[propuestas$id_caso == d$id_caso[i] &
      propuestas$campo == campo & propuestas$version_prompt == version &
      propuestas$entrada == as.character(entrada_llm(d, i)), , drop = FALSE] else data.frame()
    if (nrow(p)) p <- tail(p, 1)
    dato <- function(n, defecto = '') if (nrow(p) && n %in% names(p)) p[[n]][1] else defecto
    fallo <- nrow(errores) && d$id_caso[i] %in% errores$id_caso
    estado <- if (!nrow(p)) {
      if (fallo) 'error_clasificacion' else 'sin_propuesta'
    } else if (dato('valor') == 'no_determinado') 'requiere_revision_manual' else 'propuesta_disponible'
    data.frame(id_caso = d$id_caso[i], titulo = d$titulo[i], url = d$url[i],
      fuente = if ('fuente' %in% names(d)) d$fuente[i] else '',
      estado_revision_ia = estado, alcance_actual = d[[campo]][i],
      pais_actual = d$caso_pais[i], provincia_actual = d$caso_provincia[i],
      valor = dato('valor'), pais = dato('pais'), provincia = dato('provincia'),
      evidencia = dato('evidencia'), evidencia_pais = dato('evidencia_pais'),
      evidencia_provincia = dato('evidencia_provincia'), justificacion = dato('justificacion'),
      modelo = dato('modelo'), version_prompt = dato('version_prompt'),
      comentarios_revision = '', stringsAsFactors = FALSE)
  })
  if (!length(filas)) stop('No hay casos para revisar')
  do.call(rbind, filas)
}
publicar_revision <- function(d, propuestas, campo, version) {
  errores_archivo <- file.path(salida, 'errores_llm.csv')
  errores <- if (file.exists(errores_archivo)) as.data.frame(readr::read_csv(errores_archivo,
    col_types = readr::cols(.default = readr::col_character()), na = character(), show_col_types = FALSE)) else data.frame()
  revision <- tabla_revision(d, propuestas, campo, version, errores)
  if (bandera('escribir-sheet')) {
    autenticar()
    if ('Revisión IA' %in% googlesheets4::sheet_names(sheet_id())) {
      anterior <- as.data.frame(googlesheets4::read_sheet(sheet_id(), sheet = 'Revisión IA', col_types = 'c'))
      if ('id_caso' %in% names(anterior) && anyDuplicated(anterior$id_caso))
        stop('IDs duplicados en Revisión IA: corregir antes de regenerar')
      # Las notas manuales se conservan aunque se regenere la propuesta.
      if (all(c('id_caso', 'comentarios_revision') %in% names(anterior))) {
        idx <- match(revision$id_caso, anterior$id_caso)
        ok <- !is.na(idx)
        revision$comentarios_revision[ok] <- anterior$comentarios_revision[idx[ok]]
        revision$comentarios_revision[is.na(revision$comentarios_revision)] <- ''
      }
    }
    escribir_pestana(revision, 'Revisión IA')
  }
  guardar(revision, 'revision_ia')
  message(nrow(revision), ' casos en revisión, incluidos pendientes y no determinados. Escritura Google: ',
    bandera('escribir-sheet'))
}
