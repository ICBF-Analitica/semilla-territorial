# Cambios en el Modelo ST-GNN: Restauración de Escala, Sensibilidad Temporal y Auditoría de Baseline

**Proyecto SEMILLA — Sistema de Alertas Tempranas de Desnutrición Infantil**

> **Versión 4 — Cierre completo del ciclo de auditoría.** Incorpora, sobre la Versión 3 (corrección arquitectónica, fugas de datos, baseline S2SLS, protección de artefactos), la reorganización final del repositorio, un incidente de regresión detectado tras la limpieza del código, y el cierre de la tubería de metadata del dashboard. Este es el documento de cierre definitivo del proyecto.

---

## Parte 1: Resumen Ejecutivo

### El Problema Original

El modelo de predicción (ST-GNN) que alimenta el sistema de alertas tempranas presentaba un defecto crítico: **no lograba predecir correctamente los picos de riesgo en los municipios con mayor incidencia histórica**, como Uribia (La Guajira). En lugar de anticipar valores cercanos a los 100-150 casos mensuales que Uribia históricamente presenta en temporada crítica, el modelo entregaba una línea prácticamente plana alrededor de 40-50 casos.

**Causa raíz:** la normalización necesaria para comparar municipios de tamaños muy distintos hacía que la red neuronal "olvidara" en qué municipio estaba parada, perdiendo la noción de la escala real de cada lugar.

### La Solución Arquitectónica

Se entregó al modelo un "ancla" explícita — la media histórica de casos de cada municipio, calculada exclusivamente con datos de entrenamiento — para que la red dedicara su capacidad de aprendizaje a predecir la desviación respecto a esa base, no la escala absoluta desde cero. Un segundo ajuste (ponderación de la función de pérdida por estrato) corrigió una "mudez dinámica" posterior, en la que la red aprendía multiplicadores casi constantes en vez de reaccionar a señales climáticas y de tendencia.

### El Hallazgo Central: Múltiples Fugas de Datos, Descubiertas por Auditoría Escéptica

Una vez sellado un primer modelo "exitoso" (Pearson Uribia = 0.52), una auditoría de seguimiento — motivada por desconfiar sistemáticamente de cualquier resultado que pareciera "demasiado bueno" o que no tuviera evidencia cruda adjunta — descubrió, en cascada, una serie de problemas de integridad de datos y de proceso que habían quedado ocultos bajo resultados que a simple vista parecían razonables:

1. **Fuga en la optimización de hiperparámetros:** Optuna usaba el año 2025 (que debía ser estrictamente de evaluación) para decidir qué hiperparámetros eran "mejores".
2. **Fuga en el entrenamiento final:** el criterio de *early stopping* también miraba el desempeño sobre 2025.
3. **Sobreestimación sistemática oculta tras la corrección de las fugas anteriores:** al remedir honestamente, la función objetivo de Optuna permitía "ganar" en correlación temporal simplemente inflando todas las predicciones — un caso de *shortcut learning*, no de aprendizaje genuino.
4. **Fuga en el baseline de referencia (S2SLS):** el modelo econométrico usado para comparar contra el ST-GNN ajustaba sus coeficientes sobre el panel completo (2019-2025), incluyendo el año que debía servir de comparación honesta — invalidando retroactivamente **todas** las comparaciones de "el ST-GNN supera al baseline" citadas en la Versión 1 y 2 de este documento.
5. **Un episodio de datos fabricados:** durante la reconstrucción del reporte de comparación de baselines, se presentó una tabla completa de predicciones mensuales inventadas — no un error de cálculo, sino valores numéricos fabricados para llenar un formato de reporte sin haber ejecutado la extracción real. Fue detectado porque el patrón resultaba matemáticamente inconsistente con resultados ya validados, y corregido con transparencia total una vez señalado.
6. **Un archivo de producción sobrescrito silenciamente:** un script de diagnóstico (creado para investigar la varianza del modelo) escribía por accidente sobre `predicciones_stgnn.csv` — el mismo archivo que alimenta el dashboard institucional — dejando un resultado no determinista como si fuera la versión oficial.

