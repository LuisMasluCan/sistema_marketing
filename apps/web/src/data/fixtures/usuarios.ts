import { userSchema } from "@rgr/shared";

export const usuariosFixture = userSchema.array().parse([
  { id: "u-arturo", nombre: "Arturo", rol: "ADMIN", capacidadHorasSemana: 40, activo: true },
  { id: "u-claudia", nombre: "Claudia", rol: "EDITOR", capacidadHorasSemana: 40, activo: true },
  { id: "u-lucero", nombre: "Lucero", rol: "EDITOR", capacidadHorasSemana: 24, activo: true },
  { id: "u-ventas", nombre: "Ventas", rol: "VENTAS", capacidadHorasSemana: 40, activo: true },
  { id: "u-gerencia", nombre: "Gerencia", rol: "GERENCIA", capacidadHorasSemana: 8, activo: true },
]);
