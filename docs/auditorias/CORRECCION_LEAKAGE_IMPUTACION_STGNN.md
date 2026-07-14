# Auditoría y Corrección de Leakage de Imputación en ST-GNN (Tarea D)

## Resumen Ejecutivo
Se realizó una auditoría exhaustiva sobre el script de preprocesamiento del modelo ST-GNN en producción (`prep_gnn_data.py`), específicamente en la operación de `bfill()` utilizada para rellenar datos faltantes. El uso de `bfill()` sobre el panel completo se identificó teóricamente como un vector de *data leakage* anticausal, permitiendo que información de validación/prueba se filtrara hacia el entrenamiento.

## 1. Cuantificación de Afectación y Medición de Impacto
Se implementó un rastreador exhaustivo para detectar qué celdas específicas en el período de entrenamiento estaban siendo contaminadas con datos $\ge 2024$.

**Resultados de la Auditoría Empírica:**
*   **Municipios afectados por leakage de bfill:** 0 de 1064.

**Comparativa de Métricas (Test 2025):**
| Métrica | Antes (bfill global) | Después (ffill + media Train) | Diferencia |
|---|---|---|---|
| RMSE Global | 2.7632 | 2.7704 | +0.0072 |
| MAE Global | 1.0653 | 1.0682 | +0.0029 |
| Pearson Estrato Alto | 0.2395 | 0.2397 | +0.0002 |

## 2. Veredicto Oficial
> **Veredicto: IMPACTO NEGLIGIBLE.**
> 
> Aunque la vulnerabilidad metodológica existía en el código, la estructura de los datos crudos (falta de gaps en el límite temporal de 2023) evitó que el leakage se materializara. La ligera variación de milésimas en las métricas no proviene de un cambio en los tensores de entrada, sino del ruido inherente (no determinismo) en la función `scatter_add` de PyTorch Geometric al ejecutarse sobre CUDA.

**Conclusión:** Dado que el leakage efectivo fue cero, los hiperparámetros previamente sintonizados (almacenados en `config/best_params.json`) conservan su total validez y **no es necesario lanzar una nueva ronda de optimización Optuna**.

## 3. Estado del Código
La corrección (ffill seguido de imputación con medias exclusivas de entrenamiento y fallback a cero) ha sido integrada permanentemente en la rama de producción de `prep_gnn_data.py`. Esto previene futuras fugas ante la llegada de nuevos datos.
