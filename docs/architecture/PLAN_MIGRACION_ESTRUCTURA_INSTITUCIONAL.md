# Plan de Migración a Estructura Institucional

## 1. Diferencias Estructurales Clave y Decisiones Requeridas

1. **Monolito en `src/` vs Pipelines Múltiples:** La plantilla asume un solo flujo (ej. `model_training.py`), pero SEMILLA tiene dos motores independientes (ST-GNN en Python y S2SLS en R). 
   * **Decisión propuesta:** No forzar un monolito. Subdividir `src/models/` en `src/models/stgnn/` y `src/models/s2sls/`. De igual forma con el entrenamiento, adaptando los archivos a `src/models/stgnn/train_stgnn.py` y análogos, manteniendo sus nombres para evitar confusión semántica. ¿Estás de acuerdo con esta adaptación?

2. **Ausencia del Componente UI (Dashboard) en la Plantilla:** La plantilla genérica institucional no contempla aplicaciones interactivas. 
   * **Decisión propuesta:** (Ver Tarea 2 para opciones detalladas). Requiero tu confirmación explícita sobre qué ubicación prefieres para evitar diluir la frontera entre la canalización de datos (Backend ML) y la presentación (Frontend).

3. **Formatos de Serialización Propios (`.pt`, `.txt`):** La carpeta `models/` de la plantilla suele esperar archivos de Scikit-Learn (ej. `.pkl`). SEMILLA produce el tensor de red neuronal `best_model_stgnn.pt` y resultados estadísticos en texto plano `modelo_spatial_resultados.txt`.
   * **Decisión propuesta:** Se alojarán en `models/` y `data/04_model_output/` (según tabla abajo), conservando estrictamente sus extensiones originales y sin forzar serializaciones ajenas. ¿Conforme?

4. **Lenguaje Híbrido (R y Python):** La plantilla no anticipa scripts en R ni los contempla en las convenciones. 
   * **Decisión propuesta:** Reubicar `spml_s2sls.R` dentro de `src/models/s2sls/` documentando explícitamente el requerimiento de R en la nueva arquitectura técnica (`docs/architecture.md`). ¿Conforme?

## 2. Mapeo Completo (Carpeta por Carpeta)

