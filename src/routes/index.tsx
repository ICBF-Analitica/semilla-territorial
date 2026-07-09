import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Database,
  Leaf,
  Satellite,
  MapPin,
  Sprout,
  Cloud,
  Route as RouteIcon,
  Users,
  HeartPulse,
  Brain,
  Layers,
  ShieldCheck,
  Target,
  Sparkles,
  Upload,
  Download,
  Github,
  Mail,
  ArrowRight,
  AlertTriangle,
  Activity,
  Network,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { demoMunicipios, clusters, fuentes, type Municipio } from "@/data/demoData";

export const Route = createFileRoute("/")({ component: Index });

const NAV = [
  ["inicio", "Inicio"],
  ["problema", "Problema"],
  ["datos", "Datos abiertos"],
  ["metodologia", "Metodología"],
  ["resultados", "Resultados"],
  ["kpi", "KPI"],
  ["clusters", "Clusters"],
  ["ia", "IA"],
  ["impacto", "Impacto"],
  ["demo", "Demo"],
  ["contacto", "Contacto"],
] as const;

function riskColor(kpi: number) {
  if (kpi >= 65) return "var(--chart-4)";
  if (kpi >= 45) return "var(--chart-3)";
  return "var(--chart-1)";
}
function riskLabel(kpi: number) {
  if (kpi >= 65) return "Alto";
  if (kpi >= 45) return "Medio";
  return "Bajo";
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Problema />
      <DatosAbiertos />
      <Metodologia />
      <Resultados />
      <KpiSection />
      <ClustersSection />
      <IASection />
      <Impacto />
      <CasosDeUso />
      <Demo />
      <Cierre />
      <Footer />
    </div>
  );
}

/* ---------- Navbar ---------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/85 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2 min-w-0">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl shrink-0 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sprout className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="font-black tracking-tight leading-none">SEMILLA</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
              Inteligencia territorial
            </div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#demo"
          className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          Ver demo <ArrowRight className="w-4 h-4" />
        </a>
        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          aria-label="Abrir menú"
        >
          <div className="w-5 h-0.5 bg-foreground mb-1" />
          <div className="w-5 h-0.5 bg-foreground mb-1" />
          <div className="w-5 h-0.5 bg-foreground" />
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="grid grid-cols-2 p-3 gap-1">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Section wrapper ---------- */
function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id: string;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 py-20 sm:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {eyebrow}
          </div>
        )}
        {title && (
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl">{subtitle}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section
      id="inicio"
      className="scroll-mt-20 relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden text-primary-foreground"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 40 }).map((_, i) => {
            const x = (i * 97) % 800;
            const y = (i * 53) % 600;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={2} fill="#fff" opacity={0.6} />
                {i < 30 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={(x + 120) % 800}
                    y2={(y + 90) % 600}
                    stroke="#fff"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}
          <circle cx="400" cy="300" r="180" fill="url(#g1)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Datos abiertos · Colombia
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
            SEMILLA
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-medium max-w-2xl text-white/90">
            Inteligencia territorial para anticipar riesgo agroclimático y alimentario.
          </p>
          <p className="mt-6 text-base sm:text-lg text-white/75 max-w-2xl">
            Una solución basada en datos abiertos, imágenes satelitales e inteligencia artificial
            para priorizar municipios rurales, anticipar riesgos climáticos y fortalecer la
            seguridad alimentaria.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { icon: Database, label: "Datos abiertos" },
              { icon: Brain, label: "IA y análisis predictivo" },
              { icon: Target, label: "Priorización municipal" },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm"
              >
                <b.icon className="w-4 h-4" /> {b.label}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#resultados"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold shadow-lg hover:brightness-105 transition"
            >
              Explorar resultados <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#metodologia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition"
            >
              Ver metodología
            </a>
          </div>
        </div>

        <ColombiaGraphic />
      </div>
    </section>
  );
}

