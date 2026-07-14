# Metodología del KPI y Clustering (Avanzado_ia)

*Documento de extracción rigurosa de la metodología estadística aplicada en los módulos institucionales de la Landing Page de SEMILLA.*

## 1. Inventario del Contenido de `Avanzado_ia/`
El repositorio `semilla_landing` contiene la siguiente estructura de análisis en el directorio `Avanzado_ia/`:

```text
Avanzado_ia/consolidacion/Consolidar_clima.R
Avanzado_ia/consolidacion/Consolidar_desnutrición.R
Avanzado_ia/consolidacion/consolidar_teledeteccion.R
Avanzado_ia/data/clima/ERA5/ERA5_README.md
Avanzado_ia/data/municipios_semilla.csv
Avanzado_ia/notebooks/Analisis_Priorizacion_Territorial.ipynb
Avanzado_ia/notebooks/modelo_poisson.R
Avanzado_ia/notebooks/spml.R
```

El cálculo del KPI territorial y el modelo de segmentación (Clustering) se encuentran centralizados en el archivo `Avanzado_ia/notebooks/Analisis_Priorizacion_Territorial.ipynb`, y su salida verificada vive en `Avanzado_ia/data/municipios_semilla.csv`.

## 2. Metodología Exacta del KPI Municipal de Riesgo

El KPI se construye en la función `preprocess_data()` del notebook `Analisis_Priorizacion_Territorial.ipynb` (líneas 49-66) mediante el siguiente proceso estadístico:

**Variables Base:** (Línea 241)
`['Estimación Inseguridad Alimentaria Moderada-Grave', 'IRCA', 'Suficiencia de vías', 'Cantidad tipo de cultivos', 'temperature_2m_mean_c', 'NDVI', 'Pob rural']`

**Variable adicional confirmada en la salida (`municipios_semilla.csv`):** `Zscore_NDVI` — anomalía estandarizada de NDVI, proyectada por el componente predictivo (ST-GNN) del repositorio de GitLab, incorporada como octava variable base del KPI.

**Pasos de Cálculo:**
1. **Estandarización:** Se estandarizan las variables con `StandardScaler()` (Línea 50).
2. **Reducción de Dimensionalidad (PCA):** Se aplica Análisis de Componentes Principales (`PCA()`, línea 52) y se retienen automáticamente aquellos componentes que acumulen un umbral de varianza explicada (por defecto `variance_threshold = 0.8`, líneas 49 y 55). Con las 8 variables (incluyendo `Zscore_NDVI`), este umbral retiene 5 componentes, que explican el 82.11% de la varianza total (confirmado en el Reporte Final institucional del proyecto).
3. **Normalización por Componente:** Las puntuaciones retenidas de PCA se normalizan individualmente con un Min-Max Scaler (rango de 0 a 1) usando la fórmula `(x - np.min(x)) / (np.max(x) - np.min(x))` (Línea 60).
4. **Agregación del KPI:** El KPI final de riesgo por municipio se calcula sumando de forma simple estas puntuaciones PCA normalizadas:
```python
   # Línea 62
   kpi_por_registro = np.sum(puntuaciones_normalizadas, axis=1)
```
5. **Quintiles:** El puntaje resultante se corta en 5 quintiles categóricos etiquetados de "Muy Bajo" a "Muy Alto" mediante `pd.qcut()` (Línea 64).

**Pesos:** No se asignan pesos fijos u opináticos (expertos). La ponderación del índice es completamente endógena, determinada por las cargas factoriales implícitas del PCA sobre los componentes retenidos.
**Rango de salida:** 0 a $N$, donde $N$ es la cantidad de componentes retenidos (5 en la versión actual).

## 3. Metodología Exacta del Clustering

El modelo de segmentación se ejecuta en el mismo notebook, empleando un enfoque de Clustering Jerárquico Aglomerativo optimizado:

**Algoritmo Usado:**
Clustering Jerárquico Aglomerativo de `scipy.cluster.hierarchy`.
```python
# Línea 70
linkage_matrix = linkage(data, method=method, metric=metric)
clusters = fcluster(linkage_matrix, num_clusters, criterion='maxclust')
```

**Variables Utilizadas:**
El algoritmo agrupa los municipios basándose **exclusivamente en sus puntuaciones de PCA estandarizadas**, no en las variables crudas directamente.
```python
# Línea 269
# ... find_best_clustering(pca_data, num_clusters)
```

**Optimización de Hiperparámetros (Distancia y Enlace):**
El script itera sobre varias métricas de distancia (`euclidean`, `cosine`, etc.) y métodos de enlace (`ward`, `complete`, etc.) para encontrar el clustering óptimo maximizando una métrica combinada `combined_score` (Línea 82), que penaliza mediante el Silhouette Score, una métrica de balance (desviación estándar de los tamaños) y una penalidad a clústeres minoritarios menores al 5%. La configuración final reportada usa enlace *weighted* y distancia *cosine*.

**Etiquetas Cualitativas de los Cuatro Clústeres:**
El código fuente del notebook no contiene las definiciones semánticas de los perfiles — en el notebook, los clústeres solo son etiquetas numéricas nominales (1 a 4), unidas al dataframe en la columna `Cluster` y exportadas a `municipios_semilla.csv`. Las etiquetas descriptivas publicadas en el Reporte Final institucional son:

| Cluster (código) | Nombre | Municipios |
|---|---|---|
| 1 | Referente Estructural | 354 |
| 2 | Vulnerabilidad Crítica | 207 |
| 3 | Riesgo Hídrico Crítico | 287 |
| 4 | Degradación Ecológica | 273 |

## 4. Fuentes de Datos Reales Usadas en el Código

El siguiente cruce compara las fuentes mencionadas en la documentación institucional vs. las que son efectivamente leídas y preprocesadas por el código de `Avanzado_ia/`:

| Fuente en README | Archivo/Ruta de Ingesta en el Código (`read_*`) | Evidencia de Código |
|---|---|---|
| Open-Meteo (Clima) | `"Clima/open-meteo-.*\\.xlsx"` | `Consolidar_clima.R` (Líneas 8-12) |
| Sentinel-2 (NDVI) | `"Teledetección/.*\\.csv"` | `consolidar_teledeteccion.R` (Líneas 7-11) |
| MinSalud / ICBF | `"Desnutrición/.*\\.xlsx"` | `Consolidar_desnutrición.R` (Líneas 6-11) |
| UPRA, DANE, IGAC, OSM |  | El notebook asume un preprocesamiento externo que ya las incluye en la base municipal consolidada (Línea 219, referida en el código inspeccionado como `consolidado.xlsx` — la versión de salida vigente es `municipios_semilla.csv`). |
| ST-GNN (componente predictivo, GitLab) | `Zscore_NDVI` | Confirmado como columna presente en `municipios_semilla.csv`. |


Las etiquetas semánticas de los clústeres (Sección 3) ya están disponibles y confirmadas a través del Reporte Final institucional, su asignación es una interpretación de negocio aplicada *a posteriori* de la ejecución del análisis, el paso habitual en cualquier ejercicio de clustering.
