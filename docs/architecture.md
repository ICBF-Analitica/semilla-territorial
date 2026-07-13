# Arquitectura del Sistema SEMILLA

## 1. Visión General del Proyecto

SEMILLA es una solución de inteligencia territorial que integra datos abiertos, imágenes satelitales e inteligencia artificial para anticipar, priorizar y explicar los riesgos agroclimáticos y alimentarios en los 1.121 municipios de Colombia, presentada al reto de Agricultura y Desarrollo Rural del Concurso Datos al Ecosistema 2026.

El proyecto se articula en torno a tres pilares:

1. **Un KPI municipal de riesgo territorial**, construido mediante Análisis de Componentes Principales sobre ocho variables de exposición climática, vulnerabilidad alimentaria, conectividad vial, ruralidad y diversidad productiva, condensando el riesgo en un índice único de 0 a 1.
2. **Una segmentación territorial por clustering jerárquico**, que agrupa a los municipios en cuatro perfiles de riesgo diferenciados —Referente Estructural, Vulnerabilidad Crítica, Riesgo Hídrico Crítico, y Degradación Ecológica— facilitando el diseño de intervenciones diferenciadas.
3. **Un componente predictivo espacio-temporal** (ST-GNN y S2SLS), que aporta la dimensión de anticipación: proyecta la tendencia del Z-score de NDVI que alimenta directamente al KPI y al clustering, y predice la tendencia de riesgo de desnutrición infantil aguda a nivel municipal.

El KPI y el clustering constituyen el eje central de la herramienta de consulta pública; el componente predictivo aporta la capacidad de anticipación temporal sobre la que se apoyan ambos.

## 2. Contexto del Sistema (Vista de Alto Nivel)

SEMILLA opera como un sistema con dos repositorios especializados por stack tecnológico, conectados mediante un punto de integración claro:

