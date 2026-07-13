# Planteamiento del Problema

## El Problema: Riesgo Agroclimático y Territorial en Colombia

Colombia enfrenta riesgos crecientes asociados a la variabilidad y el cambio climático, con consecuencias que se distribuyen de forma muy desigual entre sus territorios. Un aumento de temperatura, una reducción en la cobertura vegetal, o una afectación en la disponibilidad hídrica no impactan por igual a todos los municipios: los efectos son más severos donde ya existe inseguridad alimentaria, baja conectividad vial, menor diversidad productiva agrícola, y mayores barreras estructurales de acceso a servicios.

Sin embargo, las entidades públicas suelen contar con esta información dispersa en distintas fuentes, escalas y formatos, lo que dificulta responder preguntas centrales para la toma de decisiones: ¿Qué municipios combinan mayor exposición climática y mayor vulnerabilidad alimentaria? ¿Dónde una reducción de la cobertura vegetal puede afectar la productividad agrícola y por ende la seguridad alimentaria? ¿Qué municipios tienen baja conectividad vial y mayor dificultad para recibir asistencia oportuna? ¿Qué territorios comparten características similares y requieren intervenciones diferenciadas? ¿Dónde priorizar recursos públicos para prevenir el deterioro de la seguridad alimentaria y fortalecer la resiliencia rural?

SEMILLA aborda este problema mediante tres componentes complementarios, cada uno respondiendo a una dimensión distinta del mismo desafío territorial:

**El KPI municipal de riesgo territorial** combina siete variables —inseguridad alimentaria, calidad del agua (IRCA), suficiencia vial, diversidad de cultivos, temperatura, cobertura vegetal (NDVI) y población rural— mediante un Análisis de Componentes Principales (PCA), para producir un puntaje de riesgo comparable entre municipios, segmentado en quintiles (de "Muy Bajo" a "Muy Alto"). La ponderación de cada variable es enteramente endógena, determinada por las cargas factoriales que el propio PCA calcula a partir de los datos — no por criterio experto.

**La segmentación territorial por clustering** agrupa los municipios en tres perfiles de riesgo compartido —municipios cálidos en crisis, municipios de montaña con ruralidad activa, y municipios de transición urbano-rural—, usando Clustering Jerárquico Aglomerativo sobre las mismas puntuaciones del KPI, traduciendo un ranking general en perfiles interpretables que facilitan el diseño de intervenciones diferenciadas por tipo de territorio.

**El componente predictivo espacio-temporal**, que es el foco del resto de esta documentación técnica, aporta la dimensión que los dos componentes anteriores no cubren por sí solos: la anticipación en el tiempo. Mientras el KPI y el clustering ofrecen una fotografía estructural de la vulnerabilidad de cada municipio, el componente predictivo señala cuándo esa vulnerabilidad se está por traducir en una crisis activa.


## La Oportunidad

Existen fuentes de datos abiertos —climáticas, de teledetección satelital, y de reportes históricos — que en conjunto contienen señales tempranas de riesgo: sequías prolongadas, anomalías en la cobertura vegetal (indicador indirecto de estrés agrícola y de seguridad alimentaria), y patrones históricos de incidencia por municipio. Estas fuentes, sin embargo, no estaban siendo integradas en una herramienta predictiva unificada que permitiera transformarlas en alertas accionables y preventidas para las diferentes entidades que pueden apoyar cada territorio.

## El Problema a Resolver

SEMILLA busca responder, de forma conjunta, tres preguntas que abordan distintas dimensiones del mismo riesgo territorial:

**¿Qué municipios concentran mayor riesgo estructural, combinando exposición climática, vulnerabilidad alimentaria, conectividad vial y capacidad productiva?** Esta pregunta la responde el KPI municipal de riesgo territorial, produciendo un puntaje comparable y objetivo para los 1.121 municipios de la base consolidada.

**¿Qué municipios comparten patrones de riesgo similares, y qué tipo de intervención requiere cada perfil?** Esta pregunta la responde la segmentación por clustering, agrupando a los municipios en tres perfiles territoriales interpretables — cálidos en crisis, de montaña, y de transición— que facilitan priorizar intervenciones diferenciadas en vez de tratar a todo el país por igual.

**¿Es posible anticipar, con semanas o meses de antelación, en qué municipios es más probable que se acelere una crisis, usando exclusivamente datos abiertos y de fuentes públicas ya disponibles?** Esta pregunta la responde el componente predictivo, construyendo un sistema de alertas tempranas que traduce datos climáticos, satelitales e históricos en señales de riesgo priorizadas por municipio, con especial énfasis en no fallar silenciosamente en las zonas de mayor vulnerabilidad histórica —donde un falso negativo (no anticipar una crisis real) tiene un costo humano mucho mayor que una alerta preventiva de más.

Las tres preguntas son complementarias: el KPI y el clustering responden *dónde* y *qué tipo* de riesgo estructural existe; el componente predictivo responde *cuándo* ese riesgo se está por materializar en una crisis activa.

## Objetivo del Sistema

Desarrollar una solución basada en datos abiertos, inteligencia artificial, machine learning, que permita anticipar, priorizar y explicar riesgos territoriales para la toma de decisiones públicas, y de prevención frente a agroclimáticos y seguridad alimentarios a nivel municipal en Colombia.

el anterior objetivo se pretende abordar a través de tres productos complementarios:

- El **KPI municipal** ofrece una medida objetiva y reproducible de riesgo estructural, sin depender de pesos asignados por criterio experto — su ponderación surge enteramente de la estructura estadística de los datos.
- La **segmentación por clustering** traduce ese riesgo estructural en perfiles territoriales interpretables, permitiendo diseñar intervenciones diferenciadas según el tipo de municipio, en lugar de una respuesta uniforme a nivel nacional.
- El **componente predictivo**. Su objetivo es funcionar como un **sistema de alerta temprana de tendencia relativa**: identificar hacia dónde se dirige el riesgo en cada municipio —si se está acelerando, estabilizando, o desacelerando— para que las entidades con accion territorialpuedan priorizar su intervención antes de que la crisis alcance su punto maximo. Esta definición es deliberada: prioriza la **sensibilidad ante crisis reales** sobre la precisión numérica exacta, especialmente en los municipios de mayor incidencia histórica, donde el costo de una alerta tardía es más alto que el costo de una alerta preventiva que resulte en falso positivo.

Juntos, los tres componentes permiten pasar de "¿qué municipios necesitan atención?" a "¿qué tipo de atención necesitan?" y "¿cuándo es más urgente actuar?" — las tres preguntas que un sistema de priorización territorial completo debe poder responder.

## Alcance de Este Documento

Este planteamiento describe el problema y los objetivos de los tres componentes de SEMILLA, presentados en conjunto al Concurso Datos al Ecosistema 2026. El detalle técnico de cada uno se documenta por separado según su naturaleza metodológica:

- **Componente predictivo:** arquitectura del modelo, proceso de validación, y resultados en `docs/architecture.md`, `docs/marco_metodologico.md`, `docs/conclusiones.md`, y el archivo técnico completo (`docs/auditorias/`, indexado en `docs/auditorias/README.md`).
- **KPI territorial y clustering:** metodología completa en `docs/architecture/DETALLE_KPI_CLUSTERING.md`, construida sobre la base municipal consolidada del proyecto (`Consolidado.xlsx`, con variables de UPRA, DANE, IGAC, OpenStreetMap, Open-Meteo y Sentinel-2).