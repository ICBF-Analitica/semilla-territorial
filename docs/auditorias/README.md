# Índice Cronológico de Auditorías e Investigación (Capa 2)

Este documento sirve como índice central de la documentación técnica y de auditoría exhaustiva del proyecto SEMILLA.

## Arquitectura del modelo (ST-GNN, S2SLS, GNN)

- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/diagnostico_spml.md`
  * *"Este documento detalla la auditoría del script de panel espacial (`spml.R`), evaluando su estructura, lógica matemática, dependencias y estado de ejecución actual en el fork del Proyecto SEMILLA."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/evaluacion_resultados_poisson.md`
  * *"Este documento contiene un diagnóstico detallado de las dos especificaciones del modelo de regresión de Poisson reportadas en `modelo_poisson_resultados.txt`."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/implementation_plan_spml.md`
  * *"Este plan describe las acciones técnicas para resolver las limitaciones del entorno R, corregir la deuda técnica de `spml.R` y ejecutar de forma reproducible el modelo de panel espacial para evaluar sus resultados."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/stgnn_implementation_plan.md`
  * *"Este documento detalla la arquitectura técnica y el plan paso a paso para completar la migración de los modelos espaciales (R/S2SLS) hacia una red neuronal espaciotemporal (ST-GNN) en Python utilizando PyTorch Geometric."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/stgnn_tasks.md`
  * *"- `[x]` 1. Actualizar `spatial_gnn.py` (Arquitectura)"*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/stgnn_walkthrough.md`
  * *"Este documento detalla la implementación, entrenamiento y validación de la red neuronal espaciotemporal basada en grafos (ST-GNN) utilizando regresión Binomial Negativa para el Proyecto SEMILLA."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough diagnosing SPML spatial model.md`
  * *"Auditar, refactorizar y ejecutar el modelo de panel espacial autorregresivo (SAR) implementado en `spml.R`, haciéndolo 100% autónomo y reproducible."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_modelo_poisson.md`
  * *"Este documento detalla los cambios realizados y los resultados de estimación del modelo de regresión de Poisson corregido."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_modelo_poisson_R.md`
  * *"Este documento detalla los cambios realizados para hacer autónomo el script `modelo_poisson.R` en el fork, la corrección de fallas críticas de fecha e importación recursiva detectadas en las canalizaciones de R, y los resultados del análisis comparativo y validación cruzada con su contraparte en Python (`modelo_poisson.py`)."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_ndvi_anomalias.md`
  * *"Corregir el "silenciamiento" estadístico del NDVI en el modelo de panel espacial dinámico mediante anomalías estandarizadas locales (Z-Score por municipio) y rezagos profundos (4 y 8 meses)."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_spml.md`
  * *"Auditar, refactorizar y ejecutar el modelo de panel espacial autorregresivo (SAR) implementado en `spml.R`, haciéndolo 100% autónomo y reproducible."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_spml_dinamico.md`
  * *"Este documento presenta los detalles técnicos de la implementación, el diagnóstico del límite de memoria y la validación empírica de los tres criterios de calidad del modelo espacial de panel estimado."*
- **[Creado: 2026-06-23 00:50:26 | Modif: 2026-06-23 00:50:26]** `docs/documentacion_soporte/stgnn_advanced_tasks.md`
  * *"- `[x]` 1. **Paso 1: Modificar `spatial_gnn.py`**"*
- **[Creado: 2026-06-23 00:50:26 | Modif: 2026-06-23 00:50:26]** `docs/documentacion_soporte/walkthrough_stgnn_advanced.md`
  * *"La arquitectura central ha sido rodeada de un ecosistema MLOps de producción compuesto por cinco fases, que transforman un prototipo predictivo en un **motor probabilístico escalable**."*
- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-10 12:32:20]** `docs/auditorias/CORRECCION_BASELINE_S2SLS.md`
  * *"Este documento consolida la auditoría final sobre el pipeline predictivo SEMILLA (ST-GNN y S2SLS), resolviendo las discrepancias de "Data Leakage", inestabilidad del DataLoader, conteo de universos municipales, y limitaciones estructurales de R."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/implementation_plan_Normalizacion_estratificada.md`
  * *"El escalamiento global (`StandardScaler` sobre todo el dataset) sufre de un problema de dominancia de varianza. Al calcular la media y desviación estándar de todo el país mezclado, los municipios de "Alta Incidencia" (como Uribia o Bogotá) quedan aplastados hacia la media, diluyendo sus variaciones críticas. Esto confunde a la ST-GNN y causa el aplanamiento de predicciones extremas."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/implementation_plan_refactor_AsymmetricNBL.md`
  * *"El objetivo es eliminar el efecto de "Regresión a la Media" que ocasiona que el modelo ST-GNN subestime los picos de desnutrición en zonas críticas. Para el Proyecto SEMILLA, un falso negativo (no predecir un pico) es inaceptable, mientras que un falso positivo es precaución."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/02_stgnn_asymmetric_loss.md`
  * *"Durante la evaluación inicial del modelo Spatio-Temporal Graph Neural Network (ST-GNN) del Proyecto SEMILLA, se detectó un fenómeno de **Smoothing Effect** (Regresión a la Media). La red neuronal, al optimizar un *Negative Log-Likelihood* (NLL) estándar, tendía a subestimar severamente los picos de desnutrición en zonas críticas y densamente pobladas (ej. Bogotá, Medellín) para minimizar el error global promedio a nivel nacional."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/03_hyperparameter_optimization.md`
  * *"El núcleo predictivo del Proyecto SEMILLA (la red neuronal ST-GNN) se enfrentaba a un dilema de política pública durante su calibración de parámetros:"*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/04_stratified_normalization.md`
  * *"Durante el entrenamiento del modelo predictivo espaciotemporal (ST-GNN) del Proyecto SEMILLA, se identificó que las predicciones en municipios de "Alta Incidencia" (como Uribia o Bogotá) sufrían de **aplanamiento** y subestimación crónica de picos."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/05_exposure_offset.md`
  * *"En iteraciones anteriores, la implementación de la "Normalización Estratificada" logró aislar matemáticamente el ruido entre municipios de alta y baja incidencia. Sin embargo, este proceso eliminó la magnitud real de las variables de entrada (`cantidad` de casos)."*
