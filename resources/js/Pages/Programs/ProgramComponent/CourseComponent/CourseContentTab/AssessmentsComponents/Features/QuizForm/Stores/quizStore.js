import { create } from "zustand";

const useQuizStore = create((set) => ({
    isFormSaving: false,
    isQuizDetailsChanged: false,
    quizDetails: {
        quiz_title: "",
        quiz_description: null,
        quiz_total_points: 0,
        duration: "",
        show_answers_after: false,
        cheating_mitigation: false,
        randomize: false,
        quiz_total_points: 0,
        cv_options: [],
    },
    savedLabel: "",

    setIsFormSaving: (value) => {
        set({
            isFormSaving: value,
        });
    },

    setQuizDetails: (updatedDetails) => {
        const { quizDetails } = useQuizStore.getState();
        console.log(updatedDetails);
        set({
            quizDetails: { ...quizDetails, ...updatedDetails },
        });
    },

    setSavedLabel: (label) => {
        set({
            savedLabel: label,
        });
    },

    setIsQuizDetailsChanged: (value) => {
        set({ isQuizDetailsChanged: value });
    },

    resetQuizStore: () => {
        set({
            isFormSaving: false,
            isQuizDetailsChanged: false,
            savedLabel: "",
            quizDetails: {
                quiz_title: "",
                quiz_description: null,
                quiz_total_points: 0,
                duration: "",
                show_answers_after: false,
                cheating_mitigation: false,
                randomize: false,
                quiz_total_points: 0,
                cv_options: [],
            },
        });
    },
}));

export default useQuizStore;
