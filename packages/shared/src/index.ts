import { z } from "zod";

export const businessUnitSchema = z.enum(["workshop", "machinery"]);
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(12).max(128),
});
export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "appointment",
  "quoted",
  "follow_up",
  "customer",
  "no_response",
  "lost",
]);

export const createLeadSchema = z
  .object({
    date: z.iso.datetime(),
    name: z.string().trim().min(2).max(120),
    phone: z
      .string()
      .trim()
      .regex(/^(?:\+?51)?9\d{8}$/, "Ingresa un celular peruano válido"),
    businessUnit: businessUnitSchema,
    service: z.string().trim().min(2).max(120),
    channel: z.string().trim().min(1, "Selecciona un canal de origen").max(80),
    city: z.string().trim().max(80),
    appointment: z.boolean(),
    arrived: z.boolean(),
    sold: z.boolean(),
    amount: z.number().nonnegative().nullable(),
    product: z.string().trim().max(120).nullable().optional(),
    need: z.string().trim().max(500).nullable().optional(),
    company: z.string().trim().max(160).nullable().optional(),
    purchaseWindow: z.string().trim().max(80).nullable().optional(),
  })
  .superRefine((lead, context) => {
    if (lead.sold && lead.amount === null) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Registra el monto de la venta",
      });
    }

  });

export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
});

export const prospectSchema = z.object({
  company: z.string().trim().min(2).max(160),
  industry: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?51)?9\d{8}$/),
  need: z.string().trim().min(2).max(500),
  status: z.enum([
    "identified",
    "contacted",
    "interested",
    "follow_up",
    "closed",
    "lost",
  ]),
  nextAction: z.string().trim().min(2).max(240),
});
export const prospectRecordSchema = prospectSchema.extend({ id: z.string() });

export const leadRecordSchema = createLeadSchema.extend({
  id: z.string(),
  status: leadStatusSchema,
  contactedAt: z.iso.datetime().nullable().optional(),
});
export const campaignRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  businessUnit: businessUnitSchema,
  product: z.string(),
  audience: z.string(),
  objective: z.string(),
  budget: z.number().nonnegative(),
  status: z.enum(["draft", "active", "paused"]),
});
export const contentPieceSchema = z.object({
  id: z.string(),
  title: z.string(),
  scheduledAt: z.string(),
  businessUnit: businessUnitSchema,
  format: z.enum(["Reel", "Post", "Historia"]),
  channel: z.string(),
  pillar: z.string(),
  status: z.enum(["planned", "in_progress", "published"]),
  owner: z.string(),
});
export const taskRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: z.string(),
  tag: z.string(),
  completed: z.boolean(),
});
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  businessUnit: businessUnitSchema,
  price: z.number().nonnegative().nullable(),
  currency: z.enum(["PEN", "USD"]).nullable(),
  quantity: z.number().int().nonnegative(),
});
export const userRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "EDITOR", "VENTAS", "GERENCIA"]),
});
export const contentGoalSchema = z.object({
  id: z.string(),
  label: z.string(),
  actual: z.number().nonnegative(),
  target: z.number().positive(),
  unit: z.string(),
});
export const channelChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
});
export const marketplaceAssetSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string(),
  published: z.boolean(),
});
export const channelNameSchema = z.enum([
  "Instagram",
  "TikTok",
  "Facebook",
  "Marketplace",
  "WhatsApp",
]);
export const whatsappLabelSchema = z.enum([
  "Nuevo lead",
  "Contactado",
  "Cita",
  "Cotizado",
  "Seguimiento",
  "Cliente",
  "No responde",
  "Perdido",
]);

export const productoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  categoria: z.enum(["SERVICIO_TALLER", "MAQUINARIA", "VEHICULO", "CAMION"]),
  precio: z.number().nonnegative().nullable(),
  moneda: z.enum(["PEN", "USD"]),
  precioNota: z.string(),
  fichaTecnica: z.string(),
  disponible: z.boolean(),
});

export const userSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  rol: z.enum(["ADMIN", "EDITOR", "VENTAS", "GERENCIA"]),
  capacidadHorasSemana: z.number().nonnegative(),
  activo: z.boolean(),
});

export const canalSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  tipo: z.enum(["INSTAGRAM", "TIKTOK", "FACEBOOK", "MARKETPLACE", "WHATSAPP"]),
});

export const etiquetaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().trim().min(1).max(60),
});

export const metaSchema = z.object({
  id: z.string().min(1),
  periodo: z.string().regex(/^\d{4}-\d{2}$/),
  modulo: z.enum(["TALLER", "MAQUINARIA", "PROSPECCION"]),
  indicador: z.string().min(1),
  valorObjetivo: z.number().nonnegative(),
  valorReal: z.number().nonnegative(),
});

export const tareaSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  asignadoA: z.string().min(1),
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
  fechaLimite: z.string().nullable(),
  estado: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADA"]),
  modulo: z.enum(["CONTENIDO", "CRM", "WHATSAPP", "MARKETPLACE", "CAMPANAS"]),
});

export const campanaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  concepto: z.string(),
  productoIds: z.array(z.string()),
  publico: z.string(),
  objetivo: z.string(),
  presupuesto: z.number().nonnegative(),
  gastoReal: z.number().nonnegative(),
  inicio: z.string(),
  fin: z.string(),
  estado: z.enum(["BORRADOR", "ACTIVA", "PAUSADA", "FINALIZADA"]),
  metricas: z.object({
    leads: z.number().nonnegative(),
    citas: z.number().nonnegative(),
    ventas: z.number().nonnegative(),
    cpl: z.number().nonnegative(),
    roas: z.number().nonnegative(),
  }),
});

