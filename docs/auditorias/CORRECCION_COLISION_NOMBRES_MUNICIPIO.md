# Diagnóstico y Corrección de Colisión de Nombres en el Dashboard

## El Problema y Diagnóstico

### 1. Cuantificación del Problema (Nombres Duplicados)
El análisis del shapefile municipal arrojó que existen **51 nombres de municipio duplicados** a lo largo del país, que comparten el mismo texto pero representan a diferentes divisiones políticas. 
Por ejemplo, **Buenavista** aparece 4 veces (Boyacá, Córdoba, Sucre, Quindío), **Villanueva** 4 veces (Casanare, Santander, La Guajira, Bolívar) y **Chima** 2 veces (Santander, Córdoba).

### 2. Mecanismo Exacto del Bug
El problema reside en la capa de presentación (dashboard). El identificador primario que se usa para compartir estado entre el `selectbox` (barra lateral), el componente mapa y el filtrado del drill-down es `MpNombre`.

- **En la barra lateral:** `dashboard_app.py` puebla el `selectbox` usando una lista de strings de `MpNombre` (Línea 111 y 120). Si hay dos "Buenavista", el usuario solo ve una o dos entradas idénticas, y al seleccionar una de ellas, el estado guarda el string `"Buenavista"`.
- **En el filtrado Drill-Down:** En `src/dashboard/components.py` (Línea 255), el código hace:
  ```python
  df_local = df_pred[df_pred['MpNombre'] == filtro_mpio].sort_values('mes')
  ```
  Esto captura las predicciones de *ambos* "Chima" (o los 4 "Buenavista") simultáneamente y las entrelaza al ordenar por `mes`, creando el efecto de "diente de sierra".
- **En la interactividad del mapa:** En `src/dashboard/components.py` (Líneas 233-236), cuando el usuario hace clic en el mapa, el sistema extrae correctamente el `MpCodigo` del polígono (porque `locations="MpCodigo"` en Plotly), pero lamentablemente convierte ese código de vuelta a un string de nombre:
  ```python
  mpcodigo_click = str(evento.selection.points[0]['location'])
  nombre_click = df_pred[df_pred['MpCodigo'] == mpcodigo_click]['MpNombre'].values
  return nombre_click[0] # Retorna "Chima" y pierde el código
  ```

> [!WARNING]
> **Ninguna de las métricas de rendimiento del modelo ST-GNN (RMSE, Pearson, MAE) calculadas en las fases previas y documentadas (ej. 2.62 RMSE) se ha visto contaminada**. El script de evaluación original (`train_stgnn.py` y `tune_stgnn.py`) opera **exclusivamente con tensores y `MpCodigo`** para hacer los *slices* espaciales, sin agrupar jamás por `MpNombre`. El problema detectado aquí afecta **únicamente a la visualización reactiva del dashboard**, específicamente al drill-down.

## Propuesta de Corrección (Implementación)

### Tarea 3: Modificaciones a Implementar

**1. Actualización en `dashboard_app.py`:**
- **Poblar opciones por código:** La lista de opciones del selectbox en lugar de contener nombres, contendrá tuplas o mantendrá un mapeo local. La opción mostrada al usuario usará el formato `Nombre (Departamento)` (ej. `"Chima (Córdoba)"`), pero el valor devuelto y almacenado en `st.session_state.mpio_seleccionado` será el **`MpCodigo`**.
- Se cambiará la inicialización del session_state para que la opción por defecto ("Ninguno") use una clave especial (ej. `None` o `"Nacional"`).

**2. Actualización en `src/dashboard/components.py`:**
- **Filtrado Drill-Down:** 
  Cambiar `df_local = df_pred[df_pred['MpNombre'] == filtro_mpio]` por `df_local = df_pred[df_pred['MpCodigo'] == filtro_mpio]`.
- **Lógica de KPIs Reactivos:**
  Cambiar `df_filtrado[df_filtrado['MpNombre'] == filtro_mpio]` por `df_filtrado[df_filtrado['MpCodigo'] == filtro_mpio]`.
- **Interactividad del Mapa (`render_mapa_nacional`):**
  Modificar el bloque de retorno para devolver directamente el código del municipio clicado, eliminando la conversión a nombre:
  ```python
  return str(evento.selection.points[0]['location'])
  ```

### Verificación Planificada
- Re-ejecutar el dashboard y revisar los municipios "Chima", "Buenavista" y "Villanueva".
- Confirmar que el gráfico temporal muestra una curva unificada sin dientes de sierra.
- Hacer clic en "Buenavista" (Quindío) en el mapa y validar que el drill-down solo muestre data del Quindío, sin contaminarse con Boyacá o Sucre.
