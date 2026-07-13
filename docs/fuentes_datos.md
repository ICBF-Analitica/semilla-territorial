# Fuentes de Datos del Proyecto SEMILLA

Este documento consolida el origen de los insumos usados en los dos componentes de SEMILLA: el **KPI territorial y clustering** y el **componente predictivo**. Ambos se construyen sobre un mismo conjunto de fuentes abiertas, integradas de forma independiente según las necesidades de cada análisis.

---

## Sección 1: Fuentes del KPI Municipal y Clustering

| Fuente | Tipo de Información | Uso en SEMILLA |
|---|---|---|
| **UPRA** | Producción agrícola, cultivos, uso del suelo | Caracterización productiva y diversidad agrícola (`Cantidad tipo de cultivos` y su desglose en 8 categorías) |
| **DANE** | Población, ruralidad, inseguridad alimentaria (Encuesta FIES) | Medición de exposición social y vulnerabilidad alimentaria (`Pob rural`, `Estimación Inseguridad Alimentaria Moderada-Grave`) |
| **MinSalud** | Salud, nutrición y variables de riesgo social | Aproximación al impacto social y nutricional |
| **IGAC** | Capas geográficas y territoriales | Integración espacial y caracterización municipal |
| **OpenStreetMap** | Red vial y accesibilidad terrestre | Construcción del Índice de Engel de suficiencia vial |
| **Open-Meteo** (Reanálisis ERA5) | Temperatura, precipitación y variables climáticas | Análisis de exposición climática (`temperature_2m_mean_c`) |
| **Sentinel-2 / Google Earth Engine** | Índices satelitales (NDVI, EVI, NDMI, NDWI, MSI, BSI, NDBI) | Medición de cobertura vegetal y cambios territoriales |
| **Componente predictivo SEMILLA** | Z-score de NDVI proyectado (ST-GNN) | Variable `Zscore_NDVI`, incorporada como octava variable base del KPI |

**Base de datos integrada:** `Avanzado_ia/data/municipios_semilla.csv` — 1.121 municipios, homologados mediante los códigos DIVIPOLA del DANE como estándar territorial único.

**Proceso de integración:**
1. **Recopilación** — descarga desde las plataformas oficiales de cada fuente.
2. **Limpieza** — depuración de valores atípicos, imputación de datos faltantes, estandarización de formatos.
3. **Homologación** — asignación de cada registro a su código DIVIPOLA correspondiente.
4. **Agregación y cálculo** — estadísticos municipales (media anual para variables climáticas, mediana anual para índices satelitales).

---

## Sección 2: Fuentes del Componente Predictivo

Extraídas directamente de los scripts de orquestación (`src/data/pipeline_integration.py` y `src/models/s2sls/spml_s2sls.R`).

### 2.1 Clima
- **Ruta del archivo:** `data/01_raw/Clima/clima_mensual_consolidado.csv`
- **Variables contenidas:** Temperatura media a 2 metros (`temperature_2m_mean_c`), Precipitación acumulada (`precipitation_sum_mm`).
- **Periodicidad:** Mensual.
- **Origen en el código:** `pipeline_integration.py` (Línea 21), `spml_s2sls.R` (Línea 48).

### 2.2 Desnutrición
- **Ruta del archivo:** `data/01_raw/Desnutricion/desnutricion_mensual_consolidado.csv`
- **Variables contenidas:** Conteos mensuales de desnutrición (`cantidad` / `casos_desnutricion`).
- **Periodicidad:** Mensual.
- **Origen Institucional:** ICBF (Instituto Colombiano de Bienestar Familiar).
- **Origen en el código:** `pipeline_integration.py` (Línea 22), `spml_s2sls.R` (Línea 52).

### 2.3 Teledetección
- **Ruta del archivo:** `data/01_raw/Teledetección/teledeteccion_consolidado.csv`
- **Variables contenidas:** Índices satelitales promediados mensualmente por municipio (`ndvi_mean`, `ndmi_mean`, `evi_mean`, `msi_mean`, `ndbi_mean`).
- **Periodicidad:** Mensual.
- **Origen Institucional:** Sentinel-2.
- **Origen en el código:** `pipeline_integration.py` (Línea 23), `spml_s2sls.R` (Línea 56).

### 2.4 Geometría Espacial (Shapefile)
- **Ruta del archivo:** `data/01_raw/Capas/Municipios/Municipio, Distrito y Area no municipalizada.shp`
- **Contenido:** Polígonos municipales para la matriz de contigüidad espacial tipo Queen (pesos espaciales `W_cantidad`, `W_temperature`, etc.).
- **Origen en el código:** `spml_s2sls.R` (Línea 82 — `st_read`).

---

## Sección 3: Punto de Conexión entre Ambos Componentes

El componente predictivo (ST-GNN) proyecta la tendencia del Z-score de NDVI, que se incorpora de vuelta como variable `Zscore_NDVI` en la base municipal del KPI (`municipios_semilla.csv`) — cerrando el ciclo entre el análisis estructural (KPI y clustering) y la capacidad de anticipación temporal del componente predictivo.