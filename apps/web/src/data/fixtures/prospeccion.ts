import { empresaProspectoSchema } from "@rgr/shared";

export const prospeccionFixture = empresaProspectoSchema.array().parse([
  { id: "p-1", nombre: "Transportes Ramírez", rubro: "Transporte", ciudad: "Pucallpa", contacto: "Carlos Ramírez", telefono: "961111111", necesidad: "Mantenimiento preventivo flota", estado: "CONTACTADO", proximaAccion: "Enviar propuesta de mantenimiento", fechaProximaAccion: "2026-10-02" },
  { id: "p-2", nombre: "Constructora Vela", rubro: "Construcción", ciudad: "Pucallpa", contacto: "Pedro Vela", telefono: "965555555", necesidad: "Excavadora para obra", estado: "INTERESADO", proximaAccion: "Coordinar visita a maquinaria", fechaProximaAccion: "2026-10-03" },
  { id: "p-3", nombre: "Minera San Martín", rubro: "Minería", ciudad: "Tarapoto", contacto: "Sofía Reátegui", telefono: "968888888", necesidad: "Camión compactador 7 m³", estado: "NUEVO", proximaAccion: "Enviar ficha técnica", fechaProximaAccion: "2026-10-01" },
  { id: "p-4", nombre: "Agro Ucayali", rubro: "Agroindustria", ciudad: "Pucallpa", contacto: "José Panduro", telefono: "963333333", necesidad: "A/C y mantenimiento pickups", estado: "CONTACTADO", proximaAccion: "Agendar cita taller", fechaProximaAccion: "2026-10-02" },
  { id: "p-5", nombre: "Grupo Logístico Loreto", rubro: "Transporte y carga", ciudad: "Iquitos", contacto: "Ana Torres", telefono: "966666666", necesidad: "Camionetas 4x4 para campo", estado: "INTERESADO", proximaAccion: "Enviar cotización L200", fechaProximaAccion: "2026-10-04" },
]);
