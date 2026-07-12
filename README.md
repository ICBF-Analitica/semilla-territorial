# SEMILLA: Inteligencia territorial para anticipar riesgos agroclimáticos y alimentarios

**SEMILLA** es una solución de inteligencia territorial basada en datos abiertos, imágenes satelitales e inteligencia artificial para identificar municipios de Colombia con mayor riesgo agroclimático, alimentario y territorial.

El proyecto responde al reto de **Agricultura y Desarrollo Rural** del concurso de datos abiertos:

> **Implementar modelos de IA para predecir rendimientos agrícolas y riesgos climáticos.**

SEMILLA integra información climática, agrícola, territorial, vial, poblacional, satelital y social para construir un **KPI municipal de riesgo**, identificar **tipologías territoriales mediante clustering** y apoyar la toma de decisiones públicas orientadas a la seguridad alimentaria, la resiliencia rural y la adaptación al cambio climático.

---

## 1. Resumen ejecutivo

Los choques climáticos no afectan de la misma manera a todos los territorios. Un aumento de temperatura, una reducción en la cobertura vegetal o una afectación en la disponibilidad hídrica pueden tener consecuencias más graves en municipios rurales con inseguridad alimentaria, baja conectividad vial, menor diversidad productiva y mayores barreras de acceso a servicios.

SEMILLA permite pasar de una lectura fragmentada de indicadores a una visión integrada del riesgo territorial. La solución combina:

- Datos abiertos nacionales e internacionales.
- Información satelital Sentinel-2 procesada mediante Google Earth Engine.
- Indicadores de seguridad alimentaria, ruralidad, conectividad y producción agrícola.
- Modelos de análisis espacial, clustering e inteligencia artificial.
- Una página web de consulta pública para explorar resultados municipales.

El resultado principal es una herramienta que permite **priorizar municipios**, **identificar perfiles de riesgo** y **orientar intervenciones diferenciadas** en seguridad alimentaria, asistencia técnica agropecuaria, conectividad rural, calidad del agua y adaptación climática.

---

## 2. Problema que aborda

Colombia enfrenta riesgos crecientes asociados a la variabilidad y el cambio climático. Estos riesgos pueden afectar la producción agrícola, la disponibilidad de alimentos, los medios de vida rurales y la situación nutricional de la población más vulnerable.

Sin embargo, las entidades públicas suelen contar con información dispersa en distintas fuentes, escalas y formatos. Esto dificulta responder preguntas como:

- ¿Qué municipios combinan mayor exposición climática y mayor vulnerabilidad alimentaria?
- ¿Dónde una reducción de la cobertura vegetal puede afectar la productividad y la seguridad alimentaria?
- ¿Qué municipios tienen baja conectividad vial y mayor dificultad para recibir asistencia oportuna?
- ¿Qué territorios comparten características similares y requieren intervenciones diferenciadas?
- ¿Dónde priorizar recursos públicos para prevenir deterioro nutricional y fortalecer la resiliencia rural?

SEMILLA aborda este problema mediante una solución de analítica pública que integra datos abiertos y modelos de IA para convertir información territorial compleja en insumos claros para la toma de decisiones.

---

## 3. Objetivo general

Desarrollar una solución basada en datos abiertos e inteligencia artificial que permita anticipar, priorizar y explicar riesgos agroclimáticos y alimentarios a escala municipal en Colombia, con el fin de apoyar decisiones públicas orientadas a la resiliencia rural, la seguridad alimentaria y la adaptación climática.

---

## 4. Objetivos específicos

1. Integrar fuentes abiertas de información agrícola, climática, territorial, vial, poblacional, satelital y social a escala municipal.
2. Construir variables comparables para caracterizar exposición climática, resiliencia ecológica, vulnerabilidad alimentaria, conectividad y ruralidad.
3. Diseñar un KPI municipal de riesgo territorial que permita priorizar municipios.
4. Identificar grupos de municipios con características similares mediante clustering.
5. Incorporar análisis predictivo y modelos espacio-temporales para anticipar tendencias de riesgo.
6. Presentar los resultados en una página web de consulta clara, responsiva y orientada a usuarios públicos.
7. Documentar la metodología, fuentes, variables, limitaciones y potencial de escalabilidad del proyecto.

---

## 5. Fuentes de datos abiertos

El proyecto integra información proveniente de fuentes públicas y abiertas, entre ellas:

