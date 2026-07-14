# Auditoría Diagnóstica: Prueba de Quiebre Estructural (Febrero 2024)

## 1. Contexto de la Hipótesis
La dirección del proyecto reportó la implementación de medidas institucionales preventivas a partir de febrero de 2024. Se planteó la hipótesis formal de que estas medidas representan un quiebre estructural (un cambio de régimen) en la relación entre los predictores climáticos (como la temperatura o el NDVI) y la cantidad de casos de desnutrición reportados.

**Metodología Estricta:** 
- La fecha probada fue exclusivamente el **1 de febrero de 2024**. No se realizaron búsquedas de otras fechas (*p-hacking*) para forzar resultados.
- La ventana de datos utilizada incluyó el panel completo desde 2019 hasta finales de 2024. El año 2025 permaneció completamente intacto (out-of-sample) para preservar la integridad del marco de prueba predictivo oficial.
- Se implementaron dos pruebas formales sobre un modelo OLS de panel (pooled): un Test de Chow (F-Test global) y un modelo con términos de interacción específicos a los factores de riesgo climático (temperatura, anomalias NDVI y crisis).

## 2. Resultados: Test de Chow Global
Se ajustó un modelo sin restricciones permitiendo que todos los coeficientes varíen entre el periodo pre-febrero 2024 y post-febrero 2024.

- **F-statistic:** 27.330891
- **p-value:** 8.776416e-43

**Interpretación Inicial Aislada:** Un p-valor de esta magnitud en un test aislado sugeriría un quiebre estructural altamente significativo. Sin embargo, en muestras de este tamaño (decenas de miles de observaciones), los F-Tests son extremadamente sensibles a variaciones minúsculas. Se requiere validación de robustez (Sección 4).

## 3. Resultados: Efectos Específicos (Modelo de Interacciones)
Para aislar qué relaciones climáticas específicas experimentaron el quiebre, se ajustó un modelo interactuando cada factor ambiental original con la variable dummy `post_feb2024`.

Los coeficientes de interacción resultantes fueron:

| Variable Interactuada | Coeficiente | Valor t | p-value | Significancia |
|--------------------------------------|-------------|---------|---------|---------------|
| `temperature_2m_mean_c:post_feb2024` | -0.001607   | -1.262  | 0.20668 | No sig.       |
| `ndvi_anomalia_lag4:post_feb2024`    | 0.016388    | 0.573   | 0.56628 | No sig.       |
| `ndvi_anomalia_lag8:post_feb2024`    | 0.078401    | 3.349   | 0.00081 | **Significativo (p < 0.01)** |
| `ndvi_crisis_lag4:post_feb2024`      | 0.026845    | 0.230   | 0.81747 | No sig.       |

**Interpretación Crítica de Interacciones (Tamaño vs Significancia):**
1. **Asimetría de Muestra:** El modelo divide el panel de manera sumamente desigual: N=56,392 observaciones en el régimen Pre-Febrero 2024 (53 meses) frente a N=11,704 en el régimen Post-Febrero 2024 (11 meses). Esta disparidad severa reduce sustancialmente la confiabilidad y estabilidad de las estimaciones del periodo "post".
2. **Resultados Mixtos:** Tres de los cuatro factores climáticos (temperatura, anomalía lag4, crisis lag4) no mostraron cambios estadísticamente significativos (p > 0.20 en todos los casos). 
3. **Tamaño del Efecto en lag8:** La única variable con interacción estadísticamente significativa (`ndvi_anomalia_lag8:post_feb2024`, p=0.0008) exhibe un tamaño de efecto relativo muy grande (cambio de +0.078 frente a una base de +0.014, un 530% de magnitud relativa). Sin embargo, "significancia estadística" en muestras de N > 68,000 no siempre equivale a un fenómeno estructural causal único.

## 4. Prueba Placebo de Robustez (Junio 2022) y Conclusión Final
Para verificar si la significancia observada es exclusiva a la política de Febrero de 2024 o simplemente un artefacto estadístico de dividir una muestra masiva (N=68,096), se corrió exactamente el mismo procedimiento utilizando el 1 de junio de 2022 como una **fecha placebo** sin ninguna política asociada.

**Resultados de la Fecha Placebo (Jun 2022):**
- **Test de Chow Global:** F = 8.719, p = 5.58e-12 (Altamente significativo).
- **Interacciones:** La variable `ndvi_anomalia_lag8:post_placebo` resultó nuevamente significativa (p = 0.0076).

**Conclusión Revisada para Dirección:**
Investigamos formalmente la hipótesis de que las medidas preventivas de febrero de 2024 cambiaron la relación entre clima y desnutrición. La primera prueba parecía confirmarlo, pero al aplicar una prueba de control (verificar si el mismo test 'encuentra' quiebres en fechas sin ningún significado), descubrimos que el resultado inicial era un artefacto estadístico del tamaño de la muestra, no evidencia real de la política. No encontramos evidencia suficiente para justificar un cambio en el diseño del modelo en este momento — pero dejamos el análisis documentado para revisarlo de nuevo cuando tengamos más meses de datos post-intervención, que es cuando esta pregunta realmente se podrá responder con la potencia estadística adecuada.