function ColombiaGraphic() {
  const pts = [
    [55, 15], [48, 25], [40, 35], [58, 40], [45, 50],
    [62, 30], [50, 60], [65, 55], [42, 68], [55, 75],
    [70, 42], [38, 45], [60, 20], [52, 82], [48, 90],
  ];
  return (
    <div className="relative aspect-square max-w-md mx-auto w-full">
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-40"
        style={{ background: "var(--chart-1)" }}
      />
      <svg viewBox="0 0 100 100" className="relative w-full h-full">
        <path
          d="M55 8 L48 18 L38 22 L32 32 L28 44 L34 52 L30 62 L38 72 L44 82 L52 92 L60 88 L68 78 L72 66 L76 54 L74 42 L68 32 L62 22 L55 8 Z"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.5"
        />
        {pts.map(([x, y], i) => {
          const risk = (i * 37) % 3;
          const color = risk === 0 ? "#f59e0b" : risk === 1 ? "#22c55e" : "#38bdf8";
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2.5" fill={color}>
                <animate
                  attributeName="r"
                  values="2;3.5;2"
                  dur={`${2 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={x} cy={y} r="5" fill={color} opacity="0.2" />
            </g>
          );
        })}
        {pts.slice(0, 10).map(([x1, y1], i) => {
          const [x2, y2] = pts[(i + 3) % pts.length];
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Problema ---------- */
function Problema() {
  const cards = [
    {
      icon: Cloud,
      title: "Riesgo climático",
      body: "Cambios en temperatura, precipitación y estrés vegetal pueden afectar la productividad agrícola.",
      tone: "accent",
    },
    {
      icon: HeartPulse,
      title: "Vulnerabilidad alimentaria",
      body: "Los territorios con inseguridad alimentaria tienen menor capacidad de absorber choques productivos.",
      tone: "destructive",
    },
    {
      icon: RouteIcon,
      title: "Brechas territoriales",
      body: "La conectividad vial, la ruralidad y la estructura productiva condicionan la capacidad de respuesta.",
      tone: "secondary",
    },
  ];
  return (
    <Section
      id="problema"
      eyebrow="El problema"
      title="No todos los municipios enfrentan el mismo riesgo"
      subtitle="Los choques climáticos, el aumento de temperatura, la variación de la vegetación, la inseguridad alimentaria y las brechas de conectividad rural no afectan igual a todos los territorios."
    >
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.title}
            className="p-6 rounded-2xl bg-card border border-border transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div
              className="w-12 h-12 rounded-xl grid place-items-center mb-4"
              style={{ background: `var(--${c.tone})`, color: `var(--${c.tone}-foreground)` }}
            >
              <c.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
      <blockquote className="mt-10 p-6 sm:p-8 rounded-2xl border-l-4 border-primary bg-muted/60 text-lg sm:text-xl font-medium italic">
        "No basta con saber dónde cambia el clima; es necesario saber dónde ese cambio puede
        convertirse en una crisis productiva, alimentaria o social."
      </blockquote>
    </Section>
  );
}

/* ---------- Datos abiertos ---------- */
function DatosAbiertos() {
  const capas = [
    { icon: Sprout, name: "Producción agrícola y cultivos", src: "UPRA" },
    { icon: Layers, name: "Uso del suelo y capas territoriales", src: "UPRA · IGAC" },
    { icon: Users, name: "Población, ruralidad e inseguridad alimentaria", src: "DANE" },
    { icon: HeartPulse, name: "Salud y nutrición", src: "MinSalud · ICBF" },
    { icon: Cloud, name: "Clima (temperatura y precipitación)", src: "Open-Meteo" },
    { icon: Satellite, name: "Vegetación satelital (NDVI)", src: "Sentinel-2 · GEE" },
    { icon: RouteIcon, name: "Vías y accesibilidad", src: "OpenStreetMap" },
  ];
  return (
    <Section
      id="datos"
      eyebrow="Ecosistema de datos"
      title="Datos abiertos para anticipar riesgos rurales"
      subtitle="Integramos fuentes públicas nacionales e internacionales, homologadas a escala municipal mediante códigos DIVIPOLA."
      className="bg-muted/40"
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
        <div className="space-y-3">
          {capas.map((c, i) => (
            <div
              key={c.name}
              className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition"
              style={{ transform: `translateX(${(i % 3) * 8}px)` }}
            >
              <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                <c.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.src}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-5 py-4 border-b border-border bg-secondary text-secondary-foreground">
            <div className="font-bold">Fuentes y uso en el modelo</div>
            <div className="text-xs opacity-80">Escala municipal · Colombia</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Fuente</th>
                  <th className="text-left px-4 py-3">Variable</th>
                  <th className="text-left px-4 py-3">Uso</th>
                </tr>
              </thead>
              <tbody>
                {fuentes.map((f) => (
                  <tr key={f.fuente} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{f.fuente}</td>
                    <td className="px-4 py-3">{f.variable}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 text-xs text-muted-foreground border-t border-border bg-muted/40">
            Todas las fuentes fueron integradas a escala municipal mediante homologación
            territorial, limpieza de códigos DIVIPOLA y construcción de indicadores comparables.
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Metodología ---------- */
function Metodologia() {
  const pasos = [
    { n: "01", icon: Database, t: "Integración de fuentes", d: "Homologación territorial, limpieza y unión de datos abiertos." },
    { n: "02", icon: Layers, t: "Construcción de variables", d: "Temperatura, NDVI, inseguridad alimentaria, suficiencia de vías, cultivos, ruralidad y salud." },
    { n: "03", icon: Activity, t: "Análisis de tendencias", d: "Relaciones entre clima, vegetación y vulnerabilidad alimentaria." },
    { n: "04", icon: Target, t: "KPI municipal de riesgo", d: "Medida sintética para priorizar municipios." },
    { n: "05", icon: Network, t: "Clustering territorial", d: "Agrupación de municipios similares para intervenciones diferenciadas." },
  ];
  return (
    <Section
      id="metodologia"
      eyebrow="Metodología"
      title="Del dato climático a la decisión territorial"
      subtitle="Un flujo replicable, trazable y actualizable que convierte múltiples fuentes en una lectura municipal accionable."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pasos.map((p, i) => (
          <div
            key={p.n}
            className="relative p-6 rounded-2xl bg-card border border-border overflow-hidden"
          >
            <div className="text-5xl font-black text-primary/15 absolute top-2 right-3">{p.n}</div>
            <div className="relative">
              <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary text-primary-foreground mb-3">
                <p.icon className="w-5 h-5" />
              </div>
              <div className="font-bold">{p.t}</div>
              <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{p.d}</div>
            </div>
            {i < pasos.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-5 h-5 text-primary/40" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="mt-8 p-6 rounded-2xl text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 shrink-0" />
          <p className="text-base sm:text-lg font-medium">
            El KPI no es una suma arbitraria de indicadores. Es una medida compuesta que resume
            exposición climática, vulnerabilidad social, presión territorial y capacidad de
            respuesta.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Resultados ---------- */
function Resultados() {
  const kpis = [
    { v: "1.100+", l: "Municipios analizados", icon: MapPin },
    { v: "7", l: "Familias de variables integradas", icon: Layers },
    { v: "Municipal", l: "Escala de análisis", icon: Target },
    { v: "KPI + Clusters", l: "Productos principales", icon: BarChart3 },
  ];
  const top = demoMunicipios.slice(0, 10);

  return (
    <Section
      id="resultados"
      eyebrow="Resultados"
      title="Priorización municipal basada en evidencia"
      subtitle="Un panorama nacional del riesgo agroclimático y alimentario, con un ranking de municipios priorizados."
      className="bg-muted/40"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.l} className="p-5 rounded-2xl bg-card border border-border">
            <k.icon className="w-5 h-5 text-primary" />
            <div className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">{k.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold">Mapa de riesgo municipal</div>
              <div className="text-xs text-muted-foreground">Placeholder de mapa · Colombia</div>
            </div>
            <Legend2 />
          </div>
          <FakeMap />
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="font-bold">Ranking de priorización</div>
            <div className="text-xs text-muted-foreground">Top municipios por KPI</div>
          </div>
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {top.map((m, i) => (
              <div key={m.codigo} className="p-4 flex items-center gap-3 hover:bg-muted/40">
                <div className="text-xs font-black w-6 text-muted-foreground">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{m.municipio}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.departamento} · Cluster {m.cluster}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.factores.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="px-2 py-1 rounded font-black text-sm"
                    style={{ background: riskColor(m.kpi), color: "white" }}
                  >
                    {m.kpi}
                  </div>
                  <div className="text-[10px] uppercase mt-0.5 text-muted-foreground">
                    {riskLabel(m.kpi)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Legend2() {
  const items = [
    ["Alto", "var(--chart-4)"],
    ["Medio", "var(--chart-3)"],
    ["Bajo", "var(--chart-1)"],
  ];
  return (
    <div className="flex gap-3 text-xs">
      {items.map(([l, c]) => (
        <div key={l} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: c }} />
          {l}
        </div>
      ))}
    </div>
  );
}

function FakeMap() {
  const muns = demoMunicipios.slice(0, 60);
  return (
    <div className="relative aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-secondary/5 to-primary/5 overflow-hidden border border-border">
      <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full">
        <path
          d="M55 8 L48 18 L38 22 L32 32 L28 44 L34 52 L30 62 L38 72 L44 82 L52 100 L60 112 L68 105 L72 90 L76 72 L74 55 L68 40 L62 25 L55 8 Z"
          fill="var(--muted)"
          stroke="var(--border)"
          strokeWidth="0.4"
        />
        {muns.map((m, i) => {
          const x = 32 + ((i * 13) % 42);
          const y = 15 + ((i * 17) % 95);
          return (
            <circle
              key={m.codigo}
              cx={x}
              cy={y}
              r={1.6 + (m.kpi / 100) * 2}
              fill={riskColor(m.kpi)}
              opacity={0.85}
            >
              <title>{`${m.municipio} · KPI ${m.kpi}`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Datos de demostración
      </div>
    </div>
  );
}

/* ---------- KPI municipal ---------- */
function KpiSection() {
  const [sel, setSel] = useState<string>(demoMunicipios[0].codigo);
  const m = useMemo(
    () => demoMunicipios.find((x) => x.codigo === sel) ?? demoMunicipios[0],
    [sel],
  );
  const radarData = [
    { k: "Exposición climática", v: Math.min(100, (m.temperatura - 18) * 7 + 30) },
    { k: "Estrés vegetal", v: Math.round((1 - m.ndvi) * 100) },
    { k: "Inseguridad alimentaria", v: m.inseguridad_alimentaria },
    { k: "Baja conectividad", v: 100 - m.suficiencia_vias },
    { k: "Ruralidad", v: m.poblacion_rural },
    { k: "Calidad de agua (IRCA)", v: m.irca },
  ];

  const stat = [
    { l: "Temperatura media", v: `${m.temperatura} °C` },
    { l: "NDVI", v: m.ndvi.toFixed(2) },
    { l: "Inseguridad alimentaria", v: `${m.inseguridad_alimentaria}%` },
    { l: "Suficiencia de vías", v: `${m.suficiencia_vias}%` },
    { l: "Tipos de cultivos", v: m.cultivos },
    { l: "Población rural", v: `${m.poblacion_rural}%` },
    { l: "Cluster asignado", v: `#${m.cluster}` },
  ];

  return (
    <Section
      id="kpi"
      eyebrow="KPI municipal"
      title="Riesgo territorial explicable"
      subtitle="Riesgo = exposición climática + estrés vegetal + inseguridad alimentaria + baja conectividad + ruralidad + exposición productiva."
    >
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Municipio
          </label>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="mt-2 w-full px-3 py-2.5 rounded-lg border border-input bg-background font-semibold"
          >
            {demoMunicipios.map((mu) => (
              <option key={mu.codigo} value={mu.codigo}>
                {mu.municipio} — {mu.departamento}
              </option>
            ))}
          </select>

          <div className="mt-6 flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-2xl grid place-items-center font-black text-4xl text-white shadow-[var(--shadow-elegant)]"
              style={{ background: riskColor(m.kpi) }}
            >
              {m.kpi}
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Nivel de riesgo</div>
              <div className="text-2xl font-black">{riskLabel(m.kpi)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {m.municipio}, {m.departamento}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {stat.map((s) => (
              <div key={s.l} className="p-3 rounded-lg bg-muted/60">
                <div className="text-[11px] text-muted-foreground">{s.l}</div>
                <div className="font-bold">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {m.factores.map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 inline-flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" /> {f}
              </span>
            ))}
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Datos de demostración
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-4">Perfil de riesgo — {m.municipio}</div>
          <div className="h-[380px]">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="k" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--border)" />
                <Radar
                  name="Riesgo"
                  dataKey="v"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Clusters ---------- */
function ClustersSection() {
  const scatterData = demoMunicipios.map((m) => ({
    x: m.inseguridad_alimentaria,
    y: m.suficiencia_vias,
    z: m.kpi,
    cluster: m.cluster,
    name: m.municipio,
  }));
  const byCluster = (c: number) => scatterData.filter((d) => d.cluster === c);
  const colors = ["var(--chart-4)", "var(--chart-1)", "var(--chart-3)"];

  return (
    <Section
      id="clusters"
      eyebrow="Clustering territorial"
      title="Perfiles municipales diferenciados"
      subtitle="SEMILLA identifica perfiles territoriales para diseñar intervenciones a la medida de cada contexto rural."
      className="bg-muted/40"
    >
      <div className="grid lg:grid-cols-3 gap-5">
        {clusters.map((c, i) => {
          const n = demoMunicipios.filter((m) => m.cluster === c.id).length;
          const avg = Math.round(
            demoMunicipios.filter((m) => m.cluster === c.id).reduce((a, m) => a + m.kpi, 0) / n,
          );
          return (
            <div
              key={c.id}
              className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-border" style={{ background: colors[i], color: "white" }}>
                <div className="text-xs uppercase tracking-widest opacity-90">Cluster {c.id}</div>
                <div className="font-bold mt-1">{c.nombre}</div>
              </div>
              <div className="p-5 space-y-4 flex-1">
                <p className="text-sm text-muted-foreground">{c.descripcion}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/60">
                    <div className="text-[10px] text-muted-foreground uppercase">Municipios</div>
                    <div className="text-xl font-black">{n}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/60">
                    <div className="text-[10px] text-muted-foreground uppercase">KPI promedio</div>
                    <div className="text-xl font-black">{avg}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                    Variables más altas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.variables_altas.map((v) => (
                      <span key={v} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                    Variables más bajas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.variables_bajas.map((v) => (
                      <span key={v} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="text-[11px] font-semibold uppercase text-primary mb-1">
                    Recomendación
                  </div>
                  <div className="text-sm">{c.recomendacion}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-1">Mapa perceptual de municipios</div>
          <div className="text-xs text-muted-foreground mb-4">
            Inseguridad alimentaria vs. suficiencia de vías — tamaño = KPI
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Inseg. alimentaria"
                  unit="%"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Suficiencia vías"
                  unit="%"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <ZAxis type="number" dataKey="z" range={[40, 300]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend />
                {[1, 2, 3].map((c, i) => (
                  <Scatter
                    key={c}
                    name={`Cluster ${c}`}
                    data={byCluster(c)}
                    fill={colors[i].replace("var(--", "").replace(")", "")}
                  >
                    {byCluster(c).map((_, idx) => (
                      <circle key={idx} fill={colors[i]} />
                    ))}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-1">Dendrograma (placeholder)</div>
          <div className="text-xs text-muted-foreground mb-4">
            Agrupamiento jerárquico exploratorio
          </div>
          <svg viewBox="0 0 200 220" className="w-full h-[300px]">
            {(() => {
              const lines: React.ReactElement[] = [];
              const leaves = 10;
              const step = 180 / leaves;
              for (let i = 0; i < leaves; i++) {
                const x = 10 + i * step;
                lines.push(<line key={`v${i}`} x1={x} y1={200} x2={x} y2={170 - (i % 4) * 15} stroke="var(--primary)" strokeWidth="1.2" />);
              }
              lines.push(<line key="h1" x1={10} y1={170} x2={10 + step} y2={170} stroke="var(--primary)" strokeWidth="1.2" />);
              lines.push(<line key="h2" x1={10 + 2 * step} y1={155} x2={10 + 3 * step} y2={155} stroke="var(--secondary)" strokeWidth="1.2" />);
              lines.push(<line key="h3" x1={10 + 4 * step} y1={140} x2={10 + 5 * step} y2={140} stroke="var(--chart-3)" strokeWidth="1.2" />);
              lines.push(<line key="h4" x1={10 + 6 * step} y1={125} x2={10 + 7 * step} y2={125} stroke="var(--primary)" strokeWidth="1.2" />);
              lines.push(<line key="h5" x1={10 + 8 * step} y1={130} x2={10 + 9 * step} y2={130} stroke="var(--secondary)" strokeWidth="1.2" />);
              lines.push(<line key="j1" x1={10 + 0.5 * step} y1={170} x2={10 + 0.5 * step} y2={110} stroke="var(--primary)" strokeWidth="1.2" />);
              lines.push(<line key="j2" x1={10 + 2.5 * step} y1={155} x2={10 + 2.5 * step} y2={110} stroke="var(--secondary)" strokeWidth="1.2" />);
              lines.push(<line key="jh1" x1={10 + 0.5 * step} y1={110} x2={10 + 2.5 * step} y2={110} stroke="var(--primary)" strokeWidth="1.2" />);
              lines.push(<line key="j3" x1={10 + 4.5 * step} y1={140} x2={10 + 4.5 * step} y2={95} stroke="var(--chart-3)" strokeWidth="1.2" />);
              lines.push(<line key="j4" x1={10 + 6.5 * step} y1={125} x2={10 + 6.5 * step} y2={95} stroke="var(--chart-3)" strokeWidth="1.2" />);
              lines.push(<line key="jh2" x1={10 + 4.5 * step} y1={95} x2={10 + 6.5 * step} y2={95} stroke="var(--chart-3)" strokeWidth="1.2" />);
              lines.push(<line key="j5" x1={10 + 8.5 * step} y1={130} x2={10 + 8.5 * step} y2={80} stroke="var(--secondary)" strokeWidth="1.2" />);
              lines.push(<line key="top1" x1={10 + 1.5 * step} y1={110} x2={10 + 1.5 * step} y2={50} stroke="var(--primary)" strokeWidth="1.5" />);
              lines.push(<line key="top2" x1={10 + 5.5 * step} y1={95} x2={10 + 5.5 * step} y2={50} stroke="var(--chart-3)" strokeWidth="1.5" />);
              lines.push(<line key="topH" x1={10 + 1.5 * step} y1={50} x2={10 + 5.5 * step} y2={50} stroke="var(--foreground)" strokeWidth="1.5" />);
              return lines;
            })()}
          </svg>
        </div>
      </div>
    </Section>
  );
}

/* ---------- IA ---------- */
function IASection() {
  const cards = [
    { icon: Network, t: "Modelamiento espacio-temporal", d: "Identifica relaciones entre clima, vegetación y vulnerabilidad territorial." },
    { icon: Brain, t: "Clustering no supervisado", d: "Agrupa municipios con patrones similares para diseñar intervenciones diferenciadas." },
    { icon: Satellite, t: "Análisis satelital", d: "NDVI de Sentinel-2 como señal de vigor vegetal y estrés territorial." },
    { icon: ShieldCheck, t: "Interpretabilidad", d: "Explica qué variables aportan más al riesgo municipal." },
  ];
  const validacion = [
    "Homologación territorial mediante códigos municipales.",
    "Normalización de variables.",
    "Validación de coherencia entre fuentes.",
    "Comparación de perfiles municipales.",
    "Revisión de resultados por clusters.",
    "Posibilidad de actualización periódica.",
  ];
  return (
    <Section
      id="ia"
      eyebrow="IA y análisis"
      title="IA para anticipar, explicar y priorizar"
      subtitle="IA explicable para fortalecer la seguridad alimentaria y guiar decisiones públicas."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.t} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition">
            <div className="w-10 h-10 rounded-lg grid place-items-center bg-secondary text-secondary-foreground mb-3">
              <c.icon className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm">{c.t}</div>
            <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{c.d}</div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 p-6 sm:p-8 rounded-2xl text-primary-foreground text-lg sm:text-xl font-medium"
        style={{ background: "var(--gradient-hero)" }}
      >
        "La IA no reemplaza la decisión pública. La organiza, la anticipa y la hace más
        transparente."
      </div>

      <div className="mt-8 p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <div className="font-bold">Validación y trazabilidad</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {validacion.map((v) => (
            <div key={v} className="p-3 rounded-lg bg-muted/60 text-sm flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              {v}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- Impacto ---------- */
function Impacto() {
  const cards = [
    { icon: Sparkles, t: "Innovación y creatividad", d: "Integra agricultura, clima, satélite, salud, vías e inseguridad alimentaria en una sola lectura territorial." },
    { icon: Database, t: "Uso de datos abiertos", d: "Aprovecha fuentes públicas nacionales e internacionales, integradas a escala municipal." },
    { icon: ShieldCheck, t: "Rigor técnico", d: "Combina limpieza de datos, análisis espacial, tendencias, KPI y clustering." },
    { icon: Brain, t: "IA y tecnologías emergentes", d: "Análisis predictivo, aprendizaje no supervisado, teledetección y modelos espacio-temporales." },
    { icon: HeartPulse, t: "Impacto social y rural", d: "Apoya decisiones sobre asistencia técnica, seguridad alimentaria, infraestructura rural y adaptación climática." },
    { icon: Target, t: "Usabilidad", d: "Presenta resultados en mapas, rankings y fichas municipales fáciles de interpretar." },
  ];
  return (
    <Section
      id="impacto"
      eyebrow="Impacto y escalabilidad"
      title="Diseñado con los criterios del concurso en mente"
      className="bg-muted/40"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.t} className="p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition">
            <div className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground mb-4" style={{ background: "var(--gradient-primary)" }}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="font-bold">{c.t}</div>
            <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.d}</div>
          </div>
        ))}
      </div>
      <blockquote className="mt-10 p-6 sm:p-8 rounded-2xl border-l-4 border-accent bg-card text-lg sm:text-xl font-medium">
        "SEMILLA permite pasar de una reacción tardía a una gestión anticipada del riesgo
        agroclimático y alimentario."
      </blockquote>
    </Section>
  );
}

/* ---------- Casos de uso ---------- */
function CasosDeUso() {
  const casos = [
    { t: "Ministerio de Agricultura / UPRA", d: "Priorización de asistencia técnica y adaptación climática.", icon: Sprout },
    { t: "Gobernaciones y alcaldías", d: "Identificación de municipios con riesgo alto y necesidades diferenciadas.", icon: MapPin },
    { t: "Sector social y salud pública", d: "Anticipación de territorios donde el deterioro climático puede afectar la seguridad alimentaria y la nutrición.", icon: HeartPulse },
  ];
  return (
    <Section id="casos" eyebrow="Casos de uso" title="Hecho para quien toma decisiones">
      <div className="grid md:grid-cols-3 gap-5">
        {casos.map((c) => (
          <div key={c.t} className="p-6 rounded-2xl border border-border bg-card">
            <c.icon className="w-8 h-8 text-primary mb-3" />
            <div className="font-bold">{c.t}</div>
            <div className="mt-2 text-sm text-muted-foreground">{c.d}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Demo ---------- */
function Demo() {
  const [dep, setDep] = useState("Todos");
  const [nivel, setNivel] = useState("Todos");
  const [cluster, setCluster] = useState("Todos");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Municipio[]>(demoMunicipios);

  const departments = useMemo(
    () => ["Todos", ...Array.from(new Set(demoMunicipios.map((m) => m.departamento))).sort()],
    [],
  );

  const filtered = rows.filter((m) => {
    if (dep !== "Todos" && m.departamento !== dep) return false;
    if (nivel !== "Todos" && riskLabel(m.kpi) !== nivel) return false;
    if (cluster !== "Todos" && String(m.cluster) !== cluster) return false;
    if (query && !m.municipio.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const summary = [1, 2, 3].map((c) => ({
    cluster: `C${c}`,
    municipios: filtered.filter((m) => m.cluster === c).length,
    kpi: Math.round(
      filtered.filter((m) => m.cluster === c).reduce((a, m) => a + m.kpi, 0) /
        Math.max(1, filtered.filter((m) => m.cluster === c).length),
    ),
  }));

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    alert(
      `Archivo "${f.name}" recibido. En esta versión demo se conservan los datos de ejemplo. La conexión a datos reales quedará habilitada en la siguiente iteración.`,
    );
  }

  function downloadCsv() {
    const headers = [
      "codigo", "municipio", "departamento", "inseguridad_alimentaria", "irca",
      "suficiencia_vias", "cultivos", "temperatura", "ndvi", "poblacion_rural", "kpi", "cluster",
    ];
    const csv =
      headers.join(",") +
      "\n" +
      filtered
        .map((m) =>
          [m.codigo, m.municipio, m.departamento, m.inseguridad_alimentaria, m.irca, m.suficiencia_vias, m.cultivos, m.temperatura, m.ndvi, m.poblacion_rural, m.kpi, m.cluster].join(","),
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "semilla_resultados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Section
      id="demo"
      eyebrow="Demo interactiva"
      title="Explora, filtra y descarga"
      subtitle="Carga un CSV o Excel con resultados municipales, o usa los datos de demostración cargados por defecto."
    >
      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-4">
          <label className="block p-5 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary text-primary-foreground">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Cargar CSV / Excel</div>
                <div className="text-xs text-muted-foreground">Datos municipales</div>
              </div>
            </div>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUpload} />
          </label>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <div className="font-bold text-sm">Filtros</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar municipio…"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <select value={dep} onChange={(e) => setDep(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {["Todos", "Alto", "Medio", "Bajo"].map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={cluster} onChange={(e) => setCluster(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {["Todos", "1", "2", "3"].map((d) => <option key={d}>{d === "Todos" ? "Todos los clusters" : `Cluster ${d}`}</option>)}
            </select>
            <button
              onClick={downloadCsv}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition"
            >
              <Download className="w-4 h-4" /> Descargar resultados
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <div className="font-bold text-sm mb-3">Resumen por cluster</div>
            <div className="h-[180px]">
              <ResponsiveContainer>
                <BarChart data={summary}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="cluster" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="municipios" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="kpi" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="font-bold text-sm">Tabla de datos municipales</div>
            <div className="text-xs text-muted-foreground">{filtered.length} municipios</div>
          </div>
          <div className="overflow-x-auto max-h-[560px]">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr className="text-muted-foreground">
                  {["Cód.", "Municipio", "Depto.", "Inseg. alim.", "IRCA", "Vías", "Cultivos", "Temp.", "NDVI", "Rural", "KPI", "Cluster"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.codigo} className="border-t border-border hover:bg-muted/40">
                    <td className="px-3 py-2 font-mono text-muted-foreground">{m.codigo}</td>
                    <td className="px-3 py-2 font-semibold">{m.municipio}</td>
                    <td className="px-3 py-2">{m.departamento}</td>
                    <td className="px-3 py-2">{m.inseguridad_alimentaria}%</td>
                    <td className="px-3 py-2">{m.irca}</td>
                    <td className="px-3 py-2">{m.suficiencia_vias}%</td>
                    <td className="px-3 py-2">{m.cultivos}</td>
                    <td className="px-3 py-2">{m.temperatura}°</td>
                    <td className="px-3 py-2">{m.ndvi}</td>
                    <td className="px-3 py-2">{m.poblacion_rural}%</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded font-bold text-white" style={{ background: riskColor(m.kpi) }}>
                        {m.kpi}
                      </span>
                    </td>
                    <td className="px-3 py-2">C{m.cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border">
            Datos de demostración
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Cierre ---------- */
function Cierre() {
  return (
    <section id="cierre" className="py-24 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-4xl mx-auto text-center px-4">
        <Leaf className="w-12 h-12 mx-auto opacity-80" />
        <h2 className="mt-6 text-3xl sm:text-5xl font-black tracking-tight">
          SEMILLA convierte datos abiertos en decisiones anticipadas para la resiliencia rural.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold shadow-lg hover:brightness-105 transition">
            <Download className="w-4 h-4" /> Descargar resumen metodológico
          </button>
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition">
            <Github className="w-4 h-4" /> Ver repositorio
          </a>
          <a href="#contacto" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition">
            <Mail className="w-4 h-4" /> Contactar equipo
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer id="contacto" className="bg-secondary text-secondary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <div className="font-black">SEMILLA</div>
              <div className="text-[10px] uppercase tracking-widest opacity-70">Inteligencia territorial</div>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-80">
            Sistema de Inteligencia Territorial para Riesgo Agroclimático y Seguridad Alimentaria.
          </p>
        </div>
        <div>
          <div className="font-bold text-sm mb-3">Equipo</div>
          <ul className="space-y-1 text-sm opacity-80">
            <li>Concurso de Datos Abiertos — Colombia</li>
            <li>Reto: Agricultura y Desarrollo Rural</li>
            <li>Contacto: equipo@semilla.co</li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-sm mb-3">Recursos</div>
          <ul className="space-y-1 text-sm opacity-80">
            <li><a href="#metodologia" className="hover:underline">Metodología</a></li>
            <li><a href="#datos" className="hover:underline">Fuentes de datos</a></li>
            <li><a href="#demo" className="hover:underline">Demo interactiva</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 text-xs opacity-70 flex flex-wrap justify-between gap-2">
        <div>© {new Date().getFullYear()} SEMILLA · Datos abiertos para anticipar riesgos rurales.</div>
        <div>Construido con datos públicos · UPRA · DANE · IGAC · MinSalud · Sentinel-2 · OSM</div>
      </div>
    </footer>
  );
}
