# Decisiones Técnicas del ST-GNN: De la Amnesia de Escala a la Calibración Final

*Registro consolidado de las decisiones arquitectónicas del componente predictivo, en el orden en que se diagnosticaron y resolvieron.*

## 1. El Problema Raíz: Amnesia de Escala

El pipeline de preprocesamiento (`prep_gnn_data.py`) normalizaba a los 1.064 municipios con una técnica global (`StandardScaler`), mezclando en un solo vector a municipios de alta y baja incidencia. Esto "aplastaba" estadísticamente a los municipios atípicos de alta intensidad (como Uribia), cuyas señales de riesgo quedaban indistinguibles de las de un municipio de incidencia casi nula tras la normalización.

**Corrección — Normalización Estratificada:** el pipeline clasifica cada municipio en Estrato Alto (≥ percentil 90 de casos históricos) o Estrato Bajo, calculado exclusivamente con datos de entrenamiento, y ajusta un escalador independiente para cada estrato (`scaler_alta.pkl`, `scaler_baja.pkl`). Un mapa de inferencia (`municipios_estratos.csv`) asegura que el dashboard y el orquestador clasifiquen cada municipio de forma idéntica a como se hizo en entrenamiento.

## 2. El Efecto Colateral: Amnesia de Escala Base

La normalización estratificada resolvió la varianza intra-municipio, pero introdujo un segundo problema: al normalizar, tanto un municipio de 100 casos históricos (Uribia) como uno de 1 caso convergían a un valor cercano a `0`. Como la red comparte pesos globalmente, recibir `0` en la entrada no le daba ninguna pista de en qué escala debía predecir, y colapsaba hacia el promedio nacional.

**Corrección — Exposure Offset (Ancla Multiplicativa):** se calcula la media histórica de casos por municipio (solo con datos de entrenamiento) y se inyecta directamente en la arquitectura como un multiplicador aplicado después de la activación:

$$\mu = \left(\text{Softplus}(MLP(H_{spatial})) + \epsilon\right) \times \text{Media Histórica}$$

Se prefirió esta forma multiplicativa pura sobre una alternativa aditiva en espacio logarítmico, descartada porque `Softplus(x) ≈ exp(x)` solo es una aproximación válida lejos de cero — justo donde caen la mayoría de los municipios de baja incidencia. El bias inicial del MLP se ajustó a `0.5413` (`softplus⁻¹(1)`) para que el modelo arranque, antes de cualquier entrenamiento, prediciendo exactamente la media histórica de cada municipio.

## 3. El Tercer Problema: Mudez Dinámica

Con el aplanamiento espacial resuelto, el modelo aprendió una salida "perezosa": multiplicadores casi constantes, sin reaccionar a las variables climáticas. La causa fue que la función de pérdida promediaba el error de todos los municipios por igual (`loss.mean()`), y los 956 municipios de baja incidencia dominaban el gradiente frente a los 108 críticos.

**Corrección — Pesos Espaciales + Co-optimización de Pearson:** la función de pérdida acepta ahora un peso por nodo (mayor para el Estrato Alto), y el objetivo de búsqueda de Optuna incorpora explícitamente el seguimiento de tendencia temporal, no solo el error de magnitud.

## 4. La Asimetría del Riesgo: Pérdida Binomial Negativa Asimétrica

En un sistema de alerta de desnutrición infantil, subestimar una crisis (falso negativo) es un error mucho más costoso que sobreestimarla (falso positivo). Se diseñó una función de pérdida que multiplica el costo del gradiente por un factor cuando el modelo subestima:

$$\lambda(y, \mu) = \begin{cases} 5.0, & \text{si } y > \mu \text{ (subestimación)} \\ 1.0, & \text{si } y \le \mu \end{cases}$$

Para evitar explosión de gradientes por este multiplicador severo, se introdujo recorte de gradiente (`clip_grad_norm_`, norma máxima 1.0) en el bucle de entrenamiento.

## 5. Calibración: Optuna y el Equilibrio del Riesgo

La búsqueda de hiperparámetros usa una métrica compuesta que penaliza 3 veces más el error de subestimación que el de sobreestimación, evitando dos extremos: un modelo demasiado conservador (que ignora picos reales) y uno hiper-sensible que infla sistemáticamente sus predicciones. Incluye *early stopping* (paciencia de 15 épocas) y poda de intentos poco prometedores (`MedianPruner`) para eficiencia computacional. El resultado final es `config/best_params.json`, versionado en git como artefacto de trazabilidad.

## Nota de Contexto

Estas cinco decisiones se tomaron y refinaron durante el proceso de auditoría completo del componente predictivo. Los valores numéricos finales resultantes de esta calibración —después de corregir además las fugas de datos detectadas en el proceso— están documentados en `docs/conclusiones.md` y `docs/auditorias/`.