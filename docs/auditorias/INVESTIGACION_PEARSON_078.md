# INVESTIGACION_PEARSON_078.md

**CAUSA RAÍZ: Fuga de datos (Data Leakage) confirmada en el proceso de optimización (HPO) al sobreajustar directamente sobre el set de validación Out-of-Sample (año 2025).**

## 1. Línea de Tiempo Reconstruida

- **Estado de Versión:** El archivo `config/best_params.json` **NO está versionado en Git** (aparece como untracked en el repositorio local). Esto representa una debilidad operativa, ya que no deja rastro auditable (autor o commit) de las alteraciones en los hiperparámetros.
- **Evento 1 (2026-07-07 16:14):** Se ejecutó una ronda de optimización usando `tune_stgnn.py` que volcó logs en `tune_stgnn.log`. Esta ejecución falló en la última línea al intentar exportar los resultados (`NameError: name 'trial' is not defined`), impidiendo guardar el JSON.
- **Evento 2 (2026-07-07 20:23):** Alguien (usuario u otro agente) corrigió el código de `tune_stgnn.py` (sustituyendo `trial.params` por `study.best_params`) y reejecutó el script manualmente. Esta ejecución fue exitosa y sobreescribió `config/best_params.json` con los nuevos hiperparámetros. Al ejecutarse directamente sin redirección al archivo de log, no dejó registro de texto.

## 2. Auditoría de la Integridad de la Validación (Veredictos)

1. **Máscara temporal de entrenamiento**: ✅ **Verificado sin problemas.** 
   En `prep_gnn_data.py` (Línea 58) se mantiene estricto el corte temporal: `train_mask = panel['fecha'] < '2025-01-01'`. Todos los scalers y promedios se ajustan sobre esta máscara.
2. **Independencia del offset (`x_static`)**: ✅ **Verificado sin problemas.** 
   En `prep_gnn_data.py` (Línea 77), `train_cases_mean` se calcula agrupando estrictamente sobre la `train_mask`. El set de 2025 no influye en la base geométrica.
3. **Separación de folds en la validación (HPO)**: ⚠️ **Anomalía encontrada (FUGA DE DATOS).** 
   En `tune_stgnn.py` (Líneas 109-113), el script de Optuna separa los datos en `train_indices` (< 2025) y `valid_indices` (>= 2025). Luego, **usa el DataLoader de validación (2025) para guiar la optimización** y calcular el score que Optuna minimiza (Línea 160+). Al sintonizar hiperparámetros contra 2025, el modelo "ve" el año de evaluación (data leakage) y el resultado deja de ser Out-of-Sample.
4. **Cambios en `tune_stgnn.py` (Lógica de Optuna)**: ⚠️ **Anomalía encontrada (Hackeo de Métrica).** 
   En `tune_stgnn.py` (Línea 78), el script define el factor de correlación como un parámetro a optimizar: `lambda_pearson = trial.suggest_float("lambda_pearson", 5.0, 50.0)`. Como la función objetivo resta este valor al score final (`val_score = val_score - (lambda_pearson * pearson_promedio)`), el optimizador aprendió a hacer "trampa": escoge sistemáticamente el valor más alto posible para `lambda_pearson` (~49.98) e hiperparámetros que formen curvas parecidas al año 2025, con el único fin de crear un número artificialmente negativo y ganar el trial.
5. **Cálculo de Pearson reportado**: ✅ **Verificado sin problemas.** 
   El cálculo (Líneas 173-195) es correcto y robusto. Reformatea el tensor a temporal-espacial y calcula la correlación intra-serie (municipio por municipio en el estrato alto) manejando los casos de varianza cero antes de promediar. No se comete la falacia del "pooled Pearson".

## 3. Conclusión de la Causa Raíz

El Pearson de **0.7803** no es un resultado legítimo que rompa el techo teórico, sino el **producto de una fuga de datos (Data Leakage) por sobreajuste al set de evaluación.** 

Optuna fue alimentado con el año 2025 (Out-of-Sample) como su métrica guía. Para minimizar la función objetivo, Optuna sobreajustó los pesos de la red a las dinámicas exactas del 2025 y empujó el peso penalizador (`lambda_pearson`) al límite máximo.

## 4. Recomendación Concreta

Para estabilizar la arquitectura y evitar falsas percepciones de mejora en el futuro:

1. **Restaurar el baseline:** Se debe modificar `config/best_params.json` de vuelta a los parámetros provistos en el prompt (la ronda válidada real) y añadir el archivo al control de versiones (`git add config/best_params.json`).
2. **Corregir el Data Leakage en Optuna:** `tune_stgnn.py` debe reescribirse para que `valid_indices` use exclusivamente el último año histórico (ej. 2024), y `train_indices` use 2019-2023. El año 2025 debe aislarse completamente.
3. **Congelar Parámetros de Negocio:** Retirar `lambda_pearson`, `underprediction_penalty` y `spatial_loss_weight` de la lista de sugerencias de Optuna (Líneas 76-78). Estos son hiperparámetros de penalización de negocio, no parámetros de red neuronal. Deben fijarse estáticos durante el HPO.
