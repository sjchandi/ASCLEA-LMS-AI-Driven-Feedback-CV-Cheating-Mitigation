import { forwardRef, useState } from "react";
import { MdOutlineAssignment, MdNotifications } from "react-icons/md";
import useNotification from "../../../Hooks/useNotification";
import useNotificationStore from "../../../Stores/Notification/notificationStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Loader from "../../Loader";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

const NotifDropdown = forwardRef((props, ref) => {
    console.log("Render Notif");

    // Notification store
    const notifications = useNotificationStore((state) => state.notifications);
    const isInitialRender = useNotificationStore(
        (state) => state.isInitialRender
    );

    const { isLoading, readNotification, markAllAsRead, clearAll } =
        useNotification();

    const handleClickNotif = (notification) => {
        // Close the dropdown
        props.setDropdown("");

        //  Updatethe read at in the database
        if (!notification.read_at) {
            readNotification(notification.notification_id);
        }

        // Navigate to the notification action url
        router.visit(notification.action_url);
    };

    return (
        <div
            ref={ref}
            className="absolute z-40 top-full right-6 left-6 sm:left-auto sm:w-[450px] pt-2 pb-5 bg-white shadow-lg border-ascend-gray1 border h-[60vh] overflow-y-auto scrollbar-default hover:scrollbar-hover "
        >
            <div className="font-nunito-sans w-full text-ascend-black flex flex-col space-y-2 h-full">
                <div className="px-5 pt-3 pb-2 space-y-2">
                    <h1 className="font-bold text-size4">Notifications</h1>
                    <div className="flex flex-wrap text-right">
                        {console.log(notifications)}
                        <button
                            disabled={
                                isLoading ||
                                !notifications.some((n) => n.read_at === null)
                            }
                            onClick={markAllAsRead}
                            className="hover:text-ascend-blue transition-all duration-300 py-1 px-2 hover:bg-ascend-lightblue"
                        >
                            <span
                                className={`cursor-pointer font-bold text-nowraps ${
                                    notifications.some(
                                        (n) => n.read_at === null
                                    )
                                        ? "text-ascend-black"
                                        : "text-ascend-gray2"
                                }`}
                            >
                                Mark all as read
                            </span>
                        </button>
                        <button
                            disabled={isLoading || notifications.length === 0}
                            onClick={clearAll}
                            className="hover:text-ascend-blue transition-all duration-300 py-1 px-2 hover:bg-ascend-lightblue"
                        >
                            <span
                                className={`cursor-pointer font-bold text-nowraps ${
                                    notifications.length > 0
                                        ? "text-ascend-black"
                                        : "text-ascend-gray2"
                                }`}
                            >
                                Clear all
                            </span>
                        </button>
                    </div>
                </div>
                <div className="h-full overflow-x-hidden">
                    {console.log(isInitialRender)}
                    {isLoading && isInitialRender && (
                        <div className="h-full w-full flex  items-center justify-center">
                            <Loader color="text-ascend-blue" />
                        </div>
                    )}

                    {/* Animate clearing the notifications */}
                    <AnimatePresence>
                        {(!isInitialRender || notifications.length > 0) &&
                            notifications.map((notification) => (
                                <motion.div
                                    onClick={() =>
                                        handleClickNotif(notification)
                                    }
                                    key={notification.notification_id}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 1, x: 1500 }}
                                    transition={{ duration: 0.1 }}
                                    className={`${
                                        notification.read_at ? "" : "font-bold"
                                    } hover:bg-ascend-lightblue transition-all duration-300 pl-5 pr-3 flex items-start cursor-pointer space-x-5 py-2`}
                                >
                                    <div className="p-4 mt-2 bg-ascend-lightyellow rounded-[50px]">
                                        <MdNotifications className="text-size6 text-ascend-yellow" />
                                    </div>
                                    <div className="h-full py-2 flex flex-col justify-between">
                                        <p className="">
                                            {notification.notification_body}
                                        </p>

                                        <span className="text-size1">
                                            {dayjs(
                                                notification.created_at
                                            ).fromNow()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                    </AnimatePresence>

                    {!isLoading && notifications.length === 0 && (
                        <div className="h-full w-full flex  items-center justify-center">
                            <p className="text-size3">No notifcations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default NotifDropdown;
