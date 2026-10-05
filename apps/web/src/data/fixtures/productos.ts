import { productoSchema } from "@rgr/shared";

export const productosFixture = productoSchema.array().parse([
  { id: "prod-taller-mant", nombre: "Mantenimiento preventivo", categoria: "SERVICIO_TALLER", precio: null, moneda: "PEN", precioNota: "Servicio principal de captación", fichaTecnica: "Cambio de aceite, filtros, revisión general, chequeo de frenos y niveles.", disponible: true },
  { id: "prod-taller-frenos", nombre: "Ajuste y limpieza de frenos", categoria: "SERVICIO_TALLER", precio: 99, moneda: "PEN", precioNota: "Precio fijo", fichaTecnica: "Ajuste, limpieza y verificación de pastillas y discos.", disponible: true },
  { id: "prod-taller-ac", nombre: "Aire acondicionado (Brain Bee)", categoria: "SERVICIO_TALLER", precio: 250, moneda: "PEN", precioNota: "Desde S/250 según vehículo", fichaTecnica: "Diagnóstico y recarga con equipo Brain Bee.", disponible: true },
  { id: "prod-taller-gdi", nombre: "Limpieza de inyectores GDI", categoria: "SERVICIO_TALLER", precio: 250, moneda: "PEN", precioNota: "S/250 sin repuestos", fichaTecnica: "Limpieza con máquina especializada para motores GDI.", disponible: true },
  { id: "prod-taller-undercoating", nombre: "Undercoating + zincado de tubo de escape", categoria: "SERVICIO_TALLER", precio: null, moneda: "PEN", precioNota: "Auto S/450 | SUV S/550 | Pickup S/690", fichaTecnica: "Protección anticorrosiva de chasis y zincado de escape.", disponible: true },
  { id: "prod-cat-320", nombre: "CAT 320", categoria: "MAQUINARIA", precio: 85000, moneda: "USD", precioNota: "Año 2011, repotenciada 2019", fichaTecnica: "Aprox. 9,200 horas desde repotenciación. Excavadora hidráulica.", disponible: true },
  { id: "prod-l200-1", nombre: "Mitsubishi L200 4x4 2.4 TD GLX MT 2026 — Unidad 1", categoria: "VEHICULO", precio: 38000, moneda: "USD", precioNota: "US$38,000 por unidad", fichaTecnica: "Estribos, defensa delantera, fierro antivuelco, tolva inyectada, parlante/sirena.", disponible: true },
  { id: "prod-l200-2", nombre: "Mitsubishi L200 4x4 2.4 TD GLX MT 2026 — Unidad 2", categoria: "VEHICULO", precio: 38000, moneda: "USD", precioNota: "US$38,000 por unidad", fichaTecnica: "Mismas características que Unidad 1.", disponible: true },
  { id: "prod-isuzu-kv600", nombre: "Isuzu KV600 + compactadora 7 m³", categoria: "CAMION", precio: 550000, moneda: "PEN", precioNota: "1 unidad", fichaTecnica: "Camión con compactadora de 7 m³.", disponible: true },
]);
