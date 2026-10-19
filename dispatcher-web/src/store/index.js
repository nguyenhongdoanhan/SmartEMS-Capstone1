import { create } from "zustand";

export const useStore = create((set) => ({
  token: null,
  ambulances: {},
  emergencies: [],
  setToken: (token) => set({ token }),
  upsertAmbulance: (a) => set((s) => ({ ambulances: { ...s.ambulances, [a.ambulance_id]: a } })),
}));
