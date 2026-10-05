import { etiquetaSchema } from "@rgr/shared";

export const etiquetasFixture = etiquetaSchema.array().parse([
  { id: "et-nuevo", nombre: "Nuevo lead" },
  { id: "et-contactado", nombre: "Contactado" },
  { id: "et-cita", nombre: "Cita" },
  { id: "et-cotizado", nombre: "Cotizado" },
  { id: "et-seguimiento", nombre: "Seguimiento" },
  { id: "et-cliente", nombre: "Cliente" },
  { id: "et-no-responde", nombre: "No responde" },
  { id: "et-perdido", nombre: "Perdido" },
]);
