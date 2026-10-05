import { create } from "zustand";
import { apiRequest } from "../api";
import {
  audiovisualAssetSchema,
  campanaSchema,
  canalSchema,
  contenidoSchema,
  empresaProspectoSchema,
  etiquetaSchema,
  leadSchema,
  metaSchema,
  productoSchema,
  publicacionMarketplaceSchema,
  tareaSchema,
  userSchema,
  whatsappConversationSchema,
  type AudiovisualAsset,
  type Campana,
  type Canal,
  type Contenido,
  type EmpresaProspecto,
  type Etiqueta,
  type Lead,
  type Meta,
  type Producto,
  type PublicacionMarketplace,
  type Tarea,
  type User,
  type WhatsappConversation,
} from "@rgr/shared";
import type {
  AudiovisualRepo,
  CampaignInput,
  CampanasRepo,
  CatalogoRepo,
  ContentInput,
  ContenidoRepo,
  LeadInput,
  LeadsRepo,
  MarketplaceInput,
  MarketplaceRepo,
  ProspectInput,
  ProspeccionRepo,
  TaskInput,
  TareasRepo,
  WhatsAppRepo,
} from "../contracts";

export type StaticDataState = {
  leads: Lead[];
  prospectos: EmpresaProspecto[];
  campanas: Campana[];
  contenidos: Contenido[];
  tareas: Tarea[];
  publicaciones: PublicacionMarketplace[];
  conversaciones: WhatsappConversation[];
  assets: AudiovisualAsset[];
  productos: Producto[];
  usuarios: User[];
  canales: Canal[];
  etiquetas: Etiqueta[];
  metas: Meta[];
  prospectosCreadosSemana: number;
};

export const useStaticDataStore = create<StaticDataState>(() => ({
  leads: [],
  prospectos: [],
  campanas: [],
  contenidos: [],
  tareas: [],
  publicaciones: [],
  conversaciones: [],
  assets: [],
  productos: [],
  usuarios: [],
  canales: [],
  etiquetas: [],
  metas: [],
  prospectosCreadosSemana: 0,
}));

const persistedCollections = [
  ["prospectos", empresaProspectoSchema],
  ["campanas", campanaSchema],
  ["contenidos", contenidoSchema],
  ["tareas", tareaSchema],
  ["publicaciones", publicacionMarketplaceSchema],
  ["conversaciones", whatsappConversationSchema],
  ["assets", audiovisualAssetSchema],
  ["productos", productoSchema],
  ["usuarios", userSchema],
  ["canales", canalSchema],
  ["etiquetas", etiquetaSchema],
  ["metas", metaSchema],
] as const;

type PersistedCollection = (typeof persistedCollections)[number][0];
type WorkspaceRow = { collection: PersistedCollection; id: string; data: unknown };
const savedRows = new Map<string, string>();
let persistenceStarted = false;
let persistenceRunning = false;
let persistenceTimer: ReturnType<typeof setTimeout> | undefined;

function rowKey(collection: PersistedCollection, id: string) {
  return `${collection}:${id}`;
}

export async function hydrateWorkspace() {
  const rows = await apiRequest<WorkspaceRow[]>("/api/workspace");
  const grouped = new Map<PersistedCollection, unknown[]>(
    persistedCollections.map(([collection]) => [collection, []]),
  );
  const nextSaved = new Map<string, string>();

  for (const row of rows) {
    const entry = persistedCollections.find(([collection]) => collection === row.collection);
    if (!entry) throw new Error(`Colección no reconocida: ${row.collection}`);
    const parsed = entry[1].parse(row.data);
    if (!parsed || typeof parsed !== "object" || !("id" in parsed) || parsed.id !== row.id) {
      throw new Error(`Registro inválido: ${row.collection}/${row.id}`);
    }
    grouped.get(row.collection)?.push(parsed);
    nextSaved.set(rowKey(row.collection, row.id), JSON.stringify(parsed));
  }

  const patch: Partial<StaticDataState> = {};
  for (const [collection] of persistedCollections) {
    const key = collection as keyof StaticDataState;
    (patch as Record<string, unknown>)[key] = grouped.get(collection) ?? [];
  }
  patch.prospectosCreadosSemana = (grouped.get("prospectos") ?? []).length;
  savedRows.clear();
  for (const [key, value] of nextSaved) savedRows.set(key, value);
  persistenceStarted = false;
  useStaticDataStore.setState(patch);
  persistenceStarted = true;
}