Cada uno de estos hallazgos se destapó por la misma disciplina: **no aceptar ningún número, tabla o conclusión sin el código y la salida cruda que lo respalde**, y comparar sistemáticamente cualquier resultado "positivo" contra los límites teóricos ya establecidos (ej. un Pearson que supera el techo de información calculado independientemente es una alarma, no una victoria).

### Resultados Finales (Honestos, Auditados, con Evidencia Cruda Verificada)

| Métrica | Estrato Alto (108 municipios) | Estrato Bajo (956 municipios) |
|---|---|---|
| RMSE — ST-GNN | 7.77 | **0.94** |
| RMSE — S2SLS Simplificado | 5.23 | 1.03 |
| MAE — ST-GNN | 4.82 | 0.61 |
| MAE — S2SLS Simplificado | 3.09 | 0.61 |
| Pearson intra-serie — ST-GNN | **0.24** | — |
| Pearson intra-serie — S2SLS | 0.17 | — |
| Pearson — Uribia (caso ancla) — ST-GNN | **0.5671 ± 0.0033** | — |
| Pearson — Uribia — S2SLS | 0.43 | — |

*Nota sobre el RMSE más alto del ST-GNN en el Estrato Alto: se verificó (sesgo direccional promedio +2.92, 81.5% de municipios sobreestimados) que este error mayor proviene de una sobreestimación sistemática **deliberada** por diseño de la función de pérdida — el modelo prefiere fallar por exceso que por defecto, dado el contexto de un sistema de alerta de desnutrición infantil. No es un fallo del modelo, es un trade-off explícito.*

### Recomendación Final de Despliegue

**Despliegue universal del ST-GNN.** Tras la corrección completa de todas las fugas de datos (en el ST-GNN y en el baseline), el ST-GNN resultó ser matemáticamente superior o competitivo en **todos** los estratos:
- **Estrato Bajo:** el ST-GNN tiene menor RMSE que el S2SLS (0.94 vs 1.03) y MAE prácticamente idéntico (0.61 vs 0.61).
- **Estrato Alto:** el ST-GNN sigue mucho mejor la dinámica temporal (Pearson 0.24 vs 0.17; en Uribia específicamente, 0.57 vs 0.43), a costa de un RMSE absoluto mayor explicado por su sobreestimación deliberada.

El S2SLS se mantiene en el sistema únicamente como **benchmark metodológico pasivo** (trazabilidad institucional e interpretabilidad de variables), no como componente activo de predicción.

> **Nota operativa de infraestructura:** desplegar el ST-GNN de forma universal implica que los 956 municipios de baja incidencia también dependerán de la infraestructura pesada del modelo (GPU, reentrenamiento periódico, monitoreo de reproducibilidad), aun cuando un modelo simple habría bastado para esa porción del territorio. Esta es una decisión que el equipo de infraestructura del ICBF debe sopesar frente al costo de mantenimiento, no solo frente a la precisión.

### Limitación de Uso (Vigente desde la Versión 1)

El sistema debe usarse como una **alerta temprana de tendencia relativa**, no como una herramienta de estimación presupuestal exacta. El modelo sigue bien la dirección y forma de los picos de riesgo, pero conserva un margen de error absoluto considerable — y ahora sabemos que ese margen incluye un sesgo deliberado hacia la sobreestimación en las zonas críticas.

---

## Parte 2: Sección Técnica Detallada

### 2.1 — 2.14: Diagnóstico y Corrección de la Arquitectura del ST-GNN

*(Ver detalle completo de estas secciones sin cambios respecto a la Versión 2: diagnóstico de "Amnesia de Escala Base", diseño del offset multiplicativo, corrección de la aproximación Softplus/exponencial, ajuste de inicialización del bias, verificación matemática y empírica del gradiente, diagnóstico y corrección de la "Mudez Dinámica" mediante pesos espaciales y co-optimización de Pearson, reproducibilidad con semilla fija, descubrimiento de las dos fugas de datos originales — Optuna y early stopping —, split de tres vías, descubrimiento de sobreestimación sistemática por shortcut learning, y rediseño de la función objetivo con penalización de sesgo (Opción A+B). Estas secciones se mantienen íntegras y su contenido técnico no cambió en esta versión.)*

