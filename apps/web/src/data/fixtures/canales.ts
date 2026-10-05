import { canalSchema } from "@rgr/shared";

export const canalesFixture = canalSchema.array().parse([
  { id: "ch-ig-taller", nombre: "@rgr.tallerautomotriz", tipo: "INSTAGRAM" },
  { id: "ch-ig-rgr", nombre: "@rgr.pe", tipo: "INSTAGRAM" },
  { id: "ch-tiktok", nombre: "TikTok RGR", tipo: "TIKTOK" },
  { id: "ch-fb", nombre: "Facebook RGR", tipo: "FACEBOOK" },
  { id: "ch-marketplace", nombre: "Marketplace", tipo: "MARKETPLACE" },
  { id: "ch-whatsapp", nombre: "WhatsApp Business", tipo: "WHATSAPP" },
]);
