import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { prisma } from "./db.js";
import { env } from "./env.js";

const queueName = "marketing-operations";
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue(queueName, { connection });

function mondayAtUtc(date: Date) {
  const monday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  return monday;
}

async function createWeeklySnapshot() {
  const weekStarting = mondayAtUtc(new Date());
  const nextWeek = new Date(weekStarting);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const [leads, prospects, content, campaigns] = await Promise.all([
    prisma.lead.findMany({
      where: { date: { gte: weekStarting, lt: nextWeek } },
    }),
    prisma.companyProspect.findMany({
      where: { createdAt: { gte: weekStarting, lt: nextWeek } },
    }),
    prisma.contentPiece.findMany({
      where: { scheduledAt: { gte: weekStarting, lt: nextWeek } },
    }),
    prisma.campaign.findMany({ where: { active: true } }),
  ]);

  const workshop = leads.filter((lead) => lead.businessUnit === "workshop");
  const machinery = leads.filter((lead) => lead.businessUnit === "machinery");
  const responseDurations = leads
    .filter((lead) => lead.contactedAt)
    .map(
      (lead) => (lead.contactedAt!.getTime() - lead.date.getTime()) / 60_000,
    );
  const revenue = workshop
    .filter((lead) => lead.sold)
    .reduce((total, lead) => total + Number(lead.amount ?? 0), 0);
  const workshopChannels = workshop.reduce<Record<string, number>>(
    (counts, lead) => {
      counts[lead.channel] = (counts[lead.channel] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const metrics = {
    marketing: {
      scheduled: content.length,
      published: content.filter((piece) => piece.status === "published").length,
      activeCampaigns: campaigns.length,
      budget: campaigns.reduce(
        (total, campaign) => total + Number(campaign.budget),
        0,
      ),
      spend: campaigns.reduce(
        (total, campaign) => total + Number(campaign.spent),
        0,
      ),
    },
    workshop: {
      leads: workshop.length,
      appointments: workshop.filter((lead) => lead.appointment).length,
      arrivals: workshop.filter((lead) => lead.arrived).length,
      sales: workshop.filter((lead) => lead.sold).length,
      revenue,
      channels: workshopChannels,
    },
    machinery: {
      leads: machinery.length,
      qualified: machinery.filter(
        (lead) => lead.product && lead.city && lead.need,
      ).length,
      quoted: machinery.filter((lead) => lead.status === "quoted").length,
      inFollowUp: machinery.filter((lead) => lead.status === "follow_up")
        .length,
    },
    whatsapp: {
      leads: leads.length,
      contacted: responseDurations.length,
      averageResponseMinutes: responseDurations.length
        ? responseDurations.reduce((total, value) => total + value, 0) /
          responseDurations.length
        : null,
      pending: leads.filter((lead) => lead.status === "new").length,
    },
    prospecting: {
      added: prospects.length,
      contacted: prospects.filter((prospect) => prospect.status === "contacted")
        .length,
      interested: prospects.filter(
        (prospect) => prospect.status === "interested",
      ).length,
      followUp: prospects.filter((prospect) => prospect.status === "follow_up")
        .length,
    },
  };

  return prisma.weeklyReport.upsert({
    where: { weekStarting },
    create: { weekStarting, metrics },
    update: { metrics },
  });
}

export async function startWorkers() {
  await queue.upsertJobScheduler(
    "sla-scan",
    { every: 60_000 },
    { name: "sla-scan" },
  );
  await queue.upsertJobScheduler(
    "weekly-report",
    { pattern: "0 13 * * 1" },
    { name: "weekly-report" },
  );

  const worker = new Worker(
    queueName,
    async (job) => {
      if (job.name === "sla-scan") {
        const cutoff = new Date(Date.now() - 10 * 60_000);
        return prisma.lead.updateMany({
          where: { status: "new", slaBreached: false, date: { lte: cutoff } },
          data: { slaBreached: true },
        });
      }
      if (job.name === "weekly-report") return createWeeklySnapshot();
      return null;
    },
    { connection },
  );

  return async () => {
    await worker.close();
    await queue.close();
    await connection.quit();
  };
}
