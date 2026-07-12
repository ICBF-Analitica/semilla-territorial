library(readxl)
library(dplyr)
library(purrr)
library(janitor)

ruta <- "Desnutrición/"

archivos <- list.files(
  path = ruta,
  pattern = "\\.xlsx$",
  full.names = TRUE
)

unir_archivos <- function(archivo) {
  
  read_excel(
    path = archivo,
    col_names = TRUE,
    col_types = "text",
    .name_repair = "minimal"
  ) %>%
    clean_names() %>%
    mutate(
      archivo_origen = basename(archivo)
    )
}

consolidado_desnutricion <- map_dfr(archivos, unir_archivos)

consolidado_desnutricion <- consolidado_desnutricion %>%
  mutate(
    cod_dpto_r = str_trim(as.character(cod_dpto_r)),
    cod_mun_r = str_trim(as.character(cod_mun_r)),
    cod_dpto_r = str_pad(cod_dpto_r, 2, pad = "0"),
    cod_mun_r = str_pad(cod_mun_r, 3, pad = "0"),
    divipola = paste0(cod_dpto_r, cod_mun_r)
  )


desnutricion_mensual <- consolidado_desnutricion %>%
  mutate(
    time_txt = as.character(fec_not),
    fecha = case_when(
      grepl("^\\d+$", time_txt) ~ as.Date(as.numeric(time_txt), origin = "1899-12-30"),
      TRUE ~ as.Date(ymd_hm(time_txt, quiet = TRUE))),
    #time = ymd_hm(time, quiet = TRUE),
    anio = year(fecha),
    mes = month(fecha)
  ) %>%
  group_by(divipola, anio, mes) %>%
  summarise(
    cantidad=n(),
    .groups = "drop"
  )


