import { metaSchema } from "@rgr/shared";

const periodo = "2026-10";
export const metasFixture = metaSchema.array().parse([
  { id: "m-taller-leads", periodo, modulo: "TALLER", indicador: "Leads/mes", valorObjetivo: 150, valorReal: 0 },
  { id: "m-maq-leads", periodo, modulo: "MAQUINARIA", indicador: "Leads calificados/mes", valorObjetivo: 20, valorReal: 0 },
  { id: "m-prosp", periodo, modulo: "PROSPECCION", indicador: "Empresas nuevas/mes", valorObjetivo: 40, valorReal: 0 },
  { id: "m-taller-reels", periodo, modulo: "TALLER", indicador: "Reels/semana", valorObjetivo: 3, valorReal: 0 },
  { id: "m-taller-posts", periodo, modulo: "TALLER", indicador: "Posts/semana", valorObjetivo: 2, valorReal: 0 },
  { id: "m-taller-hist", periodo, modulo: "TALLER", indicador: "Historias/semana", valorObjetivo: 15, valorReal: 0 },
  { id: "m-maq-reels", periodo, modulo: "MAQUINARIA", indicador: "Reels/semana", valorObjetivo: 2, valorReal: 0 },
  { id: "m-maq-posts", periodo, modulo: "MAQUINARIA", indicador: "Posts/semana", valorObjetivo: 2, valorReal: 0 },
]);
