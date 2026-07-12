library(dplyr)
library(lubridate)
library(fixest)
library(tidyr)

# Ajustar nombres de columnas en cobertura
cobertura <- consolidado_cobertura %>%
  rename(
    divipola = Divipola,
    anio = year,
    mes = month
  )

# Consolidar
base_consolidada <- cobertura %>%
  left_join(clima_mensual,
            by = c("divipola", "anio", "mes")) %>%
  left_join(
    desnutricion_mensual %>%
      rename(casos_desnutricion = cantidad),
    by = c("divipola", "anio", "mes")
  )

base_consolidada <- clima_mensual %>%
  full_join(desnutricion_mensual,
            by = c("divipola", "anio", "mes")) %>%
  full_join(
    consolidado_cobertura %>%
      rename(
        divipola = Divipola,
        anio = year,
        mes = month
      ),
    by = c("divipola", "anio", "mes")
  )



base_panel <- base_consolidada %>%
  mutate(
    fecha = make_date(anio, mes, 1),
    divipola = as.character(divipola),
    cantidad = ifelse(is.na(cantidad), 0, cantidad)
  ) %>%
  arrange(divipola, fecha) %>%
  group_by(divipola) %>%
  mutate(
    cantidad_lag1 = lag(cantidad, 1),
    
    precipitation_lag1 = lag(precipitation_sum_mm, 1),
    precipitation_lag2 = lag(precipitation_sum_mm, 2),
    precipitation_lag3 = lag(precipitation_sum_mm, 3),
    
    temperature_lag1 = lag(temperature_2m_mean_c, 1),
    temperature_lag2 = lag(temperature_2m_mean_c, 2),
    temperature_lag3 = lag(temperature_2m_mean_c, 3),
    
    ndvi_lag1 = lag(ndvi_mean, 1),
    ndvi_lag2 = lag(ndvi_mean, 2),
    ndvi_lag3 = lag(ndvi_mean, 3),
    
    ndmi_lag1 = lag(ndmi_mean, 1),
    ndmi_lag2 = lag(ndmi_mean, 2),
    ndmi_lag3 = lag(ndmi_mean, 3),
    
    bsi_lag1 = lag(bsi_mean, 1),
    bsi_lag2 = lag(bsi_mean, 2),
    bsi_lag3 = lag(bsi_mean, 3),
    
    evi_lag1 = lag(evi_mean, 1),
    evi_lag2 = lag(evi_mean, 2),
    evi_lag3 = lag(evi_mean, 3),
    
    msi_lag1 = lag(msi_mean, 1),
    msi_lag2 = lag(msi_mean, 2),
    msi_lag3 = lag(msi_mean, 3),
    
    ndbi_lag1 = lag(ndbi_mean, 1),
    ndbi_lag2 = lag(ndbi_mean, 2),
    ndbi_lag3 = lag(ndbi_mean, 3)
  ) %>%
  ungroup() %>%
  #filter(!is.na(cantidad_lag1))
  filter(
    !is.na(cantidad_lag1),
    !is.na(precipitation_lag3),
    !is.na(temperature_lag3),
    !is.na(ndvi_lag3),
    !is.na(ndmi_lag3),
    !is.na(bsi_lag3),
    !is.na(evi_lag3),
    !is.na(msi_lag3),
    !is.na(ndbi_lag3)
  )


modelo_poisson <- fixest::feglm(
  cantidad ~ 
    cantidad_lag1 +
    precipitation_sum_mm + precipitation_lag1 + precipitation_lag2 + precipitation_lag3 +
    temperature_2m_mean_c + temperature_lag1 + temperature_lag2 + temperature_lag3 +
    ndvi_mean + #ndvi_lag1 + ndvi_lag2 + ndvi_lag3 +
    ndmi_mean + #ndmi_lag1 + ndmi_lag2 + ndmi_lag3 +
    bsi_mean + bsi_lag1 + bsi_lag2 + bsi_lag3 +
    evi_mean + #evi_lag1 + evi_lag2 + evi_lag3 +
    msi_mean + #msi_lag1 + msi_lag2 + msi_lag3 +
    ndbi_mean + ndbi_lag1 + ndbi_lag2 + ndbi_lag3 |
    divipola + fecha,
  data = base_panel,
  family = poisson(),
  cluster = ~ divipola
)

summary(modelo_poisson)
