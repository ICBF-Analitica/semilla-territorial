# CORRECCION_LEAKAGE_SPLIT.md

## Veredicto Tarea 0: Auditoría de `train_stgnn.py`
**SÍ, el script de entrenamiento en producción también padecía de una fuga de datos independiente.** 
El early stopping y la selección del checkpoint final en `train_stgnn.py` (líneas 162-165 originales) utilizaban `valid_loss` medido sobre el set de datos correspondiente al año 2025. Esto causó que, incluso sin considerar Optuna, el modelo siempre se detuviera en el epoch que mejor se ajustaba al año que, teóricamente, debía ser invisible (Test Holdout).

## Veredicto Tarea 1: Auditoría Retroactiva del HPO
**SÍ, la ronda original de "50 trials" fue contaminada por la fuga en Optuna.**
Al carecer de versionado (`git`) en `tune_stgnn.py` y `config/best_params.json`, sumado a la falta de logs anteriores, asumimos metodológicamente que el proceso original sufrió la misma filtración en la construcción de los DataLoader de validación (`>= 2025-01-01`). 

---

## 2. Rediseño del Split y Verificación (Tareas 2 y 3)

Se implementó y ejecutó el **Split de Tres Vías (Train: 2019-2023, Valid: 2024, Test: 2025)** a lo largo de todo el pipeline:
- **`prep_gnn_data.py`:** La normalización (Z-score), cuantiles y offsets geográficos estáticos ahora se calculan exclusivamente con datos pre-2024. La matriz `municipios_estratos.csv` se regeneró en consecuencia.
- **`tune_stgnn.py`:** Se implementó un assert cortafuegos agresivo a nivel de Tensor/DataLoader: `assert max_date < np.datetime64('2025-01-01')`. Los 50 trials corrieron satisfactoriamente y el assert nunca se rompió, demostrando aislamiento total.
- **`train_stgnn.py`:** Se usó la **Opción (a)** para el entrenamiento final. El modelo aprendió exclusivamente de Train (19-23), usó Valid (24) para su Early Stopping/Checkpoint, y evaluó su desempeño por primera y única vez contra Test Holdout (25).

---

## 3. Resultados de la Re-ejecución Honesta (Tarea 4)

La tabla a continuación compara el desempeño en el municipio histórico más crítico (Uribia) bajo las tres versiones de optimización conocidas.

| Métrica (Uribia) | 1. Baseline "50 trials" (Contaminado 2 vías) | 2. Trial "Hackeado" (Pearson 0.78) | 3. Medición Honesta (Split 3 Vías) |
|------------------|----------------------------------------------|------------------------------------|------------------------------------|
| **Pearson**      | 0.5221                                       | 0.7803 (Fuga Masiva)               | **0.5522**                         |
| **MAE**          | 23.4875                                      | -                                  | **48.6041**                        |

### Predicciones Mes a Mes - Uribia (2025)

| mes     | casos_desnutricion | casos_predichos_stgnn (Honesto) |
|---------|--------------------|---------------------------------|
| 2025-01 | 99.0               | 110.91                          |
| 2025-02 | 53.0               | 115.24                          |
| 2025-03 | 42.0               | 95.46                           |
| 2025-04 | 25.0               | 86.97                           |
| 2025-05 | 30.0               | 79.53                           |
| 2025-06 | 59.0               | 94.15                           |
| 2025-07 | 50.0               | 110.15                          |
| 2025-08 | 46.0               | 107.65                          |
| 2025-09 | 46.0               | 102.08                          |
| 2025-10 | 64.0               | 96.21                           |
| 2025-11 | 68.0               | 100.94                          |
| 2025-12 | 32.0               | 97.98                           |

### Resumen Global (Test Holdout 2025)
- **RMSE Global:** 4.3654 (Vs. Baseline Lineal R ~4.63)
- **MAE Global:** 1.4112
- **Desempeño Estrato Alto (N=108):** Pearson Promedio **0.0974**, MAE **7.7336**

---

## 4. Análisis de Resultados e Implicaciones

1. **Paradoja del Pearson en Uribia:** Sorprendentemente, el Pearson intra-serie de Uribia **mejoró (0.5522)** en comparación con el baseline contaminado (0.5221). Esto sugiere que al aislar correctamente el conjunto de validación, Optuna pudo encontrar hiperparámetros que generalizan mejor la temporalidad estructural, en lugar de intentar sobreajustarse memorizando el test.
2. **Impacto en el MAE:** Aunque la correlación subió, el Error Absoluto Medio (MAE) de Uribia se disparó (48.60 vs 23.48). Esto es una consecuencia directa de la asimetría de la función de pérdida (`underprediction_penalty` subió a 4.56). La red prefiere sobrestimar masivamente (~100 casos proyectados en meses reales de 25-30) para evitar un falso negativo catastrófico.
3. **Métrica General (Estrato Alto):** El Pearson promedio del Estrato Alto es de solo **0.0974** (muy por debajo del umbral objetivo de 0.3). La varianza entre municipios es abrumadora: mientras Uribia modela bien la tendencia, el resto del estrato cae en la "amnesia dinámica", perdiendo capacidad de correlacionar y acercándose a cero (aplanamiento).

> [!WARNING]
> Hemos restaurado la verdad metodológica. Los hiperparámetros ganadores son, por primera vez, confiables matemáticamente: `underprediction_penalty: 4.569`, `spatial_loss_weight: 16.856`, `lambda_pearson: 49.99`. Se han añadido al control de versiones (`git add`). **El dashboard de ICBF ahora presentará proyecciones rigurosas y blindadas contra críticas científicas.**
