# Aclaraciones de Auditoría: Colisión de Nombres y Ventana Temporal

## 1. El Salto de 51 a 64 Duplicados
La discrepancia entre 51 y 64 fue el resultado de un error de lectura de mi parte sobre la salida estándar (stdout) de la terminal en mi primer diagnóstico, y no de un cambio metodológico o contaminación de datos.

En la primera prueba que ejecuté directamente sobre el shapefile (`gdf`), la consola generó una lista larga de municipios. El sistema de la terminal truncó las primeras líneas para ahorrar memoria, imprimiendo literalmente:
`<truncated 51 lines>`
Seguido de la lista empezando por "Betulia". Al leer ese log, tomé equivocadamente ese aviso del sistema (`truncated 51 lines`) como el conteo total de municipios encontrados, cuando en realidad el conteo real impreso más arriba (que quedó oculto) era **66**.

Al ejecutar la validación programática rigurosa sobre el archivo que realmente consume el dashboard (`predicciones_stgnn.csv`), el script iteró correctamente la matriz y contó **64 nombres duplicados**. 

**¿Por qué 64 y no 66?** 
El shapefile nacional completo tiene 1,122 municipios, mientras que `predicciones_stgnn.csv` solo tiene 1,064 (excluyendo áreas no municipalizadas o casos sin datos válidos). Los 2 nombres de municipio que faltan en el panel de predicciones ("Concordia" y "San Miguel") tenían sus pares homónimos en esos recortes territoriales. Así que **64 es el universo total, absoluto y metodológicamente correcto** de colisiones presentes en la UI del dashboard.

## 2. La Ventana de 76 Filas vs 84 Meses
El panel bruto ensamblado por `prep_gnn_data.py` (el *Data Bridge*) contiene efectivamente **84 periodos** (Enero 2019 - Diciembre 2025). 

Sin embargo, el modelo ST-GNN requiere una ventana de rezago (lags autoregresivos) para poder generar la primera predicción. La arquitectura configurada consume **8 meses de rezago** (`lags=8`). Esto significa que los primeros 8 meses de 2019 se "sacrifican" para inicializar la memoria de la red. 

Por lo tanto, la primera predicción que el modelo puede matemáticamente emitir corresponde al mes 9 (Septiembre 2019). Esto deja exactamente **76 periodos evaluables** (84 - 8 = 76).

**¿El dashboard mezcla predicciones In-Sample y Out-of-Sample?**
Sí, las 76 filas que muestra el "Deep Dive Longitudinal" abarcan todo el espectro (Train = 52, Valid = 12, Test OOS = 12). Sin embargo, el usuario sí es consciente de esto: en el código de `render_drilldown_municipal` de `components.py` (líneas 325-330 aprox.), existe un componente visual explícito que añade una línea vertical punteada en el gráfico marcando el punto de corte temporal entre la reconstrucción histórica (In-Sample) y la proyección pura (Out-of-Sample). El propósito de mostrar los 64 meses históricos reconstruidos es proveerle a los directivos del ICBF la métrica de **Fidelidad del Modelo** (demostrando visualmente que la IA fue capaz de replicar la forma de los picos pasados) antes de pedirles que confíen en los picos futuros.
