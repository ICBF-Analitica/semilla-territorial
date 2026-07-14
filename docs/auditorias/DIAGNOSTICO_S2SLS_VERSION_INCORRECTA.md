# Diagnóstico: Por qué `spml_s2sls.R` usa la versión incorrecta (`twoways`)

## Tarea 1: Discrepancia Exacta Entre Ambos Scripts

El script `archive/audit_2026_07/s2sls_individual.R` **no es una versión completa o independiente del pipeline**. Es un "script envoltura" (wrapper) de diagnóstico.

1. **Lógica de Ejecución:** `s2sls_individual.R` lee literalmente las líneas de código de `spml_s2sls.R` usando `readLines()`, recorta el script justo antes del bloque de estimación del modelo, lo guarda en un archivo temporal `s2sls_prep_temp.R`, lo ejecuta mediante `source()`, y luego inyecta su propia estimación de modelo con `effect = "individual"`.
2. **Exportación de Resultados:** Tienen lógicas de exportación incompatibles.
   - `spml_s2sls.R` hace un merge con la base original para recuperar las columnas `anio` y `mes`, y exporta `divipola, anio, mes, casos_predichos_s2sls` a `data/interim/preds_s2sls.csv`.
   - `s2sls_individual.R` exporta un esquema distinto (`divipola`, `periodo`, `real`, `prediccion`) a un archivo distinto: `data/interim/preds_s2sls_individual.csv`.

Por lo tanto, la diferencia no es solo el parámetro `effect` — `s2sls_individual.R` carece del 80% de la lógica de procesamiento (depende de hackear el script original para funcionar) y genera un formato de salida incompatible con el resto del pipeline.

## Tarea 2: Reconstrucción de la Causa Raíz en la Reorganización

1. **¿El plan clasificó explícitamente esto?** 
   Sí, pero se basó en dependencias de código estáticas (AST/regex), no en validez estadística. En `PLAN_REORGANIZACION.md`, la regla de clasificación fue:
   - *¿Es invocado por `train_models.py` u otro entrypoint?* -> NÚCLEO.
   - *¿No es invocado por nadie?* -> ARCHIVAR.
2. **El Error de Asunción:** Dado que `train_models.py` (línea 56) invocaba explícitamente a `spml_s2sls.R`, este script fue promovido ciegamente al NÚCLEO. Como `s2sls_individual.R` no era llamado por nadie, el plan lo clasificó como `ARCHIVAR`. Nunca se cruzó esta dependencia mecánica con la narrativa de validación del documento `CORRECCION_BASELINE_S2SLS.md` (que indicaba que la versión `twoways` era la rota y la `individual` era la correcta). 

## Tarea 3: Dependencias y Compatibilidad de Formato

1. **Invocaciones:** 
   - `train_models.py` invoca explícitamente `spml_s2sls.R`.
   - `train_stgnn.py` (Fase 3) lee explícitamente `data/interim/preds_s2sls.csv`.
2. **Compatibilidad:** 
   - Si simplemente renombráramos `s2sls_individual.R` a `spml_s2sls.R`, fallaría catastróficamente porque intentaría hacer `readLines()` sobre sí mismo.
   - Si lo arregláramos para que corriera standalone, el pipeline igual colapsaría en la Fase 3, porque `s2sls_individual.R` no exporta las columnas `anio` y `mes` que `train_stgnn.py` necesita para hacer los merges.

## Recomendación Concreta de Corrección

**NO debes promover ni renombrar `s2sls_individual.R`.** Su rol como script de diagnóstico concluyó.

La corrección mínima, segura y compatible con el pipeline es **modificar directamente `spml_s2sls.R` en la raíz**:
1. Cambiar `effect = "twoways"` por `effect = "individual"` (Línea 360).
2. Opcionalmente, ajustar el cálculo de métricas para que refleje el nuevo comportamiento OOS, si aplica.

Esto preservará toda la lógica robusta de carga de datos, el pipeline de exportación (que genera las columnas correctas en `preds_s2sls.csv`) y la conexión ininterrumpida con `train_models.py` y `train_stgnn.py`.
