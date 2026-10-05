import { leadSchema, type LeadStatus } from "@rgr/shared";

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Nuevo lead",
  contacted: "Contactado",
  appointment: "Cita",
  quoted: "Cotizado",
  follow_up: "Seguimiento",
  customer: "Cliente",
  no_response: "No responde",
  lost: "Perdido",
};

export const leadsFixture = leadSchema.array().parse([
  { id: "l-1", fecha: "2026-09-24", nombre: "Carlos Ramírez", telefono: "961111111", ciudad: "Pucallpa", empresa: "Transportes Ramírez", servicioProductoId: "prod-taller-mant", canalOrigenId: "ch-ig-taller", campanaId: "camp-pon-al-dia", contenidoId: null, estado: "NUEVO", calificado: true, necesidad: "Mantenimiento de flota (8 unidades)", proyecto: null, plazoCompra: null, citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: null },
  { id: "l-2", fecha: "2026-09-24", nombre: "María López", telefono: "962222222", ciudad: "Pucallpa", empresa: null, servicioProductoId: "prod-taller-frenos", canalOrigenId: "ch-whatsapp", campanaId: null, contenidoId: null, estado: "CONTACTADO", calificado: true, necesidad: "Frenos rechinan", proyecto: null, plazoCompra: null, citaFecha: "2026-09-28", llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: 6 },
  { id: "l-3", fecha: "2026-09-25", nombre: "José Panduro", telefono: "963333333", ciudad: "Pucallpa", empresa: "Agro Ucayali", servicioProductoId: "prod-taller-ac", canalOrigenId: "ch-ig-taller", campanaId: "camp-pon-al-dia", contenidoId: null, estado: "CITA", calificado: true, necesidad: "A/C no enfría en pickup", proyecto: null, plazoCompra: null, citaFecha: "2026-09-30", llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: 3 },
  { id: "l-4", fecha: "2026-09-25", nombre: "Rosa Sánchez", telefono: "964444444", ciudad: "Pucallpa", empresa: null, servicioProductoId: "prod-taller-gdi", canalOrigenId: "ch-fb", campanaId: null, contenidoId: null, estado: "COTIZADO", calificado: true, necesidad: "Limpieza de inyectores", proyecto: null, plazoCompra: null, citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: 12 },
  { id: "l-5", fecha: "2026-09-26", nombre: "Pedro Vela", telefono: "965555555", ciudad: "Pucallpa", empresa: "Constructora Vela", servicioProductoId: "prod-cat-320", canalOrigenId: "ch-ig-rgr", campanaId: null, contenidoId: null, estado: "SEGUIMIENTO", calificado: true, necesidad: "Excavadora para obra en Yarinacocha", proyecto: "Obra Yarinacocha", plazoCompra: "30 días", citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: 8 },
  { id: "l-6", fecha: "2026-09-26", nombre: "Ana Torres", telefono: "966666666", ciudad: "Iquitos", empresa: null, servicioProductoId: "prod-l200-1", canalOrigenId: "ch-marketplace", campanaId: null, contenidoId: null, estado: "NUEVO", calificado: true, necesidad: "Camioneta 4x4 para trabajo en campo", proyecto: null, plazoCompra: "60 días", citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: null },
  { id: "l-7", fecha: "2026-09-27", nombre: "Luis Paredes", telefono: "967777777", ciudad: "Pucallpa", empresa: null, servicioProductoId: "prod-taller-mant", canalOrigenId: "ch-whatsapp", campanaId: "camp-pon-al-dia", contenidoId: null, estado: "CLIENTE", calificado: true, necesidad: "Mantenimiento SUV", proyecto: null, plazoCompra: null, citaFecha: "2026-09-27", llegoTaller: true, ventaMonto: 450, responsableId: "u-ventas", tiempoRespuestaMin: 4 },
  { id: "l-8", fecha: "2026-09-27", nombre: "Sofía Reátegui", telefono: "968888888", ciudad: "Tarapoto", empresa: "Minera San Martín", servicioProductoId: "prod-isuzu-kv600", canalOrigenId: "ch-marketplace", campanaId: null, contenidoId: null, estado: "SEGUIMIENTO", calificado: true, necesidad: "Compactador para residuos sólidos", proyecto: "Gestión residuos", plazoCompra: "90 días", citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: 15 },
  { id: "l-9", fecha: "2026-09-28", nombre: "Diego Flores", telefono: "969999999", ciudad: "Pucallpa", empresa: null, servicioProductoId: "prod-taller-undercoating", canalOrigenId: "ch-ig-taller", campanaId: "camp-pon-al-dia", contenidoId: null, estado: "NUEVO", calificado: true, necesidad: "Undercoating pickup", proyecto: null, plazoCompra: null, citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: null },
  { id: "l-10", fecha: "2026-09-28", nombre: "Elena Mori", telefono: "960000000", ciudad: "Pucallpa", empresa: null, servicioProductoId: "prod-taller-mant", canalOrigenId: "ch-tiktok", campanaId: null, contenidoId: null, estado: "NO_RESPONDE", calificado: false, necesidad: null, proyecto: null, plazoCompra: null, citaFecha: null, llegoTaller: false, ventaMonto: null, responsableId: "u-ventas", tiempoRespuestaMin: null },
]);
