import { create } from "zustand";

const useOnlineStudentStore = create((set) => ({
    onlineStudents: [],

    setOnlineStudents: (students) => {
        set({
            onlineStudents: students,
        });
    },
}));

export default useOnlineStudentStore;
