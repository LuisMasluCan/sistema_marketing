import type {
  CampaignRecord,
  ContentGoal,
  ContentPiece,
  CreateLeadInput,
  LeadStatus,
  ProductRecord,
  ProspectInput as LegacyProspectInput,
  ProspectRecord,
  TaskRecord,
  UserRecord,
} from "@rgr/shared";
import { repositories, useStaticDataStore } from "./index";
import { usePersistentLeads } from "./persistentLeads";

export function useLeads() {
  const leads = usePersistentLeads((current) => current.leads);
  const create = usePersistentLeads((current) => current.create);
  const update = usePersistentLeads((current) => current.update);
  const setStatus = usePersistentLeads((current) => current.setStatus);
  const remove = usePersistentLeads((current) => current.remove);
  const load = usePersistentLeads((current) => current.load);
  const isLoading = usePersistentLeads((current) => current.isLoading);
  const error = usePersistentLeads((current) => current.error);
  return {
    leads,
    isLoading,
    error,
    load,
    addLead: (input: CreateLeadInput) => create(input),
    updateLeadStatus: (id: string, status: LeadStatus) => setStatus(id, status),
    editLead: (id: string, input: CreateLeadInput) => update(id, input),
    removeLead: remove,
  };
}

export function useProspects() {
  const state = useStaticDataStore((current) => current);
  return {
    prospects: state.prospectos.map((item): ProspectRecord => ({
      id: item.id,
      company: item.nombre,
      industry: item.rubro,
      city: item.ciudad,
      contact: item.contacto,
      phone: item.telefono,
      need: item.necesidad,
      status: item.estado === "NUEVO" ? "identified" : item.estado === "INTERESADO" ? "interested" : item.estado === "SEGUIMIENTO" ? "follow_up" : item.estado === "CERRADO" ? "closed" : item.estado === "PERDIDO" ? "lost" : "contacted",
      nextAction: item.proximaAccion,
    })),
    domainProspects: state.prospectos,
    addProspect: (input: LegacyProspectInput) => repositories.prospecting.create({
      nombre: input.company,
      rubro: input.industry,
      ciudad: input.city,
      contacto: input.contact,
      telefono: input.phone.replace(/\s/g, ""),
      necesidad: input.need,
      estado: input.status === "identified" ? "NUEVO" : input.status === "interested" ? "INTERESADO" : input.status === "follow_up" ? "SEGUIMIENTO" : input.status === "closed" ? "CERRADO" : input.status === "lost" ? "PERDIDO" : "CONTACTADO",
      proximaAccion: input.nextAction,
      fechaProximaAccion: new Date().toISOString().slice(0, 10),
    }),
    updateProspect: repositories.prospecting.update,
    removeProspect: repositories.prospecting.remove,
    weeklyCreatedCount: state.prospectosCreadosSemana,
  };
}

export function useCampaigns() {
  const state = useStaticDataStore((current) => current);
  return {
    campaigns: state.campanas.map((item): CampaignRecord => ({
      id: item.id,
      name: item.nombre,
      businessUnit:
        state.productos.find((product) => item.productoIds.includes(product.id))
          ?.categoria === "SERVICIO_TALLER"
          ? "workshop"
          : "machinery",
      product:
        state.productos.find((product) => item.productoIds.includes(product.id))
          ?.nombre ?? item.concepto,
      audience: item.publico,
      objective: item.objetivo,
      budget: item.presupuesto,
      status: item.estado === "ACTIVA" ? "active" : item.estado === "PAUSADA" ? "paused" : "draft",
    })),
    domainCampaigns: state.campanas,
    setCampaignStatus: (id: string, status: CampaignRecord["status"]) => repositories.campaigns.setStatus(id, status === "active" ? "ACTIVA" : status === "paused" ? "PAUSADA" : "BORRADOR"),
    createCampaign: repositories.campaigns.create,
    updateCampaign: repositories.campaigns.update,
    removeCampaign: repositories.campaigns.remove,
  };
}

export function useContent() {
  const state = useStaticDataStore((current) => current);
  return {
    content: state.contenidos.map((item): ContentPiece => ({
      id: item.id,
      title: item.titulo,
      scheduledAt: `${item.fechaProgramada}T12:00:00.000Z`,
      businessUnit:
        state.productos.find((product) => product.id === item.productoId)
          ?.categoria === "SERVICIO_TALLER" ||
        state.canales
          .find((channel) => channel.id === item.cuentaId)
          ?.nombre.toLowerCase()
          .includes("taller")
          ? "workshop"
          : "machinery",
      format: item.tipo === "REEL" ? "Reel" : item.tipo === "HISTORIA" ? "Historia" : "Post",
      channel: state.canales.find((channel) => channel.id === item.cuentaId)?.nombre ?? "",
      pillar: item.pilar,
      status: item.estado === "PUBLICADO" ? "published" : item.estado === "IDEA" ? "planned" : "in_progress",
      owner: state.usuarios.find((user) => user.id === item.responsableId)?.nombre ?? "",
    })),
    domainContent: state.contenidos,
    updateSchedule: (id: string, scheduledAt: string) => repositories.content.move(id, scheduledAt.slice(0, 10)),
    createContent: repositories.content.create,
    updateContent: repositories.content.update,
    removeContent: repositories.content.remove,
  };
}

