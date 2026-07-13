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
  Download,
  Github,
  Mail,
  ArrowRight,
  AlertTriangle,
  Activity,
  Network,
  ExternalLink,
  Wheat,
  Thermometer,
  Droplets,
  Scale,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { municipios, departamentos, perfilRiesgo, type Municipio } from "@/data/municipios";
import { fuentes } from "@/data/demoData";
import heroImg from "@/images/Imagen_inicial.png";
import mapaImg from "@/images/Mapa.png";
import perceptualImg from "@/images/mapa_perceptual.png";
import dendroImg from "@/images/Dendrograma.png";

export const Route = createFileRoute("/")({ component: Index });

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "";

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
  ["demo", "Consulta"],
  ["contacto", "Contacto"],
] as const;

function quintileColor(q: string) {
  switch (q) {
    case "Muy Alto":
      return "var(--chart-4)";
    case "Alto":
      return "var(--chart-3)";
    case "Medio":
      return "var(--chart-5)";
    case "Bajo":
      return "var(--chart-1)";
    case "Muy Bajo":
      return "var(--primary)";
    default:
      return "var(--chart-2)";
  }
}

function pct(v: number, digits = 1) {
  return `${(v * 100).toFixed(digits)}%`;
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
      <ConsultaSection />
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
        {DASHBOARD_URL && (
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            Tablero <ExternalLink className="w-4 h-4" />
          </a>
        )}
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
          <circle cx="400" cy="300" r="220" fill="url(#g1)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
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
            para priorizar los 1.122 municipios de Colombia, anticipar riesgos climáticos y
            fortalecer la seguridad alimentaria.
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

        <div className="relative">
          <div
            className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-40"
            style={{ background: "var(--chart-1)" }}
          />
          <img
            src={heroImg}
            alt="Ilustración SEMILLA — inteligencia territorial rural"
            className="relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl border border-white/20 object-cover"
            loading="eager"
          />
        </div>
      </div>
    </section>
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

  const variables = [
    {
      emoji: "🌿",
      icon: Leaf,
      short: "Indicador de resiliencia ecológica",
      title: "Cobertura vegetal (NDVI)",
      body: "El NDVI permite aproximar el estado de la cobertura vegetal y el vigor de los ecosistemas productivos. Una baja cobertura puede reflejar mayor vulnerabilidad a erosión, pérdida de productividad del suelo, inundaciones, sequías y deslizamientos, afectando la producción agropecuaria y agravando el riesgo de crisis alimentarias tras eventos climáticos extremos.",
    },
    {
      emoji: "🛣️",
      icon: RouteIcon,
      short: "Indicador de conectividad y acceso",
      title: "Suficiencia vial",
      body: "La suficiencia vial representa la capacidad de un territorio para acceder a mercados, servicios de salud, programas sociales y cadenas de abastecimiento. En emergencias, una baja suficiencia dificulta la llegada de ayuda humanitaria, atención nutricional y alimentos, elevando el riesgo de deterioro nutricional en poblaciones vulnerables.",
    },
    {
      emoji: "🍽️",
      icon: HeartPulse,
      short: "Predictor directo del riesgo nutricional",
      title: "Inseguridad alimentaria",
      body: "Los municipios con altos niveles de inseguridad alimentaria moderada o grave tienen hogares con menor capacidad para enfrentar choques climáticos, especialmente cuando existen barreras en el acceso físico y económico a alimentos suficientes, variados y nutritivos.",
    },
    {
      emoji: "👨‍🌾",
      icon: Users,
      short: "Factor de exposición y brecha estructural",
      title: "Población rural",
      body: "Las poblaciones rurales dependen en mayor medida de actividades agropecuarias sensibles al clima y suelen enfrentar mayores barreras de acceso a infraestructura, salud y protección social. Una alta proporción de ruralidad puede amplificar el impacto de eventos climáticos sobre la seguridad alimentaria local.",
    },
    {
      emoji: "🌾",
      icon: Wheat,
      short: "Indicador de capacidad de abastecimiento",
      title: "Diversidad productiva agrícola",
      body: "Una menor diversidad de cultivos o la concentración en pocos grupos alimentarios aumenta la vulnerabilidad ante pérdidas por fenómenos climáticos. Esta dimensión permite observar la capacidad territorial de sostener sistemas agroalimentarios más diversos y resilientes.",
    },
    {
      emoji: "🌡️",
      icon: Thermometer,
      short: "Variable climática crítica",
      title: "Temperatura",
      body: "La temperatura influye directamente en la productividad agrícola, la disponibilidad hídrica y la ocurrencia de eventos extremos. Aumentos sostenidos pueden reducir rendimientos, afectar cultivos estratégicos y generar estrés hídrico que impacta los medios de vida rurales.",
    },
    {
      emoji: "📊",
      icon: Scale,
      short: "Medida relativa de cobertura vegetal",
      title: "Z-score NDVI",
      body: "Mide qué tan verde se encuentra un municipio en comparación con sus vecinos. Valores altos indican un desempeño ecológico relativo mejor que el entorno; valores bajos sugieren degradación o menor cobertura vegetal respecto al vecindario. Permite identificar territorios que, aunque no parezcan críticos en valor absoluto, están significativamente peor que su entorno inmediato.",
    },
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

      {/* Variables clave */}
      <div className="mt-16">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
          Marco conceptual
        </div>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
          Variables clave para entender el riesgo territorial
        </h3>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Siete dimensiones se combinan para explicar dónde y por qué un territorio puede transitar
          de un choque climático a una crisis alimentaria.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {variables.map((v) => (
            <div
              key={v.title}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[var(--shadow-card)] transition"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl leading-none">{v.emoji}</div>
                <div className="w-10 h-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                  <v.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-primary">
                {v.short}
              </div>
              <h4 className="mt-1 text-lg font-bold">{v.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
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
  const total = municipios.length;
  const kpis = [
    { v: total.toLocaleString("es-CO"), l: "Municipios analizados", icon: MapPin },
    { v: "7", l: "Familias de variables integradas", icon: Layers },
    { v: "Municipal", l: "Escala de análisis", icon: Target },
    { v: "KPI + Clusters", l: "Productos principales", icon: BarChart3 },
  ];
  const top = [...municipios].sort((a, b) => b.kpi - a.kpi).slice(0, 15);

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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="font-bold">Mapa de riesgo municipal</div>
              <div className="text-xs text-muted-foreground">Colombia · KPI municipal</div>
            </div>
            <Legend2 />
          </div>
          <img
            src={mapaImg}
            alt="Mapa de Colombia con priorización municipal por KPI"
            className="w-full h-auto rounded-xl border border-border shadow-[var(--shadow-card)] object-contain bg-background"
            loading="lazy"
          />
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="font-bold">Ranking de priorización</div>
            <div className="text-xs text-muted-foreground">Top 15 municipios por KPI</div>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-border">
            {top.map((m, i) => (
              <div key={m.codigo} className="p-4 flex items-center gap-3 hover:bg-muted/40">
                <div className="text-xs font-black w-6 text-muted-foreground">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{m.municipio}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.departamento} · Cluster {m.cluster}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="px-2 py-1 rounded font-black text-sm text-white"
                    style={{ background: quintileColor(m.kpi_quintile) }}
                  >
                    {m.kpi.toFixed(2)}
                  </div>
                  <div className="text-[10px] uppercase mt-0.5 text-muted-foreground">
                    {m.kpi_quintile}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-card)] relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl grid place-items-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Uso del índice
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Mediante la focalización de los territorios que presentan la combinación más crítica
              de estos factores, las entidades responsables podrán implementar acciones preventivas
              dirigidas a fortalecer la seguridad alimentaria y nutricional, mejorar la
              preparación ante emergencias, optimizar la asignación de recursos públicos y reducir
              el riesgo de deterioro nutricional en la población más vulnerable. De esta forma, el
              índice se convierte en un instrumento de gestión prospectiva que contribuye a la
              garantía progresiva del Derecho Humano a la Alimentación Adecuada y al
              fortalecimiento de la resiliencia de los sistemas agroalimentarios territoriales
              frente a los desafíos derivados de la variabilidad y el cambio climático.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Legend2() {
  const items: [string, string][] = [
    ["Muy Alto", "var(--chart-4)"],
    ["Alto", "var(--chart-3)"],
    ["Medio", "var(--chart-5)"],
    ["Bajo", "var(--chart-1)"],
    ["Muy Bajo", "var(--primary)"],
  ];
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {items.map(([l, c]) => (
        <div key={l} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: c }} />
          {l}
        </div>
      ))}
    </div>
  );
}

/* ---------- KPI municipal ---------- */
function KpiSection() {
  const [dep, setDep] = useState<string>(departamentos[0] ?? "");
  const munsDep = useMemo(
    () =>
      municipios
        .filter((m) => m.departamento === dep)
        .sort((a, b) => a.municipio.localeCompare(b.municipio, "es")),
    [dep],
  );
  const [sel, setSel] = useState<string>(munsDep[0]?.codigo ?? "");
  const m =
    munsDep.find((x) => x.codigo === sel) ?? munsDep[0] ?? municipios[0];

  // reset selección al cambiar depto
  const currentSelValid = munsDep.some((x) => x.codigo === sel);
  const effectiveSel = currentSelValid ? sel : munsDep[0]?.codigo ?? "";

  const activeMun =
    municipios.find((x) => x.codigo === effectiveSel) ?? m;

  const radarData = useMemo(() => perfilRiesgo(activeMun), [activeMun]);

  const stat = [
    { l: "Departamento", v: activeMun.departamento },
    { l: "Municipio", v: activeMun.municipio },
    { l: "KPI", v: activeMun.kpi.toFixed(3) },
    { l: "Quintil KPI", v: activeMun.kpi_quintile || "—" },
    { l: "Cluster", v: `#${activeMun.cluster}` },
    { l: "Inseguridad alimentaria", v: pct(activeMun.inseguridad) },
    { l: "IRCA", v: activeMun.irca.toFixed(2) },
    { l: "Suficiencia de vías", v: activeMun.suficiencia_vias.toFixed(2) },
    { l: "Temperatura media", v: `${activeMun.temperatura.toFixed(1)} °C` },
    { l: "NDVI", v: activeMun.ndvi.toFixed(3) },
    { l: "Z-score NDVI (vs. vecinos)", v: activeMun.zscore_ndvi.toFixed(2) },
    { l: "Población rural", v: pct(activeMun.poblacion_rural) },
    { l: "Tipos de cultivos", v: activeMun.cultivos },
  ];

  return (
    <Section
      id="kpi"
      eyebrow="KPI municipal"
      title="Riesgo territorial explicable"
      subtitle="Perfil comparativo estandarizado 0-100 donde valores altos representan mayor riesgo. Suficiencia vial y NDVI se invierten para reflejar que valores bajos aumentan la vulnerabilidad."
    >
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Departamento
              </label>
              <select
                value={dep}
                onChange={(e) => {
                  setDep(e.target.value);
                  setSel("");
                }}
                className="mt-2 w-full px-3 py-2.5 rounded-lg border border-input bg-background font-semibold"
              >
                {departamentos.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Municipio
              </label>
              <select
                value={effectiveSel}
                onChange={(e) => setSel(e.target.value)}
                className="mt-2 w-full px-3 py-2.5 rounded-lg border border-input bg-background font-semibold"
              >
                {munsDep.map((mu) => (
                  <option key={mu.codigo} value={mu.codigo}>
                    {mu.municipio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-2xl grid place-items-center font-black text-3xl text-white shadow-[var(--shadow-elegant)]"
              style={{ background: quintileColor(activeMun.kpi_quintile) }}
            >
              {activeMun.kpi.toFixed(2)}
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Nivel de riesgo</div>
              <div className="text-2xl font-black">{activeMun.kpi_quintile || "—"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeMun.municipio}, {activeMun.departamento}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {stat.map((s) => (
              <div key={s.l} className="p-3 rounded-lg bg-muted/60">
                <div className="text-[11px] text-muted-foreground">{s.l}</div>
                <div className="font-bold truncate">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5" />
            Valores comparados frente a los 1.122 municipios del país.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-1">Perfil de riesgo — {activeMun.municipio}</div>
          <div className="text-xs text-muted-foreground mb-4">
            Escala 0-100. Alto = mayor riesgo.
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="k"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  stroke="var(--border)"
                />
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

          <div className="mt-4 h-[220px]">
            <ResponsiveContainer>
              <BarChart data={radarData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="k"
                  width={160}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Clusters ---------- */
function ClustersSection() {
  const segments = [
    {
      accent: "#2563eb",
      accentSoft: "color-mix(in oklab, #2563eb 10%, var(--card))",
      badge: "🟦",
      tono: "Referente estructural",
      titulo:
        "Municipios de clima templado, bien conectados y con baja inseguridad alimentaria",
      rows: [
        ["🏷️ Clima", "Templado (17.6°C)"],
        ["🍽️ Inseguridad alimentaria grave", "20% (la más baja)"],
        ["💧 IRCA (riesgo del agua)", "7.5 (riesgo bajo-medio)"],
        ["🛣️ Suficiencia de vías", "19.4 (la más alta)"],
        ["🌾 Diversidad de cultivos", "5.3 (intermedia)"],
        ["👨‍🌾 Población rural", "44% (baja-media)"],
        ["🌿 NDVI", "0.69"],
        ["📊 Z-score NDVI", "1.28 (el más alto → verdor muy superior al vecindario)"],
        ["📊 KPI (prioridad)", "2.24 (la más baja)"],
        ["🏘️ Municipios", "354 (grupo más grande)"],
      ],
      perfil:
        "Municipios de clima templado, con la mejor conectividad vial, baja inseguridad alimentaria y un verdor relativo destacado frente a sus vecinos. Son territorios con buenas condiciones estructurales.",
      accion:
        "Mantener y proteger la cobertura vegetal, fortalecer mercados locales y usar este clúster como referente de buenas prácticas.",
    },
    {
      accent: "#dc2626",
      accentSoft: "color-mix(in oklab, #dc2626 10%, var(--card))",
      badge: "🟥",
      tono: "Vulnerabilidad crítica",
      titulo:
        "Municipios cálidos, con alta ruralidad y muy alta inseguridad alimentaria",
      rows: [
        ["🏷️ Clima", "Cálido (23.7°C)"],
        ["🍽️ Inseguridad alimentaria grave", "40% (la más alta)"],
        ["💧 IRCA (riesgo del agua)", "5.6 (el más bajo)"],
        ["🛣️ Suficiencia de vías", "9.9 (la más baja)"],
        ["🌾 Diversidad de cultivos", "4.0 (la más baja)"],
        ["👨‍🌾 Población rural", "69% (alta)"],
        ["🌿 NDVI", "0.71"],
        ["📊 Z-score NDVI", "0.81 (verdor ligeramente superior al vecindario)"],
        ["📊 KPI (prioridad)", "2.70 (muy alta)"],
        ["🏘️ Municipios", "207"],
      ],
      perfil:
        "Municipios cálidos, con alta dependencia rural, muy baja diversificación agrícola y la peor conectividad vial. Aunque el agua es de menor riesgo, la inseguridad alimentaria es crítica. El verdor es bueno pero no excepcional frente a su entorno.",
      accion:
        "Intervención urgente en seguridad alimentaria, diversificación productiva e infraestructura vial. Es el clúster con mayor vulnerabilidad social y logística.",
    },
    {
      accent: "#7c3aed",
      accentSoft: "color-mix(in oklab, #7c3aed 10%, var(--card))",
      badge: "🟪",
      tono: "Riesgo hídrico crítico",
      titulo:
        "Municipios de clima templado, con alta ruralidad y agua de muy alto riesgo",
      rows: [
        ["🏷️ Clima", "Templado (17.6°C)"],
        ["🍽️ Inseguridad alimentaria grave", "26% (media-baja)"],
        ["💧 IRCA (riesgo del agua)", "15.3 (el más alto → riesgo muy elevado)"],
        ["🛣️ Suficiencia de vías", "16.5 (alta)"],
        ["🌾 Diversidad de cultivos", "5.9 (la más alta)"],
        ["👨‍🌾 Población rural", "70% (la más alta)"],
        ["🌿 NDVI", "0.71"],
        ["📊 Z-score NDVI", "0.82 (verdor ligeramente superior al vecindario)"],
        ["📊 KPI (prioridad)", "2.70 (muy alta, igual al Clúster 2)"],
        ["🏘️ Municipios", "287"],
      ],
      perfil:
        "Municipios de clima templado, con la mayor ruralidad y la mayor diversidad de cultivos, pero con un IRCA extremadamente alto (el agua es un riesgo serio para la salud). Tienen buena conectividad y vegetación, pero el problema hídrico es crítico.",
      accion:
        "Intervención inmediata en calidad del agua (tratamiento, monitoreo, infraestructura hídrica). Aprovechar la diversidad agrícola para planes de seguridad alimentaria con enfoque de riesgos sanitarios.",
    },
    {
      accent: "#16a34a",
      accentSoft: "color-mix(in oklab, #16a34a 10%, var(--card))",
      badge: "🟩",
      tono: "Degradación ecológica",
      titulo:
        "Municipios cálidos, urbanizados, con baja cobertura vegetal relativa",
      rows: [
        ["🏷️ Clima", "Cálido (24.0°C)"],
        ["🍽️ Inseguridad alimentaria grave", "35% (alta)"],
        ["💧 IRCA (riesgo del agua)", "9.4 (riesgo medio)"],
        ["🛣️ Suficiencia de vías", "11.0 (baja)"],
        ["🌾 Diversidad de cultivos", "5.8 (alta)"],
        ["👨‍🌾 Población rural", "42% (la más baja)"],
        ["🌿 NDVI", "0.64 (el más bajo)"],
        ["📊 Z-score NDVI", "0.43 (el más bajo → verdor inferior al vecindario)"],
        ["📊 KPI (prioridad)", "2.56 (media-alta)"],
        ["🏘️ Municipios", "273"],
      ],
      perfil:
        "Municipios cálidos, con baja población rural (mayor componente urbano), alta diversidad de cultivos pero baja conectividad vial. Su principal rasgo diferencial es el NDVI más bajo y un Z-score muy bajo, lo que indica que estos municipios están significativamente más degradados o deforestados que su entorno.",
      accion:
        "Restauración ecológica y manejo sostenible del suelo (reforestación, control de erosión, agricultura regenerativa). Además, mejorar la conectividad vial y atender la inseguridad alimentaria alta.",
    },
  ];

  return (
    <Section
      id="clusters"
      eyebrow="Clustering territorial"
      title="Cuatro clústeres municipales diferenciados"
      subtitle="El clustering territorial identifica cuatro grupos de municipios con combinaciones diferenciadas de clima, conectividad, seguridad alimentaria, calidad del agua, ruralidad y cobertura vegetal relativa. Esta segmentación permite orientar intervenciones públicas más precisas según el perfil de riesgo predominante."
      className="bg-muted/40"
    >
      <div className="grid md:grid-cols-2 gap-5">
        {segments.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col shadow-[var(--shadow-card)]"
          >
            <div
              className="px-5 py-4 border-b border-border"
              style={{ background: s.accentSoft }}
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.accent }}
                />
                <span>{s.badge} Clúster {i + 1} · {s.tono}</span>
              </div>
              <div className="mt-2 font-bold text-base leading-snug">{s.titulo}</div>
            </div>
            <div className="p-5 space-y-3 flex-1">
              <ul className="space-y-2 text-sm">
                {s.rows.map(([label, value]) => (
                  <li key={label} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-right">{value}</span>
                  </li>
                ))}
              </ul>
              <div className="p-3 rounded-lg text-sm bg-muted/50">
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">
                  Perfil
                </div>
                {s.perfil}
              </div>
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: s.accentSoft,
                  borderLeft: `3px solid ${s.accent}`,
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1">
                  Acción prioritaria
                </div>
                {s.accion}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-1">Mapa perceptual</div>
          <div className="text-xs text-muted-foreground mb-4">
            Proyección de los cuatro clústeres municipales
          </div>
          <img
            src={perceptualImg}
            alt="Mapa perceptual de municipios por clusters"
            className="w-full h-auto rounded-xl border border-border shadow-[var(--shadow-card)] object-contain bg-background"
            loading="lazy"
          />
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="font-bold mb-1">Dendrograma</div>
          <div className="text-xs text-muted-foreground mb-4">
            Agrupamiento jerárquico exploratorio con corte en cuatro clústeres
          </div>
          <img
            src={dendroImg}
            alt="Dendrograma del agrupamiento jerárquico de municipios"
            className="w-full h-auto rounded-xl border border-border shadow-[var(--shadow-card)] object-contain bg-background"
            loading="lazy"
          />
        </div>
      </div>
    </Section>
  );
}

/* ---------- IA ---------- */
function IASection() {
  const modelos = [
    {
      icon: Network,
      tag: "Modelo espacio-temporal profundo",
      t: "ST-GNN",
      d: "Detecta tendencias, no solo números. Permite aprender patrones espacio-temporales entre municipios y señales de vegetación.",
    },
    {
      icon: Activity,
      tag: "Modelo econométrico espacial",
      t: "S2SLS",
      d: "Incorpora rezagos temporales y espaciales para capturar inercia y contagio entre municipios vecinos. Permite analizar cómo los choques climáticos y territoriales pueden propagarse o mantenerse en el tiempo.",
    },
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
      <div className="grid md:grid-cols-2 gap-5">
        {modelos.map((m) => (
          <div
            key={m.t}
            className="p-7 rounded-2xl border border-border bg-card hover:border-primary/40 transition shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <m.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  {m.tag}
                </div>
                <div className="text-2xl font-black tracking-tight">{m.t}</div>
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {m.d}
            </p>
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
    <Section id="casos" eyebrow="Casos de uso" title="Hecho para quien toma decisiones" className="bg-muted/40">
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

/* ---------- Consulta ---------- */
function ConsultaSection() {
  const [dep, setDep] = useState("Todos");
  const [nivel, setNivel] = useState("Todos");
  const [cluster, setCluster] = useState("Todos");
  const [query, setQuery] = useState("");

  const deps = useMemo(() => ["Todos", ...departamentos], []);
  const clustersList = useMemo(
    () => Array.from(new Set(municipios.map((m) => m.cluster))).sort(),
    [],
  );

  const filtered = useMemo(
    () =>
      municipios.filter((m) => {
        if (dep !== "Todos" && m.departamento !== dep) return false;
        if (nivel !== "Todos" && m.kpi_quintile !== nivel) return false;
        if (cluster !== "Todos" && String(m.cluster) !== cluster) return false;
        if (query && !m.municipio.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [dep, nivel, cluster, query],
  );

  const summary = clustersList.map((c) => {
    const items = filtered.filter((m) => m.cluster === c);
    return {
      cluster: `C${c}`,
      municipios: items.length,
      kpi_x100: items.length ? +(items.reduce((a, m) => a + m.kpi, 0) / items.length * 100).toFixed(1) : 0,
    };
  });

  function downloadCsv() {
    const headers = [
      "MpCodigo","Divipola","Departamento","Municipio",
      "Inseguridad","IRCA","Suficiencia_vias","Cultivos",
      "Temperatura","NDVI","Poblacion_rural","KPI","KPI_Quintile","Cluster",
    ];
    const csv = [
      headers.join(","),
      ...filtered.map((m) => [
        m.codigo, m.divipola, m.departamento, `"${m.municipio}"`,
        m.inseguridad, m.irca, m.suficiencia_vias, m.cultivos,
        m.temperatura, m.ndvi, m.poblacion_rural, m.kpi, m.kpi_quintile, m.cluster,
      ].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "semilla_resultados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const rowsView = filtered.slice(0, 300);

  return (
    <Section
      id="demo"
      eyebrow="Consulta pública"
      title="Explora los resultados municipales"
      subtitle="Filtra los 1.122 municipios por departamento, nivel de riesgo o cluster; descarga los resultados o abre el tablero completo."
    >
      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <div className="font-bold text-sm">Filtros</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar municipio…"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <select value={dep} onChange={(e) => setDep(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {deps.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {["Todos", "Muy Alto", "Alto", "Medio", "Bajo", "Muy Bajo"].map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={cluster} onChange={(e) => setCluster(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="Todos">Todos los clusters</option>
              {clustersList.map((c) => (
                <option key={c} value={String(c)}>Cluster {c}</option>
              ))}
            </select>
            <button
              onClick={downloadCsv}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition"
            >
              <Download className="w-4 h-4" /> Descargar resultados
            </button>
            {DASHBOARD_URL && (
              <a
                href={DASHBOARD_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/40 text-primary font-semibold hover:bg-primary/5 transition"
              >
                <ExternalLink className="w-4 h-4" /> Abrir tablero
              </a>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border">
            <div className="font-bold text-sm mb-3">Resumen por cluster</div>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={summary}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="cluster" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="municipios" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="kpi_x100" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              kpi_x100 = KPI promedio × 100 para escalar junto al conteo.
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="font-bold text-sm">Tabla de datos municipales</div>
            <div className="text-xs text-muted-foreground">
              {filtered.length.toLocaleString("es-CO")} municipios
              {filtered.length > rowsView.length && ` · mostrando ${rowsView.length}`}
            </div>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr className="text-muted-foreground">
                  {["Cód.", "Municipio", "Depto.", "Inseg.", "IRCA", "Vías", "Cult.", "Temp.", "NDVI", "Rural", "KPI", "Quintil", "Cl."].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowsView.map((m) => (
                  <tr key={m.codigo} className="border-t border-border hover:bg-muted/40">
                    <td className="px-3 py-2 font-mono text-muted-foreground">{m.codigo}</td>
                    <td className="px-3 py-2 font-semibold">{m.municipio}</td>
                    <td className="px-3 py-2">{m.departamento}</td>
                    <td className="px-3 py-2">{pct(m.inseguridad, 0)}</td>
                    <td className="px-3 py-2">{m.irca.toFixed(1)}</td>
                    <td className="px-3 py-2">{m.suficiencia_vias.toFixed(1)}</td>
                    <td className="px-3 py-2">{m.cultivos}</td>
                    <td className="px-3 py-2">{m.temperatura.toFixed(1)}°</td>
                    <td className="px-3 py-2">{m.ndvi.toFixed(2)}</td>
                    <td className="px-3 py-2">{pct(m.poblacion_rural, 0)}</td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 rounded font-bold text-white"
                        style={{ background: quintileColor(m.kpi_quintile) }}
                      >
                        {m.kpi.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{m.kpi_quintile}</td>
                    <td className="px-3 py-2">C{m.cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          {DASHBOARD_URL && (
            <a
              href={DASHBOARD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-base shadow-lg hover:brightness-105 transition"
            >
              Ver tablero con mayor detalle <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <a href="#demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition">
            <Droplets className="w-4 h-4" /> Consultar municipios
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
            <li>Contacto: analitica.institucional@icbf.gov.co</li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-sm mb-3">Recursos</div>
          <ul className="space-y-1 text-sm opacity-80">
            <li><a href="#metodologia" className="hover:underline">Metodología</a></li>
            <li><a href="#datos" className="hover:underline">Fuentes de datos</a></li>
            <li><a href="#demo" className="hover:underline">Consulta municipal</a></li>
            {DASHBOARD_URL && (
              <li>
                <a href={DASHBOARD_URL} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                  Tablero completo <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            )}
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
