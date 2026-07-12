library(dplyr)
library(tidyr)
library(lubridate)
library(plm)
library(splm)


variables_imputar <- c(
  "precipitation_sum_mm",
  "temperature_2m_mean_c",
  "ndvi_mean",
  "ndmi_mean",
  "bsi_mean"
)

base_panel <- base_consolidada %>%
  mutate(
    divipola = as.character(divipola),
    fecha = make_date(anio, mes, 1),
    cantidad = ifelse(is.na(cantidad), 0, cantidad)
  ) %>%
  group_by(divipola, anio, mes, fecha) %>%
  summarise(
    cantidad = max(cantidad, na.rm = TRUE),
    precipitation_sum_mm = mean(precipitation_sum_mm, na.rm = TRUE),
    temperature_2m_mean_c = mean(temperature_2m_mean_c, na.rm = TRUE),
    ndvi_mean = mean(ndvi_mean, na.rm = TRUE),
    ndmi_mean = mean(ndmi_mean, na.rm = TRUE),
    bsi_mean = mean(bsi_mean, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  mutate(
    across(
      all_of(variables_imputar),
      ~ ifelse(is.nan(.x), NA, .x)
    )
  )

fechas_completas <- seq(
  min(base_panel$fecha, na.rm = TRUE),
  max(base_panel$fecha, na.rm = TRUE),
  by = "month"
)

base_panel <- base_panel %>%
  filter(divipola %in% mun_base$divipola) %>%
  complete(
    divipola,
    fecha = fechas_completas
  ) %>%
  mutate(
    anio = year(fecha),
    mes = month(fecha),
    cantidad = ifelse(is.na(cantidad), 0, cantidad)
  )

base_panel <- base_panel %>%
  group_by(divipola, anio) %>%
  mutate(
    across(
      all_of(variables_imputar),
      ~ ifelse(
        is.na(.x),
        mean(.x, na.rm = TRUE),
        .x
      )
    )
  ) %>%
  ungroup() %>%
  mutate(
    across(
      all_of(variables_imputar),
      ~ ifelse(is.nan(.x), NA, .x)
    )
  )

base_panel <- base_panel %>%
  group_by(divipola) %>%
  mutate(
    across(
      all_of(variables_imputar),
      ~ ifelse(
        is.na(.x),
        mean(.x, na.rm = TRUE),
        .x
      )
    )
  ) %>%
  ungroup() %>%
  mutate(
    across(
      all_of(variables_imputar),
      ~ ifelse(is.nan(.x), NA, .x)
    )
  )

base_panel <- base_panel %>%
  arrange(divipola, fecha) %>%
  group_by(divipola) %>%
  mutate(
    cantidad_lag1 = lag(cantidad, 1),
    precipitation_lag1 = lag(precipitation_sum_mm, 1),
    precipitation_lag2 = lag(precipitation_sum_mm, 2),
    temperature_lag1 = lag(temperature_2m_mean_c, 1),
    ndvi_lag1 = lag(ndvi_mean, 1),
    ndmi_lag1 = lag(ndmi_mean, 1),
    bsi_lag1 = lag(bsi_mean, 1)
  ) %>%
  ungroup()

base_modelo_sp <- base_panel %>%
  filter(!is.na(cantidad)) %>%
  filter(!is.na(ndvi_mean)) %>%
  filter(divipola %in% mun_base$divipola) %>%
  mutate(
    divipola = factor(divipola, levels = mun_base$divipola)
  ) %>%
  arrange(divipola, fecha)

pdata <- pdata.frame(
  base_modelo_sp,
  index = c("divipola", "fecha")
)

base_modelo_sp %>%
  count(divipola, fecha) %>%
  filter(n > 1)

pdim(pdata)

municipios_panel <- base_modelo_sp %>%
  distinct(divipola) %>%
  arrange(divipola) %>%
  pull(divipola)

mun_panel <- mun_base %>%
  mutate(divipola = as.character(divipola)) %>%
  filter(divipola %in% municipios_panel) %>% #$divipola
  arrange(divipola)

vecinos_panel <- poly2nb(
  mun_panel,
  queen = TRUE
)

W_panel <- nb2listw(
  vecinos_panel,
  style = "W",
  zero.policy = TRUE
)

base_modelo_sp <- base_modelo_sp %>%
  mutate(
    divipola = factor(divipola, levels = mun_panel$divipola)
  ) %>%
  arrange(divipola, fecha)

pdata <- pdata.frame(
  base_modelo_sp,
  index = c("divipola", "fecha")
)

pdim(pdata)

modelo_spatial_panel <- spml(
  cantidad ~
    #cantidad_lag1 +
    temperature_2m_mean_c+
    precipitation_lag1+
    #ndvi_mean +
    #ndmi_mean +
    bsi_mean,
  data = pdata,
  listw = W_panel,
  model = "within",
  effect = "twoways",
  lag = TRUE,
  spatial.error = "none",
  zero.policy = TRUE
)

summary(modelo_spatial_panel)


vars_modelo <- c(
  "cantidad",
  "cantidad_lag1",
  "temperature_2m_mean_c",
  "precipitation_lag1",
  "ndvi_mean",
  "ndmi_mean",
  "bsi_lag1"
)

colSums(is.na(base_modelo_sp[vars_modelo]))



#################################################################3
library(dplyr)
library(plm)
library(splm)

base_sp <- base_modelo_sp %>%
  mutate(
    divipola = as.character(divipola),
    periodo = as.integer(factor(fecha, levels = sort(unique(fecha))))
  ) %>%
  filter(divipola %in% mun_panel$divipola) %>%
  mutate(
    divipola = factor(divipola, levels = mun_panel$divipola)
  ) %>%
  arrange(divipola, periodo)

nrow(base_sp)
length(unique(base_sp$divipola))
length(unique(base_sp$periodo))
length(W_panel$neighbours)

base_sp %>%
  count(divipola, periodo) %>%
  filter(n > 1)

colSums(is.na(base_sp[
  c("cantidad", "temperature_2m_mean_c", "precipitation_lag1", "bsi_mean")
]))

pdata <- pdata.frame(
  base_sp,
  index = c("divipola", "periodo")
)

pdim(pdata)
is.pbalanced(pdata)

modelo_spatial_panel <- spml(
  cantidad ~
    temperature_2m_mean_c +
    #precipitation_lag1 +
    ndmi_mean+
    #ndvi_mean,
    
    bsi_mean,
  data = base_sp,
  index = c("divipola", "periodo"),
  listw = W_panel,
  model = "within",
  effect = "individual",
  lag = TRUE,
  spatial.error = "none",
  zero.policy = TRUE
)

summary(modelo_spatial_panel)
modelo_spatial_panel$logLik
modelo_spatial_panel$sigma2

library(dplyr)
library(spdep)

base_residuos <- base_sp %>%
  mutate(
    residuo = as.numeric(residuals(modelo_spatial_panel))
  )

moran_residuos_periodo <- base_residuos %>%
  group_by(periodo) %>%
  summarise(
    moran_i = moran.test(
      residuo,
      W_panel,
      zero.policy = TRUE
    )$estimate[["Moran I statistic"]],
    
    p_value = moran.test(
      residuo,
      W_panel,
      zero.policy = TRUE
    )$p.value,
    
    .groups = "drop"
  )

summary(moran_residuos_periodo$moran_i)

table(moran_residuos_periodo$p_value < 0.05)

moran_residuos_periodo %>%
  summarise(
    promedio_moran = mean(moran_i, na.rm = TRUE),
    periodos_significativos = sum(p_value < 0.05, na.rm = TRUE),
    total_periodos = n(),
    porcentaje_significativo = mean(p_value < 0.05, na.rm = TRUE) * 100
  )

pred <- as.numeric(modelo_spatial_panel$fitted.values)
obs <- base_sp$cantidad

RMSE <- sqrt(mean((obs - pred)^2, na.rm = TRUE))
MAE <- mean(abs(obs - pred), na.rm = TRUE)

PseudoR2 <- 1 -
  sum((obs - pred)^2, na.rm = TRUE) /
  sum((obs - mean(obs, na.rm = TRUE))^2, na.rm = TRUE)

data.frame(
  logLik = modelo_spatial_panel$logLik,
  sigma2 = modelo_spatial_panel$sigma2,
  rho = modelo_spatial_panel$coefficients["lambda"],
  RMSE = RMSE,
  MAE = MAE,
  PseudoR2 = PseudoR2
)


pred <- fitted(modelo_spatial_panel)

obs <- pdata$cantidad
cor(pred, obs)^2
1 -
  sum((obs-pred)^2)/
  sum((obs-mean(obs))^2)

pred <- fitted(modelo_spatial_panel)

obs <- pdata$cantidad

RMSE <- sqrt(
  mean(
    (obs-pred)^2
  )
)

RMSE

res <- residuals(modelo_spatial_panel)
moran.test(
  res,
  W_panel,
  zero.policy = TRUE
)


plot(
  fitted(modelo_spatial_panel),
  residuals(modelo_spatial_panel)
)

abline(h=0)

library(fixest)
modelo_poisson <- fepois(
  cantidad ~
    cantidad_lag1 +
    precipitation_lag1 +
    temperature_lag1 +
    ndvi_lag1 +
    ndmi_lag1 +
    bsi_lag1 |
    divipola + periodo,
  data = base_sp
)
