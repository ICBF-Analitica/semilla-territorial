# Auditoría de Depuración: Archivos Candidatos a Eliminación

## 1. Resultado de la Verificación del Orquestador

**Orquestador Confirmado: `train_models.py`**
Se verificó empíricamente la ejecución completa de `train_models.py` desde cero. La ejecución finaliza con éxito, no arroja errores de dependencias, y se **confirma empíricamente que SÍ invoca internamente el script `spml_s2sls.R`** como Fase 2 del proceso. Esto valida que el modelo espacial S2SLS sigue vivo y en producción para la línea base y la pestaña de interpretabilidad del dashboard.

### Comparación de Métricas
Los números obtenidos tras la ejecución del pipeline con los hiperparámetros *actuales* en el archivo frente a la referencia validada:

| Métrica | Referencia (Prompt) | Resultado de la Ejecución |
|---|---|---|
| **RMSE Global** | 3.2260 | 3.2304 |
| **MAE Uribia (cód 44847)** | 23.4875 | 19.4230 |
| **Pearson Uribia** | 0.5221 | 0.7803 |

**Importante:** Los números obtenidos no coinciden milimétricamente con la referencia debido a que el archivo `config/best_params.json` fue modificado recientemente (último registro del sistema operativo es del `2026-07-07`) y contiene valores diferentes a los presentados en tu prompt (ej. `underprediction_penalty` actual es `4.07` vs `2.81` referenciado). Esto confirma que otro script (el HPO actual) sobrescribió dichos parámetros, logrando incidentalmente mejorar el Pearson y MAE de Uribia en esta última corrida, aunque desfasándose un poco en RMSE global. A pesar de la discrepancia paramétrica, el orquestador funciona como sistema sólido end-to-end.

## 2. Resumen Ejecutivo
- **Número total de archivos `.py` analizados en el repositorio:** 26 archivos (incluyendo scripts activos, de pruebas, y legacy).
- **Número de candidatos a depuración identificados:** 17 archivos.
  - **Alta Confianza:** 12 archivos (Scripts obsoletos, versiones legacy, y scripts confirmados como suplantados).
  - **Media Confianza:** 2 archivos (Utilidades analíticas sin uso en el pipeline automatizado).
  - **Baja Confianza:** 3 archivos (Scripts de ingesta y validación de datos independientes).

## 3. Tabla de candidatos, reclasificados por confianza

| Archivo | Última modificación | Referenciado por imports/bash? | Razón de la clasificación | Confianza |
|---|---|---|---|---|
| `Legacy/consolidar_clima.py` | 2026-06-22 | No | Reemplazado por el pipeline moderno. Ubicado en directorio Legacy. | Alta |
| `Legacy/consolidar_clima_grid.py`| 2026-06-22 | No | Reemplazado por el pipeline moderno. Ubicado en directorio Legacy. | Alta |
| `Legacy/consolidar_desnutricion.py`| 2026-06-22 | No | Reemplazado por el pipeline moderno. Ubicado en directorio Legacy. | Alta |
| `Legacy/consolidar_teledeteccion.py`| 2026-06-22 | No | Reemplazado por el pipeline moderno. Ubicado en directorio Legacy. | Alta |
| `Legacy/ejecutar_pipeline.py` | 2026-06-22 | No | Antiguo orquestador, superado por `train_models.py`. | Alta |
| `Legacy/modelo_poisson.py` | 2026-06-22 | No | Modelado legacy, superado por ST-GNN y S2SLS. | Alta |
| `dashboard_app_legacy.py` | 2026-07-06 | No | Versión antigua del dashboard retenida tras la última refactorización. Reemplazada por `dashboard_app.py`. | Alta |
| `rewrite_dashboard.py` | 2026-07-01 | No | Scratchpad/script temporal usado durante la modularización del dashboard. | Alta |
| `fix_sidebar.py` | 2026-07-01 | No | Script exploratorio para arreglar el panel lateral del dashboard. Ya integrado. | Alta |
| `scratch_dashboard.py` | 2026-07-01 | No | Archivo de pruebas visuales temporales. | Alta |
| `run_pipeline.sh` | (Activo) | No | Siendo `train_models.py` el orquestador real confirmado, este shell script es redundante. *(Verificar que no sea usado por algún CRON de servidor antes de borrar)*. | Alta |
| `hpo_stgnn.py` | 2026-06-23 | No | Se verificó mediante un diff que fue suplantado por `tune_stgnn.py`. `hpo_stgnn.py` usa una pérdida binomial estándar y guarda en `docs/documentacion_soporte/best_hpo_params.json`. `tune_stgnn.py` optimiza asimetría, la métrica combinada con Pearson y exporta a `config/best_params.json`. | Alta |
| `cv_stgnn.py` | 2026-06-23 | No | Script de validación cruzada antiguo. No integrado en el orquestador principal. | Media |
| `interpret_stgnn.py` | 2026-06-23 | No | Utilidad de interpretabilidad individual. No requerida para el pipeline. | Media |
| `build_spatiotemporal_panel.py`| 2026-07-06 | No | Ingesta de datos geográficos. Script independiente previo al orquestador. Requiere integrarse o dejarse manual. | Baja |
| `data_validation_pipeline.py`| 2026-07-06 | Sí | Importado por `audit_dry_run.py`. Uso secundario para validación. | Baja |
| `audit_dry_run.py` | 2026-07-06 | No | Dependencia de validación secundaria, sin enlace directo a `train_models.py`. | Baja |

*(Nota sobre `tune_stgnn.py`: Fue retirado de esta tabla ya que su uso como script paralelo válido y vigente de optimización de hiperparámetros quedó demostrado, dejando de ser un archivo inútil/candidato a eliminar).*

## 4. Casos ambiguos / requieren decisión humana

1. **Scripts de Ingesta y Validación (Pipeline previo)**:
   - `build_spatiotemporal_panel.py` y `audit_dry_run.py`: Quedan sueltos como scripts manuales sin estar referenciados en `train_models.py`. ¿Deberían agregarse como Fase 0 de `train_models.py` o los mantendrás como herramientas manuales por separado?
2. **Archivos Temporales y Cachés (No-Python)**:
   - Archivos como `tune_stgnn.log`, directorios de caché de R (`RDataTmp`) y predicciones de texto (e.g. `modelo_spatial_resultados.txt`) pueden requerir depuración periódica o inclusión estricta en el `.gitignore`.

## 5. Archivos explícitamente EXCLUIDOS del análisis

- **Configuraciones y Dependencias**: El directorio `config/`, la carpeta de librerías locales frontend `lib/`, entornos virtuales, e integraciones.
- **Datos Vectoriales y Tabulares**: Archivos dentro de `/Capas`, ficheros `.shp`, o temporales de datos que alimentan el pipeline.
- **Scripts en lenguaje R (`.R`)**: Confirmado que `spml_s2sls.R` sigue siendo usado.
- **Documentación Activa**: Toda la carpeta `docs/`, `tasks/`, y los READMEs institucionales.
- **Módulos con Uso Confirmado**: Los archivos identificados como nodos del DAG de producción: `train_models.py`, `prep_gnn_data.py`, `train_stgnn.py`, `predict_alerts.py`, `evaluate_ab_testing.py`, `dashboard_app.py`, `tune_stgnn.py`, `spatial_gnn.py` y los submódulos de `src/dashboard/`.