- **[Creado: 2026-07-09 08:41:31 | Modif: 2026-07-09 08:41:31]** `docs/auditorias/DIAGNOSTICO_S2SLS_VERSION_INCORRECTA.md`
  * *"El script `archive/audit_2026_07/s2sls_individual.R` **no es una versión completa o independiente del pipeline**. Es un "script envoltura" (wrapper) de diagnóstico."*

## Auditoría de fugas de datos

- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-08 15:06:28]** `docs/auditorias/CORRECCION_LEAKAGE_IMPUTACION_STGNN.md`
  * *"Se realizó una auditoría exhaustiva sobre el script de preprocesamiento del modelo ST-GNN en producción (`prep_gnn_data.py`), específicamente en la operación de `bfill()` utilizada para rellenar datos faltantes. El uso de `bfill()` sobre el panel completo se identificó teóricamente como un vector de *data leakage* anticausal, permitiendo que información de validación/prueba se filtrara hacia el entrenamiento."*
- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-08 15:06:28]** `docs/auditorias/CORRECCION_LEAKAGE_SPLIT.md`
  * *"**SÍ, el script de entrenamiento en producción también padecía de una fuga de datos independiente.**"*
- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-08 15:06:28]** `docs/auditorias/DEPURACION_CANDIDATOS.md`
  * *"**Orquestador Confirmado: `train_models.py`**"*
- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-08 15:06:28]** `docs/auditorias/INVESTIGACION_PEARSON_078.md`
  * *"**CAUSA RAÍZ: Fuga de datos (Data Leakage) confirmada en el proceso de optimización (HPO) al sobreajustar directamente sobre el set de validación Out-of-Sample (año 2025).**"*
- **[Creado: 2026-07-08 15:06:28 | Modif: 2026-07-08 15:06:28]** `docs/auditorias/REDISENO_OBJETIVO_DIAGNOSTICO.md`
  * *"Tras aislar el Data Leakage mediante un split temporal de tres vías, observamos que el modelo "honesto" de baseline sufría de una sobreestimación sistémica devastadora:"*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/cambios_modelo_stgnn_2.md`
  * *"Primera corrección de fugas de datos (Data Leakage), desvinculación de Optuna del set de validación OOS y ajustes al Early Stopping."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/architecture/cambios_modelo_stgnn_3.md`
  * *"Rediseño de la función objetivo y métricas de evaluación tras detectar 'shortcut learning' causado por la predicción constante del promedio poblacional."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-09 00:14:20]** `docs/architecture/cambios_modelo_stgnn.md`
  * *"Versión base intermedia que consolidó la primera migración de arquitectura y ajustes hiperparamétricos antes del hallazgo de data leakage profundo."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-09 08:41:31]** `docs/architecture/cambios_modelo_stgnn_4.md` **(Versión Final)**
  * *"Cierre metodológico final con reorganización institucional del repositorio, blindaje CI/CD, protección de artefactos y reporte final de sesgo direccional (Pearson)."*

## Corrección de dashboard/UI

- **[Creado: 2026-07-09 00:14:20 | Modif: 2026-07-09 00:14:20]** `docs/auditorias/CIERRE_METADATA_DASHBOARD.md`
  * *"Durante la auditoría de despliegue, se detectó que el dashboard experimentaba un **colapso silencioso** de su KPI de "Anomalía Vegetal (NDVI)", mostrando de manera crónica "N/D" (Sin datos)."*
- **[Creado: 2026-07-09 08:41:31 | Modif: 2026-07-09 08:41:31]** `docs/auditorias/CORRECCION_COLISION_NOMBRES_MUNICIPIO.md`
  * *"El análisis del shapefile municipal arrojó que existen **51 nombres de municipio duplicados** a lo largo del país, que comparten el mismo texto pero representan a diferentes divisiones políticas."*
