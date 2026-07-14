export type Municipio = {
  codigo: string;
  municipio: string;
  departamento: string;
  inseguridad_alimentaria: number; // 0-100 (%)
  irca: number; // 0-100
  suficiencia_vias: number; // 0-100
  cultivos: number; // count
  temperatura: number; // °C
  ndvi: number; // 0-1
  poblacion_rural: number; // %
  kpi: number; // 0-100
  cluster: 1 | 2 | 3;
  factores: string[];
};

const deps = [
  ["Chocó", ["Quibdó", "Istmina", "Riosucio", "Bojayá", "Alto Baudó"]],
  ["La Guajira", ["Uribia", "Manaure", "Maicao", "Riohacha", "Dibulla"]],
  ["Nariño", ["Tumaco", "Ipiales", "Pasto", "Barbacoas", "Roberto Payán"]],
  ["Cauca", ["Popayán", "Guapi", "Timbiquí", "López de Micay", "Silvia"]],
  ["Antioquia", ["Turbo", "Apartadó", "Chigorodó", "Necoclí", "Vigía del Fuerte"]],
  ["Bolívar", ["Cartagena", "Magangué", "Mompós", "El Carmen de Bolívar", "María la Baja"]],
  ["Boyacá", ["Tunja", "Chiquinquirá", "Sogamoso", "Duitama", "Muzo"]],
  ["Meta", ["Villavicencio", "Puerto López", "Acacías", "Granada", "Puerto Gaitán"]],
  ["Casanare", ["Yopal", "Aguazul", "Tauramena", "Paz de Ariporo", "Hato Corozal"]],
  ["Vichada", ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"]],
] as const;

function seeded(i: number, salt = 1) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

export const demoMunicipios: Municipio[] = (() => {
  const out: Municipio[] = [];
  let i = 0;
  for (const [dep, muns] of deps) {
    for (const m of muns) {
      const r = seeded(++i);
      const r2 = seeded(i, 2);
      const inseg = 15 + r * 55;
      const vias = 20 + r2 * 70;
      const ndvi = 0.35 + seeded(i, 3) * 0.5;
      const temp = 18 + seeded(i, 4) * 14;
      const rural = 25 + seeded(i, 5) * 70;
      const cultivos = Math.round(2 + seeded(i, 6) * 12);
      const irca = seeded(i, 7) * 60;
      const kpi = Math.round(
        inseg * 0.28 + (100 - vias) * 0.18 + (100 - ndvi * 100) * 0.14 + (temp - 18) * 2 + rural * 0.15 + irca * 0.15,
      );
      const kpiC = Math.max(5, Math.min(98, kpi));
      const cluster = (kpiC > 65 ? 1 : kpiC > 45 ? 3 : 2) as 1 | 2 | 3;
      const factores: string[] = [];
      if (inseg > 45) factores.push("Inseguridad alimentaria");
      if (vias < 45) factores.push("Baja conectividad vial");
      if (ndvi < 0.5) factores.push("Estrés vegetal");
      if (temp > 26) factores.push("Exposición térmica");
      if (rural > 60) factores.push("Alta ruralidad");
      if (irca > 35) factores.push("Calidad de agua");
      out.push({
        codigo: String(5000 + i),
        municipio: m,
        departamento: dep as string,
        inseguridad_alimentaria: +inseg.toFixed(1),
        irca: +irca.toFixed(1),
        suficiencia_vias: +vias.toFixed(1),
        cultivos,
        temperatura: +temp.toFixed(1),
        ndvi: +ndvi.toFixed(2),
        poblacion_rural: +rural.toFixed(1),
        kpi: kpiC,
        cluster,
        factores: factores.slice(0, 3),
      });
    }
  }
  return out.sort((a, b) => b.kpi - a.kpi);
})();

export const clusters = [
  {
    id: 1,
    nombre: "Alta vulnerabilidad alimentaria y presión climática",
    color: "var(--chart-4)",
    descripcion:
      "Municipios con inseguridad alimentaria elevada, estrés vegetal y exposición térmica marcada.",
    variables_altas: ["Inseguridad alimentaria", "Temperatura media", "Ruralidad"],
    variables_bajas: ["Suficiencia de vías", "NDVI"],
    recomendacion:
      "Priorizar asistencia técnica agroclimática, transferencias condicionadas y programas nutricionales.",
  },
  {
    id: 2,
    nombre: "Ruralidad alta con mejor conectividad relativa",
    color: "var(--chart-1)",
    descripcion:
      "Territorios rurales con acceso vial razonable y menor presión climática inmediata.",
    variables_altas: ["Suficiencia de vías", "Diversidad de cultivos"],
    variables_bajas: ["Inseguridad alimentaria", "IRCA"],
    recomendacion:
      "Fortalecer cadenas productivas, extensión rural y mercados campesinos.",
  },
  {
    id: 3,
    nombre: "Riesgo intermedio con señales vegetacionales críticas",
    color: "var(--chart-3)",
    descripcion:
      "NDVI descendente y variabilidad climática que anticipa deterioro productivo.",
    variables_altas: ["Estrés vegetal", "Temperatura media"],
    variables_bajas: ["NDVI"],
    recomendacion:
      "Monitoreo satelital continuo, sistemas de alerta temprana y adaptación de calendarios agrícolas.",
  },
];

export const fuentes = [
  { fuente: "UPRA", variable: "Producción y uso agrícola", uso: "Diversidad de cultivos y aptitud productiva" },
  { fuente: "IGAC", variable: "Uso del suelo y capas territoriales", uso: "Contexto biofísico y coberturas" },
  { fuente: "DANE", variable: "Ruralidad, población, inseguridad alimentaria", uso: "Vulnerabilidad social y demografía" },
  { fuente: "MinSalud", variable: "Salud y nutrición", uso: "Indicadores de deterioro nutricional" },
  { fuente: "Open-Meteo", variable: "Temperatura, precipitación", uso: "Exposición climática municipal" },
  { fuente: "Sentinel-2 / GEE", variable: "NDVI, vigor vegetal", uso: "Estrés vegetal por teledetección" },
  { fuente: "OpenStreetMap", variable: "Red vial y accesibilidad", uso: "Suficiencia de conectividad rural" },
];