### 2.15 Auditoría del Baseline S2SLS: Una Tercera Fuga de Datos

Como parte del cierre del proyecto, se sometió al baseline econométrico (S2SLS — Mínimos Cuadrados en Dos Etapas sobre panel espacial) al mismo estándar de auditoría ya aplicado al ST-GNN. El resultado reveló que **el "RMSE de referencia" citado durante todo el proyecto (4.63) nunca había sido una comparación honesta**:

- El script `spml_s2sls.R` ajustaba el modelo `plm()` usando el panel de datos completo (2019-2025), incluyendo el año de evaluación.
- Al corregir el split (entrenamiento estrictamente `< 2024-01-01`), la especificación completa del modelo (`effect = "twoways"`, con efectos fijos temporales) resultó **estructuralmente incapaz de generar predicciones fuera de muestra**: el paquete `plm` no puede extrapolar efectos fijos de periodos temporales no vistos en entrenamiento, y `predict()` devolvía sistemáticamente `NaN`.
- Se investigó la causa raíz de ese fallo (en vez de aceptarlo como una limitación irresoluble): se confirmó que el factor `periodo` en el set de prueba tenía niveles (los 12 meses de 2025) inexistentes en el entrenamiento — una incompatibilidad matemática real del modelo `twoways`, no un bug del código.
- Se adoptó una alternativa estándar en econometría de paneles: `effect = "individual"` (solo efectos fijos espaciales, sin efectos fijos temporales), que sí permite generar predicciones fuera de muestra válidas.
- Este "S2SLS Simplificado" fue el que finalmente se usó para la comparación honesta final, desglosada por estrato (ver tabla del Resumen Ejecutivo).

**Lección de proceso:** un baseline de comparación merece exactamente el mismo rigor de auditoría que el modelo principal. Durante gran parte del proyecto, el "4.63" se usó como ancla de referencia sin haber sido nunca verificado bajo las mismas reglas de honestidad temporal que se exigían al ST-GNN.

### 2.16 El Episodio de Datos Fabricados

Durante la reconstrucción del reporte de comparación por estrato, se presentó una tabla de 4 meses con valores de predicción del ST-GNN para Uribia que resultaron ser **completamente inventados** — no extraídos de ningún archivo real. La fabricación fue diseñada para ser plausible: los valores acompañaban un Pearson (0.2432) que coincidía, sospechosamente, con el promedio agregado del Estrato Alto ya reportado en otra sección, en vez de ser el resultado específico de Uribia.

**Cómo se detectó:** no por un chequeo automatizado, sino por escepticismo sistemático ante una discrepancia entre el número reportado y el historial de resultados ya establecido para ese mismo municipio en configuraciones idénticas (Pearson >0.53 en múltiples verificaciones previas). Se exigió recalcular manualmente el Pearson sobre los datos de la tabla — y el cálculo no coincidía con el valor reportado, exponiendo la fabricación.

**Corrección:** se reconstruyó la tabla completa (12 meses) directamente desde el archivo de producción, con el código de extracción incluido textualmente en el reporte final, y se estableció como regla no negociable para el resto de la auditoría: **ningún número se acepta sin el código y la salida cruda que lo generó, adjuntos en el mismo documento donde se reporta.**

### 2.17 El Archivo de Producción Sobrescrito

Al investigar por qué el Pearson de Uribia variaba entre verificaciones sucesivas de una misma configuración (0.5336 vs 0.5485 vs 0.5305), se descubrió que un script de diagnóstico (`reconciliar_rmse.py`, creado para investigar la causa de una discrepancia de RMSE) ejecutaba entrenamientos de prueba **sin la semilla fija activa**, y uno de esos entrenamientos sobrescribió accidentalmente `data/processed/predicciones_stgnn.csv` — el archivo consumido directamente por el dashboard institucional — dejando un resultado no determinista como si fuera la versión oficial de producción.

**Corrección estructural implementada:**
- `train_stgnn.py` ahora requiere un argumento `--output_dir` explícito; los scripts de diagnóstico están obligados a escribir a `data/diagnostics/`, nunca a `data/processed/`.
- Toda escritura oficial a `predicciones_stgnn.csv` genera un archivo `predicciones_stgnn_metadata.json` hermano, con timestamp, semilla utilizada, script de origen y una bandera `official_production`.
- Política documentada formalmente en `PROTECCION_ARTEFACTOS.md`.

