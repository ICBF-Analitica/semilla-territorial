library(readxl)
library(dplyr)
library(purrr)
library(janitor)
library(stringr)
library(lubridate)

ruta <- "Clima/"

archivos <- list.files(
  path = ruta,
  pattern = "^open-meteo-.*\\.xlsx$",
  full.names = TRUE
)

leer_open_meteo <- function(archivo) {
  
  bruto <- read_excel(
    archivo,
    col_names = FALSE,
    .name_repair = "minimal"
  )
  
  # Identificar filas de encabezado
  fila_tabla1 <- which(bruto[[1]] == "location_id")[1]
  fila_tabla2 <- which(bruto[[1]] == "location_id")[2]
  
  if (is.na(fila_tabla1) | is.na(fila_tabla2)) {
    warning(paste("No se encontraron dos tablas en:", archivo))
    return(NULL)
  }
  
  # Primera tabla: desde su encabezado hasta la fila anterior a la segunda tabla
  tabla1_raw <- bruto[fila_tabla1:(fila_tabla2 - 2), ]
  
  nombres_t1 <- as.character(tabla1_raw[1, ])
  nombres_t1[is.na(nombres_t1) | nombres_t1 == ""] <- "DIVIPOLA"
  
  tabla1 <- tabla1_raw[-1, ]
  names(tabla1) <- nombres_t1
  
  tabla1 <- tabla1 %>%
    remove_empty("cols") %>%
    clean_names() %>%
    mutate(
      archivo_origen = basename(archivo),
      location_id = as.character(location_id),
      divipola = as.character(divipola)
    )
  
  # Segunda tabla: desde su encabezado hasta el final
  tabla2_raw <- bruto[fila_tabla2:nrow(bruto), ]
  
  nombres_t2 <- as.character(tabla2_raw[1, ])
  
  tabla2 <- tabla2_raw[-1, ]
  names(tabla2) <- nombres_t2
  
  tabla2 <- tabla2 %>%
    remove_empty("cols") %>%
    clean_names() %>%
    mutate(
      archivo_origen = basename(archivo),
      location_id = as.character(location_id)
    )
  
  # Cruce dentro del archivo antes de consolidar
  consolidado_archivo <- tabla2 %>%
    left_join(
      tabla1,
      by = c("archivo_origen", "location_id")
    )
  
  consolidado_archivo
}

consolidado_open_meteo <- map_dfr(archivos, leer_open_meteo)

consolidado_open_meteo <- consolidado_open_meteo %>%
  mutate(
    time = as.POSIXct(time, format = "%Y-%m-%dT%H:%M", tz = "UTC"),
    latitude = as.numeric(latitude),
    longitude = as.numeric(longitude),
    elevation = as.numeric(elevation),
    temperature_2m_mean_c = as.numeric(temperature_2m_mean_c),
    precipitation_sum_mm = as.numeric(precipitation_sum_mm),
    utc_offset_seconds = as.numeric(utc_offset_seconds)
  )

clima_mensual <- consolidado_open_meteo %>%
  mutate(
    time_excel = as.numeric(time),
    time_txt = as.character(time),
    fecha = case_when(
      grepl("^\\d+$", time_txt) ~ as.Date(as.numeric(time_txt), origin = "1899-12-30"),
      TRUE ~ as.Date(ymd_hm(time_txt, quiet = TRUE))),
    #time = ymd_hm(time, quiet = TRUE),
    anio = year(fecha),
    mes = month(fecha)
  ) %>%
  group_by(divipola, anio, mes) %>%
  summarise(
    precipitation_sum_mm = sum(as.numeric(precipitation_sum_mm), na.rm = TRUE),
    temperature_2m_mean_c = mean(as.numeric(temperature_2m_mean_c), na.rm = TRUE),
    .groups = "drop"
  )

head(consolidado_open_meteo$time)
