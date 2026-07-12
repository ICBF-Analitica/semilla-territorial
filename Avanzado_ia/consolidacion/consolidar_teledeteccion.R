library(readxl)
library(dplyr)
library(purrr)
library(janitor)
library(writexl)

ruta <- "Teledetección/"

archivos <- list.files(
  path = ruta,
  pattern = "\\.csv$",
  full.names = TRUE
)

unir_archivos_csv <- function(archivo) {
  
  read.csv(
     archivo,
    #col_names = TRUE,
    #col_types = "text",
    #.name_repair = "minimal"
  ) %>%
    clean_names() %>%
    mutate(
      archivo_origen = basename(archivo)
    )
}

consolidado_cobertura <- map_dfr(archivos, unir_archivos_csv)

listado<-unique(consolidado_cobertura[,c(3:5)])

#write_xlsx(listado,"listado.xlsx")

listado<-read_xlsx("listado.xlsx")

consolidado_cobertura<-consolidado_cobertura%>%left_join(listado)

consolidado_cobertura%>%group_by(Divipola)%>%filter(is.na(Contar))%>%summarise(n=n())

consolidado_cobertura<-consolidado_cobertura%>%filter(Contar=="Si")
