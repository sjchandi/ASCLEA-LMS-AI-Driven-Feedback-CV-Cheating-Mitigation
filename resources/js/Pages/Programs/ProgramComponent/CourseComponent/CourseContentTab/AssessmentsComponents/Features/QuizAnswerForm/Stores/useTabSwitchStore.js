import { create } from "zustand";

const useTabSwitchStore = create((set) => ({
    tabDetectionEnabled: true, // default: true during quiz
    setTabDetectionEnabled: (value) => set({ tabDetectionEnabled: value }),
}));

export default useTabSwitchStore;