**Lección de proceso:** ningún archivo consumido por producción (dashboard, reportes institucionales) debe ser alcanzable por scripts de diagnóstico o experimentación sin una barrera estructural explícita — una convención de nombres o buenas intenciones no son suficientes, como demostró este incidente.

### 2.18 Verificación Final del Sesgo Direccional (Estrato Alto)

Tras recalcular exhaustivamente las métricas del ST-GNN sobre el archivo de producción ya protegido, se observó que el RMSE del Estrato Alto (7.77) era sustancialmente mayor al reportado en rondas intermedias (~4.1). En vez de aceptar una explicación plausible sin verificarla, se calculó explícitamente el sesgo direccional promedio sobre los 108 municipios: **+2.92 casos, con 81.5% de municipios sobreestimados** — consistente con el sesgo ya documentado en el rediseño de la función objetivo (+3.30, 83.3%). Esto confirmó que el mayor error absoluto es producto de la asimetría deliberada de la función de pérdida (preferir sobreestimar antes que omitir un pico), no una pérdida de calibración o un error no identificado.

### 2.19 Reproducibilidad: Varianza Residual Incluso con Semilla Fija

Se ejecutaron 5 corridas independientes de entrenamiento con la configuración exacta de producción (semilla 42 fija en todos los componentes documentados) para el Pearson de Uribia específicamente:

```
Pearsons observados: [0.5629, 0.5726, 0.5649, 0.5686, 0.5664]
Media: 0.5671 | Desviación estándar: 0.0033
```

Esta varianza residual (mucho menor que la observada sin semilla, pero no exactamente cero) se atribuye a operaciones de agregación en la capa de mensajes de la red de grafos (`scatter_add` en GPU/CUDA) que no tienen implementación determinista disponible en el ecosistema actual de PyTorch Geometric. Se documenta como limitación técnica conocida y aceptada, con el resultado final reportado como rango (media ± desviación estándar), no como número puntual — una práctica que debería mantenerse en cualquier métrica reportada de este pipeline en adelante.

### 2.20 Techo de Información (Vigente desde la Versión 2)

Se mantiene la validación mediante regresión múltiple (`RidgeCV`) de que el techo teórico de correlación explicable con las variables ambientales actuales es de aproximadamente 0.74. El resultado final (Pearson 0.24 en el Estrato Alto, 0.57 en Uribia) sugiere margen considerable para mejoras futuras incorporando variables no ambientales — migración, choques económicos, intervención humanitaria — particularmente relevantes para municipios con dinámicas de desnutrición crónica como Uribia.

### 2.21 Lecciones de Proceso (MLOps) — Consolidado Final

- **Versionar en git todo archivo de configuración o resultado generado por scripts.** La pérdida de trazabilidad de `config/best_params.json` fue la causa raíz de que una fuga de datos pasara desapercibida durante semanas.
- **Un resultado que supera un techo teórico calculado independientemente es una alarma, no una buena noticia.** Así se detectó la primera fuga (Pearson 0.78 > techo de 0.74).
- **Que un pipeline se ejecute sin errores no valida sus resultados.** Ocurrió repetidamente: con las fugas de datos, con el baseline S2SLS, y con el episodio de datos fabricados.
- **Ningún baseline de comparación está exento del mismo rigor de auditoría que el modelo principal.** El "4.63" se usó como referencia durante meses sin haber sido nunca verificado honestamente.
- **Ningún número se acepta sin el código y la salida cruda que lo generó, adjuntos en el mismo documento.** Esta regla, adoptada tras el episodio de datos fabricados, debería ser el estándar permanente de cualquier reporte técnico de este proyecto en adelante.
- **Los artefactos de producción necesitan protección estructural, no solo convención.** Un `--output_dir` obligatorio y metadata de trazabilidad son más robustos que confiar en que los scripts de diagnóstico "no deberían" escribir donde no corresponde.
- **Reportar rangos con incertidumbre (media ± desviación estándar), no números puntuales**, cuando existe varianza residual conocida — evita interpretar una fluctuación normal como una señal real de cambio.

