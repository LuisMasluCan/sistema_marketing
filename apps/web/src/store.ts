import { create } from "zustand";

type SessionUser = { id: string; name: string; email: string; role: string };

type UiState = {
  leadDialogOpen: boolean;
  setLeadDialogOpen: (open: boolean) => void;
  sessionUser: SessionUser | null;
  setSessionUser: (user: SessionUser | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  leadDialogOpen: false,
  setLeadDialogOpen: (leadDialogOpen) => set({ leadDialogOpen }),
  sessionUser: null,
  setSessionUser: (sessionUser) => set({ sessionUser }),
}));