export const leadSchema = z.object({
  id: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().regex(/^9\d{8}$/),
  ciudad: z.string(),
  empresa: z.string().nullable(),
  servicioProductoId: z.string().nullable(),
  canalOrigenId: z.string().trim().min(1, "Selecciona un canal de origen"),
  campanaId: z.string().nullable(),
  contenidoId: z.string().nullable(),
  estado: z.enum(["NUEVO", "CONTACTADO", "CITA", "COTIZADO", "SEGUIMIENTO", "CLIENTE", "NO_RESPONDE", "PERDIDO"]),
  calificado: z.boolean(),
  necesidad: z.string().nullable(),
  proyecto: z.string().nullable(),
  plazoCompra: z.string().nullable(),
  citaFecha: z.string().nullable(),
  llegoTaller: z.boolean(),
  ventaMonto: z.number().nonnegative().nullable(),
  responsableId: z.string().min(1),
  tiempoRespuestaMin: z.number().nonnegative().nullable(),
}).superRefine((lead, context) => {
  if (!lead.canalOrigenId.trim()) {
    context.addIssue({ code: "custom", path: ["canalOrigenId"], message: "Selecciona un canal de origen" });
  }
});

export const empresaProspectoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(2),
  rubro: z.string().min(1),
  ciudad: z.string().min(1),
  contacto: z.string().min(1),
  telefono: z.string().regex(/^9\d{8}$/),
  necesidad: z.string().min(1),
  estado: z.enum(["NUEVO", "CONTACTADO", "INTERESADO", "SEGUIMIENTO", "CERRADO", "PERDIDO"]),
  proximaAccion: z.string().min(1),
  fechaProximaAccion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const contenidoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  tipo: z.enum(["REEL", "POST", "HISTORIA"]),
  pilar: z.enum(["EDUCACION", "TRABAJO_REAL", "PROMOCION", "PRODUCTO"]),
  cuentaId: z.string().min(1),
  responsableId: z.string().min(1),
  fechaProgramada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaPublicacion: z.string().nullable(),
  estado: z.enum(["IDEA", "GUION", "GRABADO", "EDITADO", "PROGRAMADO", "PUBLICADO"]),
  campanaId: z.string().nullable(),
  productoId: z.string().nullable(),
  assetIds: z.array(z.string()),
  metricas: z.object({
    alcance: z.number().nonnegative(),
    interacciones: z.number().nonnegative(),
    guardados: z.number().nonnegative(),
    clics: z.number().nonnegative(),
    leads: z.number().nonnegative(),
  }),
});

export const publicacionMarketplaceSchema = z.object({
  id: z.string().min(1),
  productoId: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string(),
  precio: z.number().nonnegative(),
  estado: z.enum(["BORRADOR", "PUBLICADO", "PAUSADO", "VENDIDO"]),
  fechaPublicacion: z.string().nullable(),
  consultas: z.number().nonnegative(),
  ultimaRevision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const whatsappConversationSchema = z.object({
  id: z.string().min(1),
  leadId: z.string().min(1),
  etiquetaId: z.string().min(1),
  fechaEntrada: z.string().regex(/^\d{4}-\d{2}-\d{2}T/),
  primeraRespuesta: z.string().regex(/^\d{4}-\d{2}-\d{2}T/).nullable(),
  responsableId: z.string().min(1),
});

export const audiovisualAssetSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  productoId: z.string().nullable(),
  tipo: z.enum(["FOTO", "VIDEO", "GRAFICA"]),
  vecesUsado: z.number().int().nonnegative(),
});

export type BusinessUnit = z.infer<typeof businessUnitSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type ProspectInput = z.infer<typeof prospectSchema>;
export type ProspectRecord = z.infer<typeof prospectRecordSchema>;
export type LeadRecord = z.infer<typeof leadRecordSchema>;
export type CampaignRecord = z.infer<typeof campaignRecordSchema>;
export type ContentPiece = z.infer<typeof contentPieceSchema>;
export type TaskRecord = z.infer<typeof taskRecordSchema>;
export type ProductRecord = z.infer<typeof productSchema>;
export type UserRecord = z.infer<typeof userRecordSchema>;
export type ContentGoal = z.infer<typeof contentGoalSchema>;
export type ChannelChecklistItem = z.infer<typeof channelChecklistItemSchema>;
export type MarketplaceAsset = z.infer<typeof marketplaceAssetSchema>;
export type ChannelName = z.infer<typeof channelNameSchema>;
export type WhatsappLabel = z.infer<typeof whatsappLabelSchema>;
export type Producto = z.infer<typeof productoSchema>;
export type User = z.infer<typeof userSchema>;
export type Canal = z.infer<typeof canalSchema>;
export type Etiqueta = z.infer<typeof etiquetaSchema>;
export type Meta = z.infer<typeof metaSchema>;
export type Tarea = z.infer<typeof tareaSchema>;
export type Campana = z.infer<typeof campanaSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type EmpresaProspecto = z.infer<typeof empresaProspectoSchema>;
export type Contenido = z.infer<typeof contenidoSchema>;
export type PublicacionMarketplace = z.infer<typeof publicacionMarketplaceSchema>;
export type WhatsappConversation = z.infer<typeof whatsappConversationSchema>;
export type AudiovisualAsset = z.infer<typeof audiovisualAssetSchema>;