async function syncWorkspace() {
  if (persistenceRunning || !persistenceStarted) return;
  persistenceRunning = true;
  try {
    while (true) {
      const state = useStaticDataStore.getState();
      const currentRows = new Map<string, { collection: PersistedCollection; id: string; data: unknown; json: string }>();
      for (const [collection] of persistedCollections) {
        const records = state[collection as keyof StaticDataState] as unknown as Array<{ id: string }>;
        for (const record of records) {
          const json = JSON.stringify(record);
          currentRows.set(rowKey(collection, record.id), {
            collection,
            id: record.id,
            data: record,
            json,
          });
        }
      }

      const deleted = [...savedRows.keys()].filter((key) => !currentRows.has(key));
      const changed = [...currentRows.entries()].filter(([key, row]) => savedRows.get(key) !== row.json);
      if (deleted.length === 0 && changed.length === 0) break;

      for (const key of deleted) {
        const separator = key.indexOf(":");
        const collection = key.slice(0, separator) as PersistedCollection;
        const id = key.slice(separator + 1);
        await apiRequest(`/api/workspace/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
        savedRows.delete(key);
      }
      for (const [key, row] of changed) {
        await apiRequest(`/api/workspace/${row.collection}/${encodeURIComponent(row.id)}`, {
          method: "PUT",
          body: JSON.stringify(row.data),
        });
        savedRows.set(key, row.json);
      }
    }
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent("rgr-api-error", {
        detail: error instanceof Error ? `No se pudo guardar en el espacio de trabajo: ${error.message}` : "No se pudo guardar en el espacio de trabajo",
      }),
    );
  } finally {
    persistenceRunning = false;
  }
}

useStaticDataStore.subscribe(() => {
  if (!persistenceStarted) return;
  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => void syncWorkspace(), 350);
});

function updateCollection<T extends { id: string }>(
  key: keyof StaticDataState,
  id: string,
  update: (record: T) => T,
) {
  useStaticDataStore.setState((state) => ({
    [key]: (state[key] as unknown as T[]).map((record) =>
      record.id === id ? update(record) : record,
    ),
  }) as Partial<StaticDataState>);
}

function removeFromCollection(key: keyof StaticDataState, id: string) {
  useStaticDataStore.setState((state) => ({
    [key]: (state[key] as { id: string }[]).filter((record) => record.id !== id),
  }) as Partial<StaticDataState>);
}

function insertIntoCollection<T extends { id: string }>(key: keyof StaticDataState, record: T) {
  useStaticDataStore.setState((state) => ({
    [key]: [...(state[key] as unknown as T[]), record],
  }) as Partial<StaticDataState>);
}

function recalculateCampaigns() {
  const { campanas, leads } = useStaticDataStore.getState();
  useStaticDataStore.setState({
    campanas: campanas.map((campaign) => {
      const campaignLeads = leads.filter((lead) => lead.campanaId === campaign.id);
      return campanaSchema.parse({
        ...campaign,
        metricas: {
          ...campaign.metricas,
          leads: campaignLeads.length,
          cpl: campaignLeads.length ? campaign.gastoReal / campaignLeads.length : 0,
        },
      });
    }),
  });
}

export const staticLeadsRepo: LeadsRepo = {
  list: () => useStaticDataStore.getState().leads,
  create: (input: LeadInput) => {
    const state = useStaticDataStore.getState();
    const product = state.productos.find((item) => item.id === input.servicioProductoId);
    const isMachinery = product?.categoria !== "SERVICIO_TALLER";
    const record = leadSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      calificado: input.calificado && (!isMachinery || Boolean(input.ciudad && input.servicioProductoId)),
    });
    insertIntoCollection("leads", record);
    recalculateCampaigns();
    return record;
  },
  update: (id, changes) => {
    updateCollection<Lead>("leads", id, (lead) => leadSchema.parse({ ...lead, ...changes }));
    recalculateCampaigns();
  },
  updateStatus: (id, estado) => {
    updateCollection<Lead>("leads", id, (lead) => leadSchema.parse({ ...lead, estado }));
  },
  remove: (id) => {
    removeFromCollection("leads", id);
    recalculateCampaigns();
  },
};

export const staticProspectingRepo: ProspeccionRepo = {
  list: () => useStaticDataStore.getState().prospectos,
  create: (input: ProspectInput) => {
    const record = empresaProspectoSchema.parse({ ...input, id: crypto.randomUUID() });
    insertIntoCollection("prospectos", record);
    useStaticDataStore.setState((state) => ({ prospectosCreadosSemana: state.prospectosCreadosSemana + 1 }));
    return record;
  },
  update: (id, changes) =>
    updateCollection<EmpresaProspecto>("prospectos", id, (record) =>
      empresaProspectoSchema.parse({ ...record, ...changes }),
    ),
  remove: (id) => removeFromCollection("prospectos", id),
};

export const staticCampaignsRepo: CampanasRepo = {
  list: () => useStaticDataStore.getState().campanas,
  create: (input: CampaignInput) => {
    const record = campanaSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      metricas: input.metricas ?? { leads: 0, citas: 0, ventas: 0, cpl: 0, roas: 0 },
    });
    insertIntoCollection("campanas", record);
    return record;
  },
  update: (id, changes) => {
    updateCollection<Campana>("campanas", id, (campaign) =>
      campanaSchema.parse({ ...campaign, ...changes }),
    );
    recalculateCampaigns();
  },
  setStatus: (id, estado) => staticCampaignsRepo.update(id, { estado }),
  remove: (id) => removeFromCollection("campanas", id),
};

export const staticContentRepo: ContenidoRepo = {
  list: () => useStaticDataStore.getState().contenidos,
  create: (input: ContentInput) => {
    const record = contenidoSchema.parse({ ...input, id: crypto.randomUUID() });
    insertIntoCollection("contenidos", record);
    return record;
  },
  update: (id, changes) =>
    updateCollection<Contenido>("contenidos", id, (record) =>
      contenidoSchema.parse({ ...record, ...changes }),
    ),
  move: (id, fechaProgramada) => staticContentRepo.update(id, { fechaProgramada }),
  remove: (id) => removeFromCollection("contenidos", id),
};

export const staticTasksRepo: TareasRepo = {
  list: () => useStaticDataStore.getState().tareas,
  create: (input: TaskInput) => {
    const record = tareaSchema.parse({ ...input, id: crypto.randomUUID() });
    insertIntoCollection("tareas", record);
    return record;
  },
  update: (id, changes) =>
    updateCollection<Tarea>("tareas", id, (record) =>
      tareaSchema.parse({ ...record, ...changes }),
    ),
  remove: (id) => removeFromCollection("tareas", id),
};

export const staticMarketplaceRepo: MarketplaceRepo = {
  list: () => useStaticDataStore.getState().publicaciones,
  create: (input: MarketplaceInput) => {
    const record = publicacionMarketplaceSchema.parse({ ...input, id: crypto.randomUUID() });
    insertIntoCollection("publicaciones", record);
    return record;
  },
  update: (id, changes) =>
    updateCollection<PublicacionMarketplace>("publicaciones", id, (record) =>
      publicacionMarketplaceSchema.parse({ ...record, ...changes }),
    ),
  setStatus: (id, estado) => staticMarketplaceRepo.update(id, { estado }),
  remove: (id) => removeFromCollection("publicaciones", id),
};

export const staticWhatsAppRepo: WhatsAppRepo = {
  list: () => useStaticDataStore.getState().conversaciones,
  setLabel: (id, etiquetaId) =>
    updateCollection<WhatsappConversation>("conversaciones", id, (record) =>
      whatsappConversationSchema.parse({ ...record, etiquetaId }),
    ),
  markFirstResponse: (id, at) =>
    updateCollection<WhatsappConversation>("conversaciones", id, (record) =>
      whatsappConversationSchema.parse({ ...record, primeraRespuesta: at }),
    ),
};

export const staticAudiovisualRepo: AudiovisualRepo = {
  list: () => useStaticDataStore.getState().assets,
  create: (input) => {
    const record = audiovisualAssetSchema.parse({ ...input, id: crypto.randomUUID(), vecesUsado: 0 });
    insertIntoCollection("assets", record);
    return record;
  },
  update: (id, changes) =>
    updateCollection<AudiovisualAsset>("assets", id, (record) =>
      audiovisualAssetSchema.parse({ ...record, ...changes }),
    ),
  markUsed: (id) => staticAudiovisualRepo.update(id, { vecesUsado: (useStaticDataStore.getState().assets.find((item) => item.id === id)?.vecesUsado ?? 0) + 1 }),
  remove: (id) => removeFromCollection("assets", id),
};

export const staticCatalogRepo: CatalogoRepo = {
  productos: () => useStaticDataStore.getState().productos,
  usuarios: () => useStaticDataStore.getState().usuarios,
  canales: () => useStaticDataStore.getState().canales,
  etiquetas: () => useStaticDataStore.getState().etiquetas,
  metas: () => useStaticDataStore.getState().metas,
  createProducto: (input) => { const record = productoSchema.parse({ ...input, id: crypto.randomUUID() }); insertIntoCollection("productos", record); return record; },
  updateProducto: (id, changes) => updateCollection<Producto>("productos", id, (record) => productoSchema.parse({ ...record, ...changes })),
  removeProducto: (id) => removeFromCollection("productos", id),
  createUsuario: (input) => { const record = userSchema.parse({ ...input, id: crypto.randomUUID() }); insertIntoCollection("usuarios", record); return record; },
  updateUsuario: (id, changes) => updateCollection<User>("usuarios", id, (record) => userSchema.parse({ ...record, ...changes })),
  removeUsuario: (id) => removeFromCollection("usuarios", id),
  createCanal: (input) => { const record = canalSchema.parse({ ...input, id: crypto.randomUUID() }); insertIntoCollection("canales", record); return record; },
  updateCanal: (id, changes) => updateCollection<Canal>("canales", id, (record) => canalSchema.parse({ ...record, ...changes })),
  removeCanal: (id) => removeFromCollection("canales", id),
  createEtiqueta: (input) => { const record = etiquetaSchema.parse({ ...input, id: crypto.randomUUID() }); insertIntoCollection("etiquetas", record); return record; },
  updateEtiqueta: (id, changes) => updateCollection<Etiqueta>("etiquetas", id, (record) => etiquetaSchema.parse({ ...record, ...changes })),
  removeEtiqueta: (id) => removeFromCollection("etiquetas", id),
  createMeta: (input) => { const record = metaSchema.parse({ ...input, id: crypto.randomUUID() }); insertIntoCollection("metas", record); return record; },
  updateMeta: (id, changes) => updateCollection<Meta>("metas", id, (record) => metaSchema.parse({ ...record, ...changes })),
  removeMeta: (id) => removeFromCollection("metas", id),
};
