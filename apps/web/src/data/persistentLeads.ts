import { create } from "zustand";
import type { CreateLeadInput, LeadRecord, LeadStatus } from "@rgr/shared";
import { apiRequest } from "./api";

type PersistentLeadState = {
  leads: LeadRecord[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (input: CreateLeadInput) => Promise<void>;
  update: (id: string, input: CreateLeadInput) => Promise<void>;
  setStatus: (id: string, status: LeadStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function normalizeLead(
  lead: Omit<LeadRecord, "date" | "amount"> & {
    date: string | Date;
    amount: number | string | null;
  },
): LeadRecord {
  return {
    ...lead,
    date: new Date(lead.date).toISOString(),
    amount: lead.amount === null ? null : Number(lead.amount),
  };
}

export const usePersistentLeads = create<PersistentLeadState>((set, get) => ({
  leads: [],
  isLoading: true,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const rows = await apiRequest<Array<Parameters<typeof normalizeLead>[0]>>(
        "/api/leads",
      );
      set({ leads: rows.map(normalizeLead), isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "No se pudieron cargar los leads",
      });
      throw error;
    }
  },
  create: async (input) => {
    const row = await apiRequest<Parameters<typeof normalizeLead>[0]>(
      "/api/leads",
      { method: "POST", body: JSON.stringify(input) },
    );
    set({ leads: [normalizeLead(row), ...get().leads], error: null });
  },
  update: async (id, input) => {
    const row = await apiRequest<Parameters<typeof normalizeLead>[0]>(
      `/api/leads/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    set({
      leads: get().leads.map((lead) => lead.id === id ? normalizeLead(row) : lead),
      error: null,
    });
  },
  setStatus: async (id, status) => {
    const row = await apiRequest<Parameters<typeof normalizeLead>[0]>(
      `/api/leads/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
    set({
      leads: get().leads.map((lead) => lead.id === id ? normalizeLead(row) : lead),
      error: null,
    });
  },
  remove: async (id) => {
    await apiRequest(`/api/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
    set({ leads: get().leads.filter((lead) => lead.id !== id), error: null });
  },
}));
