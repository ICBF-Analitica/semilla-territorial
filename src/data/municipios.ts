import raw from "./municipios_semilla.csv?raw";

export type Municipio = {
  codigo: string;
  divipola: string;
  departamento: string;
  municipio: string;
  inseguridad: number; // fracción 0-1
  irca: number;
  suficiencia_vias: number;
  cultivos: number;
  temperatura: number;
  ndvi: number;
  poblacion_rural: number; // fracción 0-1
  kpi: number;
  kpi_quintile: string;
  cluster: number;
};

const parseNum = (s: string) => {
  const v = parseFloat(String(s ?? "").replace(",", "."));
  return Number.isFinite(v) ? v : 0;
};

function parse(): Municipio[] {
  const text = raw.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(";").map((h) => h.trim());
  const H: Record<string, number> = {};
  header.forEach((h, i) => {
    if (!(h in H)) H[h] = i; // primera aparición (NDVI está duplicada)
  });
  const col = (r: string[], name: string) => (H[name] !== undefined ? r[H[name]] ?? "" : "");
  return lines.slice(1).map((line) => {
    const r = line.split(";");
    return {
      codigo: (col(r, "MpCodigo") || "").trim(),
      divipola: (col(r, "Divipola") || "").trim(),
      departamento: (col(r, "Departamento") || "").trim(),
      municipio: (col(r, "Municipio") || "").trim(),
      inseguridad: parseNum(col(r, "Estimación Inseguridad Alimentaria Moderada-Grave")),
      irca: parseNum(col(r, "IRCA")),
      suficiencia_vias: parseNum(col(r, "Suficiencia de vías")),
      cultivos: parseNum(col(r, "Cantidad tipo de cultivos")),
      temperatura: parseNum(col(r, "temperature_2m_mean_c")),
      ndvi: parseNum(col(r, "NDVI")),
      poblacion_rural: parseNum(col(r, "Pob rural")),
      kpi: parseNum(col(r, "KPI")),
      kpi_quintile: (col(r, "KPI_Quintile") || "").trim(),
      cluster: parseNum(col(r, "Cluster")),
    };
  }).filter((m) => m.codigo && m.municipio);
}

export const municipios: Municipio[] = parse();

export const departamentos: string[] = Array.from(
  new Set(municipios.map((m) => m.departamento)),
).sort((a, b) => a.localeCompare(b, "es"));

type NormKey =
  | "irca"
  | "suficiencia_vias"
  | "inseguridad"
  | "ndvi"
  | "poblacion_rural"
  | "kpi";

const normKeys: NormKey[] = [
  "irca",
  "suficiencia_vias",
  "inseguridad",
  "ndvi",
  "poblacion_rural",
  "kpi",
];

export const rangos: Record<NormKey, { min: number; max: number }> = (() => {
  const out = {} as Record<NormKey, { min: number; max: number }>;
  for (const k of normKeys) {
    let mn = Infinity;
    let mx = -Infinity;
    for (const m of municipios) {
      const v = m[k];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    out[k] = { min: mn, max: mx };
  }
  return out;
})();

export function norm(k: NormKey, v: number): number {
  const { min, max } = rangos[k];
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}

/** Perfil de riesgo 0-100 (alto = mayor riesgo). Invierte vías y NDVI. */
export function perfilRiesgo(m: Municipio) {
  return [
    { k: "Baja conectividad vial", v: +(100 - norm("suficiencia_vias", m.suficiencia_vias)).toFixed(1) },
    { k: "IRCA (agua)", v: +norm("irca", m.irca).toFixed(1) },
    { k: "Inseguridad alimentaria", v: +norm("inseguridad", m.inseguridad).toFixed(1) },
    { k: "KPI", v: +norm("kpi", m.kpi).toFixed(1) },
    { k: "Cobertura vegetal baja", v: +(100 - norm("ndvi", m.ndvi)).toFixed(1) },
    { k: "Población rural", v: +norm("poblacion_rural", m.poblacion_rural).toFixed(1) },
  ];
}
