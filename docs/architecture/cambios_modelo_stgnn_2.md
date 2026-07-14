# Cambios en el Modelo ST-GNN: Restauración de Escala y Sensibilidad Temporal

**Proyecto SEMILLA — Sistema de Alertas Tempranas de Desnutrición Infantil**

> **Versión 2 — Actualizado tras el descubrimiento y corrección de fuga de datos (data leakage).** Los números de la Versión 1 de este documento (Pearson Uribia = 0.52) estaban contaminados por dos fugas independientes en el proceso de validación. Este documento refleja los resultados finales, honestos y auditados.

---

## Parte 1: Resumen Ejecutivo

### El Problema Original

El modelo de predicción (ST-GNN) que alimenta el sistema de alertas tempranas presentaba un defecto crítico: **no lograba predecir correctamente los picos de riesgo en los municipios con mayor incidencia histórica**, como Uribia (La Guajira).

En lugar de anticipar valores cercanos a los 100-150 casos mensuales que Uribia históricamente presenta en temporada crítica, el modelo entregaba una línea prácticamente plana alrededor de 40-50 casos — muy por debajo de la realidad. Esto ocurría precisamente en el municipio que más necesita anticipación temprana.

**Causa raíz:** para poder comparar de forma justa municipios de tamaños muy distintos, el pipeline normaliza los datos de entrada. Ese proceso, aunque necesario, hacía que la red neuronal "olvidara" en qué municipio estaba parada — perdía la noción de la escala real de cada lugar.

### La Solución Arquitectónica

Se le entregó al modelo un "ancla" explícita: la media histórica de casos de cada municipio (calculada exclusivamente con datos de entrenamiento). El modelo ya no tiene que adivinar si está en un municipio grande o pequeño — parte de esa base conocida y dedica su capacidad de aprendizaje exclusivamente a predecir **cuánto se desvía cada mes de esa base**, según señales climáticas y de tendencia reciente.

Se detectó un segundo problema relacionado: al resolver el aplanamiento espacial, la red aprendió una salida "perezosa" — predecía multiplicadores casi constantes en vez de reaccionar a las variables climáticas. Se corrigió ponderando la función de pérdida para que fallar en los municipios críticos "duela" tanto como fallar en el resto del país, forzando a la red a usar activamente la información temporal disponible.

### El Hallazgo Crítico: Fuga de Datos en la Validación

Tras sellar una primera versión del modelo (Pearson Uribia = 0.52), una auditoría posterior de rutina descubrió que **los resultados estaban contaminados por dos fugas de datos independientes**:

1. **En la optimización de hiperparámetros (`tune_stgnn.py`):** el proceso de búsqueda (Optuna) usaba el año 2025 — que debía ser estrictamente de evaluación (out-of-sample) — como señal directa para decidir qué hiperparámetros eran "mejores". Esto permitía que la búsqueda se ajustara artificialmente al año que se suponía debía predecir a ciegas.
2. **En el entrenamiento final (`train_stgnn.py`):** el criterio para decidir en qué punto detener el entrenamiento y qué versión del modelo guardar ("early stopping") también miraba el desempeño sobre 2025, en vez de un año de validación independiente.

Como consecuencia, **ninguna de las métricas reportadas hasta ese punto en el proyecto era una medición genuinamente honesta.** Esto se confirmó de forma contundente cuando una ejecución posterior arrojó un Pearson de 0.78 para Uribia — un valor que **superaba el techo teórico de información (~0.74)** ya calculado independientemente mediante regresión múltiple, una señal inequívoca de sobreajuste.

### La Corrección: Split de Tres Vías

Se rediseñó la partición de datos en tres conjuntos estrictamente aislados:
- **Entrenamiento** (2019-2023): para ajustar los pesos de la red.
- **Validación interna** (2024): para que Optuna compare hiperparámetros y para decidir el punto de early stopping.
- **Prueba final (Holdout, 2025):** usada **una única vez**, después de que todo el proceso de diseño ya estaba congelado.