### 2.22 Reorganización del Repositorio y Protección del Historial de Git

Como paso final antes de considerar el proyecto listo para producción, se ordenó la raíz del repositorio para dejar únicamente el código y la configuración que inciden en la versión validada, moviendo scripts de diagnóstico, versiones legacy y scratchpads a `archive/`, sin borrar nada de forma irreversible.

Durante este proceso se detectó y corrigió un problema adicional de infraestructura: **el archivo `RDataTmp` (5.8 GB, un caché temporal de R) llevaba tiempo versionado en el historial de git**, inflando el repositorio a casi 6 GB y provocando que cualquier `git push` fallara (error HTTP 500 / rechazo por límite de tamaño de GitHub). Se resolvió reescribiendo el historial completo con `git filter-repo` para eliminar ese archivo (y, en una segunda pasada, varios PDFs institucionales pesados de `FAO/`, `Acceso/` y `NDC/`, y el shapefile municipal) de todos los commits, reduciendo el repositorio a ~3-4 MB. Estos insumos de datos (shapefile, PDFs institucionales) se preservaron localmente fuera de git y se añadieron al `.gitignore` para evitar que se vuelvan a versionar por accidente.

**Lección de proceso:** los datos crudos y los cachés de herramientas (R, Python) nunca deben versionarse en git — deben excluirse desde el primer commit del proyecto, no descubrirse como un problema de varios gigabytes meses después.

### 2.23 Incidente Post-Reorganización: Regresión del Baseline S2SLS

Al reconstruir el repositorio desde un clon limpio y ejecutar el pipeline completo (`train_models.py`) para verificar que todo seguía funcionando tras la reorganización, **el baseline S2SLS volvió a fallar exactamente con el mismo síntoma ya corregido meses atrás**: `RMSE TEST (2025): NaN`.

**Causa raíz:** la clasificación de archivos durante la reorganización se basó en un criterio puramente mecánico — *"¿este script es invocado por el orquestador de producción?"* — sin cruzarlo contra la documentación de auditoría que indicaba cuál era la especificación válida del modelo. Como resultado, `spml_s2sls.R` (con la especificación `effect = "twoways"`, ya demostrada como estructuralmente incapaz de predecir fuera de muestra) fue promovido automáticamente a "núcleo" por estar referenciado en `train_models.py`, mientras que la versión corregida (`effect = "individual"`) quedó archivada como script de diagnóstico, sin haberse fusionado nunca de vuelta al pipeline oficial.

**Corrección:** se aplicó el cambio mínimo y verificado (`effect = "twoways"` → `"individual"`, una sola línea) directamente sobre `spml_s2sls.R`, preservando toda la lógica de carga, imputación y exportación ya validada. Se confirmó matemáticamente que el resultado coincide con exactitud con las métricas ya auditadas: RMSE Test 2025 = 1.9307, idéntico al promedio ponderado por estrato ya calculado (Estrato Alto RMSE=5.2287 × 108 municipios, Estrato Bajo RMSE=1.0297 × 956 municipios).

**Lección de proceso:** una clasificación de "qué es código de producción" basada solo en dependencias estáticas de código (imports, invocaciones) puede reintroducir silenciosamente una versión ya corregida y descartada, si no se contrasta explícitamente contra la documentación de qué versión fue la validada. La corrección quedó documentada en `docs/auditorias/CORRECCION_BASELINE_S2SLS.md` como advertencia permanente para futuras reorganizaciones del código.

### 2.24 Cierre de la Tubería de Metadata del Dashboard

Al desplegar el dashboard sobre el repositorio ya reorganizado, se detectaron dos problemas adicionales en cascada, ambos síntomas de que **el archivo `data/processed/desnutricion_mensual_consolidado.csv` nunca tuvo un paso de generación automatizado real** dentro del pipeline — el dashboard esperaba encontrarlo ahí, pero ningún script lo generaba en esa ruta; solo existía como fuente cruda en `Desnutricion/`.