```text
┌─────────────────────────────────────┐          ┌────────────────────────────────────────┐
│   Landing Page Institucional         │         │   Componente Predictivo (SEMILLA)                                                                           │
│   (GitHub · React/TanStack · Lovable)│         │   (GitLab · Python/R · CI/CD propio)  │
│                                       │         │                                        │
│   - KPI territorial (ACP)            │  enlace │   - Pipeline de datos                 │
│   - Clustering jerárquico (4 perfiles│ ──────► │   - Modelos ST-GNN y S2SLS            │
│     )                                │  (URL)  │   - Dashboard interactivo (Streamlit) │
│   - Enlace al dashboard predictivo   │         │   - Pipeline de CI/CD con GPU         │
└─────────────────────────────────────┘         └──────────────────────────────────────┘
```
> Repositorio del componente predictivo: [https://gitlab.com/jaimescastrodf-group/semilla-fork](https://gitlab.com/jaimescastrodf-group/semilla-fork)

El proyecto se construyó desde el diseño sobre una misma base de fuentes de datos abiertos —climáticas (Open-Meteo), satelitales (Sentinel-2), territoriales (IGAC, OpenStreetMap), productivas (UPRA) y sociales (DANE, MinSalud)—, aprovechada de forma complementaria por ambos repositorios.

## 3. Diagrama Estructural de Repositorios

### 3.1 KPI y Clustering (GitHub — Avanzado_ia)

```text
Avanzado_ia/
├── data/
│   ├── municipios_semilla.csv    # Base municipal integrada: 1.121 municipios,
│   │                              # 29 variables (KPI, quintil, cluster, índices)
│   ├── clima/                    # Open-Meteo (ERA5)
│   └── ...                       # UPRA, DANE, IGAC, OpenStreetMap
├── consolidacion/                # Scripts R de consolidación por fuente
└── notebooks/
    └── Analisis_Priorizacion_Territorial.ipynb   # ACP, ponderación KPI, clustering
```

### 3.2 Componente Predictivo (GitLab)

```text
data/
├── 01_raw/             (Insumos crudos: Clima, Desnutrición, Teledetección, shapefiles)
├── 02_intermediate/    (Predicciones base S2SLS: preds_s2sls.csv)
├── 03_primary/         (Dataframes consolidados: panel_historico_dashboard.csv, tensores .pt)
└── 04_model_output/    (Salidas finales listas para consumo: predicciones_consolidadas.csv)

pipelines/
└── pipeline_ml.py      (Orquestador principal que ejecuta secuencialmente los modelos)

src/
├── data/               (prep_gnn_data.py: Integración y limpieza de paneles espaciotemporales)
├── models/
│   ├── stgnn/          (Motor principal en PyTorch: redes de grafos, optimización, offset)
│   └── s2sls/          (Benchmark econométrico espacial en R: spml_s2sls.R)
└── dashboard/          (Aplicación Streamlit para la ingesta interactiva de resultados)
```

### 3.3 Landing Page (GitHub)

```text
semilla-territorial/
├── .lovable/
├── Avanzado_ia/              # (ver 3.1)
├── src/routes/               # Enlace al dashboard predictivo (VITE_DASHBOARD_URL)
├── src/components/
├── package.json
├── README.md                  # Presentación institucional del proyecto
└── README_TECNICO.md          # Documentación de desarrollo
```

## 4. KPI Municipal de Riesgo Territorial

Construido sobre ocho variables base: inseguridad alimentaria moderada-grave (DANE), calidad del agua IRCA, suficiencia vial (Índice de Engel sobre datos de OpenStreetMap), diversidad de cultivos (UPRA), temperatura media (Open-Meteo), NDVI (Sentinel-2), población rural (DANE), y Z-score de NDVI (proyectado por el componente predictivo).

El Índice de Engel de suficiencia vial se calcula como:

Ie = KmV / √(S × P)

donde `KmV` es la longitud de la red vial municipal, `S` la superficie del municipio, y `P` su población — una medida que corrige el sesgo de densidad vial al considerar simultáneamente extensión territorial y presión demográfica.

El Análisis de Componentes Principales sobre estas ocho variables identificó dos ejes estructurales: un primer componente de "vulnerabilidad estructural" (cargado por inseguridad alimentaria y población rural, en sentido opuesto a suficiencia vial y Z-score de NDVI), y un segundo componente de "exposición climática y ecológica" (cargado por temperatura, en sentido opuesto a NDVI y diversidad de cultivos). El KPI final agrega los 5 componentes principales retenidos (82.11% de la varianza total) en una escala de 0 a 1, ponderados combinando las cargas factoriales del ACP, el marco conceptual del proyecto, y la maximización de correlación con los casos históricos de desnutrición aguda. El resultado se segmenta en cinco quintiles de riesgo, de "Muy Bajo" a "Muy Alto".

## 5. Segmentación Territorial (Clustering)

Ejecutado mediante clustering jerárquico aglomerativo (enlace *weighted*, distancia *cosine*) sobre los 5 componentes principales del KPI, validado con coeficiente de Silhouette y pruebas ANOVA de significancia entre grupos. El análisis agrupó a los 1.121 municipios en cuatro perfiles:

| Clúster | Municipios | Perfil |
|---|---|---|
| Referente Estructural | 354 | Clima templado, mejor seguridad alimentaria, mayor conectividad, Z-score de NDVI más alto |
| Vulnerabilidad Crítica | 207 | Clima cálido, mayor inseguridad alimentaria, menor conectividad y diversidad de cultivos |
| Riesgo Hídrico Crítico | 287 | Buena conectividad y diversidad agrícola, IRCA más alto del país |
| Degradación Ecológica | 273 | Mayor componente urbano, NDVI y Z-score de NDVI más bajos del país |

## 6. Componente Predictivo Espacio-Temporal

### 6.1 ST-GNN: Anticipando Dinámicas de Vegetación y Riesgo Nutricional

La Red Neuronal Espacio-Temporal (ST-GNN) modela cada municipio como un nodo de un grafo conectado a sus vecinos geográficos (contigüidad Queen), combinando capas espaciales (Graph Neural Networks) con capas temporales que capturan tendencias y rezagos. Esta arquitectura cumple dos funciones dentro de SEMILLA:

- **Proyección de tendencia del Z-score de NDVI**, alimentando directamente al KPI y al clustering territorial — permitiendo detectar municipios con tendencia de degradación ecológica incluso cuando su valor actual de NDVI no es crítico.
- **Predicción de riesgo de desnutrición infantil aguda**, con un mecanismo de "ancla" multiplicativa que preserva la escala histórica real de cada municipio, y una función de pérdida calibrada para priorizar la detección temprana de crisis sobre la precisión numérica exacta.

*Detalle técnico completo de la implementación de desnutrición: `docs/data_dictionary.md`, `docs/marco_metodologico.md`.*

### 6.2 S2SLS: Explicación Causal

Modelo de panel espacial dinámico (`plm`, R) que establece relaciones causales robustas entre variables climáticas/ecológicas y los casos de desnutrición: un incremento de 1°C en temperatura media anual se asocia con un aumento de ~2.3% en casos de desnutrición aguda; una reducción de una desviación estándar en NDVI, con un aumento de ~1.8%; y un incremento de una desviación estándar en la temperatura de municipios vecinos, con un aumento de ~1.5% en el municipio focal (efecto de contagio espacial). En SEMILLA, opera como referencia interpretable y de trazabilidad institucional junto al ST-GNN.

*Detalle completo: `docs/auditorias/CORRECCION_BASELINE_S2SLS.md`.*

### 6.3 Complementariedad

El S2SLS explica por qué el riesgo es alto en un territorio dado, mientras el ST-GNN anticipa hacia dónde se dirige ese riesgo — dos capacidades complementarias que, combinadas con el KPI y el clustering, permiten tanto diagnosticar el presente como anticipar el futuro de cada municipio.

## 7. Flujo de Datos del Componente Predictivo

```text
Fuentes abiertas (Clima, Desnutrición ICBF, Teledetección Sentinel-2, Shapefiles DIVIPOLA)
        │
        ▼
data/01_raw/  ──────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          ▼
src/data/prep_gnn_data.py                              src/models/s2sls/spml_s2sls.R
        │                                                          │
        ▼                                                          ▼
src/models/stgnn/train_stgnn.py                        data/02_intermediate/preds_s2sls.csv
        │                                                          │
        ▼                                                          │
data/04_model_output/predicciones_stgnn.csv                        │
        │                                                          │
        └──────────────► pipelines/consolidar_predicciones.py ◄────┘
                                    │
                                    ▼
                data/04_model_output/predicciones_consolidadas.csv
                                    │
                                    ▼
                        src/dashboard/dashboard_app.py
                                    │
                                    ▼
                     Landing Page (enlace vía VITE_DASHBOARD_URL)
```

## 8. Dashboard (Interfaz de Consulta)

Aplicación interactiva en Streamlit, protegida por autenticación de sesión. Incluye mapa nacional interactivo con clasificación de riesgo por municipio, KPIs territoriales, comparación entre modelos predictivos, y drill-down municipal mes a mes.

## 9. Pipeline de Producción y CI/CD

El flujo del componente predictivo se orquesta mediante `pipelines/pipeline_ml.py`, con un pipeline de GitLab CI/CD sobre runner GPU dedicado: validación automática en cada push, y reentrenamiento disparado manualmente, generando metadata de trazabilidad (`timestamp`, `seed`, script de origen) en cada corrida oficial.

## 10. Stack Tecnológico por Capa

| Capa | Tecnología |
|---|---|
| KPI y clustering territorial | Python (Jupyter Notebook), scikit-learn (PCA), scipy (clustering jerárquico) |
| Modelo predictivo principal | Python, PyTorch, PyTorch Geometric |
| Benchmark econométrico | R, `plm`, `sp`, `spdep` |
| Orquestación del pipeline | Python (`pipelines/pipeline_ml.py`) |
| Interfaz de consulta | Streamlit, Plotly |
| Control de versiones y CI/CD | GitLab, GitLab Runner (self-hosted, GPU) |
| Landing page institucional | React 19, TanStack Start, Vite, TypeScript, Tailwind CSS, Radix UI |
| Plataforma de despliegue de la landing | Lovable |

## 11. Integración con la Landing Page Institucional

El dashboard del componente predictivo es referenciado desde la landing page pública, que presenta el proyecto completo —KPI territorial, clustering, y componente predictivo— para el Concurso Datos al Ecosistema 2026. La landing consume la URL del dashboard vía la variable de entorno `VITE_DASHBOARD_URL`, configurada en Lovable, con los botones de acceso ocultándose automáticamente si la variable no está configurada.