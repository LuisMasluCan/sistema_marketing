import { campanaSchema } from "@rgr/shared";

export const campanasFixture = campanaSchema.array().parse([
  {
    id: "camp-pon-al-dia",
    nombre: "PON TU VEHÍCULO AL DÍA",
    concepto: "Mantenimiento preventivo como servicio principal de captación",
    productoIds: ["prod-taller-mant", "prod-taller-frenos", "prod-taller-ac", "prod-taller-gdi", "prod-taller-undercoating"],
    publico: "Particulares y empresas con flotas en Pucallpa / Ucayali",
    objetivo: "Generar consultas y citas para el taller",
    presupuesto: 700,
    gastoReal: 0,
    inicio: "2026-10-01",
    fin: "2026-10-31",
    estado: "BORRADOR",
    metricas: { leads: 0, citas: 0, ventas: 0, cpl: 0, roas: 0 },
  },
]);
