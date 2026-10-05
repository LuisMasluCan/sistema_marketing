import { whatsappConversationSchema } from "@rgr/shared";
import { leadsFixture } from "./leads";

export { productosFixture } from "./productos";
export { usuariosFixture } from "./usuarios";
export { canalesFixture } from "./canales";
export { etiquetasFixture } from "./etiquetas";
export { metasFixture } from "./metas";
export { tareasInicialesFixture } from "./tareasIniciales";
export { campanasFixture } from "./campanas";
export { leadsFixture } from "./leads";
export { prospeccionFixture } from "./prospeccion";
export { contenidoFixture } from "./contenido";
export { marketplaceFixture } from "./marketplace";

const labelByLeadStatus: Record<string, string> = {
  NUEVO: "et-nuevo",
  CONTACTADO: "et-contactado",
  CITA: "et-cita",
  COTIZADO: "et-cotizado",
  SEGUIMIENTO: "et-seguimiento",
  CLIENTE: "et-cliente",
  NO_RESPONDE: "et-no-responde",
  PERDIDO: "et-perdido",
};

export const conversacionesFixture = whatsappConversationSchema.array().parse(
  leadsFixture
    .filter((lead) => lead.canalOrigenId === "ch-whatsapp")
    .map((lead) => ({
      id: `wa-${lead.id}`,
      leadId: lead.id,
      etiquetaId: labelByLeadStatus[lead.estado],
      fechaEntrada: `${lead.fecha}T09:00:00.000Z`,
      primeraRespuesta:
        lead.tiempoRespuestaMin === null
          ? null
          : new Date(
              new Date(`${lead.fecha}T09:00:00.000Z`).getTime() +
                lead.tiempoRespuestaMin * 60_000,
            ).toISOString(),
      responsableId: lead.responsableId,
    })),
);

export const audiovisualAssetsFixture = [];