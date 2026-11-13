normalizar_territorios <- function(pais, provincia) {
  separar <- function(x) if (vacio(x)) character() else trimws(unlist(strsplit(x, '[|/]')))
  ps <- separar(pais); ts <- separar(provincia)
  if (length(ps) == 1L && length(ts)) {
    territorios <- lapply(ts, function(t) list(pais = ps[1], provincia = t))
  } else if (length(ps) && length(ts) == 1L && tolower(ts) == 'nacional') {
    territorios <- lapply(ps, function(p) list(pais = p, provincia = 'Nacional'))
  } else if (length(ps) && length(ps) == length(ts)) {
    territorios <- lapply(seq_along(ps), function(i) list(pais = ps[i], provincia = ts[i]))
  } else {
    territorios <- lapply(ps, function(p) list(pais = p, provincia = ''))
  }
  list(territorios = territorios, pendiente = !length(ps) || (length(ps) > 1L && length(ts) != length(ps) &&
    !(length(ts) == 1L && tolower(ts) == 'nacional')))
}