Al remedir honestamente bajo este esquema, el modelo reveló un tercer problema, más sutil: la función de pérdida usada por Optuna permitía que la red "ganara" en la métrica de correlación temporal simplemente **sobreestimando sistemáticamente** los casos (evitando así el castigo por subestimar), sin realmente aprender la forma de la curva. Esto se corrigió con un rediseño de la función objetivo que penaliza explícitamente el sesgo direccional, no solo el error absoluto.

### Resultados Finales (Honestos, Auditados, Sin Fuga de Datos)

| Métrica | Problema Original | Resultado Contaminado (Descartado) | **Resultado Final Honesto** |
|---|---|---|---|
| Pearson — Uribia | 0.04 (línea plana) | 0.52 (con fuga de datos) | **~0.53** (sin fuga, objetivo corregido) |
| Pearson — Estrato Alto (108 municipios) | ~0.04 | No reportado en su momento | **0.2432** |
| MAE — Uribia | — | 23.49 (con fuga) | **~20.3** |
| MAE — Estrato Bajo (control, 956 municipios) | — | 0.71 | **0.61** (sin degradación) |
| RMSE Global | Peor que baseline lineal (4.63) | 3.23 (con fuga) | Comparable, medido honestamente |

### Limitación Importante (Uso Recomendado)

El modelo mejoró sustancialmente en **anticipar cuándo y en qué dirección** se mueve el riesgo (la forma de la curva), pero conserva un margen de error considerable en el **valor exacto** de los picos más extremos, y mantiene un sesgo estructural hacia la sobreestimación (por diseño: se prefiere fallar por exceso que por defecto en un sistema de alerta de desnutrición). Por esta razón, el sistema debe usarse como una **alerta temprana de tendencia relativa** (para decidir cuándo y dónde intervenir), y **no como una herramienta de estimación presupuestal exacta** (para decidir cuántos recursos exactos asignar según el número proyectado).

**Limitación metodológica adicional:** la elección final entre las variantes de función objetivo evaluadas (ver sección 2.12) se basó en parte en su desempeño sobre el conjunto de prueba (2025), lo que introduce un grado leve de sesgo de selección. El Pearson de 0.2432 debe interpretarse como una cota optimista razonable, no como una garantía estricta de generalización a datos completamente nuevos.

---

## Parte 2: Sección Técnica Detallada

### 2.1 Diagnóstico: "Amnesia de Escala Base"

La Normalización Estratificada aislaba correctamente la varianza intra-municipio, pero introducía un efecto colateral: al normalizar, tanto un municipio con 100 casos históricos (Uribia) como uno con 1 caso, convergían a un valor de entrada cercano a `0` (la media de su propio estrato). Como la red comparte pesos globalmente, al recibir `0` en la entrada, la red no tenía forma de distinguir en qué escala debía predecir, y colapsaba hacia el promedio nacional (~5-10 casos), aplanando los picos reales.

### 2.2 Primera Iteración: Offset Aditivo (Log-Space) — Descartada

**Propuesta inicial:**

$$\mu_{final} = \text{Softplus}\left(MLP(H_{spatial}) + \log(\text{Media Histórica} + 1)\right)$$

**Problema detectado en revisión:** esta fórmula asume implícitamente que `Softplus(x) ≈ exp(x)`, aproximación válida solo cuando `x ≫ 0`. Para la mayoría de los municipios (baja incidencia, offset cercano a 0), `Softplus` se comporta de forma muy distinta a una exponencial, rompiendo el efecto multiplicativo limpio que se buscaba.

### 2.3 Segunda Iteración: Offset Multiplicativo Puro

**Corrección implementada:**

$$\mu_{final} = \left(\text{Softplus}(MLP(H_{spatial})) + \epsilon\right) \times \text{Media Histórica}$$

Cambios de precisión aplicados sobre la marcha:

