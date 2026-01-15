import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useOnlineStudentStore from "../Pages/Dashboard/Stores/onlineStudentStore";
import useNotificationStore from "../Stores/Notification/notificationStore";
import { displayToast } from "../Utils/displayToast";
import DefaultCustomToast from "../Components/CustomToast/DefaultCustomToast";
import useBackupAndRestoreStore from "../Pages/BackupAndRestore/Stores/backupAndRestoreStore";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export default function OnlineUsersSocketProvider({ children, user }) {
    const setOnlineStudents = useOnlineStudentStore(
        (state) => state.setOnlineStudents
    );

    const addNewNotification = useNotificationStore(
        (state) => state.addNewNotification
    );
    const setNumOfUnreadNotifications = useNotificationStore(
        (state) => state.setNumOfUnreadNotifications
    );
    const setRefresh = useBackupAndRestoreStore((state) => state.setRefresh);

    const socketRef = useRef(null);

    useEffect(() => {
        if (!user || socketRef.current) return; // already connected

        const host = import.meta.env.VITE_MAIN_URL;
        const path = import.meta.env.VITE_SOCKET_IO_PATH;
        const port = import.meta.env.VITE_SOCKET_IO_PORT;
        const url = port ? `${host}:${port}` : host;

        const socket = io(url, {
            path,
            transports: ["websocket"],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.emit("user_online", { user });

        const ping = setInterval(
            () => socket.emit("student_ping", { user }),
            30000
        );

        const handleUnload = () => socket.emit("student_offline", { user });
        window.addEventListener("beforeunload", handleUnload);

        // Get the list of online users
        socket.on("online_students", setOnlineStudents);

        // Add the new notification
        socket.on("notification", (data) => {
            console.log(data);
            addNewNotification(data.notification);
            setNumOfUnreadNotifications(1);
            displayToast(
                <DefaultCustomToast
                    message={data.notification.notification_title}
                />,
                "info"
            );
        });

        // Listens to new backup data
        // If there's new data we refresh a state to reload the BackupAndRestore component
        socket.on("backup", (data) => {
            if (data.backup) {
                setRefresh();
            }
        });

        return () => {
            clearInterval(ping);
            window.removeEventListener("beforeunload", handleUnload);
            socket.off("online_students", setOnlineStudents);
            socket.off("notification");
            socket.off("backup");
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
}
