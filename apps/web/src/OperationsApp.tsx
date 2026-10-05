import {
  lazy,
  Suspense,
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  createRoute,
  createRootRoute,
  createRouter,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Film,
  LayoutDashboard,
  LayoutGrid,
  List,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Pencil,
  Printer,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Store,
  Target,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  type CampaignRecord,
  type Campana,
  createLeadSchema,
  leadStatusSchema,
  prospectSchema,
  type CreateLeadInput,
  type LeadRecord,
  type LeadStatus,
  type ProspectInput,
  type Canal,
  type Producto,
  type User,
  type Meta,
  type Contenido,
  type Tarea,
} from "@rgr/shared";
import { leadStatusLabels } from "./data/fixtures/leads";
import {
  useCampaigns,
  useCatalog,
  useChannels,
  useContent,
  useAudiovisual,
  useLeads,
  useMarketplace,
  useWhatsApp,
  useProspects,
  useTasks,
} from "./data/hooks";
import { useUiStore } from "./store";
import { apiRequest } from "./data/api";
import { Button } from "./components/ui/button";
import "./App.css";

const DemandChart = lazy(() => import("./DemandChart"));

type MarketingContextValue = {
  leads: LeadRecord[];
  saveLead: (input: CreateLeadInput) => Promise<void>;
  editLead: (id: string, input: CreateLeadInput) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
};
const MarketingContext = createContext<MarketingContextValue | null>(null);

function useMarketing() {
  const context = useContext(MarketingContext);
  if (!context) throw new Error("Marketing context is unavailable");
  return context;
}
const navItems = [
  {
    label: "Panel operativo",
    to: "/",
    icon: LayoutDashboard,
    group: "GESTIÓN",
  },
  { label: "Tareas", to: "/tasks", icon: ClipboardList, group: "GESTIÓN" },
  {
    label: "Leads",
    to: "/leads",
    icon: Target,
    group: "COMERCIAL",
  },
  {
    label: "Prospección",
    to: "/prospecting",
    icon: BriefcaseBusiness,
    group: "COMERCIAL",
  },
  { label: "Campañas", to: "/campaigns", icon: Megaphone, group: "COMERCIAL" },
  { label: "Marketplace", to: "/marketplace", icon: Store, group: "COMERCIAL" },
  {
    label: "Calendario",
    to: "/calendar",
    icon: CalendarDays,
    group: "CONTENIDO",
  },
  {
    label: "Canales y activos",
    to: "/channels",
    icon: Store,
    group: "OPERACIÓN",
  },
  { label: "WhatsApp", to: "/whatsapp", icon: MessageCircle, group: "OPERACIÓN" },
  { label: "Banco audiovisual", to: "/assets", icon: Film, group: "OPERACIÓN" },
  { label: "Admin", to: "/admin", icon: ShieldCheck, group: "OPERACIÓN" },
  {
    label: "Reporte semanal",
    to: "/reports",
    icon: FileText,
    group: "OPERACIÓN",
  },
] as const;
const pageTitles: Record<string, string> = {
  "/": "Panel operativo",
  "/tasks": "Tareas iniciales",
  "/leads": "Registro de leads",
  "/prospecting": "Prospección comercial",
  "/campaigns": "Campañas y pauta",
  "/marketplace": "Marketplace",
  "/whatsapp": "WhatsApp Business",
  "/assets": "Banco audiovisual",
  "/admin": "Administración",
  "/calendar": "Calendario de contenido",
  "/channels": "Canales y activos",
  "/reports": "Reporte a Gerencia",
};

