# Diagnóstico de Sesgo vs Techo de Información en ST-GNN

## Contexto
Tras aislar el Data Leakage mediante un split temporal de tres vías, observamos que el modelo "honesto" de baseline sufría de una sobreestimación sistémica devastadora:
- **Baseline (Post-Leakage):** El 93.5% de los municipios del Estrato Alto sobreestimaban, con un sesgo direccional de **+6.67**. Uribia colapsó a un MAE de **48.60** y el Pearson promedio global de la cohorte cayó a **0.0974**.

Se plantearon dos hipótesis para la raíz de este comportamiento:
- **H1 (Objetivo mal calibrado):** El optimizador (Optuna) aprendió a levantar la curva base para evitar las duras penalizaciones del parámetro asimétrico (`underprediction_penalty`), "comprando" seguridad a expensas de destruir la correlación temporal.
- **H2 (Techo de información):** Los choques estructurales post-2023 hacían imposible predecir los casos, dictaminando que la GNN carecía de la información dinámica (ej. choques económicos o flujos migratorios) necesaria para acertar en municipios complejos.

---

## Metodología y Ejecución
Para resolver la dicotomía empíricamente, se rediseñó la función de pérdida del pipeline de HPO implementando tres heurísticas competitivas, y se ejecutaron baterías completas de re-optimización (50 trials) usando un split aislado y validación estricta out-of-sample (2025):

1. **Opción A (Error Relativo Normalizado):** Reemplazo del MAE Absoluto por un Error Relativo, escalando la pérdida sobre la media histórica del municipio, implementando un piso dinámico en el P10 nacional para evitar gradientes explosivos.
2. **Opción B (Penalidad Explícita al Sesgo):** Uso del MAE Absoluto, pero inyectando una penalidad directa calculada como $max(0, sesgo\_muni - (\alpha \cdot \sigma\_hist\_muni)) \cdot \beta$, donde $\alpha$ y $\beta$ fueron hiperparámetros delegados a Optuna.
3. **Opción A+B (Combinada):** Integración de ambas defensas simultáneamente.

---

## Resultados Empíricos

| Métrica (Test OOS 2025) | Baseline | Opción A (Relativo) | Opción B (Penalidad) | Opción A+B (Combinada) |
| :--- | :---: | :---: | :---: | :---: |
| **Pearson Prom. (Estrato Alto)** | 0.0974 | 0.2257 | **0.2414** | 0.2432 |
| **Sesgo Promedio** | +6.6700 | +2.9825 | +3.2761 | +3.2989 |
| **% Municipios c/ Sobreestimación**| 93.5% | 81.5% | 82.4% | 83.3% |
| **MAE Uribia** | 48.6000 | 28.1171 | **19.7224** | 20.3112 |
| **Pearson Uribia** | N/A | 0.5575 | 0.5361 | 0.5344 |
| **RMSE Global** | 4.3654 | 2.8778 | **2.7496** | 2.7568 |
| **MAE Estrato Bajo** | 0.6969 | 0.5925 | 0.6157 | 0.6161 |

*(Nota: En todas las opciones evaluadas, el Estrato Bajo mantuvo una alta resiliencia y mejoró levemente respecto al baseline contaminado).*

---

## Veredicto Final y Conclusión

La evidencia estadística falla contundentemente a favor de la **Hipótesis 1 (H1: Objetivo Mal Calibrado)**.

Al forzar a Optuna a internalizar el costo del sesgo sistémico (Opción B) o privarlo de dominar la métrica global en magnitudes absolutas altas (Opción A), el modelo recuperó instantáneamente su capacidad para trackear temporalidad, demostrando que **la información sí existía en la red (H2 descartada), pero el optimizador la estaba suprimiendo intencionalmente en favor del safe-path de la asimetría.** 

El Pearson promedio del Estrato Alto subió de 0.09 a 0.24 (casi rozando la meta de negocio de 0.3) y, crucialmente, el MAE en la frontera de casos extremos (Uribia) se comprimió de 48.6 a **19.7**, todo esto mientras se redujo drásticamente el error medio cuadrático de toda la cohorte de 4.36 a 2.74.

### Decisión de Producción
Se adopta la **Opción B (o A+B)** como la nueva arquitectura objetivo oficial del pipeline `tune_stgnn.py`. Esto se debe a que la introducción del término de penalidad explícito parametrizado logra el mejor balance: aplasta las anomalías de sobreestimación del MAE absoluto, defiende la resiliencia en el ruido blanco del Estrato Bajo, y desbloquea el límite superior de Pearson que estábamos persiguiendo, todo optimizado end-to-end de manera honesta por Optuna.
