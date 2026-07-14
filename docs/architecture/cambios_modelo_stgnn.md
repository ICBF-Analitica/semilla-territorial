# Cambios en el Modelo ST-GNN: Restauración de Escala y Sensibilidad Temporal

**Proyecto SEMILLA — Sistema de Alertas Tempranas de Desnutrición Infantil**

---

## Parte 1: Resumen Ejecutivo

### El Problema

El modelo de predicción (ST-GNN) que alimenta el sistema de alertas tempranas presentaba un defecto crítico: **no lograba predecir correctamente los picos de riesgo en los municipios con mayor incidencia histórica**, como Uribia (La Guajira).

En lugar de anticipar valores cercanos a los 100-150 casos mensuales que Uribia históricamente presenta en temporada crítica, el modelo entregaba una línea prácticamente plana alrededor de 40-50 casos — muy por debajo de la realidad. Esto ocurría precisamente en el municipio que más necesita anticipación temprana.

**Causa raíz:** para poder comparar de forma justa municipios de tamaños muy distintos, el pipeline normaliza los datos de entrada. Ese proceso, aunque necesario, hacía que la red neuronal "olvidara" en qué municipio estaba parada — perdía la noción de la escala real de cada lugar.

### La Solución

Se le entregó al modelo un "ancla" explícita: la media histórica de casos de cada municipio (2019-2024, sin usar ningún dato de 2025 para evitar sesgos). El modelo ya no tiene que adivinar si está en un municipio grande o pequeño — parte de esa base conocida y dedica su capacidad de aprendizaje exclusivamente a predecir **cuánto se desvía cada mes de esa base**, según señales climáticas y de tendencia reciente.

Durante el desarrollo se detectó un segundo problema relacionado: al resolver el aplanamiento, la red aprendió una salida "perezosa" — predecía multiplicadores casi constantes en vez de reaccionar a las variables climáticas y de tendencia. Se corrigió ajustando cómo se calcula el error durante el entrenamiento, para que fallar en los municipios críticos "duela" tanto como fallar en el resto del país. Esto forzó a la red a usar activamente la información temporal disponible.

### Resultados Obtenidos

| Métrica | Antes | Después |
|---|---|---|
| Error global del modelo (RMSE) | Peor que el modelo de referencia (baseline lineal, 4.63) | **3.23** — supera al baseline |
| Seguimiento de la curva de Uribia (correlación con la realidad) | Prácticamente nulo (0.04 — línea plana) | **0.52** — sigue la forma de los picos y caídas |
| Estabilidad en municipios de baja incidencia (957 municipios) | — | Se mantuvo intacta, sin contaminación |

### Limitación Importante (Uso Recomendado)

El modelo mejoró sustancialmente en **anticipar cuándo y en qué dirección** se mueve el riesgo (la forma de la curva), pero conserva un margen de error considerable en el **valor exacto** de los picos más extremos. Por esta razón, el sistema debe usarse como una **alerta temprana de tendencia relativa** (para decidir cuándo y dónde intervenir), y **no como una herramienta de estimación presupuestal exacta** (para decidir cuántos recursos exactos asignar según el número proyectado).

---

## Parte 2: Sección Técnica Detallada

### 2.1 Diagnóstico: "Amnesia de Escala Base"

La Normalización Estratificada aislaba correctamente la varianza intra-municipio, pero introducía un efecto colateral: al normalizar, tanto un municipio con 100 casos históricos (Uribia) como uno con 1 caso, convergían a un valor de entrada cercano a `0` (la media de su propio estrato). Como la red comparte pesos globalmente, al recibir `0` en la entrada, la red no tenía forma de distinguir en qué escala debía predecir, y colapsaba hacia el promedio nacional (~5-10 casos), aplanando los picos reales.

### 2.2 Primera Iteración: Offset Aditivo (Log-Space)

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

Tras resolver el aplanamiento espacial, la inspección visual del drill-down de Uribia reveló que el modelo predecía valores casi constantes (~90-140) sin correlación real con la serie temporal (Pearson = 0.04). Diagnóstico: la función de pérdida promedia el error sobre todos los nodos del batch (`loss.mean()`) sin ponderación. Los 957 municipios de baja incidencia (frente a 107 críticos) dominaban el gradiente promedio, incentivando a la red a ignorar las señales climáticas dinámicas y conformarse con un multiplicador cercano a `1.0`.

**Se descartó** la alternativa de normalizar el target (`y / media_histórica`) por romper la naturaleza de conteo entero requerida por la Binomial Negativa.

### 2.6 Solución: Pesos Espaciales + Co-optimización de Pearson

