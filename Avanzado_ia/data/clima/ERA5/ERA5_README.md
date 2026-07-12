# Datos Crudos ERA5

Este documento describe los datos crudos descargados del reanálisis ERA5 (European Centre for Medium-Range Weather Forecasts - ECMWF).

Enlace: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-monthly-means?tab=overview

## Rango de Tiempo y Frecuencia

*   **Rango de Fechas:** 1 de enero de 2018 hasta 1 de marzo de 2026 (99 periodos).
*   **Intervalo de Tiempo:** Mensual (`stream-moda` - promedios mensuales de medias diarias). Cada medición representa el valor promedio de ese mes.

## Nivel de Desagregación (Resolución Espacial)

Los datos crudos **no** están agregados por municipio ni departamento. Vienen en un formato de grilla regular (raster):

*   **Resolución Espacial:** 0.25° x 0.25° grados (aproximadamente 27.75 km a nivel del ecuador).
*   **Bounding Box (Extensión):** 
    *   Latitud: 13.5° N a -4.5° S
    *   Longitud: -80.0° W a -66.5° W
*   *Nota: Para su uso en modelos a nivel departamental o municipal, estos datos en grilla deben ser cruzados e interpolados con los polígonos correspondientes.*

## Variables Descargadas

Los datos se encuentran divididos en dos archivos NetCDF (`.nc`):

### 1. Variables de Acumulación (`data_stream-moda_stepType-avgad.nc`)
*   **`tp` (Total precipitation):** Precipitación total (m).
*   **`ssrd` (Surface short-wave solar radiation downwards):** Radiación solar de onda corta descendente en la superficie (J/m²).
*   **`pev` (Potential evaporation):** Evaporación potencial (m).

### 2. Variables de Estado (`data_stream-moda_stepType-avgua.nc`)
*   **`t2m` (2 metre temperature):** Temperatura del aire a 2 metros de altura (Kelvin).
*   **`d2m` (2 metre dewpoint temperature):** Temperatura del punto de rocío a 2 metros (Kelvin).
*   **`stl1` (Soil temperature level 1):** Temperatura del suelo en la capa superficial (Kelvin).
*   **`swvl1` (Volumetric soil water layer 1):** Contenido volumétrico de agua en el suelo - Capa 1 (m³/m³).
*   **`swvl2` (Volumetric soil water layer 2):** Contenido volumétrico de agua en el suelo - Capa 2 (m³/m³).
