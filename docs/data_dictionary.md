# Diccionario de Datos del Proyecto SEMILLA

Este diccionario documenta las variables utilizadas en los dos componentes de SEMILLA: el **KPI territorial y clustering** y el **componente predictivo** (ST-GNN y S2SLS). Ambos parten de una misma base de datos abiertos, procesada de forma independiente según las necesidades de cada análisis.

---

## Sección 1: Variables del KPI Municipal y Clustering

Documentadas a partir de `Avanzado_ia/data/municipios_semilla.csv` (1.121 municipios, 29 variables).

### Identificación Municipal

| Nombre Variable | Definición |
|---|---|
| `MpCodigo` | Código DIVIPOLA del municipio (entero) |
| `Divipola` | Código DIVIPOLA con formato de 5 dígitos |
| `Departamento` | Nombre del departamento |
| `Municipio` | Nombre del municipio |

### Variables Base del KPI

| Nombre Variable | Definición | Fuente |
|---|---|---|
| `Estimación Inseguridad Alimentaria Moderada-Grave` | Porcentaje de hogares con inseguridad alimentaria moderada o grave (Escala FIES) | DANE |
| `IRCA` | Índice de Riesgo de la Calidad del Agua para consumo humano | Entidades de salud y ambiente |
| `Suficiencia de vías` | Índice de Engel de conectividad vial: `Ie = KmV / √(S × P)` | OpenStreetMap |
| `Cantidad tipo de cultivos` | Número de tipos de cultivo (grupos alimentarios) reportados en el municipio | UPRA |
| `temperature_2m_mean_c` | Temperatura media anual a 2 metros de altura | Open-Meteo (ERA5) |
| `NDVI` | Índice de Vegetación de Diferencia Normalizada, mediana anual | Sentinel-2 |
| `Pob rural` | Porcentaje de población municipal residente en zonas rurales | DANE (Censo) |
| `Zscore_NDVI` | Anomalía estandarizada de NDVI respecto al promedio nacional del período — proyectada por el componente predictivo (ST-GNN) | Componente predictivo SEMILLA |

### Desglose de Diversidad de Cultivos (UPRA)

| Nombre Variable | Definición |
|---|---|
| `Cereales` | Superficie/volumen reportado en cultivos de cereales |
| `Cultivos para condimentos, bebidas medicinales y aromáticas` | Superficie/volumen en este grupo alimentario |
| `Cultivos tropicales tradicionales` | Superficie/volumen en cultivos tropicales tradicionales |
| `Frutales` | Superficie/volumen en frutales |
| `Hortalizas` | Superficie/volumen en hortalizas |
| `Leguminosas` | Superficie/volumen en leguminosas |
| `Oleaginosas` | Superficie/volumen en oleaginosas |
| `Raíces y tubérculos` | Superficie/volumen en raíces y tubérculos |

### Índices Satelitales Complementarios (Sentinel-2)

| Nombre Variable | Definición |
|---|---|
| `EVI` | Índice de Vegetación Mejorado |
| `NDMI` | Índice de Humedad de Diferencia Normalizada |
| `NDWI` | Índice de Agua de Diferencia Normalizada |
| `MSI` | Índice de Estrés Hídrico |
| `BSI` | Índice de Suelo Desnudo |
| `NDBI` | Índice de Área Construida de Diferencia Normalizada |

### Variables de Síntesis (KPI y Clustering)

| Nombre Variable | Definición | Método de Cálculo |
|---|---|---|
| `KPI` | Puntaje final de riesgo territorial por municipio, escala 0-1 | ACP sobre las 8 variables base (5 componentes, 82.11% de varianza explicada), normalización y suma ponderada |
| `KPI_Quintile` | Categoría de riesgo: Muy Bajo, Bajo, Medio, Alto, Muy Alto | Quintiles del KPI |
| `Cluster` | Perfil territorial asignado (1 a 4) | Clustering jerárquico aglomerativo (enlace *weighted*, distancia *cosine*) sobre los 5 componentes principales del KPI |

**Interpretación de `Cluster`:**

| Valor | Perfil | Municipios |
|---|---|---|
| 1 | Referente Estructural | 354 |
| 2 | Vulnerabilidad Crítica | 207 |
| 3 | Riesgo Hídrico Crítico | 287 |
| 4 | Degradación Ecológica | 273 |

---

## Sección 2: Variables del Componente Predictivo (ST-GNN y S2SLS)

Documentadas a partir de la inspección directa del código en `src/models/s2sls/spml_s2sls.R` y `src/data/pipeline_integration.py`.