| Fuente | Tipo de información | Uso en SEMILLA |
|---|---|---|
| UPRA | Producción agrícola, cultivos, uso del suelo y aptitud productiva | Caracterización productiva y diversidad agrícola |
| DANE | Población, ruralidad e inseguridad alimentaria | Medición de exposición social y vulnerabilidad alimentaria |
| Ministerio de Salud / ICBF | Información de salud, nutrición y variables asociadas a riesgo social | Aproximación al impacto social y nutricional |
| IGAC | Capas geográficas y territoriales | Integración espacial y caracterización municipal |
| OpenStreetMap | Red vial y conectividad terrestre | Construcción de indicadores de suficiencia vial |
| Open-Meteo | Temperatura, precipitación y variables climáticas | Análisis de exposición climática |
| Sentinel-2 / Google Earth Engine | Índices satelitales como NDVI, EVI, NDMI, NDWI, MSI, BSI y NDBI | Medición de cobertura vegetal, humedad, suelo y cambios territoriales |

---

## 6. Variables clave del análisis

SEMILLA incorpora variables que permiten entender el riesgo territorial desde una perspectiva multidimensional.

### Cobertura vegetal — NDVI

El NDVI funciona como un indicador de resiliencia ecológica. Una baja cobertura vegetal puede asociarse con mayor vulnerabilidad a erosión, pérdida de productividad del suelo, sequías, inundaciones y deslizamientos. Esto afecta la producción agropecuaria, reduce la disponibilidad local de alimentos y puede agravar crisis alimentarias después de eventos climáticos extremos.

### Suficiencia vial

La suficiencia vial representa la capacidad de un territorio para conectarse con mercados, servicios de salud, programas sociales y cadenas de abastecimiento. En emergencias, una baja suficiencia vial dificulta la llegada de ayuda humanitaria, atención nutricional y alimentos.

### Inseguridad alimentaria

La inseguridad alimentaria moderada o grave es un predictor directo del riesgo nutricional. Los municipios con mayores niveles de inseguridad alimentaria tienen hogares con menor capacidad para enfrentar choques climáticos y productivos.

### Población rural

La población rural representa un factor de exposición y brecha estructural. Las comunidades rurales dependen en mayor medida de actividades agropecuarias sensibles al clima y suelen enfrentar mayores barreras de acceso a infraestructura, salud y protección social.

### Diversidad productiva agrícola

La diversidad productiva permite aproximar la capacidad de abastecimiento territorial. Una menor diversidad de cultivos o una alta concentración en pocos grupos alimentarios aumenta la vulnerabilidad ante pérdidas asociadas a fenómenos climáticos.

### Temperatura

La temperatura es una variable climática crítica. Influye en la productividad agrícola, la disponibilidad hídrica, la ocurrencia de eventos extremos y el estrés sobre cultivos estratégicos y medios de vida rurales.

---

## 7. Metodología

La metodología del proyecto se organiza en seis etapas principales.

### 7.1 Integración de fuentes

Se consolidaron datos abiertos de distintas entidades y plataformas. La integración se realizó a escala municipal, usando códigos territoriales y procesos de homologación para asegurar comparabilidad.

### 7.2 Limpieza y transformación

Se realizaron procesos de depuración, normalización de variables, tratamiento de valores faltantes, estandarización de nombres de municipios y consolidación de indicadores.

### 7.3 Construcción de variables

Se construyeron variables asociadas a:

- Exposición climática.
- Cobertura vegetal y condiciones satelitales.
- Inseguridad alimentaria.
- Calidad del agua.
- Suficiencia vial.
- Ruralidad.
- Diversidad productiva agrícola.
- Indicadores de riesgo social y nutricional.

### 7.4 Análisis exploratorio

Se analizaron tendencias, distribuciones, relaciones entre variables y patrones territoriales, con énfasis en la relación entre clima, cobertura vegetal, inseguridad alimentaria y vulnerabilidad nutricional.

### 7.5 Construcción del KPI municipal

Se diseñó un KPI territorial para priorizar municipios según la combinación de factores críticos. El índice permite identificar territorios donde se acumulan condiciones de riesgo asociadas a inseguridad alimentaria, baja conectividad, presión climática, menor resiliencia ecológica y exposición rural.

### 7.6 Clustering territorial

Se aplicó clustering para identificar municipios con características similares. Esto permite pasar de un ranking general de riesgo a una lectura por perfiles territoriales, facilitando intervenciones diferenciadas.

---

## 8. Modelos de IA y análisis avanzado

SEMILLA incorpora enfoques de analítica avanzada e inteligencia artificial para anticipar y explicar riesgos territoriales.

### Clustering no supervisado

