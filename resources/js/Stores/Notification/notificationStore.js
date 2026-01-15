import { create } from "zustand";

const useNotificationStore = create((set) => ({
    notifications: [],
    isThereNewNotif: false,
    isLoaded: false,
    numOfUnreadNotifications: 0,
    isInitialRender: true,

    setNotifications: (notifications) => {
        set({
            notifications,
        });
    },

    addNewNotification: (newNotification) => {
        const { notifications } = useNotificationStore.getState();

        set({
            notifications: [newNotification, ...notifications],
            isThereNewNotif: true,
        });
    },

    setIsThereNewNotif: (val) => {
        set({
            isThereNewNotif: val,
        });
    },

    setIsLoaded: (val) => {
        set({
            isLoaded: val,
        });
    },

    updateNotifications: (redNotification) => {
        const { notifications } = useNotificationStore.getState();

        // Update the notifications
        const udpatedNotifications = notifications.map((notification) =>
            notification.notification_id === redNotification.notification_id
                ? redNotification
                : notification
        );

        set({
            notifications: udpatedNotifications,
        });
    },

    clearAllNotificatiions: () =>
        set({
            notifications: [],
        }),

    setNumOfUnreadNotifications: (count) => {
        set((state) => ({
            numOfUnreadNotifications:
                count === 0 ? 0 : state.numOfUnreadNotifications + count,
        }));
    },

    setIsInitialRender: (val) => set({ isInitialRender: val }),

    clearNotificationState: () => {
        set({
            notifications: [],
            isThereNewNotif: false,
            isLoaded: false,
            numOfUnreadNotifications: 0,
            isInitialRender: true,
        });
    },
}));

export default useNotificationStore;
