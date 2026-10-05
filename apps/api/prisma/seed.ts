import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/password.js";
import { z } from "zod";

const setup = z
  .object({
    DATABASE_URL: z.url(),
    BOOTSTRAP_ADMIN_EMAIL: z.email(),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().min(12),
    BOOTSTRAP_ADMIN_NAME: z.string().trim().min(2).default("Arturo"),
  })
  .parse(process.env);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: setup.DATABASE_URL }),
});

const taskSeed = [
  [
    "content-calendar",
    "Programar calendario de contenido · próximas 4 semanas",
    "Arturo",
  ],
  ["lead-registry", "Activar registro de leads por unidad y canal", "Arturo"],
  [
    "whatsapp-business",
    "Coordinar configuración de WhatsApp Business con Luis",
    "Arturo + Luis",
  ],
  [
    "marketplace-listings",
    "Publicar CAT 320, L200, Isuzu y unidades disponibles en Marketplace",
    "Arturo",
  ],
  [
    "workshop-media",
    "Grabar banco audiovisual: mantenimiento, frenos, Brain Bee, GDI y undercoating",
    "Claudia",
  ],
  [
    "sales-media",
    "Grabar banco audiovisual de CAT 320, L200, Isuzu y demás unidades",
    "Claudia",
  ],
  ["workshop-launch", "Lanzar campaña «Pon tu vehículo al día»", "Arturo"],
  ["parallel-campaigns", "Iniciar campañas prioritarias en paralelo", "Arturo"],
] as const;

const productSeed = [
  {
    sku: "CAT-320-2011",
    name: "CAT 320",
    businessUnit: "machinery" as const,
    category: "Excavadora",
    make: "CAT",
    model: "320",
    year: 2011,
    quantity: 1,
    hoursSinceOverhaul: 9200,
    summary:
      "Repotenciada en 2019 · aproximadamente 9,200 horas desde la repotenciación.",
    price: 85000,
    currency: "USD",
  },
  {
    sku: "MITSUBISHI-L200-2026",
    name: "Mitsubishi L200 4×4 2.4 TD GLX MT",
    businessUnit: "machinery" as const,
    category: "Camioneta",
    make: "Mitsubishi",
    model: "L200 4×4 2.4 TD GLX MT",
    year: 2026,
    quantity: 2,
    summary:
      "Estribos, defensa, antivuelco, tolva inyectada, parlante y sirena. Precio por unidad.",
    price: 38000,
    currency: "USD",
  },
  {
    sku: "ISUZU-KV600-COMPACTADORA-7M3",
    name: "Isuzu KV600 + compactadora 7 m³",
    businessUnit: "machinery" as const,
    category: "Camión compactador",
    make: "Isuzu",
    model: "KV600 + compactadora 7 m³",
    quantity: 1,
    summary: "Una unidad disponible.",
    price: 550000,
    currency: "PEN",
  },
  {
    sku: "MOTOCARROS-TIKTOK-LIVE",
    name: "Motocarros disponibles",
    businessUnit: "machinery" as const,
    category: "Motocarro",
    quantity: 0,
    summary:
      "La promoción y atención comercial de motocarros se realiza exclusivamente por TikTok Live.",
    price: null,
    currency: null,
    channelRestriction: "TikTok Live",
  },
] as const;

const offerSeed = [
  {
    sku: "PREVENTIVE-MAINTENANCE",
    name: "Mantenimiento preventivo",
    description: "Servicio principal de captación · cotización según vehículo.",
  },
  {
    sku: "BRAKE-CLEANING",
    name: "Ajuste y limpieza de frenos",
    description: "Precio promocional.",
    price: 99,
  },
  {
    sku: "BRAIN-BEE-AC",
    name: "Aire acondicionado Brain Bee",
    description: "Desde S/250.",
    price: 250,
  },
  {
    sku: "GDI-INJECTOR-CLEANING",
    name: "Limpieza de inyectores GDI",
    description: "Sin repuestos.",
    price: 250,
  },
  {
    sku: "UNDERCOATING-AUTO",
    name: "Undercoating + zincado tubo de escape",
    vehicleType: "Auto",
    price: 450,
  },
  {
    sku: "UNDERCOATING-SUV",
    name: "Undercoating + zincado tubo de escape",
    vehicleType: "SUV",
    price: 550,
  },
  {
    sku: "UNDERCOATING-PICKUP",
    name: "Undercoating + zincado tubo de escape",
    vehicleType: "Pickup",
    price: 690,
  },
] as const;