| Carpeta/Archivo Objetivo | Categoría | Contenido Actual Propuesto | Origen (ruta actual) | Notas / Dependencias Críticas a Actualizar |
|---|---|---|---|---|
| `data/01_raw/` | Poblar | `Capas/`, `Clima/`, `Desnutricion/`, `Teledetección/` | Raíz actual | Actualmente excluidas en `.gitignore`. ¿Se mantienen ignoradas en la nueva estructura? |
| `data/02_intermediate/` | Poblar | `preds_s2sls.csv` | `data/interim/` | Actualizar imports en los scripts S2SLS. |
| `data/03_primary/` | Poblar | `data_stgnn.pt`, `panel_historico_dashboard.csv`, `desnutricion_mensual_consolidado.csv` | Raíz, `data/processed/` | Archivos base consolidados. Actualizar `torch.save`/`torch.load`. |
| `data/04_model_output/` | Poblar | `predicciones_stgnn.csv`, `predicciones_stgnn_metadata.json`, `modelo_spatial_resultados.txt` | `data/processed/`, Raíz | Productos de salida puros; el Dashboard leerá de aquí. |
| `models/` | Poblar | `best_model_stgnn.pt`, `scaler_alta.pkl`, `scaler_baja.pkl` | Raíz, `data/processed/` | Archivos de pesos y estados del modelo predictivo (Diferencia Estructural #3). |
| `docs/data_dictionary.md` | Poblar (nuevo) | Diccionario de variables | - | Requiere redacción técnica desde cero (7 features, target). |
| `docs/architecture.md` | Poblar (nuevo) | Detalle arquitectónico actualizado | - | Derivado de los documentos `cambios_modelo_stgnn.md`. |
| `docs/conclusiones.md` | Poblar (adaptar)| Sección "Cierre del Proyecto" de documentación | `docs/architecture/cambios_modelo_stgnn.md` | Extracción de contenido ya existente. |
| `docs/auditorias/` | Poblar | Mantener actas de auditoría previas (S2SLS, STGNN, UI) | `docs/auditorias/` | Trasladar intacta para trazabilidad histórica. |
| `src/data/pipeline_integration.py` | Adaptar | `prep_gnn_data.py` (Construcción del Panel) | Raíz | Integración principal de datos; deberá actualizar múltiples rutas (Diferencia Estructural #1). |
| `src/models/stgnn/` | Adaptar | `train_stgnn.py`, `tune_stgnn.py`, `spatial_gnn.py`, `cv_stgnn.py` | Raíz | Agrupación lógica del motor ST-GNN en PyTorch. Mantienen nombre original. |
| `src/models/s2sls/` | Adaptar | `spml_s2sls.R` | Raíz | Agrupación lógica del modelo base espacial (Diferencia Estructural #4). |
| `src/model_evaluation.py` | Adaptar | `evaluate_ab_testing.py`, `predict_alerts.py`, `interpret_stgnn.py` | Raíz | Centralización analítica. **OJO:** `predict_alerts.py` tiene hiperparámetros hardcodeados de arquitectura; requiere refactorización para no desincronizarse del modelo. |
| `pipelines/pipeline_ml.py` | Adaptar | `train_models.py` (Orquestador) | Raíz | Encaje directo, pero obligará a modificar todos sus `subprocess.run(...)`. |
| `tests/` | Placeholder | N/A | - | SEMILLA no tiene suite de pruebas unitarias al momento; queda como Placeholder. |
| `notebooks/` | Poblar / Plch. | Revisión de `archive/audit_2026_07/` | `archive/` | Si no hay `.ipynb` válidos, la carpeta se genera vacía (Placeholder). |
| `RECURSOS/` | Placeholder | Elementos visuales y presentaciones | - | Solo se creará la carpeta. |
| `config/` | Poblar | `best_params.json`, `municipios_estratos.csv` | `config/` | Movimiento directo; requerirá actualizar las rutas de carga en la etapa 1 del orquestador. |

### Archivos sin ubicación clara en la estructura objetivo
- `CLAUDE.md`, `PROTECCION_ARTEFACTOS.md`: Documentos guía exclusivos del LLM. Deberían permanecer en la raíz para no romper las directrices sistémicas, o ser agrupados en una carpeta oculta.
- `DIAGNOSTICO_S2SLS_VERSION_INCORRECTA.md`: Puede ser absorbido lógicamente por `docs/auditorias/`.
- `lib/` (Contiene bindings de JavaScript y CSS de `tom-select` y `vis-network`): Lógicamente forma parte integral del Front-End del Dashboard. Se reubicará en `src/dashboard/lib/` y se auditarán exhaustivamente las referencias a assets estáticos en el HTML/JS dentro del código de Python para evitar silenciosas caídas visuales.

## 3. El Dashboard: Opciones de Ubicación

Dado que el dashboard (`dashboard_app.py`, `src/dashboard/`) no está previsto en la arquitectura ML genérica, propongo las siguientes opciones para que tomes la decisión:

*   **Opción A: Carpeta independiente `app/` en la raíz.**
    *   Reubicación: `app/dashboard_app.py`, `app/components.py`, `app/data_loader.py` y `app/lib/`
    *   *Ventaja:* Separa completamente el "producto de consumo" (Front-End) del "motor científico y de modelado" (`src/`).

*   **Opción B (Recomendada): Submódulo dentro de `src/` (`src/dashboard/`).**
    *   Reubicación: `src/dashboard/dashboard_app.py`, conservando su propia estructura actual pero dentro del nuevo árbol fuente.
    *   *Ventaja:* Todo el código fuente productivo y de negocio queda encapsulado de forma cohesiva bajo `src/`. Esto alinea con el principio de que el dashboard es un componente integral de la entrega de valor, no un ente aislado.

**¿Qué opción eliges para dictar el destino definitivo del Dashboard?**

## 4. Plan de Verificación de Integridad (Antes y Después)

Antes de proponer este plan, ejecuté exitosamente el orquestador actual (`train_models.py`) de principio a fin para establecer una línea base incorruptible.

### Línea Base Actual de Rendimiento (Post-Reparaciones Previas)
**Fase 2: Línea Base S2SLS (Test Holdout 2025):**
*   RMSE TEST (2025): 1.9366
*   MAE TEST (2025): 0.8591
*   RMSE URIBIA (2025): 18.7304
*   MAE URIBIA (2025): 14.6339

**Fase 3: Línea Base ST-GNN (OOS Evaluation - Estratificada):**
*   **RMSE Global Ponderado:** ~2.63 *(Cálculo matemático real derivado de los estratos)*
*   **[Estrato Alto - Histórico Crítico] (N=108):** RMSE: 7.7757 | MAE: 4.8230 | **Pearson Promedio intra-serie: 0.2403**
*   **[Estrato Bajo - Control Nacional] (N=956):** RMSE: 0.9432 | MAE: 0.6078 | **Pearson Promedio intra-serie: 0.0445**

> [!CAUTION]
> El log del script reporta un "Pearson Global" de `0.8407`. Este número está matemáticamente invalidado (Paradoja de Simpson por cálculo *pooled* inter-estrato) ya que el techo teórico de correlación de los datos es ~0.74. **Bajo ningún concepto** se usará ese `0.8407` como meta de validación; el `Stop the Line` se basará rigurosamente en las métricas estratificadas mostradas arriba (específicamente, retener el Pearson del Estrato Alto en `~0.2403 ±0.0033`).

### Protocolo de Validación (Etapa de Ejecución)
1. Los archivos se trasladarán bloque a bloque (1. Datos, 2. Modelos, 3. Orquestador, 4. Interfaz UI).
2. Tras **cada bloque**, se aplicará el `find and replace` minucioso de dependencias duras (`pd.read_csv`, `torch.load()`, `subprocess.run()`, etc).
3. Tras **cada bloque**, se lanzará inmediatamente `python pipelines/pipeline_ml.py` (o su equivalente temporal). 
4. **Criterio de Aceptación Estricto ("Stop the Line"):** Si durante la ejecución post-bloque, los resultados difieren de la línea base documentada arriba (incluso por fuera de la tolerancia documentada de `±0.0033` en Uribia), el proceso se detendrá inmediatamente. No se avanzará al siguiente bloque hasta aislar la causa de la regresión y revertirla.
5. Finalmente, en el Bloque 4, se validará que el Dashboard se inicialice (`streamlit run src/dashboard/dashboard_app.py`) asegurando que los assets estáticos de `src/dashboard/lib/` se rendericen sin fallos silenciosos.