- **[Creado: 2026-07-09 08:41:31 | Modif: 2026-07-09 08:41:31]** `docs/auditorias/ACLARACIONES_DASHBOARD_STGNN.md`
  * *"La discrepancia entre 51 y 64 fue el resultado de un error de lectura de mi parte sobre la salida estándar (stdout) de la terminal en mi primer diagnóstico, y no de un cambio metodológico o contaminación de datos."*
- **[Creado: 2026-07-09 08:41:31 | Modif: 2026-07-09 08:41:31]** `docs/auditorias/CIERRE_AUDITORIA_UI.md`
  * *"Este documento consolida la validación de los dos puntos críticos levantados previo al cierre de la corrección en el Dashboard."*
- **[Creado: 2026-07-10 12:32:20 | Modif: 2026-07-10 12:32:20]** `docs/auditorias/INVESTIGACION_QUIEBRE_ESTRUCTURAL_2024.md`
  * *"La dirección del proyecto reportó la implementación de medidas institucionales preventivas a partir de febrero de 2024. Se planteó la hipótesis formal de que estas medidas representan un quiebre estructural (un cambio de régimen) en la relación entre los predictores climáticos (como la temperatura o el NDVI) y la cantidad de casos de desnutrición reportados."*

## Migración de infraestructura (git, GitLab, CI/CD)

- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/riesgos_y_decisiones/2026-07-06_mitigaciones_pipeline_semilla.md`
  * *"**Fecha:** 2026-07-06"*
- **[Creado: 2026-07-09 08:41:31 | Modif: 2026-07-09 08:41:31]** `docs/architecture/PLAN_MIGRACION_ESTRUCTURA_INSTITUCIONAL.md`
  * *"1. **Monolito en `src/` vs Pipelines Múltiples:** La plantilla asume un solo flujo (ej. `model_training.py`), pero SEMILLA tiene dos motores independientes (ST-GNN en Python y S2SLS en R)."*

## Otro (Especificar: Documentación técnica)

- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/diagnostico_desnutricion_v1.md`
  * *"Este reporte documenta los resultados de la auditoría y diagnóstico realizados sobre el pipeline de consolidación y estimación del modelo Poisson (especificaciones Open-Meteo y Clima de Grilla) tras la migración de datos de simulación (mockup) a datos reales."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/diagrama_ejecucion_v1.md`
  * *"Este documento describe el flujo de trabajo y la arquitectura de orquestación implementada en el script `ejecutar_pipeline.py` para procesar los datos reales y estimar el modelo Poisson final."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/implementation_plan_SPGM.md`
  * *"El modelo SAR estático actual (`spml` por ML) presenta tres problemas diagnosticados en las instrucciones del agente:"*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/lessons_v1.md`
  * *"Este documento registra las lecciones técnicas aprendidas durante la auditoría, optimización y migración del pipeline de datos y modelos del proyecto SEMILLA a Python."*
- **[Creado: 2026-06-22 12:31:22 | Modif: 2026-06-22 12:31:22]** `docs/documentacion_soporte/walkthrough_v1.md`
  * *"Este documento resume los cambios realizados, el proceso de validación y los resultados del modelo de estimación Poisson para el **Proyecto SEMILLA**."*
- **[Creado: 2026-06-23 00:50:26 | Modif: 2026-06-23 00:50:26]** `docs/documentacion_soporte/walkthrough_bifocal.md`
  * *"El dashboard original mostraba únicamente **riesgo absoluto**: Uribia (La Guajira) aparecía siempre en primer lugar con P=99.9%, seguida por los mismos municipios históricamente vulnerables. Un tomador de decisiones del ICBF no obtiene valor agregado de esto — ya sabe que La Guajira necesita recursos permanentes."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/reporte_ab_testing_W1.md`
  * *"Este documento presenta la validación estadística rigurosa (Backtesting Fuera de Muestra) comparando el rendimiento del modelo de Deep Learning Geométrico (ST-GNN) frente a la línea base econométrica espacial (S2SLS)."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/reporte_ab_testing_W12.md`
  * *"Este documento presenta la validación estadística rigurosa (Backtesting Fuera de Muestra) comparando el rendimiento del modelo de Deep Learning Geométrico (ST-GNN) frente a la línea base econométrica espacial (S2SLS)."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/reporte_ab_testing_W4.md` **(Versión Final)**
  * *"Este documento presenta la validación estadística rigurosa (Backtesting Fuera de Muestra) comparando el rendimiento del modelo de Deep Learning Geométrico (ST-GNN) frente a la línea base econométrica espacial (S2SLS)."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/documentacion_soporte/walkthrough_perfil_municipal.md`
  * *"Este documento resume las modificaciones implementadas en el pipeline visual del Proyecto SEMILLA para integrar la auditoría a nivel municipal solicitada por el comité directivo."*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/riesgos_y_decisiones/2026-07-06_imputacion_sentinel.md`
  * *"**Fecha:** 2026-07-06"*
- **[Creado: 2026-07-08 15:35:47 | Modif: 2026-07-08 15:35:47]** `docs/riesgos_y_decisiones/2026-07-06_riesgo_estructura_datos.md`
  * *"**Fecha:** 2026-07-06"*

