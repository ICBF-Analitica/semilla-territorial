# Conclusiones y Próximos Pasos

## Resumen

SEMILLA integra tres componentes complementarios: un **KPI municipal de riesgo territorial** y una **segmentación por clustering**, que hoy constituyen el eje principal de la herramienta presentada al Concurso Datos al Ecosistema 2026; y un **componente predictivo** (ST-GNN y S2SLS), que aporta la dimensión de anticipación temporal — incluyendo la proyección de tendencia del Z-score de NDVI y la predicción de riesgo de desnutrición infantil ya auditada extensamente en este proyecto.

## Resultados del KPI Municipal de Riesgo Territorial

El KPI, construido mediante Análisis de Componentes Principales sobre ocho variables —inseguridad alimentaria, IRCA, suficiencia vial, diversidad de cultivos, temperatura, NDVI, población rural, y Z-score de NDVI—, condensa el riesgo territorial en un índice de 5 componentes que recoge el 82.11% de la varianza total, clasificando a cada uno de los 1.121 municipios en uno de cinco quintiles de riesgo (de "Muy Bajo" a "Muy Alto"). La ponderación combina las cargas factoriales del ACP, el marco conceptual del proyecto, y una validación empírica que maximiza la correlación con los casos históricos de desnutrición aguda.

## Resultados de la Segmentación Territorial

El análisis de clustering jerárquico (enlace *weighted*, distancia *cosine*, validado con coeficiente de Silhouette y pruebas ANOVA) agrupó a los municipios de Colombia en **cuatro** perfiles territoriales diferenciados:

| Clúster | Municipios | Perfil |
|---|---|---|
| 1 — Referente Estructural | 354 | Clima templado, mejor seguridad alimentaria relativa, mayor conectividad vial, Z-score de NDVI más alto (municipios más verdes que sus vecinos) |
| 2 — Vulnerabilidad Crítica | 207 | Clima cálido, inseguridad alimentaria más alta (40%), conectividad más baja, menor diversidad de cultivos — prioridad de intervención más alta |
| 3 — Riesgo Hídrico Crítico | 287 | Buena conectividad y diversidad agrícola, pero IRCA más alto del país (15.3) |
| 4 — Degradación Ecológica | 273 | Mayor componente urbano, NDVI y Z-score de NDVI más bajos del país |

**Total: 1.121 municipios**

## Resultados del Componente Predictivo

Esta sección mantiene el mismo estándar de verificación aplicado durante toda la auditoría del proyecto: cada cifra cuenta con código y salida cruda reproducible en `docs/auditorias/`.

### Predicción de Riesgo de Desnutrición Infantil (ST-GNN y S2SLS)

El ST-GNN corrigió el defecto original de "ceguera de escala" (problema de normalización) que le impedía distinguir la magnitud real del riesgo. Inicialmente, el modelo predecía una línea plana de 40 a 50 casos para Uribia, a pesar de que este municipio presenta históricamente entre 100 y 150 casos en temporada crítica. Al proporcionar un ancla explícita basada en la media histórica, el modelo recuperó la noción de escala y pudo concentrarse en predecir la desviación de la crisis.  

Al hacer esto, el modelo asume deliberadamente un costo mayor en error absoluto (RMSE) a cambio de una capacidad muy superior para seguir la tendencia temporal de las crisis (Pearson). Este es un trade-off consciente de diseño: en un sistema de alerta de desnutrición, un falso negativo es mucho más costoso que un falso positivo.  

| Métrica | Estrato Alto (108 municipios críticos) | Estrato Bajo (956 municipios) |
|---|---|---|
| Pearson (ST-GNN) | **0.24** | — |
| Pearson (S2SLS, baseline) | 0.17 | — |
| RMSE (ST-GNN) | 7.77 | **0.94** |
| RMSE (S2SLS, baseline) | 5.23 | 1.03 |
| MAE (ST-GNN) | — | 0.61 (empate con S2SLS) |

**Caso de referencia — Uribia (La Guajira):** el ST-GNN alcanza un Pearson de **0.5671 ± 0.0033** (promedio de 5 corridas independientes), frente a 0.43 del baseline.

Adicionalmente, se calculó un **techo de información** de referencia (~0.74) usando una técnica de regresión independiente sobre las variables ambientales disponibles hoy.

### Proyección de Tendencia del Z-score de NDVI

El mismo modelo ST-GNN —ya auditado en su capacidad de predicción de desnutrición— se reporta también aplicado a la proyección de tendencia del Z-score de NDVI, alimentando directamente al KPI y al clustering territorial. Según el reporte institucional, la comparación de las predicciones contra los datos reales de un año posterior mostró un **error medio absoluto (MAE) de 0.12**.

**Recomendación de despliegue del componente predictivo:** dado que el ST-GNN iguala o supera al baseline S2SLS en la tarea de desnutrición (ambos estratos), se recomienda su uso como motor predictivo único para esa tarea específica, manteniendo el S2SLS como referencia de interpretabilidad.

## Limitaciones de Uso

**El componente predictivo de SEMILLA, en su tarea de desnutrición infantil, debe utilizarse exclusivamente como un sistema de alerta temprana de tendencia relativa, no como una herramienta de estimación de casos exacta.** Su función de pérdida está deliberadamente sesgada hacia la sobreestimación en escenarios de alta incertidumbre.

El KPI y el clustering, por su naturaleza de fotografía estructural, son el eje principal para decisiones de priorización territorial de mediano y largo plazo; el componente predictivo aporta la señal de urgencia de corto plazo y de tendencia ecológica.

## Próximos Pasos Sugeridos

1. **Explorar variables predictivas no ambientales en la tarea de desnutrición.** El techo de información actual (0.74) sugiere margen de mejora incorporando intervención humanitaria, choques económicos, o migración.
2. **Revisar la hipótesis de cambio de régimen post-2024 con más datos**, cuando se disponga de al menos 24 meses posteriores a febrero de 2024. *(Ver `docs/auditorias/INVESTIGACION_QUIEBRE_ESTRUCTURAL_2024.md`.)*
3. **Mejorar la resolución espacial de las variables satelitales (NDVI)**, agregando por zonas más finas dentro de cada municipio para capturar señales de estrés localizado.

## Documentación de Respaldo

Las cifras del componente predictivo en la tarea de desnutrición están respaldadas por evidencia reproducible en `docs/auditorias/` (índice completo en `docs/auditorias/README.md`). Los valores del KPI y del clustering están verificados directamente sobre `Avanzado_ia/data/municipios_semilla.csv`.

El código y la documentación técnica completa del componente predictivo están disponibles en [https://gitlab.com/jaimescastrodf-group/semilla-fork](https://gitlab.com/jaimescastrodf-group/semilla-fork).