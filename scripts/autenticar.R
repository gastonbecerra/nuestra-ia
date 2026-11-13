# Ejecutar con source() desde una consola interactiva de R o RStudio.
if (!interactive()) stop(
  'La autorización inicial requiere una consola interactiva de R o RStudio.\n',
  'Desde allí: source("scripts/autenticar.R", encoding = "UTF-8")', call. = FALSE)
source('scripts/R/comunes.R', encoding = 'UTF-8')
autenticar()
message('Autorización completada. Token guardado en la caché local de usuario.\n',
  'Ya podés cerrar R y repetir la importación con Rscript.')
