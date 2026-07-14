# Reporte de Auditoría: Cierre Definitivo de Metadata del Dashboard (Data Bridge)

## 1. Contexto del Incidente (El Parche Silencioso)
Durante la auditoría de despliegue, se detectó que el dashboard experimentaba un **colapso silencioso** de su KPI de "Anomalía Vegetal (NDVI)", mostrando de manera crónica "N/D" (Sin datos).
Esto ocurrió porque el archivo de consumo histórico copiado manualmente (`desnutricion_mensual_consolidado.csv`) únicamente contenía las variables del target (desnutrición), pero el dashboard esperaba recibir las variables climáticas y de metadatos allí.
La solución temporal introducida en `data_loader.py` parcheaba el nombre de las columnas y toleraba la falta de datos, lo que ocultó la ruptura funcional subyacente.

## 2. Corrección Arquitectónica Implementada

Se trasladó la exportación del "Data Bridge Histórico" hacia el generador oficial de tensores (`prep_gnn_data.py`).

**Punto de Exportación (Tarea 1):**
La exportación se configuró exactamente en la línea 133 de `prep_gnn_data.py`, *antes* de que el script aplique la estandarización `StandardScaler` por estratos (Línea 137). 
Esto garantiza que el dashboard reciba los valores **crudos** (`ndvi_mean`), ya que la UI de `components.py` (Línea 133) calcula dinámicamente su propio Z-Score intra-período basado en la media nacional, lo que previene un doble escalado.

**Columnas Exportadas y Renombradas (Tarea 2):**
- `divipola` → `MpCodigo`
- `cantidad` → `casos_desnutricion`
- `ndvi_mean` → `NDVI`
- `precipitation_sum_mm`
- `temperature_2m_mean_c`
- `depto_code` (Derivado automáticamente en el exportador)

**Refactorización del Dashboard (Tarea 3):**
Se eliminó el código muerto y los parches tolerantes en `src/dashboard/data_loader.py`. 
El orquestador ahora asume que el archivo fuente (`data/processed/panel_historico_dashboard.csv`) ya es estrictamente conforme con su esquema esperado. El formato de la columna `mes` fue alineado (`YYYY-MM`) para garantizar que el `left join` con el dataset de predicciones OOS (2025) funcione de manera exacta y propague la metadata ambiental hasta los períodos futuros.

## 3. Evidencia Cruda de Verificación (Tarea 4)

### A. Generación desde `prep_gnn_data.py`
El pipeline `train_models.py` ahora genera transparentemente la tubería cruzada, confirmada por los logs de consola:
```text
   --- Auditoría de bfill() Leakage ---
   Municipios afectados por leakage de bfill: 0 de 1064
   -------------------------------------
   Panel histórico para dashboard exportado: 89376 registros, 1064 municipios.
```

Salida cruda (`head -n 4 data/processed/panel_historico_dashboard.csv`):
```csv
MpCodigo,anio,mes,casos_desnutricion,NDVI,precipitation_sum_mm,temperature_2m_mean_c,depto_code
05001,2019,1,57.0,0.605459331617156,74.3,19.9483870967742,05
05001,2019,2,47.0,0.470911601269896,96.8,20.1678571428571,05
05001,2019,3,62.0,0.461274940214983,107.4,20.0967741935484,05
```

### B. Rendimiento Consolidado Tras la Fusión UI
El código del dashboard fue evaluado de forma automatizada sobre su caché de memoria, extrayendo las filas fusionadas para los municipios críticos en el mes de proyección máxima (`2025-12`):

**Validación Uribia (Estrato Alto - Crisis Histórica)**
```text
MpCodigo: 44847
Periodo: 2025-12
NDVI Crudo Importado: 0.303775
```
Al correr sobre la matriz nacional del dashboard, este valor crudo produce un Z-Score válido. El panel UI abandona su estado "N/D" y renderiza la alerta térmica.

**Validación Tunja (Estrato Bajo - Control/Estabilidad)**
```text
MpCodigo: 15001
Periodo: 2025-12
NDVI Crudo Importado: 0.578515
```
El pipeline de propagación cruzada opera simétricamente para estratos bajos. Ninguno de los KPIs previamente validados (como el RMSE global 2.62 o el Pearson) fue afectado por este transporte de metadatos ambientales.

## 4. Veredicto Final
El ciclo de refactorización "Data Bridge" concluyó exitosamente. Se ha neutralizado el colapso silencioso del dashboard, vinculando directamente la tubería UI al motor robusto del orquestador backend. La UI es ahora una representación 1:1 de los metadatos generados.
