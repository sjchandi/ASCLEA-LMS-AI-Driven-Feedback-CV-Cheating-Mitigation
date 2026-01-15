import { create } from "zustand";

const useBackupAndRestoreStore = create((set) => ({
    refresh: 0,

    setRefresh: () => {
        set((state) => ({ refresh: state.refresh + 1 }));
    },
}));

export default useBackupAndRestoreStore;
