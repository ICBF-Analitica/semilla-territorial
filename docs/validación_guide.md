# Guía de Validación para Pares Evaluadores

Esta guía establece las rutas exactas para que un evaluador verifique el origen y la reproducibilidad de los resultados reportados en los documentos de síntesis, sin tener que navegar a ciegas por los repositorios del proyecto.

**Repositorio del componente predictivo:** [https://gitlab.com/jaimescastrodf-group/semilla-fork](https://gitlab.com/jaimescastrodf-group/semilla-fork) — todas las rutas de archivo mencionadas en esta guía (`docs/auditorias/`, `pipelines/`, `src/`) están dentro de este repositorio.

## 1. ¿Quieres verificar el KPI municipal de riesgo territorial?

*   **Lee:** `docs/data_dictionary.md` (Sección 1) y `docs/architecture/DETALLE_KPI_CLUSTERING.md` para la metodología completa del ACP y la ponderación.
*   **Fuente de datos:** `Avanzado_ia/data/municipios_semilla.csv` — 1.121 municipios, con el KPI, quintil y las ocho variables base ya calculadas. Puedes abrirlo directamente para inspeccionar cualquier municipio.
*   **Para reproducir:** ejecuta `Avanzado_ia/notebooks/Analisis_Priorizacion_Territorial.ipynb` en un entorno con Python, `pandas`, `scikit-learn` y `scipy`.

## 2. ¿Quieres verificar la segmentación por clustering?

*   **Lee:** `docs/conclusiones.md` (tabla de los cuatro perfiles) y `docs/architecture/DETALLE_KPI_CLUSTERING.md`.
*   **Fuente de datos:** la columna `Cluster` de `Avanzado_ia/data/municipios_semilla.csv` — confirma que la distribución (354, 207, 287 y 273 municipios) coincide con la reportada.
*   **Para reproducir:** el mismo notebook de la Sección 1 incluye el paso de clustering jerárquico sobre los componentes principales del KPI.

## 3. ¿Quieres verificar el componente predictivo (ST-GNN y S2SLS)?

Para validar el Pearson de Uribia (~0.567) en la tarea de desnutrición, y la comparación contra el baseline S2SLS:

*   **Lee:** `docs/conclusiones.md` (sección de resultados del componente predictivo) y `docs/architecture/cambios_modelo_stgnn_4.md`.
*   **Lee también:** `docs/auditorias/CORRECCION_BASELINE_S2SLS.md` para el desglose metodológico del S2SLS.
*   **Para reproducir:** ejecuta el orquestador principal, o inspecciona directamente `data/04_model_output/predicciones_consolidadas.csv`.

## 4. ¿Quieres verificar que no hay fugas de datos en el componente predictivo?

*   **Sobre la partición temporal y Optuna:** `docs/auditorias/CORRECCION_LEAKAGE_SPLIT.md`.
*   **Sobre el baseline S2SLS:** `docs/auditorias/CORRECCION_BASELINE_S2SLS.md`.
*   **Sobre imputación satelital:** `docs/auditorias/CORRECCION_LEAKAGE_IMPUTACION_STGNN.md`.

## 5. ¿Quieres revisar la investigación sobre el cambio de régimen de febrero 2024?

*   **Lee:** `docs/auditorias/INVESTIGACION_QUIEBRE_ESTRUCTURAL_2024.md`.
*   **Para reproducir:** corre el script `analisis/test_quiebre_estructural_feb2024.R`.

## 6. ¿Quieres correr el pipeline del componente predictivo tú mismo?

1. Asegúrate de que los datos crudos estén en `data/01_raw/`.
2. Ejecuta desde la terminal: `python3 pipelines/pipeline_ml.py`.
3. El orquestador reconstruye los datos, entrena/evalúa ambos modelos, y genera los resultados en `data/04_model_output/`.
4. Revisa `README_TECNICO.md` en el repositorio de la landing para los requisitos de instalación del stack de la interfaz web.

## 7. ¿Quieres ver el proyecto completo en funcionamiento?

*   **Landing page institucional:** repositorio `github.com/ICBF-Analitica/semilla-territorial`, desplegada en Lovable — incluye el KPI, el clustering y el enlace al dashboard predictivo.
*   **Dashboard interactivo del componente predictivo:** enlazado desde la landing (variable `VITE_DASHBOARD_URL`), protegido por contraseña de acceso.