export function useTasks() {
  const state = useStaticDataStore((current) => current);
  return {
    tasks: state.tareas.map((item): TaskRecord => ({
      id: item.id,
      title: item.titulo,
      owner: state.usuarios.find((user) => user.id === item.asignadoA)?.nombre ?? item.asignadoA,
      tag: item.modulo,
      completed: item.estado === "COMPLETADA",
    })),
    domainTasks: state.tareas,
    toggleTask: (id: string) => {
      const task = state.tareas.find((item) => item.id === id);
      if (task) repositories.tasks.update(id, { estado: task.estado === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA" });
    },
    createTask: repositories.tasks.create,
    updateTask: repositories.tasks.update,
    removeTask: repositories.tasks.remove,
  };
}

export function useCatalog() {
  const state = useStaticDataStore((current) => current);
  const products = state.productos.map((item): ProductRecord => ({
    id: item.id,
    name: item.nombre,
    category: item.categoria,
    businessUnit: item.categoria === "SERVICIO_TALLER" ? "workshop" : "machinery",
    price: item.precio,
    currency: item.moneda,
    quantity: item.disponible ? 1 : 0,
  }));
  const users = state.usuarios.map((item): UserRecord => ({ id: item.id, name: item.nombre, role: item.rol }));
  const goalIds: Record<string, string> = {
    "m-taller-leads": "workshop-leads-monthly",
    "m-maq-leads": "qualified-leads-monthly",
    "m-prosp": "companies-monthly",
    "m-taller-reels": "workshop-reels-weekly",
    "m-taller-posts": "workshop-posts-weekly",
    "m-taller-hist": "workshop-stories-weekly",
    "m-maq-reels": "sales-reels-weekly",
    "m-maq-posts": "sales-posts-weekly",
  };
  const goals = state.metas.map((item): ContentGoal => ({
    id: goalIds[item.id] ?? item.id,
    label: item.indicador,
    actual: item.valorReal,
    target: item.valorObjetivo,
    unit: item.indicador,
  }));
  return {
    catalog: { products, users, goals, channels: state.canales.map((item) => item.nombre), whatsappLabels: state.etiquetas.map((item) => item.nombre) },
    domain: { products: state.productos, users: state.usuarios, channels: state.canales, labels: state.etiquetas, goals: state.metas },
    repo: repositories.catalog,
    isLoading: false,
  };
}

export function useChannels() {
  const state = useStaticDataStore((current) => current);
  const leads = usePersistentLeads((current) => current.leads);
  const setLeadStatus = usePersistentLeads((current) => current.setStatus);
  return {
    checklist: leads
      .filter((lead) => lead.channel.toLowerCase().includes("whatsapp"))
      .map((lead) => ({
      id: lead.id,
      label: lead.name,
      completed: lead.status !== "new",
    })),
    marketplace: state.publicaciones.map((item) => ({
      id: item.id,
      label: item.titulo,
      detail: item.descripcion,
      published: item.estado === "PUBLICADO",
    })),
    toggle: (id: string, kind: "checklist" | "marketplace") => {
      if (kind === "checklist") {
        const lead = leads.find((item) => item.id === id);
        if (lead?.status === "new") void setLeadStatus(id, "contacted");
      } else {
        const item = state.publicaciones.find((publication) => publication.id === id);
        if (item) repositories.marketplace.setStatus(id, item.estado === "PUBLICADO" ? "PAUSADO" : "PUBLICADO");
      }
    },
  };
}

export function useMarketplace() {
  const state = useStaticDataStore((current) => current);
  return {
    publications: state.publicaciones,
    products: state.productos,
    repo: repositories.marketplace,
  };
}

export function useWhatsApp() {
  const leads = usePersistentLeads((current) => current.leads);
  return {
    conversations: leads.filter((lead) =>
      lead.channel.toLowerCase().includes("whatsapp"),
    ),
    leads,
  };
}

export function useAudiovisual() {
  const state = useStaticDataStore((current) => current);
  return { assets: state.assets, products: state.productos, repo: repositories.audiovisual };
}
