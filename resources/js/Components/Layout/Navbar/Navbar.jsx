import { useState, useEffect, useRef } from "react";
import { MdNotifications } from "react-icons/md";
import { usePage } from "@inertiajs/react";
import ProfileDropdown from "../Navbar/ProfileDropdown";
import NotifDropdown from "./NotifDropdown";
import useNotificationStore from "../../../Stores/Notification/notificationStore";

export default function Navbar({ setIsSidebarOpen, isMdScreen }) {
    const { url } = usePage();
    const { auth } = usePage().props;

    // States
    const [pageTitle, setPageTitle] = useState("");
    const [dropDown, setDropdown] = useState("");
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const isThereNewNotif = useNotificationStore(
        (state) => state.isThereNewNotif
    );
    const setIsThereNewNotif = useNotificationStore(
        (state) => state.setIsThereNewNotif
    );
    const numOfUnreadNotifications = useNotificationStore(
        (state) => state.numOfUnreadNotifications
    );
    const setNumOfUnreadNotifications = useNotificationStore(
        (state) => state.setNumOfUnreadNotifications
    );

    // Set the dropdown to be displayed when clicked
    const openDropdown = (dropdown) => {
        setDropdown((prev) => (dropdown === prev ? "" : dropdown));
        setIsThereNewNotif(false);
    };

    // Open sidebar
    const openSidebar = () => {
        setIsSidebarOpen(true);
    };

    useEffect(() => {
        if (url.includes("/dashboard")) {
            setPageTitle("Dashboard");
        } else if (url.includes("/administration")) {
            setPageTitle("Administration");
        } else if (url.includes("/admission")) {
            setPageTitle("Admission");
        } else if (url.includes("/programs")) {
            setPageTitle("Programs");
        } else if (url.includes("/accounting")) {
            setPageTitle("Payment History");
        } else if (url.includes("/archives")) {
            setPageTitle("Archives");
        } else if (url.includes("/grades")) {
            setPageTitle("Grades");
        } else if (
            url.includes("/payment-history") ||
            url.includes("/student-payment-history")
        ) {
            setPageTitle("Payment History");
        } else if (url.includes("/backup-and-restore")) {
            setPageTitle("Backup and Restore");
        } else {
            setPageTitle("");
        }
    }, [url]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !notifRef.current.contains(e.target) &&
                !profileRef.current.contains(e.target)
            ) {
                setDropdown("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        // Set the count of unread notifications
        setNumOfUnreadNotifications(auth.user.unread_notifications);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav
            className={`relative h-20 w-full flex items-center justify-between ${
                isMdScreen ? "pl-3 pr-6" : "px-6"
            } font-nunito-sans text-ascend-black shrink-0`}
        >
            <div className="flex items-center space-x-1 md:space-x-6">
                {isMdScreen && (
                    <button
                        onClick={openSidebar}
                        className="cursor-pointer hover:bg-ascend-lightblue p-3 rounded-[50px] transition-hover duration-300"
                    >
                        <div className="w-7 h-7 space-y-1 flex flex-col justify-center">
                            <span className="block h-[3px] w-full bg-ascend-black rounded"></span>
                            <span className="block h-[3px] w-full bg-ascend-black rounded"></span>
                            <span className="block h-[3px] w-full bg-ascend-black rounded"></span>
                        </div>
                    </button>
                )}
                <h1 className="text-size4 font-bold">{pageTitle}</h1>
            </div>

            <div className="flex items-center space-x-1 md:space-x-6">
                <div
                    ref={notifRef}
                    onClick={() => openDropdown("notif")}
                    className="group hover:bg-ascend-lightblue p-3 rounded-[50px] cursor-pointer relative transition-hover duration-300"
                >
                    {(isThereNewNotif || numOfUnreadNotifications > 0) && (
                        <div
                            className={`rounded-full px-[6px] flex justify-center items-center bg-ascend-blue absolute   ${
                                numOfUnreadNotifications > 9
                                    ? " right-1"
                                    : " right-2"
                            }
                                 top-3 border-ascend-white text-ascend-white text-size1`}
                        >
                            {numOfUnreadNotifications > 9
                                ? "9+"
                                : numOfUnreadNotifications}
                        </div>
                    )}

                    <MdNotifications className="text-size7 group-hover:text-ascend-blue" />
                </div>

                {auth.user.profile_image ? (
                    <img
                        ref={profileRef}
                        alt="Profile image"
                        src={`/storage/${auth.user.profile_image}`}
                        className="w-12 h-12 rounded-full cursor-pointer object-cover bg-ascend-gray1/20"
                        onClick={() => openDropdown("profile")}
                    ></img>
                ) : (
                    <div
                        ref={profileRef}
                        onClick={() => openDropdown("profile")}
                        className={`w-12 h-12 bg-ascend-blue rounded-4xl shrink-0 flex items-center justify-center cursor-pointer`}
                    >
                        <span
                            className={`text-size5 font-bold  text-ascend-white capitalize`}
                        >
                            {auth.user.first_name[0]}
                        </span>
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {dropDown === "notif" && (
                <NotifDropdown setDropdown={setDropdown} ref={dropdownRef} />
            )}
            {dropDown === "profile" && (
                <ProfileDropdown setDropdown={setDropdown} ref={dropdownRef} />
            )}
        </nav>
    );
}