function AppShell() {
  const { catalog } = useCatalog();
  const sessionUser = useUiStore((state) => state.sessionUser);
  const { leads, addLead, editLead, removeLead, updateLeadStatus, load: loadLeads, isLoading: leadsLoading, error: leadsError } = useLeads();
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setApiError(detail || "Ocurrió un error al guardar los datos.");
    };
    window.addEventListener("rgr-api-error", handleApiError);
    return () => window.removeEventListener("rgr-api-error", handleApiError);
  }, []);
  const todayLabel = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const dialogOpen = useUiStore((state) => state.leadDialogOpen);
  const setDialogOpen = useUiStore((state) => state.setLeadDialogOpen);
  const profileName =
    sessionUser?.name ??
    catalog?.users.find((user) => user.role === "ADMIN")?.name ??
    "Cuenta";
  const context: MarketingContextValue = {
    leads,
    saveLead: async (input) => { await addLead(input); },
    editLead: async (id, input) => { await editLead(id, input); },
    removeLead,
    updateLeadStatus: async (id, status) => { await updateLeadStatus(id, status); },
  };
  const openDialog = setDialogOpen;

  return (
    <MarketingContext.Provider value={context}>
      <div className="app-shell">
        <aside className="sidebar">
          <Link className="brand-lockup" to="/" aria-label="RGR Marketing">
            <span className="brand-name">
              RGR<span>OPERACIONES</span>
            </span>
          </Link>
          <div className="workspace-picker">
            <span className="workspace-glyph">
              <Wrench size={15} />
            </span>
            <span>
              <b>Marketing</b>
            </span>
          </div>
          <nav className="side-nav" aria-label="Navegación principal">
            {["GESTIÓN", "COMERCIAL", "CONTENIDO", "OPERACIÓN"].map((group) => (
              <div className="nav-group" key={group}>
                <p className="nav-label">{group}</p>
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        activeOptions={{ exact: item.to === "/" }}
                        className="nav-link"
                        activeProps={{ className: "nav-link is-active" }}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                        <span>{item.label}</span>
                        {item.to === "/leads" && (
                          <span className="nav-count">{leads.length}</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="team-card">
              <div className="team-head">
                <i /> EQUIPO DE MARKETING
              </div>
              {catalog?.users.map((user) => (
                <TeamPerson
                  key={user.id}
                  initials={user.name.slice(0, 2).toUpperCase()}
                  name={user.name}
                  role={user.role}
                  tone={user.id}
                />
              ))}
            </div>
            <Link className="nav-link sidebar-help" to="/admin">
              <ShieldCheck size={17} />
              <span>Configuración</span>
            </Link>
          </div>
        </aside>
        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              <span>RGR</span>
              <i>/</i>
              <b>{pageTitles[pathname] ?? "Panel operativo"}</b>
            </div>
            <div className="topbar-actions">
              <span className="topbar-date">
                <CalendarDays size={14} /> {todayLabel}
              </span>
              <button
                className="profile-button"
                type="button"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={() => window.dispatchEvent(new Event("rgr-logout"))}
              >
                <Avatar initials={profileName.slice(0, 2).toUpperCase()} tone="arturo" />
                <span>
                  <b>{profileName}</b>
                  {sessionUser && <small>{sessionUser.role}</small>}
                </span>
                <X size={14} />
              </button>
            </div>
          </header>
          <div className="mobile-brand">
            <strong>RGR OPERACIONES</strong>
            <button
              className="icon-button"
              aria-label="Agregar lead"
              type="button"
              onClick={() => openDialog(true)}
            >
              <Plus size={19} />
            </button>
          </div>
          {(apiError || leadsError) && (
            <div className="api-error-banner" role="alert">
              {apiError || leadsError}
            </div>
          )}
          {leadsLoading && (
            <div className="api-loading-banner" role="status">
              Cargando leads…
            </div>
          )}
          <Outlet />
        </main>
      </div>
      {dialogOpen && (
        <LeadDialog
          onClose={() => openDialog(false)}
          onSave={context.saveLead}
        />
      )}
    </MarketingContext.Provider>
  );
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return <span className={`avatar avatar-${tone}`}>{initials}</span>;
}
function TeamPerson({
  initials,
  name,
  role,
  tone,
}: {
  initials: string;
  name: string;
  role: string;
  tone: string;
}) {
  return (
    <div className="team-person">
      <Avatar initials={initials} tone={tone} />
      <span>
        <b>{name}</b>
        <small>{role}</small>
      </span>
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function localDateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function localMonthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function localDateTimeInputValue(value: string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
function DemoNotice() {
  return null;
}

function DashboardPage() {
  const { leads } = useMarketing();
  const { tasks, toggleTask } = useTasks();
  const { catalog, domain: domainCatalog } = useCatalog();
  const { domainContent } = useContent();
  const { weeklyCreatedCount } = useProspects();
  const { campaigns } = useCampaigns();
  const setDialogOpen = useUiStore((state) => state.setLeadDialogOpen);
  const workshopGoal = catalog?.goals.find((goal) => goal.id === "workshop-leads-monthly")?.target ?? 0;
  const qualifiedGoal = catalog?.goals.find((goal) => goal.id === "qualified-leads-monthly")?.target ?? 0;
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekStartText = weekStart.toISOString().slice(0, 10);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndText = weekEnd.toISOString().slice(0, 10);
  const weeklyGoalContent = catalog?.goals.filter((goal) => goal.id.includes("weekly")) ?? [];
  const contentActual = (goalId: string) => {
    const businessUnit = goalId.includes("workshop") ? "workshop" : "machinery";
    const format = goalId.includes("reels")
      ? "REEL"
      : goalId.includes("posts")
        ? "POST"
        : "HISTORIA";
    return domainContent.filter((piece) => {
      const product = domainCatalog.products.find(
        (item) => item.id === piece.productoId,
      );
      const channel = domainCatalog.channels.find(
        (item) => item.id === piece.cuentaId,
      );
      const pieceBusinessUnit =
        product?.categoria === "SERVICIO_TALLER" ||
        channel?.nombre.toLowerCase().includes("taller")
          ? "workshop"
          : "machinery";
      return (
        pieceBusinessUnit === businessUnit &&
        piece.tipo === format &&
        piece.estado === "PUBLICADO" &&
        piece.fechaPublicacion !== null &&
        piece.fechaPublicacion >= weekStartText &&
        piece.fechaPublicacion < weekEndText
      );
    }).length;
  };
  const weeklyPublished = weeklyGoalContent.reduce((sum, goal) => sum + contentActual(goal.id), 0);
  const weeklyTargets = weeklyGoalContent.reduce((sum, goal) => sum + goal.target, 0);
  const semaphore = weeklyTargets && weeklyPublished >= weeklyTargets ? "verde" : weeklyTargets && weeklyPublished / weeklyTargets >= 0.7 ? "ámbar" : "rojo";
  const weeklyProspectTarget = Math.ceil((catalog?.goals.find((goal) => goal.id === "companies-monthly")?.target ?? 40) / 4);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthLeads = leads.filter((lead) => new Date(lead.date) >= monthStart);
  const workshopLeads = monthLeads.filter(
    (lead) => lead.businessUnit === "workshop",
  );
  const qualifiedMachinery = monthLeads.filter(
    (lead) =>
      lead.businessUnit === "machinery" && lead.product && lead.city && lead.need,
  );
  const appointments = workshopLeads.filter((lead) => lead.appointment);
  const arrivals = workshopLeads.filter((lead) => lead.arrived).length;
  const sales = workshopLeads
    .filter((lead) => lead.sold)
    .reduce((sum, lead) => sum + Number(lead.amount ?? 0), 0);
  const workshopProgress = workshopGoal ? Math.min(100, Math.round((workshopLeads.length / workshopGoal) * 100)) : 0;
  const machineryProgress = Math.min(
    100,
    qualifiedGoal ? Math.round((qualifiedMachinery.length / qualifiedGoal) * 100) : 0,
  );
  const demandData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    const dayLeads = leads.filter(
      (lead) => new Date(lead.date).toDateString() === date.toDateString(),
    );
    return {
      day: new Intl.DateTimeFormat("es-PE", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      workshop: dayLeads.filter((lead) => lead.businessUnit === "workshop")
        .length,
      machinery: dayLeads.filter((lead) => lead.businessUnit === "machinery")
        .length,
    };
  });
  const weeklyDemand = demandData.reduce(
    (sum, day) => sum + day.workshop + day.machinery,
    0,
  );
  const channelCount = new Set(monthLeads.map((lead) => lead.channel)).size;
  const completeCount = tasks.filter((task) => task.completed).length;
  return (
    <div className="page-content">
      <PageHeading
        eyebrow={new Intl.DateTimeFormat("es-PE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(new Date()).toUpperCase()}
        title="Panel operativo"
        subtitle="Demanda, seguimiento y ejecución comercial en un solo lugar."
        action={
          <div className="heading-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => setDialogOpen(true)}
            >
              <Plus size={17} /> Registrar lead
            </button>
          </div>
        }
      />
      <DemoNotice />
      <section className="kpi-grid">
        <Metric
          title="Leads · taller"
          value={String(workshopLeads.length)}
          goal={String(workshopGoal)}
          suffix="leads / mes"
          delta={`${workshopProgress}% de la meta`}
          progress={workshopProgress}
          icon={Wrench}
          tone="mint"
        />
        <Metric
          title="Leads calificados"
          value={String(qualifiedMachinery.length)}
          goal={String(qualifiedGoal)}
          suffix="maquinaria / mes"
          delta={`${Math.max(0, qualifiedGoal - qualifiedMachinery.length)} para la meta`}
          progress={machineryProgress}
          icon={Target}
          tone="coral"
        />
        <Metric
          title="Citas generadas"
          value={String(appointments.length)}
          suffix="taller · este mes"
          delta={`${arrivals} llegaron al taller`}
          icon={CalendarDays}
          tone="blue"
        />
        <Metric
          title="Facturación atribuible"
          value={`S/ ${sales.toLocaleString("es-PE")}`}
          suffix="según leads registrados"
          delta="Atribución del registro"
          icon={CircleDollarSign}
          tone="yellow"
        />
      </section>
      <section className="overview-grid">
        <div className="panel chart-panel">
          <PanelTitle
            eyebrow="DEMANDA · ÚLTIMOS 7 DÍAS"
            title="Consultas por unidad"
            action={
              <Link className="text-button" to="/leads">
                Ver registro <ArrowRight size={15} />
              </Link>
            }
          />
          <div className="chart-legend">
            <span>
              <i className="legend-mark legend-workshop" /> Taller
            </span>
            <span>
              <i className="legend-mark legend-machinery" /> Maquinaria
            </span>
            <b>
              {weeklyDemand} <small>leads</small>
            </b>
          </div>
          <div className="chart-wrap">
            <Suspense fallback={<div className="chart-loading">Cargando actividad…</div>}>
              <DemandChart data={demandData} />
            </Suspense>
          </div>
          <div className="chart-footnote">
            <span>
              <b>{workshopLeads.length}</b> taller en el mes
            </span>
            <span>
              <b>{qualifiedMachinery.length}</b> calificados maquinaria
            </span>
            <span>
              <b>{channelCount}</b> canales activos
            </span>
          </div>
        </div>
        <div className="panel unit-panel">
          <PanelTitle
            eyebrow="PRIORIDAD COMERCIAL"
            title="Metas del mes"
          />
          <UnitProgress
            icon={Wrench}
            title="Taller automotriz"
            account={
              domainCatalog.channels
                .filter((channel) => channel.tipo === "INSTAGRAM" || channel.tipo === "FACEBOOK")
                .map((channel) => channel.nombre)
                .join(" · ") || "Sin canales configurados"
            }
            value={String(workshopLeads.length)}
            goal={String(workshopGoal)}
            percent={workshopProgress}
            color="green"
            details={[`${appointments.length} citas`, `S/ ${sales.toLocaleString("es-PE")} atrib.`]}
          />
          <UnitProgress
            icon={PackageCheck}
            title="Maquinaria y vehículos"
            account={
              domainCatalog.products
                .filter((product) => product.categoria !== "SERVICIO_TALLER")
                .map((product) => product.nombre)
                .slice(0, 3)
                .join(" · ") || "Sin unidades configuradas"
            }
            value={String(qualifiedMachinery.length)}
            goal={String(qualifiedGoal)}
            percent={machineryProgress}
            color="orange"
            details={[
              `${domainCatalog.products.filter((product) => product.categoria !== "SERVICIO_TALLER").length} unidades en catálogo`,
              `${qualifiedMachinery.filter((lead) => lead.status === "quoted").length} cotizados`,
            ]}
          />
          <div className="budget-strip">
            <span>
              <CircleDollarSign size={16} />
              <span>
                <b>Inversión en pauta</b>
                <small>Distribución inicial mensual</small>
              </span>
            </span>
            <b>S/ {campaigns.reduce((sum, campaign) => sum + campaign.budget, 0).toLocaleString("es-PE")} <small>asignados</small></b>
          </div>
          <div className="budget-split">
            <span>
              <i className="budget-dot green" /> Campañas registradas <b>{campaigns.length}</b>
            </span>
          </div>
        </div>
      </section>
      <section className="lower-grid">
        <div className="panel task-panel">
          <PanelTitle
            eyebrow="ARRANQUE · TAREAS DE MARKETING"
            title="Prioridades de implementación"
            action={
              <span className="small-counter">{completeCount}/{tasks.length} listas</span>
            }
          />
          <div className="task-list">
            {tasks.map((task, index) => (
              <button
                className={`task-row ${task.completed ? "task-done" : ""}`}
                type="button"
                key={task.id}
                onClick={() => void toggleTask(task.id)}
              >
                <span
                  className={`task-check ${task.completed ? "checked" : ""}`}
                >
                  {task.completed && <Check size={13} />}
                </span>
                <span className="task-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="task-copy">
                  <b>{task.title}</b>
                  <small>{task.owner}</small>
                </span>
                <span className={`task-tag ${index < 2 ? "tag-priority" : ""}`}>
                  {task.tag}
                </span>
              </button>
            ))}
          </div>
          <div className="task-footer">
            <span>
              <Clock3 size={14} /> Prioridades del equipo
            </span>
            <Link className="text-button" to="/tasks">
              Ver tareas <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="panel cadence-panel">
          <PanelTitle
            eyebrow="RITMO DE PUBLICACIÓN"
            title="Meta semanal"
            action={<span className={`week-chip semaphore-${semaphore}`}>Semáforo {semaphore}</span>}
          />
          <div className="content-goals">
            {weeklyGoalContent.map((goal) => {
              const actual = contentActual(goal.id);
              return <div className="goal-row" key={goal.id}>
                <span>{goal.label}</span>
                <div className="goal-track">
                  <i
                    style={{
                      width: `${Math.min(100, (actual / goal.target) * 100)}%`,
                    }}
                  />
                </div>
                <b>
                  {actual}
                  <small>/{goal.target}</small>
                </b>
              </div>;
            })}
          </div>
          <div className="quick-links">
            <Link to="/calendar">
              <CalendarDays size={15} /> Abrir calendario
            </Link>
            <Link to="/reports">
              <FileText size={15} /> Preparar reporte
            </Link>
            <Link to="/prospecting"><BriefcaseBusiness size={15} /> Prospección semanal {weeklyCreatedCount}/{weeklyProspectTarget}</Link>
          </div>
        </div>
      </section>
      <section className="panel recent-panel">
        <PanelTitle
          eyebrow="SEGUIMIENTO COMERCIAL"
          title="Leads recientes"
          action={
            <Link className="text-button" to="/leads">
              Ver todos <ArrowRight size={15} />
            </Link>
          }
        />
        <LeadTable leads={leads.slice(0, 4)} compact />
      </section>
      <footer className="page-foot">
        <span>RGR · Sistema operativo de marketing</span>
        <span>Datos atribuibles a leads, citas y ventas</span>
      </footer>
    </div>
  );
}

function Metric({
  title,
  value,
  goal,
  suffix,
  delta,
  progress,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  goal?: string;
  suffix: string;
  delta: string;
  progress?: number;
  icon: ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">
          <Icon size={17} />
        </span>
      </div>
      <div className="metric-value">
        {value}
        {goal && <small> / {goal}</small>}
      </div>
      <div className="metric-bottom">
        <span>{suffix}</span>
        <span className="metric-delta">
          <ArrowUpRight size={13} />
          {delta}
        </span>
      </div>
      {progress !== undefined && (
        <div className="metric-progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  );
}
function PanelTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
function UnitProgress({
  icon: Icon,
  title,
  account,
  value,
  goal,
  percent,
  color,
  details,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  account: string;
  value: string;
  goal: string;
  percent: number;
  color: string;
  details: string[];
}) {
  return (
    <div className="unit-progress">
      <div className="unit-title">
        <span className={`unit-icon unit-icon-${color}`}>
          <Icon size={16} />
        </span>
        <span>
          <b>{title}</b>
          <small>{account}</small>
        </span>
        <strong>
          {value} <small>/ {goal}</small>
        </strong>
      </div>
      <Progress percent={percent} color={color} />
      <div className="unit-detail">
        {details.map((detail) => (
          <span key={detail}>
            <CheckCircle2 size={13} />
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}
function Progress({ percent, color }: { percent: number; color: string }) {
  return (
    <div className={`progress-bar progress-${color}`}>
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}

function LeadTable({
  leads,
  compact = false,
  onEdit,
  onDelete,
}: {
  leads: LeadRecord[];
  compact?: boolean;
  onEdit?: (lead: LeadRecord) => void;
  onDelete?: (id: string) => Promise<void>;
}) {
  const { updateLeadStatus } = useMarketing();
  if (!leads.length) {
    return (
      <div className="empty-state">
        <Target size={22} />
        <b>Aún no hay leads en este filtro</b>
        <span>Registra una consulta para iniciar el seguimiento.</span>
      </div>
    );
  }
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>CONTACTO</th>
            <th>SERVICIO / PRODUCTO</th>
            <th>ORIGEN</th>
            <th>FECHA</th>
            <th>ESTADO</th>
            {!compact && <><th>CITA</th><th>LLEGÓ</th><th>VENTA</th><th>MONTO</th>{onEdit && <th>ACCIONES</th>}</>}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td><div className="lead-cell"><span className={`lead-avatar lead-avatar-${lead.businessUnit}`}>{lead.name.slice(0, 1)}</span><span><b>{lead.name}</b><small>{lead.phone} · {lead.city}</small></span></div></td>
              <td><span className="service-name">{lead.product ?? lead.service}</span><small className="cell-subtitle">{lead.businessUnit === "workshop" ? "Taller automotriz" : "Maquinaria / vehículos"}</small></td>
              <td><span className="channel-label">{lead.channel}</span></td>
              <td>{new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(new Date(lead.date))}</td>
              <td><select className={`status-select status-${lead.status}`} aria-label={`Estado de ${lead.name}`} value={lead.status} onChange={(event) => updateLeadStatus(lead.id, leadStatusSchema.parse(event.target.value))}>{Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
              {!compact && <>
                <td><BooleanMark value={lead.appointment} /></td>
                <td><BooleanMark value={lead.arrived} /></td>
                <td><BooleanMark value={lead.sold} /></td>
                <td>{lead.amount === null ? "—" : `S/ ${lead.amount.toLocaleString("es-PE")}`}</td>
                {onEdit && <td><button className="icon-button subtle" type="button" aria-label={`Editar ${lead.name}`} title="Editar lead" onClick={() => onEdit(lead)}><Pencil size={14} /></button>{onDelete && <button className="icon-button subtle" type="button" aria-label={`Eliminar ${lead.name}`} title="Eliminar lead" onClick={() => void onDelete(lead.id)}><Trash2 size={14} /></button>}</td>}
              </>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function BooleanMark({ value }: { value: boolean }) {
  return (
    <span className={`boolean-mark ${value ? "is-yes" : ""}`}>
      {value ? <Check size={12} /> : "—"}
    </span>
  );
}

function LeadsPage() {
  const { leads, editLead, removeLead } = useMarketing();
  const sessionUser = useUiStore((state) => state.sessionUser);
  const setOpen = useUiStore((state) => state.setLeadDialogOpen);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [actionError, setActionError] = useState("");
  const canDeleteLeads = sessionUser?.role === "ADMIN" || sessionUser?.role === "SALES";
  const deleteLead = async (id: string) => {
    const lead = leads.find((item) => item.id === id);
    if (!lead || !window.confirm(`¿Eliminar el lead de ${lead.name}? Esta acción no se puede deshacer.`))
      return;
    setActionError("");
    try {
      await removeLead(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo eliminar el lead.");
    }
  };
  const filtered = leads.filter(
    (lead) =>
      `${lead.name} ${lead.phone} ${lead.service} ${lead.product ?? ""} ${lead.channel}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (unit === "all" || lead.businessUnit === unit) &&
      (status === "all" || lead.status === status),
  );
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="EMBUDO COMERCIAL"
        title="Registro de leads"
        subtitle="Cada consulta conserva fecha, contacto, necesidad, origen y resultado."
        action={
          <button
            className="button button-primary"
            onClick={() => setOpen(true)}
            type="button"
          >
            <Plus size={17} /> Nuevo lead
          </button>
        }
      />
      <DemoNotice />
      <div className="lead-summary">
        {[
          [leads.length, "registros visibles"],
          [leads.filter((lead) => lead.appointment).length, "con cita"],
          [leads.filter((lead) => lead.arrived).length, "llegaron al taller"],
          [leads.filter((lead) => lead.sold).length, "ventas atribuidas"],
        ].map(([value, label]) => (
          <span key={String(label)}>
            <b>{value}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
      <section className="panel lead-register-panel">
        {actionError && <p className="auth-error" role="alert">{actionError}</p>}
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              aria-label="Buscar leads"
              placeholder="Buscar contacto, servicio u origen"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="toolbar-filters">
            <div className="view-toggle" aria-label="Vista de leads">
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} title="Lista"><List size={15} /></button>
              <button type="button" aria-pressed={view === "kanban"} onClick={() => setView("kanban")} title="Kanban"><LayoutGrid size={15} /></button>
            </div>
            <label>
              <span>Unidad</span>
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="all">Todas</option>
                <option value="workshop">Taller</option>
                <option value="machinery">Maquinaria / vehículos</option>
              </select>
            </label>
            <label>
              <span>Estado</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">Todos</option>
                {Object.entries(leadStatusLabels).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {view === "list" ? (
          <LeadTable
            leads={filtered}
            onEdit={setEditingLead}
            onDelete={canDeleteLeads ? deleteLead : undefined}
          />
        ) : (
          <LeadKanban
            leads={filtered}
            onEdit={setEditingLead}
            onDelete={canDeleteLeads ? deleteLead : undefined}
          />
        )}
      </section>
      <div className="lead-policy">
        <Clock3 size={16} />
        <span>
          <b>SLA comercial: menos de 10 minutos</b>
          <small>
            Ventas responde y cierra; Marketing conserva el canal de origen y el
            resultado.
          </small>
        </span>
        <span className="policy-count">
          {leads.filter((lead) => lead.status === "new").length} pendientes de
          contacto
        </span>
      </div>
      {editingLead && (
        <LeadDialog
          key={editingLead.id}
          initial={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(input) => editLead(editingLead.id, input)}
        />
      )}
    </div>
  );
}

function LeadKanban({
  leads,
  onEdit,
  onDelete,
}: {
  leads: LeadRecord[];
  onEdit: (lead: LeadRecord) => void;
  onDelete?: (id: string) => Promise<void>;
}) {
  const { updateLeadStatus } = useMarketing();
  const statuses = Object.keys(leadStatusLabels) as LeadStatus[];
  return (
    <div className="lead-kanban">
      {statuses.map((status) => {
        const column = leads.filter((lead) => lead.status === status);
        return (
          <section
            className="kanban-column"
            key={status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const leadId = event.dataTransfer.getData("text/plain");
              if (leadId) void updateLeadStatus(leadId, status);
            }}
          >
            <header><b>{leadStatusLabels[status]}</b><span>{column.length}</span></header>
            {column.map((lead) => (
              <article className="kanban-lead" key={lead.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", lead.id)}>
                <b>{lead.name}</b>
                <span>{lead.product ?? lead.service}</span>
                <small>{lead.city} · {lead.channel}</small>
                <div className="kanban-lead-actions">
                  <button type="button" className="icon-button subtle" aria-label={`Editar ${lead.name}`} title="Editar lead" onClick={() => onEdit(lead)}><Pencil size={14} /></button>
                  {onDelete && <button type="button" className="icon-button subtle" aria-label={`Eliminar ${lead.name}`} title="Eliminar lead" onClick={() => void onDelete(lead.id)}><Trash2 size={14} /></button>}
                </div>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function CampaignsPage() {
  const { campaigns, domainCampaigns, setCampaignStatus, createCampaign, updateCampaign, removeCampaign } = useCampaigns();
  const { domain: catalog } = useCatalog();
  const [newName, setNewName] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newAudience, setNewAudience] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newBudget, setNewBudget] = useState(0);
  const addCampaign = () => {
    if (
      !newName.trim() ||
      !newProductId ||
      !newAudience.trim() ||
      !newObjective.trim()
    )
      return;
    const today = new Date();
    const start = localDateInputValue(today);
    const end = localDateInputValue(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    createCampaign({ nombre: newName.trim(), concepto: newConcept.trim(), productoIds: [newProductId], publico: newAudience.trim(), objetivo: newObjective.trim(), presupuesto: newBudget, gastoReal: 0, inicio: start, fin: end, estado: "BORRADOR" });
    setNewName(""); setNewConcept(""); setNewAudience(""); setNewObjective(""); setNewBudget(0);
  };
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="INVERSIÓN · RESULTADO · CPL"
        title="Campañas y pauta"
        subtitle="Cada campaña define producto, público, objetivo, presupuesto y resultado medible."
        action={
          <button
            className="button button-primary"
            type="button"
            onClick={() => document.getElementById("campaign-name")?.focus()}
          >
            <Plus size={17} /> Nueva campaña
          </button>
        }
      />
      <DemoNotice />
      <div className="campaign-budget-grid">
        <BudgetCard
          icon={Wrench}
          title="Presupuesto de campaña"
          amount={`S/ ${domainCampaigns.reduce((sum, campaign) => sum + campaign.presupuesto, 0).toLocaleString("es-PE")}`}
          note={`${domainCampaigns.length} campañas registradas`}
        />
      </div>
      <section className="panel asset-create-row campaign-create-row">
        <input id="campaign-name" placeholder="Nombre de campaña" value={newName} onChange={(event) => setNewName(event.target.value)} />
        <input placeholder="Concepto" value={newConcept} onChange={(event) => setNewConcept(event.target.value)} />
        <select aria-label="Producto o servicio" value={newProductId} onChange={(event) => setNewProductId(event.target.value)}><option value="">Selecciona producto o servicio</option>{catalog.products.filter((product) => product.disponible).map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select>
        <input placeholder="Público objetivo" value={newAudience} onChange={(event) => setNewAudience(event.target.value)} />
        <input placeholder="Objetivo de campaña" value={newObjective} onChange={(event) => setNewObjective(event.target.value)} />
        <input aria-label="Presupuesto inicial" type="number" min="0" value={newBudget} onChange={(event) => setNewBudget(Number(event.target.value))} />
        <button className="button button-primary" onClick={addCampaign} disabled={!newName.trim() || !newProductId || !newAudience.trim() || !newObjective.trim()}><Plus size={15} /> Crear</button>
      </section>
      <div className="campaign-list">
        {campaigns.map((campaign) => {
          const domainCampaign = domainCampaigns.find((item) => item.id === campaign.id);
          if (!domainCampaign) return null;
          return (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            domainCampaign={domainCampaign}
            products={catalog.products}
            update={(changes) => updateCampaign(campaign.id, changes)}
            toggle={() =>
              setCampaignStatus(campaign.id, campaign.status === "active" ? "paused" : campaign.status === "paused" ? "draft" : "active")
            }
            remove={() => removeCampaign(campaign.id)}
          />
        );})}
      </div>
      <div className="campaign-rule">
        <ShieldCheck size={16} />
        <span>
          <b>Regla de optimización:</b> revisar CPL, calidad del lead, citas y
          ventas antes de mover presupuesto.
        </span>
      </div>
    </div>
  );
}
function BudgetCard({
  icon: Icon,
  title,
  amount,
  note,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  amount: string;
  note: string;
}) {
  return (
    <div className="budget-summary-card">
      <span className="summary-icon">
        <Icon size={18} />
      </span>
      <span>
        <small>{title}</small>
        <b>{amount}</b>
      </span>
      <span className="summary-status">{note}</span>
    </div>
  );
}
function CampaignCard({
  campaign,
  domainCampaign,
  products,
  update,
  toggle,
  remove,
}: {
  campaign: CampaignRecord;
  domainCampaign: Campana;
  products: Producto[];
  update: (changes: Partial<Campana>) => void;
  toggle: () => void;
  remove: () => void;
}) {
  const tone = campaign.businessUnit === "workshop" ? "green" : "orange";
  const active = campaign.status === "active";
  return (
    <article className="panel campaign-card">
      <div className={`campaign-accent campaign-accent-${tone}`} />
      <div className="campaign-card-head">
        <span className={`campaign-logo logo-${tone}`}>
          {tone === "green" ? <Wrench size={19} /> : <PackageCheck size={19} />}
        </span>
        <span
          className={`campaign-state ${active ? "state-live" : "state-paused"}`}
        >
          <i />
          {campaign.status === "draft" ? "BORRADOR" : active ? "ACTIVA" : "PAUSADA"}
        </span>
        <button
          className="icon-button subtle"
          type="button"
          aria-label="Activar o pausar campaña"
          onClick={toggle}
        >
          {active ? <Clock3 size={16} /> : <Send size={16} />}
        </button>
        <button className="icon-button subtle" type="button" aria-label="Eliminar campaña" onClick={remove}><Trash2 size={14} /></button>
      </div>
      <p className="eyebrow">{campaign.businessUnit === "workshop" ? "TALLER AUTOMOTRIZ" : "MAQUINARIA Y VEHÍCULOS"} · CAPTACIÓN</p>
      <input aria-label="Nombre de campaña" className="campaign-title-input" value={domainCampaign.nombre} onChange={(event) => update({ nombre: event.target.value })} />
      <input aria-label="Concepto de campaña" className="campaign-description-input" value={domainCampaign.concepto} placeholder="Concepto de campaña" onChange={(event) => update({ concepto: event.target.value })} />
      <div className="campaign-meta">
        <span>
          <b>Producto</b>
          <select aria-label="Producto de campaña" value={domainCampaign.productoIds[0] ?? ""} onChange={(event) => update({ productoIds: event.target.value ? [event.target.value] : [] })}><option value="">Sin producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select>
        </span>
        <span>
          <b>Público</b>
          <input aria-label="Público objetivo" value={domainCampaign.publico} onChange={(event) => update({ publico: event.target.value })} />
        </span>
        <span>
          <b>Objetivo</b>
          <input aria-label="Objetivo de campaña" value={domainCampaign.objetivo} onChange={(event) => update({ objetivo: event.target.value })} />
        </span>
      </div>
      <div className="campaign-results">
        <div>
          <small>Presupuesto</small>
          <input type="number" min="0" value={domainCampaign.presupuesto} onChange={(event) => update({ presupuesto: Number(event.target.value) })} />
        </div>
        <div>
          <small>Gasto real</small>
          <input type="number" min="0" value={domainCampaign.gastoReal} onChange={(event) => update({ gastoReal: Number(event.target.value) })} />
        </div>
        <div>
          <small>Leads · CPL</small>
          <b>{domainCampaign.metricas.leads} · S/ {domainCampaign.metricas.cpl.toFixed(2)}</b>
        </div>
        <div>
          <small>Estado</small>
          <b>{domainCampaign.estado}</b>
        </div>
      </div>
    </article>
  );
}

function CalendarPage() {
  const [unit, setUnit] = useState("all");
  const { content, domainContent, createContent, updateContent, removeContent, updateSchedule } = useContent();
  const { catalog, domain: domainCatalog } = useCatalog();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(() => localDateInputValue());
  const [newChannelId, setNewChannelId] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [rangeStart, setRangeStart] = useState(() => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
  });
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 14);
  const rangeLastDay = new Date(rangeEnd);
  rangeLastDay.setDate(rangeLastDay.getDate() - 1);
  const formatRangeDate = (date: Date) =>
    new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" })
      .format(date)
      .toUpperCase();
  const setCurrentRange = () => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    setRangeStart(monday);
  };
  const addPiece = () => {
    if (!newTitle.trim() || !newChannelId || !newOwnerId || !newProductId)
      return;
    const piece: Omit<Contenido, "id"> = { titulo: newTitle.trim(), tipo: "REEL", pilar: "EDUCACION", cuentaId: newChannelId, responsableId: newOwnerId, fechaProgramada: newDate, fechaPublicacion: null, estado: "IDEA", campanaId: null, productoId: newProductId, assetIds: [], metricas: { alcance: 0, interacciones: 0, guardados: 0, clics: 0, leads: 0 } };
    createContent(piece); setNewTitle(""); setAdding(false);
  };
  const goals = catalog?.goals ?? [];
  const pieces = content.filter((item) => {
    const scheduledAt = new Date(item.scheduledAt);
    return (
      scheduledAt >= rangeStart &&
      scheduledAt < rangeEnd &&
      (unit === "all" || item.businessUnit === unit)
    );
  });
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="PLANIFICACIÓN · PRÓXIMAS 2 SEMANAS"
        title="Calendario de contenido"
        subtitle="El taller convierte cada ingreso en contenido; Ventas rota producto y evidencia."
        action={
          <button className="button button-primary" type="button" onClick={() => setAdding((current) => !current)}>
            <Plus size={17} /> Programar pieza
          </button>
        }
      />
      <DemoNotice />
      <div className="calendar-target-row">
        <CalendarTarget
          icon={Wrench}
          title="Taller automotriz"
          goal={`${goals.find((goal) => goal.id === "workshop-reels-weekly")?.target ?? 0} reels · ${goals.find((goal) => goal.id === "workshop-posts-weekly")?.target ?? 0} posts · ${goals.find((goal) => goal.id === "workshop-stories-weekly")?.target ?? 0} historias / semana`}
          note="2–3 jornadas de grabación"
          tone="green"
        />
        <CalendarTarget
          icon={PackageCheck}
          title="Maquinaria / vehículos"
          goal={`${goals.find((goal) => goal.id === "sales-reels-weekly")?.target ?? 0} reels · ${goals.find((goal) => goal.id === "sales-posts-weekly")?.target ?? 0} posts / semana`}
          note="Rotación de unidades"
          tone="orange"
        />
      </div>
      <section className="panel calendar-panel">
        {adding && <div className="calendar-create-row">
          <input placeholder="Título de contenido" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
          <input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} />
          <select aria-label="Producto o servicio" value={newProductId} onChange={(event) => setNewProductId(event.target.value)}><option value="">Selecciona producto o servicio</option>{domainCatalog.products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select>
          <select aria-label="Canal de contenido" value={newChannelId} onChange={(event) => setNewChannelId(event.target.value)}><option value="">Selecciona canal</option>{domainCatalog.channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.nombre}</option>)}</select>
          <select aria-label="Responsable de contenido" value={newOwnerId} onChange={(event) => setNewOwnerId(event.target.value)}><option value="">Selecciona responsable</option>{domainCatalog.users.filter((user) => user.activo).map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select>
          <button className="button button-primary" onClick={addPiece} disabled={!newTitle.trim() || !newDate || !newProductId || !newChannelId || !newOwnerId}>Guardar</button>
        </div>}
        <div className="calendar-toolbar">
          <div>
            <b className="month-label">
              {formatRangeDate(rangeStart)} <i>—</i> {formatRangeDate(rangeLastDay)}
            </b>
            <small>2 semanas · planificación editorial</small>
          </div>
          <div className="toolbar-filters">
            <label>
              <span>Unidad</span>
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="all">Todas</option>
                <option value="workshop">Taller</option>
                <option value="machinery">Maquinaria y vehículos</option>
              </select>
            </label>
            <button
              className="icon-button subtle"
              type="button"
              aria-label="Periodo anterior"
              onClick={() =>
                setRangeStart((current) => {
                  const previous = new Date(current);
                  previous.setDate(previous.getDate() - 14);
                  return previous;
                })
              }
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={setCurrentRange}
            >
              <CalendarDays size={15} /> Volver a esta semana
            </button>
            <button
              className="icon-button subtle"
              type="button"
              aria-label="Periodo siguiente"
              onClick={() =>
                setRangeStart((current) => {
                  const next = new Date(current);
                  next.setDate(next.getDate() + 14);
                  return next;
                })
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="schedule-list">
          {pieces.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={24} />
              <b>Sin contenido en este periodo</b>
              <span>Programa una pieza o cambia el rango de fechas.</span>
            </div>
          ) : pieces.map((item) => {
            const scheduledAt = new Date(item.scheduledAt);
            const day = new Intl.DateTimeFormat("es-PE", { weekday: "short" })
              .format(scheduledAt)
              .replace(".", "");
            const color = item.businessUnit === "workshop" ? "lime" : "red";
            const domainItem = domainContent.find((piece) => piece.id === item.id);
            return <article className="schedule-row" key={item.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const draggedId = event.dataTransfer.getData("text/plain"); if (draggedId) updateSchedule(draggedId, item.scheduledAt); }}>
              <div className="schedule-date">
                <b>{String(scheduledAt.getUTCDate()).padStart(2, "0")}</b>
                <span>{day}</span>
              </div>
              <i className={`schedule-color color-${color}`} />
              <div className="schedule-content">
                <div>
                  <span className={`format-label format-${color}`}>
                    {item.format}
                  </span>
                  <span className="schedule-unit">
                    {item.businessUnit === "workshop" ? "Taller" : "Ventas"}
                  </span>
                </div>
                <input aria-label="Título de contenido" value={domainItem?.titulo ?? item.title} onChange={(event) => updateContent(item.id, { titulo: event.target.value })} />
                <small>
                  {item.pillar} · {item.owner}
                </small>
              </div>
              <span className="schedule-status">
                <i />
                {item.status === "in_progress" ? "En producción" : "Planificado"}
              </span>
              {domainItem && <select aria-label={`Estado de ${item.title}`} value={domainItem.estado} onChange={(event) => updateContent(item.id, { estado: event.target.value as Contenido["estado"] })}><option value="IDEA">Idea</option><option value="GUION">Guion</option><option value="GRABADO">Grabado</option><option value="EDITADO">Editado</option><option value="PROGRAMADO">Programado</option><option value="PUBLICADO">Publicado</option></select>}
              <button
                className="icon-button subtle"
                type="button"
                aria-label={`Abrir ${item.title}`}
              >
                <ArrowRight size={15} />
              </button>
              <button className="icon-button subtle" aria-label={`Eliminar ${item.title}`} onClick={() => removeContent(item.id)}><Trash2 size={14} /></button>
            </article>;
          })}
        </div>
        <div className="calendar-foot">
          <span>
            <i className="legend-dot lime" /> Taller
          </span>
          <span>
            <i className="legend-dot red" /> Maquinaria / vehículos
          </span>
          <span>Planificación de contenido</span>
        </div>
      </section>
    </div>
  );
}
function CalendarTarget({
  icon: Icon,
  title,
  goal,
  note,
  tone,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  goal: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="calendar-target">
      <span className={`target-icon target-${tone}`}>
        <Icon size={17} />
      </span>
      <span>
        <b>{title}</b>
        <small>{goal}</small>
      </span>
      <span className="target-review">{note}</span>
    </div>
  );
}

function TasksPage() {
  const { domainTasks, createTask, updateTask, removeTask } = useTasks();
  const { domain: catalog } = useCatalog();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [module, setModule] = useState<Tarea["modulo"]>("CONTENIDO");
  const filtered = domainTasks.filter((task) =>
    (statusFilter === "ALL" || task.estado === statusFilter) &&
    (ownerFilter === "ALL" || task.asignadoA === ownerFilter),
  );
  const addTask = () => {
    if (!title.trim() || !assignee) return;
    createTask({ titulo: title.trim(), asignadoA: assignee, prioridad: "MEDIA", fechaLimite: null, estado: "PENDIENTE", modulo: module });
    setTitle("");
  };
  return (
    <div className="page-content">
      <PageHeading eyebrow="EJECUCIÓN · RESPONSABLES" title="Tareas" subtitle={`${domainTasks.length} tareas registradas.`} />
      <DemoNotice />
      <section className="panel">
        <div className="table-toolbar">
          <h2>Seguimiento de tareas</h2>
          <div className="toolbar-filters">
            <label>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos</option><option value="PENDIENTE">Pendiente</option><option value="EN_PROGRESO">En progreso</option><option value="COMPLETADA">Completada</option></select></label>
            <label>Responsable<select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="ALL">Todos</option>{catalog.users.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select></label>
          </div>
        </div>
        <div className="task-create-row">
          <input aria-label="Nueva tarea" placeholder="Nueva tarea..." value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} />
          <select aria-label="Asignar a" value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">Selecciona responsable</option>{catalog.users.filter((user) => user.activo).map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select>
          <select aria-label="Módulo" value={module} onChange={(event) => setModule(event.target.value as Tarea["modulo"])}><option value="CONTENIDO">Contenido</option><option value="CRM">CRM</option><option value="WHATSAPP">WhatsApp</option><option value="MARKETPLACE">Marketplace</option><option value="CAMPANAS">Campañas</option></select>
          <button type="button" className="button button-primary" onClick={addTask} disabled={!title.trim() || !assignee}><Plus size={15} /> Agregar</button>
        </div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>TAREA</th><th>RESPONSABLE</th><th>MÓDULO</th><th>PRIORIDAD</th><th>ESTADO</th><th></th></tr></thead><tbody>
          {filtered.map((task) => <tr key={task.id}><td><b>{task.titulo}</b></td><td><select value={task.asignadoA} onChange={(event) => updateTask(task.id, { asignadoA: event.target.value })}>{catalog.users.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}</select></td><td>{task.modulo}</td><td>{task.prioridad}</td><td><select value={task.estado} onChange={(event) => updateTask(task.id, { estado: event.target.value as Tarea["estado"] })}><option value="PENDIENTE">Pendiente</option><option value="EN_PROGRESO">En progreso</option><option value="COMPLETADA">Completada</option></select></td><td><button className="icon-button subtle" aria-label={`Eliminar ${task.titulo}`} onClick={() => removeTask(task.id)}><Trash2 size={14} /></button></td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  );
}

function ProspectingPage() {
  const { prospects, domainProspects, addProspect, updateProspect, removeProspect } = useProspects();
  const { catalog } = useCatalog();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<ProspectInput | undefined>();
  const prospectGoal = catalog?.goals.find((goal) => goal.id === "companies-monthly")?.target ?? 0;
  const prospectProgress = prospectGoal ? Math.min(100, Math.round((prospects.length / prospectGoal) * 100)) : 0;
  const add = async (input: ProspectInput) => {
    if (editingId) {
      const status = input.status === "identified" ? "NUEVO" : input.status === "interested" ? "INTERESADO" : input.status === "follow_up" ? "SEGUIMIENTO" : input.status === "closed" ? "CERRADO" : input.status === "lost" ? "PERDIDO" : "CONTACTADO";
      updateProspect(editingId, {
        nombre: input.company,
        rubro: input.industry,
        ciudad: input.city,
        contacto: input.contact,
        telefono: input.phone,
        necesidad: input.need,
        estado: status,
        proximaAccion: input.nextAction,
      });
    } else {
      addProspect(input);
    }
    setEditingId(null);
    setEditingValues(undefined);
    setOpen(false);
  };
  const edit = (id: string) => {
    const item = domainProspects.find((prospect) => prospect.id === id);
    if (!item) return;
    setEditingId(id);
    setEditingValues({
      company: item.nombre,
      industry: item.rubro,
      city: item.ciudad,
      contact: item.contacto,
      phone: item.telefono,
      need: item.necesidad,
      status: item.estado === "NUEVO" ? "identified" : item.estado === "INTERESADO" ? "interested" : item.estado === "SEGUIMIENTO" ? "follow_up" : item.estado === "CERRADO" ? "closed" : item.estado === "PERDIDO" ? "lost" : "contacted",
      nextAction: item.proximaAccion,
    });
    setOpen(true);
  };
  const rows = prospects.filter((item) =>
    `${item.company} ${item.city} ${item.industry}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="DESARROLLO DE CUENTAS"
        title="Prospección comercial"
        subtitle={`Meta de ${prospectGoal} empresas al mes · registra el contacto, estado y próxima acción.`}
        action={
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setEditingValues(undefined);
              setOpen(true);
            }}
          >
            <Plus size={17} /> Agregar empresa
          </button>
        }
      />
      <DemoNotice />
      <div className="prospect-target">
        <div>
          <span className="target-ring">
            <Target size={22} />
          </span>
          <span>
            <b>Meta: {prospectGoal} empresas nuevas / mes</b>
            <small>
              Taller · flotas &nbsp;·&nbsp; Equipos · constructoras, minería y
              transporte
            </small>
          </span>
        </div>
        <div className="target-number">
          <strong>{prospects.length}</strong>
          <span>/ {prospectGoal}</span>
          <small>este mes</small>
        </div>
        <Progress percent={prospectProgress} color="green" />
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <div>
            <p className="eyebrow">
              BASE DE CUENTAS · {prospects.length} REGISTROS
            </p>
            <h2>Empresas por próxima acción</h2>
          </div>
          <div className="search-field search-compact">
            <Search size={16} />
            <input
              placeholder="Buscar empresa o ciudad"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>EMPRESA</th>
                <th>RUBRO · CIUDAD</th>
                <th>CONTACTO</th>
                <th>NECESIDAD</th>
                <th>ESTADO</th>
                <th>PRÓXIMA ACCIÓN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{item.company}</b>
                  </td>
                  <td>
                    {item.industry}
                    <small className="cell-subtitle">{item.city}</small>
                  </td>
                  <td>
                    {item.contact}
                    <small className="cell-subtitle">{item.phone}</small>
                  </td>
                  <td>{item.need}</td>
                  <td>
                    <select value={item.status} onChange={(event) => {
                      const next = event.target.value as ProspectInput["status"];
                      const status = next === "identified" ? "NUEVO" : next === "interested" ? "INTERESADO" : next === "follow_up" ? "SEGUIMIENTO" : next === "closed" ? "CERRADO" : next === "lost" ? "PERDIDO" : "CONTACTADO";
                      updateProspect(item.id, { estado: status });
                    }}>
                      <option value="identified">Nueva</option><option value="contacted">Contactada</option><option value="interested">Interesada</option><option value="follow_up">Seguimiento</option><option value="closed">Cerrada</option><option value="lost">Perdida</option>
                    </select>
                  </td>
                  <td>
                    <input aria-label={`Próxima acción de ${item.company}`} value={item.nextAction} onChange={(event) => updateProspect(item.id, { proximaAccion: event.target.value })} />
                  </td>
                  <td>
                    <button className="icon-button subtle" aria-label={`Editar ${item.company}`} onClick={() => edit(item.id)}><Pencil size={14} /></button>
                    <button className="icon-button subtle" aria-label={`Eliminar ${item.company}`} onClick={() => removeProspect(item.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {open && <ProspectDialog close={() => { setOpen(false); setEditingId(null); }} save={add} initial={editingValues} />}
    </div>
  );
}

function ChannelsPage() {
  const { checklist, marketplace, toggle } = useChannels();
  const { catalog, domain } = useCatalog();
  const salesOwner = domain.users.find((user) => user.rol === "VENTAS");
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="WHATSAPP BUSINESS · MARKETPLACE"
        title="Canales y activos"
        subtitle="Canales de venta con responsables, tiempos y resultados revisables cada semana."
      />
      <DemoNotice />
      <section className="channel-sla">
        <span className="sla-icon">
          <Clock3 size={20} />
        </span>
        <div>
          <p className="eyebrow">ACUERDO DE ATENCIÓN</p>
          <h2>Responder en menos de 10 minutos</h2>
          <p>
            Horario comercial · asesor de servicio del taller + WhatsApp de
            Ventas
          </p>
        </div>
        <span className="sla-owner">
          {salesOwner && (
            <Avatar
              initials={salesOwner.nombre.slice(0, 2).toUpperCase()}
              tone="lucero"
            />
          )}
          <span>
            <b>{salesOwner?.nombre ?? "Sin responsable asignado"}</b>
            <small>Responsable comercial</small>
          </span>
        </span>
      </section>
      <div className="channel-grid">
        <section className="panel channel-panel">
          <ChannelTitle
            icon={MessageCircle}
            title="WhatsApp Business"
            eyebrow="ATENCIÓN COMERCIAL"
            count={`${checklist.filter((item) => item.completed).length}/${checklist.length} configurados`}
            tone="whatsapp"
          />
          <p className="channel-intro">
            Registra el canal de origen y el tiempo de respuesta de cada lead.
          </p>
          <div className="checklist">
            {checklist.map((item, index) => (
              <button
                className="checklist-row"
                type="button"
                key={item.id}
                onClick={() => void toggle(item.id, "checklist")}
              >
                <span
                  className={`task-check ${item.completed ? "checked" : ""}`}
                >
                  {item.completed && <Check size={13} />}
                </span>
                {item.label}
                {index === checklist.length - 1 && (
                  <span className="label-count">{catalog?.whatsappLabels.length ?? 8} etiquetas</span>
                )}
              </button>
            ))}
          </div>
          <div className="tag-cloud">
            {(catalog?.whatsappLabels ?? []).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </section>
        <section className="panel channel-panel marketplace-panel">
          <ChannelTitle
            icon={Store}
            title="Marketplace"
            eyebrow="CANAL DE VENTA"
            count="Revisión semanal"
            tone="marketplace"
          />
          <p className="channel-intro">
            Publicación activa, consultas y resultados. No solo vitrina de
            unidades.
          </p>
          <div className="marketplace-list">
            {marketplace.map((asset, index) => (
              <div className="marketplace-row" key={asset.id}>
                <span className={`marketplace-thumb thumb-${index}`}>
                  <PackageCheck size={18} />
                </span>
                <span>
                  <b>{asset.label}</b>
                  <small>{asset.detail}</small>
                </span>
                <span className="marketplace-state">
                  <i />
                  {asset.published ? "Publicado" : "Por publicar"}
                </span>
                <button
                  className="icon-button subtle"
                  type="button"
                  aria-label={`Cambiar estado ${asset.label}`}
                  onClick={() => void toggle(asset.id, "marketplace")}
                >
                  <Check size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="marketplace-review">
            <CalendarDays size={15} />
            <span>
              <b>Revisión semanal obligatoria</b>
              <small>
                Publicaciones · consultas · seguimiento · resultados
              </small>
            </span>
            <Link className="text-button" to="/marketplace">
              Revisar <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <section className="panel audiovisual-panel">
        <PanelTitle
          eyebrow="ARCHIVOS · ORGANIZACIÓN POR UNIDAD"
          title="Banco audiovisual"
          action={
            <Link className="button button-secondary" to="/assets">
              <Plus size={16} /> Registrar activo
            </Link>
          }
        />
        <div className="asset-folders">
          <AssetFolder
            icon={Wrench}
            title="Taller automotriz"
            detail={catalog?.products.filter((product) => product.businessUnit === "workshop").map((product) => product.name).join(" · ") ?? ""}
            count={`${catalog?.products.filter((product) => product.businessUnit === "workshop").length ?? 0} productos`}
          />
          <AssetFolder
            icon={PackageCheck}
            title="Ventas y equipos"
            detail={catalog?.products.filter((product) => product.businessUnit === "machinery").map((product) => product.name).join(" · ") ?? ""}
            count={`${catalog?.products.filter((product) => product.businessUnit === "machinery").length ?? 0} productos`}
          />
        </div>
      </section>
    </div>
  );
}

function MarketplacePage() {
  const { publications, products, repo } = useMarketplace();
  const [adding, setAdding] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const addPublication = () => {
    if (!productId || !title.trim()) return;
    repo.create({ productoId: productId, titulo: title.trim(), descripcion: description, precio: price, estado: "BORRADOR", fechaPublicacion: null, consultas: 0, ultimaRevision: new Date().toISOString().slice(0, 10) });
    setTitle(""); setDescription(""); setPrice(0); setAdding(false);
  };
  return (
    <div className="page-content">
      <PageHeading eyebrow="VENTA DE UNIDADES" title="Marketplace" subtitle={`${publications.length} publicaciones registradas.`} action={<button className="button button-primary" onClick={() => setAdding((current) => !current)}><Plus size={16} /> Nueva publicación</button>} />
      <DemoNotice />
      {adding && <section className="panel market-create-form"><select aria-label="Producto" value={productId} onChange={(event) => setProductId(event.target.value)}>{products.filter((product) => product.categoria !== "SERVICIO_TALLER").map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select><input placeholder="Título de publicación" value={title} onChange={(event) => setTitle(event.target.value)} /><input placeholder="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} /><input aria-label="Precio" type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} /><button className="button button-primary" onClick={addPublication}>Guardar</button></section>}
      <section className="panel">
        <div className="table-toolbar"><div><p className="eyebrow">INVENTARIO PUBLICADO · {publications.length}</p><h2>Unidades en Marketplace</h2></div></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>PUBLICACIÓN</th><th>PRECIO</th><th>CONSULTAS</th><th>ESTADO</th><th>REVISIÓN</th><th></th></tr></thead><tbody>
          {publications.map((publication) => {
            const age = Math.floor((Date.now() - new Date(`${publication.ultimaRevision}T00:00:00`).getTime()) / 86_400_000);
            const pendingReview = age >= 7;
            return <tr key={publication.id}><td><b>{publication.titulo}</b><small className="cell-subtitle">{products.find((product) => product.id === publication.productoId)?.nombre}</small></td><td><label className="inline-money"><span>{products.find((product) => product.id === publication.productoId)?.moneda === "USD" ? "US$" : "S/"}</span><input aria-label={`Precio ${publication.titulo}`} type="number" min="0" value={publication.precio} onChange={(event) => repo.update(publication.id, { precio: Number(event.target.value) })} /></label></td><td>{publication.consultas}</td><td><select value={publication.estado} onChange={(event) => repo.setStatus(publication.id, event.target.value as typeof publication.estado)}><option value="BORRADOR">Borrador</option><option value="PUBLICADO">Publicado</option><option value="PAUSADO">Pausado</option><option value="VENDIDO">Vendido</option></select></td><td>{pendingReview ? <span className="sla-badge">Pendiente revisión</span> : publication.ultimaRevision}</td><td><button className="icon-button subtle" aria-label={`Eliminar ${publication.titulo}`} onClick={() => repo.remove(publication.id)}><Trash2 size={14} /></button></td></tr>;
          })}
        </tbody></table></div>
      </section>
    </div>
  );
}

function WhatsAppPage() {
  const { conversations } = useWhatsApp();
  const { updateLeadStatus } = useMarketing();
  return (
    <div className="page-content">
      <PageHeading eyebrow="ATENCIÓN COMERCIAL · SLA 10 MIN" title="WhatsApp" subtitle={`${conversations.length} conversaciones desde los leads con canal WhatsApp.`} />
      <DemoNotice />
      <section className="panel">
        <div className="table-toolbar"><div><p className="eyebrow">CONVERSACIONES · {conversations.length}</p><h2>Seguimiento de primera respuesta</h2></div></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>CONTACTO</th><th>INGRESO</th><th>ESTADO</th><th>PRIMERA RESPUESTA</th><th>SLA</th></tr></thead><tbody>
          {conversations.map((conversation) => {
            const elapsedMinutes = Math.max(
              0,
              Math.floor((Date.now() - new Date(conversation.date).getTime()) / 60_000),
            );
            const overSla = !conversation.contactedAt && elapsedMinutes > 10;
            return <tr key={conversation.id}><td><b>{conversation.name}</b><small className="cell-subtitle">{conversation.phone} · {conversation.city}</small></td><td>{new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(conversation.date))}</td><td><select value={conversation.status} onChange={(event) => void updateLeadStatus(conversation.id, event.target.value as LeadStatus)}>{Object.entries(leadStatusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></td><td>{conversation.contactedAt ? new Intl.DateTimeFormat("es-PE", { timeStyle: "short" }).format(new Date(conversation.contactedAt)) : <button className="button button-secondary" onClick={() => void updateLeadStatus(conversation.id, "contacted")}>Marcar respuesta</button>}</td><td>{overSla ? <span className="sla-badge sla-overdue">SLA excedido · {elapsedMinutes} min</span> : conversation.contactedAt ? <span className="sla-good">Respondido</span> : <span>{elapsedMinutes} / 10 min</span>}</td></tr>;
          })}
        </tbody></table></div>
      </section>
    </div>
  );
}

function AudiovisualPage() {
  const { assets, products, repo } = useAudiovisual();
  const [productFilter, setProductFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"FOTO" | "VIDEO" | "GRAFICA">("VIDEO");
  const filtered = assets.filter((asset) =>
    (productFilter === "ALL" || asset.productoId === productFilter) &&
    (typeFilter === "ALL" || asset.tipo === typeFilter),
  );
  const addAsset = () => {
    if (!name.trim()) return;
    repo.create({ nombre: name.trim(), productoId: productId || null, tipo: type });
    setName("");
  };
  return (
    <div className="page-content">
      <PageHeading eyebrow="PRODUCCIÓN · REUTILIZACIÓN" title="Banco audiovisual" subtitle={`${assets.length} recursos audiovisuales disponibles.`} />
      <DemoNotice />
      <section className="panel">
        <div className="table-toolbar"><h2>Assets</h2><div className="toolbar-filters"><label>Producto<select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}><option value="ALL">Todos</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select></label><label>Tipo<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="ALL">Todos</option><option value="FOTO">Foto</option><option value="VIDEO">Video</option><option value="GRAFICA">Gráfica</option></select></label></div></div>
        <div className="asset-create-row"><input placeholder="Nombre del asset" value={name} onChange={(event) => setName(event.target.value)} /><select aria-label="Producto del asset" value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Sin producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select><select aria-label="Tipo de asset" value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="VIDEO">Video</option><option value="FOTO">Foto</option><option value="GRAFICA">Gráfica</option></select><button className="button button-primary" onClick={addAsset}><Plus size={15} /> Agregar</button></div>
        {filtered.length ? <div className="asset-grid">{filtered.map((asset) => <article className="asset-card" key={asset.id}><span className="asset-card-icon"><Film size={22} /></span><input aria-label="Nombre de asset" value={asset.nombre} onChange={(event) => repo.update(asset.id, { nombre: event.target.value })} /><small>{products.find((product) => product.id === asset.productoId)?.nombre ?? "Sin producto"} · {asset.tipo}</small><div><span>Usado {asset.vecesUsado} veces</span><button className="button button-secondary" onClick={() => repo.markUsed(asset.id)}>Marcar usado</button><button className="icon-button subtle" aria-label={`Eliminar ${asset.nombre}`} onClick={() => repo.remove(asset.id)}><Trash2 size={14} /></button></div></article>)}</div> : <div className="empty-state"><Film size={24} /><b>{assets.length ? "No hay assets en este filtro" : "Aún no hay assets"}</b><span>Agrega materiales audiovisuales para empezar a organizar su uso.</span></div>}
      </section>
    </div>
  );
}

function AdminPage() {
  const { domain, repo } = useCatalog();
  const [tab, setTab] = useState<"products" | "users" | "channels" | "goals" | "labels">("products");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Producto["categoria"]>("SERVICIO_TALLER");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState<Producto["moneda"]>("PEN");
  const [role, setRole] = useState<User["rol"]>("EDITOR");
  const [hours, setHours] = useState(40);
  const [channelType, setChannelType] = useState<Canal["tipo"]>("INSTAGRAM");
  const [period, setPeriod] = useState(() => localMonthInputValue());
  const [module, setModule] = useState<Meta["modulo"]>("TALLER");
  const [target, setTarget] = useState(0);
  const [actual, setActual] = useState(0);
  useEffect(() => {
    if (window.location.hash === "#channels") setTab("channels");
  }, []);
  const add = () => {
    if (!name.trim()) return;
    if (tab === "products") repo.createProducto({ nombre: name.trim(), categoria: category, precio: price || null, moneda: currency, precioNota: "", fichaTecnica: "", disponible: true });
    if (tab === "users") repo.createUsuario({ nombre: name.trim(), rol: role, capacidadHorasSemana: hours, activo: true });
    if (tab === "channels") repo.createCanal({ nombre: name.trim(), tipo: channelType });
    if (tab === "labels") repo.createEtiqueta({ nombre: name.trim() });
    if (tab === "goals") repo.createMeta({ periodo: period, modulo: module, indicador: name.trim(), valorObjetivo: target, valorReal: actual });
    setName(""); setPrice(0);
  };
  return (
    <div className="page-content">
      <PageHeading eyebrow="CONFIGURACIÓN" title="Administración" subtitle="Administra productos, equipo, canales, metas y etiquetas." />
      <DemoNotice />
      <section className="panel admin-panel">
        <div className="admin-tabs" role="tablist">{([ ["products", "Productos"], ["users", "Usuarios"], ["channels", "Canales"], ["goals", "Metas"], ["labels", "Etiquetas"] ] as const).map(([key, label]) => <button id={key === "channels" ? "channels" : undefined} key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label} <small>{key === "products" ? domain.products.length : key === "users" ? domain.users.length : key === "channels" ? domain.channels.length : key === "goals" ? domain.goals.length : domain.labels.length}</small></button>)}</div>
        {tab === "channels" && (
          <p className="page-subtitle">
            Estos canales aparecerán en “Canal de origen” al registrar un lead.
            Agrega el nombre que quieres ver, por ejemplo “WhatsApp Taller” o
            “Instagram RGR”.
          </p>
        )}
        <div className="admin-create-row"><input placeholder={tab === "products" ? "Nombre del producto" : tab === "users" ? "Nombre del usuario" : tab === "channels" ? "Nombre de canal" : tab === "labels" ? "Nombre de etiqueta" : "Indicador de meta"} value={name} onChange={(event) => setName(event.target.value)} />
          {tab === "products" && <><select value={category} onChange={(event) => setCategory(event.target.value as Producto["categoria"])}><option value="SERVICIO_TALLER">Servicio taller</option><option value="MAQUINARIA">Maquinaria</option><option value="VEHICULO">Vehículo</option><option value="CAMION">Camión</option></select><input aria-label="Precio" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} /><select value={currency} onChange={(event) => setCurrency(event.target.value as Producto["moneda"])}><option>PEN</option><option>USD</option></select></>}
          {tab === "users" && <><select value={role} onChange={(event) => setRole(event.target.value as User["rol"])}><option>ADMIN</option><option>EDITOR</option><option>VENTAS</option><option>GERENCIA</option></select><input aria-label="Horas por semana" type="number" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></>}
          {tab === "channels" && <select value={channelType} onChange={(event) => setChannelType(event.target.value as Canal["tipo"])}><option>INSTAGRAM</option><option>TIKTOK</option><option>FACEBOOK</option><option>MARKETPLACE</option><option>WHATSAPP</option></select>}
          {tab === "goals" && <><input type="month" aria-label="Periodo" value={period} onChange={(event) => setPeriod(event.target.value)} /><select value={module} onChange={(event) => setModule(event.target.value as Meta["modulo"])}><option>TALLER</option><option>MAQUINARIA</option><option>PROSPECCION</option></select><input aria-label="Valor objetivo" type="number" value={target} onChange={(event) => setTarget(Number(event.target.value))} /><input aria-label="Valor real" type="number" value={actual} onChange={(event) => setActual(Number(event.target.value))} /></>}
          <button className="button button-primary" onClick={add}><Plus size={15} /> Agregar</button></div>
        {tab === "products" && <div className="table-scroll"><table className="data-table"><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>DISPONIBLE</th><th></th></tr></thead><tbody>{domain.products.map((item) => <tr key={item.id}><td><input value={item.nombre} onChange={(event) => repo.updateProducto(item.id, { nombre: event.target.value })} /></td><td><select value={item.categoria} onChange={(event) => repo.updateProducto(item.id, { categoria: event.target.value as Producto["categoria"] })}><option>SERVICIO_TALLER</option><option>MAQUINARIA</option><option>VEHICULO</option><option>CAMION</option></select></td><td><input type="number" value={item.precio ?? ""} onChange={(event) => repo.updateProducto(item.id, { precio: event.target.value === "" ? null : Number(event.target.value) })} /></td><td><input type="checkbox" checked={item.disponible} onChange={(event) => repo.updateProducto(item.id, { disponible: event.target.checked })} /></td><td><button className="icon-button subtle" onClick={() => repo.removeProducto(item.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
        {tab === "users" && <div className="table-scroll"><table className="data-table"><thead><tr><th>USUARIO</th><th>ROL</th><th>HORAS/SEMANA</th><th>ACTIVO</th><th></th></tr></thead><tbody>{domain.users.map((item) => <tr key={item.id}><td><input value={item.nombre} onChange={(event) => repo.updateUsuario(item.id, { nombre: event.target.value })} /></td><td><select value={item.rol} onChange={(event) => repo.updateUsuario(item.id, { rol: event.target.value as User["rol"] })}><option>ADMIN</option><option>EDITOR</option><option>VENTAS</option><option>GERENCIA</option></select></td><td><input type="number" value={item.capacidadHorasSemana} onChange={(event) => repo.updateUsuario(item.id, { capacidadHorasSemana: Number(event.target.value) })} /></td><td><input type="checkbox" checked={item.activo} onChange={(event) => repo.updateUsuario(item.id, { activo: event.target.checked })} /></td><td><button className="icon-button subtle" onClick={() => repo.removeUsuario(item.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
        {tab === "channels" && <div className="table-scroll"><table className="data-table"><thead><tr><th>CANAL</th><th>TIPO</th><th></th></tr></thead><tbody>{domain.channels.map((item) => <tr key={item.id}><td><input value={item.nombre} onChange={(event) => repo.updateCanal(item.id, { nombre: event.target.value })} /></td><td><select value={item.tipo} onChange={(event) => repo.updateCanal(item.id, { tipo: event.target.value as Canal["tipo"] })}><option>INSTAGRAM</option><option>TIKTOK</option><option>FACEBOOK</option><option>MARKETPLACE</option><option>WHATSAPP</option></select></td><td><button className="icon-button subtle" onClick={() => repo.removeCanal(item.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
        {tab === "labels" && <div className="table-scroll"><table className="data-table"><thead><tr><th>ETIQUETA</th><th></th></tr></thead><tbody>{domain.labels.map((item) => <tr key={item.id}><td><input value={item.nombre} onChange={(event) => repo.updateEtiqueta(item.id, { nombre: event.target.value })} /></td><td><button className="icon-button subtle" onClick={() => repo.removeEtiqueta(item.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
        {tab === "goals" && <div className="table-scroll"><table className="data-table"><thead><tr><th>PERIODO</th><th>MÓDULO</th><th>INDICADOR</th><th>OBJETIVO</th><th>REAL</th><th></th></tr></thead><tbody>{domain.goals.map((item) => <tr key={item.id}><td><input type="month" value={item.periodo} onChange={(event) => repo.updateMeta(item.id, { periodo: event.target.value })} /></td><td><select value={item.modulo} onChange={(event) => repo.updateMeta(item.id, { modulo: event.target.value as Meta["modulo"] })}><option>TALLER</option><option>MAQUINARIA</option><option>PROSPECCION</option></select></td><td><input value={item.indicador} onChange={(event) => repo.updateMeta(item.id, { indicador: event.target.value })} /></td><td><input type="number" value={item.valorObjetivo} onChange={(event) => repo.updateMeta(item.id, { valorObjetivo: Number(event.target.value) })} /></td><td><input type="number" value={item.valorReal} onChange={(event) => repo.updateMeta(item.id, { valorReal: Number(event.target.value) })} /></td><td><button className="icon-button subtle" onClick={() => repo.removeMeta(item.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
function ChannelTitle({
  icon: Icon,
  title,
  eyebrow,
  count,
  tone,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  eyebrow: string;
  count: string;
  tone: string;
}) {
  return (
    <div className="channel-heading">
      <span className={`channel-logo ${tone}-logo`}>
        <Icon size={20} />
      </span>
      <span>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </span>
      <span className="setup-pill">{count}</span>
    </div>
  );
}
function AssetFolder({
  icon: Icon,
  title,
  detail,
  count,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  detail: string;
  count: string;
}) {
  return (
    <Link className="asset-folder" to="/assets">
      <span className="asset-icon">
        <Icon size={19} />
      </span>
      <span>
        <b>{title}</b>
        <small>{detail}</small>
      </span>
      <span className="asset-count">{count}</span>
      <ArrowRight size={15} />
    </Link>
  );
}

function ReportsPage() {
  const { leads } = useMarketing();
  const { prospects } = useProspects();
  const { campaigns } = useCampaigns();
  const { content } = useContent();
  const { tasks } = useTasks();
  const { checklist, marketplace } = useChannels();
  const { catalog } = useCatalog();
  const sessionUser = useUiStore((state) => state.sessionUser);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEndExclusive = new Date(weekStart);
  weekEndExclusive.setDate(weekEndExclusive.getDate() + 7);
  const weekEnd = new Date(weekEndExclusive);
  weekEnd.setDate(weekEnd.getDate() - 1);
  const reportLeads = leads.filter((lead) => {
    const date = new Date(lead.date);
    return date >= weekStart && date < weekEndExclusive;
  });
  const reportContent = content.filter((piece) => {
    const date = new Date(piece.scheduledAt);
    return date >= weekStart && date < weekEndExclusive;
  });
  const formatReportDate = (date: Date) =>
    new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(date);
  const reportAuthor =
    sessionUser?.name ??
    catalog?.users.find((user) => user.role === "ADMIN")?.name ??
    "Equipo de marketing";
  const workshop = reportLeads.filter((lead) => lead.businessUnit === "workshop");
  const machinery = reportLeads.filter((lead) => lead.businessUnit === "machinery");
  const sales = workshop.filter((lead) => lead.sold);
  const revenue = sales.reduce(
    (sum, lead) => sum + Number(lead.amount ?? 0),
    0,
  );
  const [reportSavedAt, setReportSavedAt] = useState<string | null>(null);
  const [savingReport, setSavingReport] = useState(false);
  const [reportSaveError, setReportSaveError] = useState("");
  const canManageReport = ["ADMIN", "MANAGEMENT"].includes(sessionUser?.role ?? "");
  const weekStarting = new Date(
    Date.UTC(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate(),
    ),
  ).toISOString();

  useEffect(() => {
    if (!canManageReport) return;
    let active = true;
    void apiRequest<{
      weekStarting: string;
      createdAt: string;
      metrics: { generatedAt?: string };
    } | null>(
      "/api/reports/latest",
    )
      .then((report) => {
        if (active && report?.weekStarting === weekStarting)
          setReportSavedAt(report.metrics.generatedAt ?? report.createdAt);
      })
      .catch((error: unknown) => {
        if (active)
          setReportSaveError(
            error instanceof Error
              ? error.message
              : "No se pudo consultar el estado del reporte",
          );
      });
    return () => {
      active = false;
    };
  }, [canManageReport, weekStarting]);
  const reportSections = [
    {
      n: "01",
      title: "Marketing",
      icon: Megaphone,
      lines: [
        `${reportContent.filter((piece) => piece.status === "planned").length} piezas planificadas para esta semana.`,
        `Campañas: ${campaigns.map((campaign) => `${campaign.name} (${campaign.status})`).join(" · ") || "ninguna"}.`,
        `Presupuesto asignado: S/ ${campaigns.reduce((sum, campaign) => sum + campaign.budget, 0).toLocaleString("es-PE")} · revisar consultas y calidad.`,
      ],
    },
    {
      n: "02",
      title: "Taller automotriz",
      icon: Wrench,
      lines: [
        `${workshop.length} leads recibidos esta semana · origen registrado por consulta.`,
        `${workshop.filter((lead) => lead.appointment).length} citas · ${workshop.filter((lead) => lead.arrived).length} vehículos llegaron al taller.`,
        `${sales.length} ventas · S/ ${revenue.toLocaleString("es-PE")} atribuibles a los leads de esta semana.`,
      ],
    },
    {
      n: "03",
      title: "Maquinaria, vehículos y camiones",
      icon: PackageCheck,
      lines: [
        `${machinery.length} consultas recibidas esta semana · meta mensual: ${catalog?.goals.find((goal) => goal.id === "qualified-leads-monthly")?.target ?? 0} leads calificados.`,
        catalog?.products.filter((product) => product.businessUnit === "machinery").map((product) => product.name).join(" · ") ?? "",
        "Cotizaciones, ciudad, plazo de compra y próxima acción por oportunidad.",
      ],
    },
    {
      n: "04",
      title: "WhatsApp",
      icon: MessageCircle,
      lines: [
        `${reportLeads.length} leads recibidos esta semana · SLA: menos de 10 minutos.`,
        `${reportLeads.filter((lead) => lead.status !== "new").length} contactados o en gestión · ${reportLeads.filter((lead) => lead.status === "new").length} pendientes.`,
        `${checklist.filter((item) => item.completed).length}/${checklist.length} puntos de configuración completos · ${marketplace.filter((item) => item.published).length}/${marketplace.length} publicaciones activas.`,
      ],
    },
    {
      n: "05",
      title: "Prospección",
      icon: BriefcaseBusiness,
      lines: [
        `${prospects.length} cuentas en cartera · meta mensual: ${catalog?.goals.find((goal) => goal.id === "companies-monthly")?.target ?? 0} empresas nuevas.`,
        "Segmentar flotas, constructoras, minería, transporte, contratistas y obras.",
        "Cada cuenta debe tener contacto, necesidad, estado y próxima acción.",
      ],
    },
    {
      n: "06",
      title: "Próxima semana",
      icon: CalendarDays,
      lines: [
        `${tasks.filter((task) => !task.completed).length} tareas iniciales pendientes de ejecución.`,
        `${reportContent.filter((piece) => piece.status !== "published").length} piezas de contenido pendientes de publicación esta semana.`,
        "Ventas prioriza leads con cita, cotización y seguimiento pendiente.",
      ],
    },
  ];
  const saveReport = async () => {
    setSavingReport(true);
    setReportSaveError("");
    try {
      const savedReport = await apiRequest<{
        createdAt: string;
        metrics: { generatedAt?: string };
      }>("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          weekStarting,
          metrics: {
            status: "ready_for_review",
            generatedAt: new Date().toISOString(),
            sections: reportSections.map(({ n, title, lines }) => ({
              number: n,
              title,
              lines,
            })),
          },
        }),
      });
      setReportSavedAt(savedReport.metrics.generatedAt ?? savedReport.createdAt);
    } catch (error) {
      setReportSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el reporte",
      );
    } finally {
      setSavingReport(false);
    }
  };
  const download = () => {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["N°", "Sección", "Detalle"],
      ...reportSections.flatMap((item) =>
        item.lines.map((line) => [item.n, item.title, line]),
      ),
    ].map((row) => row.map(escapeCsv).join(","));
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${rows.join("\r\n")}`], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reporte-semanal-${weekStart.toISOString().slice(0, 10)}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="GERENCIA · CORTE SEMANAL"
        title="Reporte semanal"
        subtitle="Ejecución, atribución y oportunidades que requieren acción."
        action={
          <div className="heading-actions">
            <button className="button button-secondary" type="button" onClick={download}><Download size={16} /> Excel (CSV)</button>
            <button className="button button-secondary" type="button" onClick={() => window.print()}><Printer size={16} /> PDF</button>
          </div>
        }
      />
      <div className="report-meta">
        <span>
          <CalendarDays size={15} /> Semana del {formatReportDate(weekStart)} al {formatReportDate(weekEnd)}
        </span>
        <span className="report-state">
          {reportSavedAt ? (
            <>
              <CheckCircle2 size={14} /> Guardado para revisión ·{" "}
              {new Intl.DateTimeFormat("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(reportSavedAt))}
            </>
          ) : canManageReport ? (
            <>Pendiente de guardar</>
          ) : (
            <>Reporte disponible</>
          )}
        </span>
      </div>
      <div className="report-sections">
        {reportSections.map((item) => {
          const Icon = item.icon;
          return (
            <article className="panel report-section" key={item.n}>
              <div className="report-section-head">
                <span className="report-number">{item.n}</span>
                <span className="report-icon">
                  <Icon size={17} />
                </span>
                <h2>{item.title}</h2>
              </div>
              <ul>
                {item.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <div className="report-signoff">
        <span>
          <Avatar initials={reportAuthor.slice(0, 2).toUpperCase()} tone="arturo" />
          <span>
            <b>Preparado por {reportAuthor}</b>
            <small>{sessionUser?.role ?? "Equipo de marketing"} · para Gerencia</small>
          </span>
        </span>
        {canManageReport && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => void saveReport()}
            disabled={savingReport}
          >
            {reportSavedAt ? <CheckCircle2 size={15} /> : <Send size={15} />}
            {savingReport
              ? "Guardando…"
              : reportSavedAt
                ? "Actualizar para revisión"
                : "Guardar para revisión"}
          </button>
        )}
      </div>
      {canManageReport && reportSaveError && (
        <p className="auth-error" role="alert">
          {reportSaveError}
        </p>
      )}
    </div>
  );
}

function LeadDialog({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (input: CreateLeadInput) => Promise<void>;
  initial?: LeadRecord;
}) {
  const { catalog } = useCatalog();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      date: new Date().toISOString(),
      businessUnit: "workshop",
      service: "",
      channel: "",
      city: "",
      appointment: false,
      arrived: false,
      sold: false,
      amount: null,
      product: null,
      need: null,
      company: null,
      purchaseWindow: null,
    },
  });
  useEffect(() => {
    if (!initial) return;
    reset({
      date: initial.date,
      name: initial.name,
      phone: initial.phone,
      businessUnit: initial.businessUnit,
      service: initial.service,
      channel: initial.channel,
      city: initial.city,
      appointment: initial.appointment,
      arrived: initial.arrived,
      sold: initial.sold,
      amount: initial.amount,
      product: initial.product,
      need: initial.need,
      company: initial.company,
      purchaseWindow: initial.purchaseWindow,
    });
  }, [initial, reset]);
  const unit = watch("businessUnit");
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-dialog-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">REGISTRO COMERCIAL</p>
            <h2 id="lead-dialog-title">{initial ? "Editar lead" : "Nuevo lead"}</h2>
            <p>
              {initial
                ? "Actualiza los datos del contacto y guarda los cambios."
                : "Captura el origen y el resultado desde el primer contacto."}
            </p>
          </div>
          <button
            className="icon-button subtle"
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <form
          className="modal-form"
          onSubmit={handleSubmit(async (input) => {
            await onSave(input);
            onClose();
          })}
        >
          <div className="form-grid">
            <Field label="Nombre / empresa *" error={errors.name?.message}>
              <input {...register("name")} placeholder="Nombre del contacto" />
            </Field>
            <Field label="Teléfono *" error={errors.phone?.message}>
              <input
                {...register("phone")}
                placeholder="987 654 321"
                inputMode="tel"
              />
            </Field>
            <Field label="Unidad de negocio *">
              <select {...register("businessUnit")}>
                <option value="workshop">Taller automotriz</option>
                <option value="machinery">
                  Maquinaria / vehículos / camiones
                </option>
              </select>
            </Field>
            <Field
              label={
                unit === "workshop"
                  ? "Servicio consultado *"
                  : "Producto consultado *"
              }
              error={errors.service?.message}
            >
              <input
                {...register("service")}
                placeholder={
                  unit === "workshop"
                    ? "Mantenimiento preventivo"
                    : "CAT 320, L200, Isuzu..."
                }
              />
            </Field>
            <Field label="Canal de origen *" error={errors.channel?.message}>
              {catalog?.channels.length ? (
                <select {...register("channel")}>
                  <option value="">Seleccionar canal</option>
                  {initial &&
                    !catalog.channels.includes(initial.channel) && (
                      <option value={initial.channel}>{initial.channel}</option>
                    )}
                  {catalog.channels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="channel-empty-state">
                  <span>Aún no hay canales configurados.</span>
                  <a href="/admin#channels">Agregar canales</a>
                </div>
              )}
            </Field>
            <Field label={unit === "workshop" ? "Ciudad *" : "Ciudad"} error={errors.city?.message}>
              <input {...register("city")} placeholder="Ciudad" />
            </Field>
            {unit === "machinery" && (
              <>
                <Field
                  label="Necesidad / proyecto *"
                  error={errors.need?.message}
                >
                  <input
                    {...register("need")}
                    placeholder="Uso, empresa o proyecto"
                  />
                </Field>
                <Field label="Empresa">
                  <input {...register("company")} placeholder="Razón social" />
                </Field>
                <Field label="Plazo de compra">
                  <input
                    {...register("purchaseWindow")}
                    placeholder="Este mes, próximo trimestre..."
                  />
                </Field>
              </>
            )}
            <Field label="Fecha del contacto *">
              <input
                type="datetime-local"
                value={localDateTimeInputValue(watch("date"))}
                onChange={(event) => {
                  const date = new Date(event.target.value);
                  if (!Number.isNaN(date.getTime()))
                    setValue("date", date.toISOString());
                }}
              />
            </Field>
            <Field label="Monto de venta · S/">
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("amount", {
                  setValueAs: (value: string) =>
                    value === "" ? null : Number(value),
                })}
                placeholder="Sin venta aún"
              />
            </Field>
          </div>
          <div className="form-checks">
            <label>
              <input type="checkbox" {...register("appointment")} /> Cita
              generada
            </label>
            <label>
              <input type="checkbox" {...register("arrived")} /> Llegó al taller
            </label>
            <label>
              <input type="checkbox" {...register("sold")} /> Venta cerrada
            </label>
          </div>
          <footer className="modal-footer">
            <span>* Obligatorio · origen y servicio siempre identificados</span>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="button button-secondary"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                <Check size={16} /> {initial ? "Guardar cambios" : "Guardar lead"}
              </Button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error && <small className="form-error">{error}</small>}
    </label>
  );
}

function ProspectDialog({
  close,
  save,
  initial,
}: {
  close: () => void;
  save: (input: ProspectInput) => void;
  initial?: ProspectInput;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProspectInput>({
    resolver: zodResolver(prospectSchema),
    defaultValues: initial ?? { status: "identified" },
  });
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal modal-narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospect-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">BASE DE PROSPECCIÓN</p>
            <h2 id="prospect-title">{initial ? "Editar empresa" : "Agregar empresa"}</h2>
            <p>Deja una próxima acción concreta para Ventas.</p>
          </div>
          <button
            className="icon-button subtle"
            type="button"
            aria-label="Cerrar"
            onClick={close}
          >
            <X size={18} />
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit(save)}>
          <div className="form-grid">
            {(
              [
                ["company", "Empresa *"],
                ["industry", "Rubro *"],
                ["city", "Ciudad *"],
                ["contact", "Contacto *"],
                ["phone", "Teléfono *"],
                ["need", "Necesidad *"],
                ["nextAction", "Próxima acción *"],
              ] as const
            ).map(([field, label]) => (
              <Field key={field} label={label} error={errors[field]?.message}>
                <input {...register(field)} />
              </Field>
            ))}
            <Field label="Estado">
              <select {...register("status")}>
                <option value="identified">Identificada</option>
                <option value="contacted">Contactada</option>
                <option value="interested">Interesada</option>
                <option value="follow_up">Seguimiento</option>
                <option value="closed">Cerrada</option>
                <option value="lost">Perdida</option>
              </select>
            </Field>
          </div>
          <footer className="modal-footer">
            <span>Los cambios se sincronizan con el espacio de trabajo.</span>
            <div>
              <button
                className="button button-secondary"
                type="button"
                onClick={close}
              >
                Cancelar
              </button>
              <button className="button button-primary" type="submit">
                <Check size={16} /> {initial ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

const rootRoute = createRootRoute({ component: AppShell });
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: TasksPage,
});
const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leads",
  component: LeadsPage,
});
const prospectingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prospecting",
  component: ProspectingPage,
});
const campaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns",
  component: CampaignsPage,
});
const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/marketplace",
  component: MarketplacePage,
});
const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calendar",
  component: CalendarPage,
});
const channelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channels",
  component: ChannelsPage,
});
const whatsappRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/whatsapp",
  component: WhatsAppPage,
});
const audiovisualRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: AudiovisualPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  tasksRoute,
  leadsRoute,
  prospectingRoute,
  campaignsRoute,
  marketplaceRoute,
  calendarRoute,
  channelsRoute,
  whatsappRoute,
  audiovisualRoute,
  adminRoute,
  reportsRoute,
]);
export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
