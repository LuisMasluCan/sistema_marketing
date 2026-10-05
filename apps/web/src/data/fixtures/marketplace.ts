import { publicacionMarketplaceSchema } from "@rgr/shared";

export const marketplaceFixture = publicacionMarketplaceSchema.array().parse([
  { id: "mk-1", productoId: "prod-cat-320", titulo: "CAT 320 — Excavadora 2011 repotenciada", descripcion: "Aprox. 9,200 h desde repotenciación (2019). Lista para trabajo.", precio: 85000, estado: "BORRADOR", fechaPublicacion: null, consultas: 0, ultimaRevision: "2026-09-28" },
  { id: "mk-2", productoId: "prod-l200-1", titulo: "Mitsubishi L200 4x4 2.4 TD GLX MT 2026", descripcion: "Estribos, defensa, antivuelco, tolva inyectada, sirena.", precio: 38000, estado: "BORRADOR", fechaPublicacion: null, consultas: 0, ultimaRevision: "2026-09-28" },
  { id: "mk-3", productoId: "prod-l200-2", titulo: "Mitsubishi L200 4x4 2.4 TD GLX MT 2026 (2da)", descripcion: "Igual especificación que unidad 1.", precio: 38000, estado: "BORRADOR", fechaPublicacion: null, consultas: 0, ultimaRevision: "2026-09-28" },
  { id: "mk-4", productoId: "prod-isuzu-kv600", titulo: "Isuzu KV600 + compactadora 7 m³", descripcion: "Unidad única. Ideal gestión de residuos.", precio: 550000, estado: "BORRADOR", fechaPublicacion: null, consultas: 0, ultimaRevision: "2026-09-28" },
]);