### Variables Principales

| Nombre Variable | Definición | Unidad | Fuente | Tipo | Origen en Código |
|-----------------|------------|--------|--------|------|------------------|
| `cantidad` | Casos de inseguridad alimentaria registrados por municipio y periodo. Variable objetivo (target). | Conteo (N) | Desnutrición | Cruda | `pipeline_integration.py:45,48`, `spml_s2sls.R:109-111,113` |
| `temperature_2m_mean_c` | Temperatura media mensual a 2 metros de altura sobre la superficie. | Grados Celsius (°C) | Clima | Cruda | `pipeline_integration.py:44`, `spml_s2sls.R:127` |
| `precipitation_sum_mm` | Suma de precipitación total mensual. | Milímetros (mm) | Clima | Cruda | `pipeline_integration.py:44`, `spml_s2sls.R:126` |
| `ndvi_mean` | Índice de Vegetación de Diferencia Normalizada (promedio mensual). | Índice [-1, 1] | Teledetección | Cruda | `pipeline_integration.py:43`, `spml_s2sls.R:128` |
| `ndmi_mean` | Índice de Humedad de Diferencia Normalizada (promedio mensual). | Índice [-1, 1] | Teledetección | Cruda | `pipeline_integration.py:43`, `spml_s2sls.R:129` |

### Variables Derivadas: Anomalías y Crisis

| Nombre Variable | Definición | Unidad | Fuente | Tipo | Origen en Código |
|-----------------|------------|--------|--------|------|------------------|
| `ndvi_anomalia` | Anomalía estandarizada del NDVI (Z-score). Calculada con media y desviación estándar del conjunto de entrenamiento por municipio. | Z-score | Derivada | Calculada | `pipeline_integration.py:65`, `spml_s2sls.R:200` |
| `ndvi_crisis_lag4` | Variable dicotómica (dummy) que indica sequía severa, activada si `ndvi_anomalia_lag4 < -1.5`. | Binaria [0, 1] | Derivada | Calculada | `spml_s2sls.R:207` |

### Variables Derivadas: Rezagos Temporales (Lags)

| Nombre Variable | Definición | Unidad | Fuente | Tipo | Origen en Código |
|-----------------|------------|--------|--------|------|------------------|
| `cantidad_lag[1-3]` | Rezago temporal de 1, 2 y 3 meses de la variable `cantidad`. | Conteo (N) | Derivada | Calculada | `spml_s2sls.R:173-175` |
| `temperature_lag1` | Rezago temporal de 1 mes de temperatura media. | °C | Derivada | Calculada | `spml_s2sls.R:178` |
| `precipitation_lag[1-2]`| Rezago temporal de 1 y 2 meses de precipitación total. | mm | Derivada | Calculada | `spml_s2sls.R:176-177` |
| `ndvi_lag1` | Rezago temporal de 1 mes del NDVI. | Índice | Derivada | Calculada | `spml_s2sls.R:179` |
| `ndmi_lag1` | Rezago temporal de 1 mes del NDMI. | Índice | Derivada | Calculada | `spml_s2sls.R:180` |
| `ndvi_anomalia_lag[4,8]`| Rezagos temporales de 4 y 8 meses de la anomalía de NDVI. Instrumentos estructurales del S2SLS. | Z-score | Derivada | Calculada | `spml_s2sls.R:205-206` |

### Variables Derivadas: Rezagos Espaciales

| Nombre Variable | Definición | Unidad | Fuente | Tipo | Origen en Código |
|-----------------|------------|--------|--------|------|------------------|
| `W_cantidad` | Rezago espacial de `cantidad` ponderado usando matriz de contigüidad Queen. Representa el efecto spillover de municipios vecinos. | Conteo (N) | Derivada | Calculada | `spml_s2sls.R:305` |
| `W_temperature` | Rezago espacial de temperatura media (instrumento). | °C | Derivada | Calculada | `spml_s2sls.R:306` |
| `W_ndmi` | Rezago espacial del NDMI (instrumento). | Índice | Derivada | Calculada | `spml_s2sls.R:307` |

---

## Nota Técnica de Integración entre Ambos Componentes

`MpCodigo` en `municipios_semilla.csv` se almacena como entero (ej. `5001`); en el componente predictivo, el identificador equivalente (`divipola`) es un string de 5 dígitos con ceros a la izquierda (`"05001"`). Normalizar el formato antes de cualquier cruce entre ambas fuentes.