const feedPlan = [
  {
    weekday: 0,
    businessUnit: "workshop" as const,
    format: "Reel",
    pillar: "educación",
    title: "Checklist de mantenimiento antes de un viaje largo",
  },
  {
    weekday: 1,
    businessUnit: "machinery" as const,
    format: "Reel",
    pillar: "producto",
    title: "CAT 320 · encendido, motor y horómetro",
  },
  {
    weekday: 2,
    businessUnit: "workshop" as const,
    format: "Post",
    pillar: "promoción",
    title: "Ajuste y limpieza de frenos · S/99",
  },
  {
    weekday: 2,
    businessUnit: "machinery" as const,
    format: "Post",
    pillar: "producto",
    title: "Mitsubishi L200 4×4 · ficha y equipamiento",
  },
  {
    weekday: 3,
    businessUnit: "workshop" as const,
    format: "Reel",
    pillar: "trabajo real",
    title: "Diagnóstico Brain Bee en acción",
  },
  {
    weekday: 4,
    businessUnit: "workshop" as const,
    format: "Reel",
    pillar: "trabajo real",
    title: "Proceso de mantenimiento preventivo",
  },
  {
    weekday: 4,
    businessUnit: "workshop" as const,
    format: "Post",
    pillar: "promoción",
    title: "Aire acondicionado Brain Bee desde S/250",
  },
  {
    weekday: 4,
    businessUnit: "machinery" as const,
    format: "Reel",
    pillar: "producto",
    title: "Isuzu KV600 · compactadora 7 m³ en operación",
  },
  {
    weekday: 4,
    businessUnit: "machinery" as const,
    format: "Post",
    pillar: "producto",
    title: "CAT 320 · ficha, horas y precio",
  },
] as const;

async function seed() {
  const email = setup.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: setup.BOOTSTRAP_ADMIN_NAME,
      email,
      passwordHash: await hashPassword(setup.BOOTSTRAP_ADMIN_PASSWORD),
      role: "ADMIN",
    },
  });

  for (let index = 0; index < taskSeed.length; index += 1) {
    const [key, title, owner] = taskSeed[index];
    await prisma.task.upsert({
      where: { key },
      update: { title, description: `Responsable: ${owner}` },
      create: {
        key,
        title,
        description: `Responsable: ${owner}`,
        priority: index < 4 ? 1 : 2,
        status: "pending",
      },
    });
  }

  for (const product of productSeed) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  for (const offer of offerSeed) {
    await prisma.serviceOffer.upsert({
      where: { sku: offer.sku },
      update: offer,
      create: offer,
    });
  }

  const now = new Date();
  await prisma.campaign.upsert({
    where: { key: "pon-tu-vehiculo-al-dia" },
    update: {},
    create: {
      key: "pon-tu-vehiculo-al-dia",
      name: "Pon tu vehículo al día",
      businessUnit: "workshop",
      product: "Mantenimiento preventivo",
      audience:
        "Conductores particulares y empresas con flotas · Pucallpa / Ucayali",
      objective: "Generar consultas y citas atribuibles",
      budget: 700,
      startsAt: now,
    },
  });
  await prisma.campaign.upsert({
    where: { key: "equipos-rgr-disponibles" },
    update: {},
    create: {
      key: "equipos-rgr-disponibles",
      name: "Equipos RGR disponibles",
      businessUnit: "machinery",
      product: "CAT 320 · Mitsubishi L200 · Isuzu KV600",
      audience: "Constructoras, mineras, contratistas, transporte · 4 regiones",
      objective: "Generar leads calificados",
      budget: 300,
      startsAt: now,
    },
  });

  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const contentPieces = feedPlan.flatMap((piece) =>
    Array.from({ length: 4 }, (_, week) => {
      const scheduledAt = new Date(monday);
      scheduledAt.setDate(scheduledAt.getDate() + week * 7 + piece.weekday);
      const key = `launch-w${week + 1}-${piece.businessUnit}-${piece.format}-${piece.weekday}-${piece.title}`;
      return {
        key,
        title: `${piece.title}${week === 0 ? "" : ` · semana ${week + 1}`}`,
        businessUnit: piece.businessUnit,
        format: piece.format,
        channel:
          piece.businessUnit === "workshop"
            ? "Instagram"
            : "Instagram · Facebook · Marketplace",
        pillar: piece.pillar,
        status: "scheduled" as const,
        assignee: "Claudia",
        scheduledAt,
      };
    }),
  );
  for (const piece of contentPieces) {
    await prisma.contentPiece.upsert({
      where: { key: piece.key },
      update: { ...piece },
      create: { ...piece },
    });
  }

  console.info(
    `Seed listo: admin ${email}, ${taskSeed.length} tareas, ${productSeed.length} productos, ${offerSeed.length} servicios y ${contentPieces.length} piezas de calendario.`,
  );
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