Permite agrupar municipios con patrones similares de riesgo, conectividad, ruralidad, inseguridad alimentaria, clima, cobertura vegetal y diversidad agrícola.

### Modelos espacio-temporales

Se consideran relaciones entre municipios vecinos y rezagos temporales para capturar dinámicas territoriales. Esto permite entender cómo ciertos riesgos pueden persistir o propagarse en el tiempo y el espacio.

### S2SLS

El enfoque S2SLS permite incorporar rezagos temporales y espaciales para capturar inercia y contagio entre municipios vecinos. Es útil para analizar cómo los choques climáticos y territoriales pueden mantenerse o expandirse.

### ST-GNN

Las redes neuronales espacio-temporales tipo ST-GNN permiten detectar tendencias, no solo valores puntuales. Este enfoque puede anticipar hacia dónde se dirige una crisis de desnutrición o vulnerabilidad alimentaria, aprendiendo patrones entre municipios, clima, vegetación y variables sociales.

### Interpretabilidad

La solución busca que los resultados sean explicables. Por eso, el KPI, el clustering y las visualizaciones se presentan de forma que los usuarios puedan entender qué variables inciden en el riesgo de cada municipio.

---

## 9. Resultados principales

El proyecto genera tres productos principales.

### 9.1 KPI municipal de riesgo

Permite priorizar municipios según la acumulación de factores de riesgo agroclimático, alimentario y territorial.

### 9.2 Segmentación territorial

El clustering identifica tres grandes segmentos de municipios:

#### Segmento 1: Municipios cálidos en crisis — agua y alimentos en riesgo

Grupo con mayor vulnerabilidad acumulada. Presenta mayor inseguridad alimentaria, mayor riesgo asociado a calidad del agua, menor suficiencia vial y menor diversidad productiva.

**Acción prioritaria:** intervenir en calidad del agua, seguridad alimentaria y conectividad vial.

#### Segmento 2: Municipios de montaña — ruralidad activa y mejor resiliencia

Grupo con alta ruralidad, mejor conectividad relativa y mayor diversidad productiva. Aunque mantiene riesgos, cuenta con una mejor base estructural para fortalecer resiliencia.

**Acción prioritaria:** fortalecer economía rural, diversificación agrícola y calidad del agua de forma preventiva.

#### Segmento 3: Municipios de transición — menor riesgo urbano-rural

Grupo con menor KPI relativo, menor población rural y mejores condiciones en algunos indicadores. Puede funcionar como escenario para pilotos de intervención.

**Acción prioritaria:** mantener calidad del agua, promover proyectos urbano-rurales y evitar deterioro ambiental.

### 9.3 Página web de consulta

La página web permite explorar resultados, consultar perfiles municipales, revisar mapas, visualizar clusters y acceder a un tablero detallado.

---

## 10. Impacto esperado

SEMILLA busca generar valor público en cinco dimensiones:

### Impacto social

Permite anticipar territorios donde los choques climáticos y productivos pueden traducirse en deterioro de la seguridad alimentaria y nutricional.

### Impacto económico

Apoya la priorización de asistencia técnica, fortalecimiento de cadenas productivas, diversificación agrícola y reducción de pérdidas asociadas a eventos climáticos.

### Impacto ambiental

Incorpora variables satelitales para monitorear cobertura vegetal, humedad, suelo y condiciones ecológicas relevantes para la resiliencia territorial.

### Impacto institucional

Facilita la articulación entre entidades nacionales, territoriales y sectoriales mediante una lectura común del riesgo municipal.

### Escalabilidad

La metodología puede actualizarse periódicamente con nuevas fuentes abiertas, nuevos periodos climáticos, nuevas imágenes satelitales y datos adicionales de producción agrícola.

---

## 11. Arquitectura general del proyecto

El repositorio combina una aplicación web de consulta con insumos de análisis avanzado.

```text
semilla-territorial/
├── .lovable/                  # Configuración del proyecto en Lovable
├── Avanzado_ia/               # Insumos, datos, consultas y notebooks de análisis avanzado
├── public/                    # Recursos públicos de la aplicación
├── src/                       # Código fuente de la aplicación web
│   ├── data/                  # Datos utilizados por la página web
│   ├── images/                # Imágenes y visualizaciones utilizadas en la web
│   ├── routes/                # Rutas principales de la aplicación
│   ├── components/            # Componentes reutilizables de interfaz
│   └── ...
├── package.json               # Dependencias de la aplicación web
├── vite.config.ts             # Configuración de Vite
├── tsconfig.json              # Configuración de TypeScript
└── README.md                  # Documentación principal del proyecto