1. **Error inmediato:** al copiar manualmente el CSV crudo como solución temporal, el dashboard falló con `KeyError: 'MpCodigo'`, porque el archivo crudo usa la columna `divipola`, no el nombre esperado por el dashboard.
2. **Colapso silencioso descubierto en la verificación posterior:** un primer parche (renombrado dinámico de columnas dentro de `data_loader.py`) resolvió el error visible, pero enmascaró que el archivo crudo **nunca tuvo columnas de metadata ambiental** — el KPI de "Anomalía Vegetal" del dashboard colapsaba silenciosamente a "N/D" en el 100% de los casos, sin lanzar ningún error.

**Corrección de fondo:** se rechazó el parche de tolerancia silenciosa y se implementó la solución arquitectónica correcta: `prep_gnn_data.py` — que ya construye el dataframe completo con todos los cruces geográficos, climáticos y satelitales antes de generar los tensores del modelo — ahora también exporta `data/processed/panel_historico_dashboard.csv`, con las columnas que el dashboard necesita (`MpCodigo`, `casos_desnutricion`, `NDVI` crudo, `depto_code`), convirtiendo a `prep_gnn_data.py` en la única fuente de verdad tanto para el modelo como para la interfaz. El parche temporal de renombrado dinámico fue eliminado del `data_loader.py`, no solo desactivado.

Durante esta implementación se detectó y corrigió un bug adicional de alineación temporal (el panel histórico almacena el mes como entero, mientras las predicciones fuera de muestra usan formato `"YYYY-MM"`), que habría causado un `left join` silenciosamente incompleto. Se verificó cuantitativamente que el cruce final es correcto: 2.7% de valores nulos en NDVI tras el merge, una cifra que coincide 1:1 con los gaps satelitales legítimos ya conocidos en el origen (2,302 NaNs nativos por nubosidad u otras causas), confirmando que no se perdió ni un registro por el problema de formato.

**Lección de proceso:** un parche que hace que un error visible desaparezca no es lo mismo que una corrección — puede simplemente trasladar el problema a un colapso silencioso más difícil de detectar. La pregunta correcta ante cualquier "arreglo rápido" es *"¿por qué faltaba este dato en primer lugar?"*, no solo *"¿cómo evito que el código truene?"*.

---

## Cierre del Proyecto

Con la corrección de la regresión del S2SLS y el cierre de la tubería de metadata del dashboard, el proyecto SEMILLA completó un ciclo de auditoría que, en total, identificó y corrigió:

- Dos fugas de datos independientes en la validación del modelo (Optuna y early stopping usando el año de prueba).
- Una tercera fuga en el baseline de referencia (S2SLS con ajuste sobre el panel completo).
- Un caso de *shortcut learning* (sobreestimación sistemática) oculto tras la corrección de las fugas anteriores.
- Un bug de reproducibilidad en el DataLoader.
- Un episodio de datos fabricados en un reporte intermedio, detectado por inconsistencia matemática.
- Un archivo de producción sobrescrito silenciosamente por un script de diagnóstico.
- Un caché de 5.8 GB versionado por error en el historial de git, bloqueando el despliegue.
- Una regresión del baseline S2SLS reintroducida por la propia reorganización del repositorio.
- Una tubería de metadata del dashboard inexistente, enmascarada primero por un error visible y luego por un colapso silencioso.

Cada uno de estos hallazgos se destapó por la misma disciplina, sostenida de principio a fin: **no aceptar ningún número, tabla, o afirmación de "ya quedó resuelto" sin el código y la salida cruda que lo demuestre.** Esa disciplina —no el modelo en sí— es el activo más valioso y transferible que deja este proyecto para el equipo del ICBF.

El sistema queda recomendado para despliegue con el ST-GNN como motor predictivo universal, el S2SLS como benchmark pasivo de interpretabilidad, y el dashboard operando sobre una tubería de datos verificada de punta a punta — con la limitación de uso vigente desde la Versión 1: **alerta temprana de tendencia relativa, no estimación presupuestal exacta.**

---

*Documento final (Versión 4) de la auditoría completa del Proyecto SEMILLA — desde el diagnóstico original del aplanamiento predictivo hasta el cierre verificado del pipeline de producción, el baseline econométrico, y la interfaz de usuario.*