Se modificó `AsymmetricNegativeBinomialLoss` para aceptar un tensor de pesos por nodo, y se rediseñó el objetivo de búsqueda de Optuna para optimizar directamente el seguimiento temporal, no solo el error de magnitud:

```
score = (3.0 * mae_under + mae_over) - (lambda_pearson * pearson_alta)
```

Hiperparámetros añadidos al espacio de búsqueda bayesiana:
- `spatial_loss_weight` — peso relativo del Estrato Alto en la pérdida.
- `lambda_pearson` — ponderación del término de correlación temporal.

Manejo de casos borde: predicciones con varianza casi nula (`np.std(y_pred) < 1e-4`) se penalizan explícitamente (`pearson = -1.0`) para evitar que Optuna acepte silenciosamente modelos "mudos".

### 2.7 Comparación de Rondas de Optimización

| Ronda | Trials | Pearson Uribia | MAE Uribia | RMSE Estrato Alto | RMSE Global |
|---|---|---|---|---|---|
| Baseline (sin pesos) | — | 0.04 | ~19-36 (inestable, sin semilla) | 14.62 | 4.73 |
| 50 trials | 30→50 | 0.47 | 19.88 | 8.54 | **2.86** |
| 100 trials | 100 | 0.41 | 32.59 | 11.02 | 3.64 |
| **Final (50 trials + semilla fija)** | 50 | **0.52** | 23.49 | — | 3.23 |

La ronda de 100 trials demostró un caso claro de sobre-optimización: al perseguir agresivamente el Pearson, la red amplificó el rango dinámico más allá de lo justificado, generando sobre-reacciones (ej. predecir 105 cuando la realidad era 50) que empeoraron el error absoluto. Se determinó que la configuración de **50 trials** representaba el mejor balance entre seguimiento de tendencia y precisión de magnitud.

### 2.8 Reproducibilidad

Se detectó que el pipeline no fijaba semillas aleatorias (`torch.manual_seed`, NumPy, `random`, sampler de Optuna), causando variaciones sustanciales entre reentrenamientos con los mismos hiperparámetros (MAE de Uribia oscilando entre 19.9 y 36.6). Se implementó `set_seed(42)` de forma determinista en `train_stgnn.py` y `tune_stgnn.py`, incluyendo `torch.backends.cudnn.deterministic = True` y `TPESampler(seed=42)`, garantizando que el modelo sea auditable y reproducible byte a byte.

### 2.9 Validación de Estabilidad en el Estrato Bajo

En cada iteración se verificó explícitamente que los 957 municipios de baja incidencia no fueran contaminados por los ajustes dirigidos al Estrato Alto, usando municipios de control (Tunja, Abejorral, Abriaquí). Resultado final: MAE del Estrato Bajo de **0.64-0.71**, sin degradación en ninguna ronda.

### 2.10 Techo de Información

Se validó mediante regresión múltiple (`RidgeCV`, validación cruzada, misma ventana de lags que recibe la GNN) que el techo teórico de correlación explicable con las variables ambientales actuales (NDVI, precipitación, autoregresivos) es de aproximadamente **0.74**. Esto confirma que existe margen para mejoras futuras incorporando nuevas variables predictoras (intervención humanitaria, migración, precios de alimentos), pero que el valor actual (0.52 en el caso ancla) ya captura una fracción sustancial de la señal disponible sin sobreajustar.

### 2.11 Pipeline de Datos: Cierre de Brecha de Metadata (Dashboard)

Durante la auditoría final de despliegue, se detectó un colapso silencioso en los KPIs ambientales del dashboard (ej. "Anomalía Vegetal - NDVI" siempre mostraba "N/D"). Esto ocurría porque el dashboard consumía una copia manual del archivo histórico crudo de desnutrición, carente de los cruces satelitales y climáticos, y utilizaba un formato de fecha (entero) incompatible con el formato `YYYY-MM` de las predicciones OOS (2025).
La solución consistió en eliminar la dependencia de ese archivo manual y configurar `prep_gnn_data.py` para que exporte un `panel_historico_dashboard.csv` estructurado, justo antes de escalar las variables, sirviendo como única fuente de verdad (Data Bridge). Adicionalmente, se corrigió rígidamente la llave temporal en `data_loader.py`. La validación matemática sobre el dataframe cruzado arrojó exactamente un 2.7% de nulos en NDVI, coincidente 1:1 con los *gaps* satelitales legítimos nativos del panel. El parche de tolerancia del dashboard fue desactivado.

---

*Documento generado como parte de la auditoría de la Fase de Modelado del Proyecto SEMILLA.*
