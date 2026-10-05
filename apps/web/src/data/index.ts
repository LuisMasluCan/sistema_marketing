import {
  staticAudiovisualRepo,
  staticCampaignsRepo,
  staticCatalogRepo,
  staticContentRepo,
  staticLeadsRepo,
  staticMarketplaceRepo,
  staticProspectingRepo,
  staticTasksRepo,
  staticWhatsAppRepo,
  useStaticDataStore,
} from "./static";

export const dataMode = "static" as const;
export const repositories = {
  leads: staticLeadsRepo,
  prospecting: staticProspectingRepo,
  campaigns: staticCampaignsRepo,
  content: staticContentRepo,
  tasks: staticTasksRepo,
  catalog: staticCatalogRepo,
  marketplace: staticMarketplaceRepo,
  whatsapp: staticWhatsAppRepo,
  audiovisual: staticAudiovisualRepo,
};
export { useStaticDataStore };
