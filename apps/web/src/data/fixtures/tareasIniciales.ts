import { tareaSchema } from "@rgr/shared";

export const tareasInicialesFixture = tareaSchema.array().parse([
  { id: "t-1", titulo: "Calendario de contenido: próximas 4 semanas", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "CONTENIDO" },
  { id: "t-2", titulo: "Registro de leads: taller, maquinaria, vehículos, camiones", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "CRM" },
  { id: "t-3", titulo: "WhatsApp Business: coordinar con Luis", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "WHATSAPP" },
  { id: "t-4", titulo: "Marketplace: publicar CAT, L200, Isuzu y demás", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "MARKETPLACE" },
  { id: "t-5", titulo: "Banco audiovisual taller (servicios y procesos)", asignadoA: "u-claudia", prioridad: "MEDIA", fechaLimite: null, estado: "PENDIENTE", modulo: "CONTENIDO" },
  { id: "t-6", titulo: "Banco audiovisual ventas (CAT, L200, Isuzu)", asignadoA: "u-claudia", prioridad: "MEDIA", fechaLimite: null, estado: "PENDIENTE", modulo: "CONTENIDO" },
  { id: "t-7", titulo: "Primera campaña: \"Pon tu vehículo al día\"", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "CAMPANAS" },
  { id: "t-8", titulo: "Campañas prioritarias en paralelo", asignadoA: "u-arturo", prioridad: "ALTA", fechaLimite: null, estado: "PENDIENTE", modulo: "CAMPANAS" },
]);
