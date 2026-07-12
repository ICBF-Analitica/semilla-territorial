// ======================================================
// 1. Municipios de Colombia continental
// ======================================================

var municipios = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2")
  .filter(ee.Filter.eq('ADM0_NAME', 'Colombia'))
  .filter(ee.Filter.neq('ADM1_NAME', 'San Andrés y Providencia'))
  // Seleccionar solo atributos útiles para reducir peso de salida
  .select([
    'ADM0_NAME',
    'ADM1_NAME',
    'ADM2_NAME',
    'ADM2_CODE'
  ]);


// ======================================================
// 2. Parámetros generales
// ======================================================

var anio = 2020;
var meses = ee.List.sequence(7, 12);

// Escala sugerida:
// 30 m = más detalle, más costo computacional
// 60 m = más eficiente para análisis municipal nacional
var escala = 60;


// ======================================================
// 3. Máscara de nubes Sentinel-2 usando SCL
// ======================================================

function enmascararS2(img) {
  var scl = img.select('SCL');

  // Clases SCL:
  // 3  = sombra de nube
  // 8  = nube probabilidad media
  // 9  = nube probabilidad alta
  // 10 = cirros
  // 11 = nieve/hielo
  var mascara = scl.neq(3)
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  // Escalar reflectancia a 0-1.
  // Esto es importante para EVI porque tiene una constante +1.
  return img
    .select(['B2', 'B4', 'B8', 'B11'])
    .divide(10000)
    .updateMask(mascara)
    .copyProperties(img, ['system:time_start']);
}


// ======================================================
// 4. Función para calcular índices espectrales
// ======================================================

function agregarIndices(img) {
  var blue = img.select('B2');
  var red  = img.select('B4');
  var nir  = img.select('B8');
  var swir = img.select('B11');

  var ndvi = nir.subtract(red)
    .divide(nir.add(red))
    .rename('NDVI');

  var evi = nir.subtract(red)
    .multiply(2.5)
    .divide(
      nir
        .add(red.multiply(6))
        .subtract(blue.multiply(7.5))
        .add(1)
    )
    .rename('EVI');

  // NDMI: humedad de vegetación.
  // También se usa como NDWI NIR-SWIR en algunos estudios.
  var ndmi = nir.subtract(swir)
    .divide(nir.add(swir))
    .rename('NDMI');

  // MSI: Moisture Stress Index.
  // Valores altos suelen indicar mayor estrés hídrico.
  var msi = swir.divide(nir)
    .rename('MSI');

  var bsi = swir.add(red)
    .subtract(nir.add(blue))
    .divide(
      swir.add(red)
        .add(nir)
        .add(blue)
    )
    .rename('BSI');

  var ndbi = swir.subtract(nir)
    .divide(swir.add(nir))
    .rename('NDBI');

  return img.addBands([
    ndvi,
    evi,
    ndmi,
    msi,
    bsi,
    ndbi
  ]);
}


// ======================================================
// 5. Función mensual optimizada
// ======================================================

function calcularIndicesMensuales(mes) {
  mes = ee.Number(mes);

  var start = ee.Date.fromYMD(anio, mes, 1);
  var end = start.advance(1, 'month');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(municipios)
    .filterDate(start, end)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 70))
    .select(['B2', 'B4', 'B8', 'B11', 'SCL'])
    .map(enmascararS2);

  var nImagenes = s2.size();

  return ee.FeatureCollection(
    ee.Algorithms.If(
      nImagenes.gt(0),

      // Si hay imágenes, calcular mediana mensual e índices
      (function() {

        var mensual = s2.median();

        var indices = agregarIndices(mensual)
          .select([
            'NDVI',
            'EVI',
            'NDMI',
            'MSI',
            'BSI',
            'NDBI'
          ]);

        // Reducidor combinado para obtener varias estadísticas
        // en una sola operación
        var reducer = ee.Reducer.mean()
          .combine({
            reducer2: ee.Reducer.stdDev(),
            sharedInputs: true
          })
          .combine({
            reducer2: ee.Reducer.min(),
            sharedInputs: true
          })
          .combine({
            reducer2: ee.Reducer.max(),
            sharedInputs: true
          });

        var zonal = indices.reduceRegions({
          collection: municipios,
          reducer: reducer,
          scale: escala,
          tileScale: 4
        });

        return zonal.map(function(f) {
          return f.set({
            'year': anio,
            'month': mes,
            'n_imagenes': nImagenes,
            'fecha_inicio': start.format('YYYY-MM-dd'),
            'fecha_fin': end.advance(-1, 'day').format('YYYY-MM-dd')
          });
        });

      })(),

      // Si no hay imágenes en el mes, devolver colección vacía
      ee.FeatureCollection([])
    )
  );
}


// ======================================================
// 6. Ejecutar todos los meses y aplanar resultados
// ======================================================

var listaMensual = meses.map(calcularIndicesMensuales);

var resultados = ee.FeatureCollection(listaMensual).flatten();

print('Resultados', resultados.limit(10));


// ======================================================
// 7. Exportar CSV
// ======================================================

Export.table.toDrive({
  collection: resultados,
  description: 'Indices_S2_Municipios_Colombia_' + anio,
  fileFormat: 'CSV'
});