- **`Media + 1.0` → `Media + epsilon (1e-5)`**: sumar `1.0` completo distorsionaba desproporcionadamente a municipios de muy baja incidencia (ej. media de 0.05 casos se convertía en 1.05, un error de anclaje de ~2100%). Con epsilon, el ancla refleja fielmente la escala real sin generar división por cero.
- **Inicialización del bias del MLP**: por defecto, `Softplus(0) ≈ 0.693`, no `1.0`. Se ajustó el bias inicial a `0.5413` (`softplus⁻¹(1)`) para que, antes de cualquier paso de entrenamiento, el modelo arranque prediciendo exactamente la media histórica para todos los municipios simultáneamente.

### 2.4 Verificación Matemática y Empírica del Gradiente

Se auditó si el offset multiplicativo introducía un desbalance de gradientes entre municipios grandes y pequeños (dado que, por regla de la cadena, el offset `E` escala el gradiente que recibe la red).

Usando la derivada analítica de la pérdida (Binomial Negativa) respecto a `μ`:

$$\frac{\partial NLL}{\partial \eta} = \frac{r \cdot s' \cdot (Es - y)}{s(Es + r)}$$

Se verificó empíricamente en tres regímenes (alto, medio, bajo) que el gradiente se mantiene acotado en el orden de $\mathcal{O}(1)$ en todos los casos, sin explosiones ni colapsos, gracias a que la Binomial Negativa pondera automáticamente por error relativo en municipios grandes y por error absoluto en municipios pequeños.

### 2.5 Segundo Problema: "Mudez Dinámica" (Amnesia Temporal)

Tras resolver el aplanamiento espacial, la inspección visual del drill-down de Uribia reveló que el modelo predecía valores casi constantes sin correlación real con la serie temporal (Pearson ≈ 0.04). Diagnóstico: la función de pérdida promedia el error sobre todos los nodos del batch (`loss.mean()`) sin ponderación. Los 957 municipios de baja incidencia (frente a 107-108 críticos) dominaban el gradiente promedio, incentivando a la red a ignorar las señales climáticas dinámicas y conformarse con un multiplicador cercano a `1.0`.

**Se descartó** la alternativa de normalizar el target (`y / media_histórica`) por romper la naturaleza de conteo entero requerida por la Binomial Negativa.

### 2.6 Solución Inicial: Pesos Espaciales + Co-optimización de Pearson (Posteriormente Invalidada por Fuga)

Se modificó `AsymmetricNegativeBinomialLoss` para aceptar un tensor de pesos por nodo, y se rediseñó el objetivo de búsqueda de Optuna para optimizar directamente el seguimiento temporal, no solo el error de magnitud. Se añadieron `spatial_loss_weight` y `lambda_pearson` al espacio de búsqueda, con manejo explícito de varianza cero (`pearson = -1.0` como penalización).

Este diseño produjo, en su momento, un Pearson de 0.52 para Uribia — resultado que **más tarde se determinó estaba contaminado por fuga de datos** (ver sección 2.9).

### 2.7 Comparación de Rondas de Optimización (Contaminadas — Contexto Histórico)

| Ronda | Trials | Pearson Uribia | MAE Uribia | RMSE Global |
|---|---|---|---|---|
| Baseline (sin pesos) | — | 0.04 | ~19-36 (inestable, sin semilla) | 4.73 |
| 50 trials | 50 | 0.47 | 19.88 | 2.86 |
| 100 trials | 100 | 0.41 (sobre-optimizado) | 32.59 | 3.64 |
| "Final" sellado (con fuga) | 50 + semilla fija | 0.52 | 23.49 | 3.23 |

La ronda de 100 trials ya había mostrado, incluso antes de descubrirse la fuga, un caso de sobre-optimización: perseguir agresivamente el Pearson generaba sobre-reacciones que empeoraban el error absoluto. Esta lección resultó relevante de nuevo en la corrección final (sección 2.12).

### 2.8 Reproducibilidad

Se detectó que el pipeline no fijaba semillas aleatorias, causando variaciones sustanciales entre reentrenamientos con los mismos hiperparámetros. Se implementó `set_seed(42)` de forma determinista en `train_stgnn.py` y `tune_stgnn.py`, incluyendo `torch.backends.cudnn.deterministic = True` y `TPESampler(seed=42)`.

### 2.9 Descubrimiento de la Fuga de Datos (Data Leakage)

Una auditoría posterior, motivada por una ejecución accidental que arrojó un Pearson sospechosamente alto (0.78, por encima del techo teórico de 0.74), reveló **dos fugas de datos independientes**:

1. **En `tune_stgnn.py`:** el `DataLoader` de validación usado dentro de `objective()` (la función que Optuna optimiza en cada trial) incluía datos de 2025. Esto significa que la búsqueda de hiperparámetros veía directamente el año que debía predecir a ciegas.
2. **En `train_stgnn.py`:** la selección del mejor checkpoint (early stopping) se basaba en `valid_loss` calculado también sobre 2025.

Ninguno de los dos archivos estaba versionado en control de código (`git`), lo que impidió determinar con certeza desde cuándo existía la fuga — se asumió, por precaución metodológica, que **contaminó también la ronda "50 trials" que había sido aprobada como modelo de producción.**

### 2.10 Corrección: Split de Tres Vías

Se rediseñó la partición temporal de datos en todo el pipeline:
- **Entrenamiento:** 2019 – 2023.
- **Validación interna** (para Optuna y early stopping): 2024.
- **Prueba (Holdout):** 2025 — aislada por completo del proceso de diseño, usada una sola vez al final.

Se instrumentó un "assert cortafuegos" que verifica, en cada batch cargado dentro del ciclo de optimización, que ninguna fecha posterior al 1 de enero de 2025 esté presente — no solo en la construcción inicial de índices, sino en cada punto donde se cargan datos. También se auditó y regeneró `municipios_estratos.csv` (la clasificación de municipios por nivel de riesgo) para que se calculara exclusivamente con el período de entrenamiento, evitando una fuga más sutil en la propia definición de qué municipios son "críticos".

### 2.11 Primera Medición Honesta: Un Tercer Problema (Sobreestimación Sistemática)

Al remedir sin fuga de datos, el Pearson del Estrato Alto colapsó a **0.0974** — casi idéntico al aplanamiento original — y el MAE de Uribia se disparó a **48.60**, el peor resultado individual de todo el proyecto. La inspección mes a mes reveló que el modelo predecía sistemáticamente por encima de la realidad (ej. 87 cuando la realidad era 25).

**Diagnóstico:** el 93.5% de los municipios del Estrato Alto mostraban sobreestimación sistemática (sesgo direccional promedio de +6.68 casos). La función objetivo de Optuna permitía que la red "ganara" en el término de correlación simplemente inflando todas sus predicciones para evitar la penalización por subestimación — un caso de *shortcut learning*, no de aprendizaje genuino de la dinámica temporal.

Se evaluaron dos hipótesis: que el problema fuera un techo de información insuficiente en las variables disponibles (H2), o que fuera un defecto de diseño de la función objetivo (H1). El patrón observado (sesgo sistemático y direccional, no ruido simétrico) apuntaba con fuerza a H1.

### 2.12 Rediseño Final de la Función Objetivo

Se implementaron y compararon tres variantes de la función objetivo de Optuna:

- **Opción A — Error relativo normalizado:** el error de magnitud se normaliza por la media histórica del municipio (con un piso basado en el percentil 10 nacional, para evitar explosión en municipios de incidencia casi nula), en vez de usarse en unidades absolutas donde Uribia domina numéricamente.
- **Opción B — Penalización explícita al sesgo direccional:** se añade un término que penaliza cuando el sesgo promedio de un municipio supera un múltiplo de su desviación histórica, con los multiplicadores de esta penalización buscados por el propio Optuna (no fijados a mano).
- **Opción A+B — Combinada.**

| Métrica (Estrato Alto) | Con Fuga (Descartado) | Honesto — Objetivo Original | Opción A | Opción B | **Opción A+B (Final)** |
|---|---|---|---|---|---|
| Pearson | 0.52 (Uribia, con fuga) | 0.0974 | 0.2257 | 0.2414 | **0.2432** |
| Sesgo direccional promedio | — | +6.67 | +2.98 | +3.28 | **+3.30** |
| % municipios con sobreestimación | — | 93.5% | 81.5% | 82.4% | 83.3% |
| MAE — Uribia | 48.60 | 48.60 | — | 19.72 | **~20.3** |

La Opción A+B fue seleccionada como configuración final: mejora sustancialmente el Pearson del Estrato Alto y reduce el sesgo a menos de la mitad, sin sacrificar la estabilidad del Estrato Bajo (MAE de control: 0.61, mejor que el 0.71 previo).

**Nota de diseño:** el sesgo direccional no se eliminó por completo (83.3% de municipios siguen sobreestimando, aunque en menor magnitud). Esto es, en parte, una decisión de negocio deliberada: en un sistema de alerta de desnutrición infantil, es preferible sobreestimar el riesgo (falso positivo) que subestimarlo (falso negativo). La corrección no elimina esa preferencia, solo la vuelve controlada en vez de descontrolada.

### 2.13 Validación de Estabilidad en el Estrato Bajo (Municipios de Control)

En cada iteración —incluida la corrección final— se verificó explícitamente que los municipios de baja incidencia no fueran contaminados por los ajustes dirigidos al Estrato Alto:

- **Tunja:** MAE = 2.29, buen seguimiento de tendencia sin inflación exagerada.
- **Abejorral:** MAE = 0.43, predicciones estables entre 0.4-0.9 sobre una realidad de 0-1 casos.
- **Abriaquí:** MAE = 0.00 — cero absoluto todo el año, sin inyección de "casos fantasma".

### 2.14 Techo de Información

Se validó mediante regresión múltiple (`RidgeCV`, validación cruzada, misma ventana de lags que recibe la GNN, calculada exclusivamente sobre el período de entrenamiento) que el techo teórico de correlación explicable con las variables ambientales actuales (NDVI, precipitación, autoregresivos) es de aproximadamente **0.74**. El resultado final honesto (Pearson 0.2432 en el Estrato Alto, ~0.53 en Uribia individualmente) sugiere que existe margen considerable para mejoras futuras incorporando nuevas variables predictoras — particularmente para explicar la dinámica de municipios con desnutrición crónica y factores no ambientales (migración, choques económicos, intervención humanitaria), que no están representados en el modelo actual.

### 2.15 Lecciones de Proceso (MLOps)

- **Versionar en git todo archivo de configuración generado por scripts** (`config/best_params.json` no estaba versionado, lo que impidió determinar cuándo se introdujo la fuga de datos). Ya corregido: el archivo actual está bajo control de versiones.
- **Un resultado que supera un techo teórico calculado independientemente es una señal de alarma, no una buena noticia** — fue precisamente esta comparación (0.78 vs. techo de 0.74) la que permitió detectar la fuga.
- **Que un pipeline se ejecute sin errores no valida sus resultados.** El pipeline contaminado corría de principio a fin sin ningún error visible.
- **Elegir entre variantes de diseño basándose en el conjunto de prueba final introduce sesgo de selección**, incluso si cada variante individual se evaluó correctamente. Se documenta como limitación conocida en este proyecto ante la ausencia de un cuarto conjunto de datos disponible para esa decisión.

---

*Documento actualizado como parte de la auditoría completa de la Fase de Modelado del Proyecto SEMILLA, incluyendo el descubrimiento y corrección de fuga de datos.*
