import { useState, useEffect } from "react";
import SidebarLink from "./SidebarLink";
import useUserStore from "../../../Stores/User/userStore";

// Icon
import {
    MdSpaceDashboard,
    MdPeopleAlt,
    MdNoteAlt,
    MdSchool,
    MdClose,
    MdPayments,
    MdRateReview,
    MdArchive,
    MdBackup,
} from "react-icons/md";

export default function Sidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    isMdScreen,
    closeSidebar,
}) {
    const user = useUserStore((state) => state.user);
    const [expanded, setExpanded] = useState(true);

    const links = [
        {
            url: "/dashboard",
            text: "Dashboard",
            icon: MdSpaceDashboard,
            roles: ["admin", "faculty", "student"],
        },
        {
            url: "/administration",
            text: "Administration",
            icon: MdPeopleAlt,
            roles: ["admin"],
        },
        {
            url: "/admission",
            text: "Admission",
            icon: MdSchool,
            roles: ["admin", "student", "faculty"],
        },
        {
            url: "/programs",
            text: "Programs",
            icon: MdNoteAlt,
            roles: ["admin", "faculty", "student"],
        },
        {
            url: "/payment-history",
            text: "Payment History",
            icon: MdPayments,
            roles: ["admin"],
        },
        {
            url: "/archives",
            text: "Archives",
            icon: MdArchive,
            roles: ["admin"],
        },
        {
            url: "/grades",
            text: "Grades",
            icon: MdRateReview,
            roles: ["student"],
        },
        {
            url: "/student-payment-history",
            text: "Payment History",
            icon: MdPayments,
            roles: ["student"],
        },
        {
            url: "/backup-and-restore",
            text: "Backup and Restore",
            icon: MdBackup,
            roles: ["admin"],
        },
    ];

    // Get the width of window
    useEffect(() => {
        const handleResize = () => {
            setExpanded(window.innerWidth >= 1280 || window.innerWidth < 1024);
            // console.log(window.innerWidth >= 1280);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMenu = () => {
        console.log("Render toggleMenu");
        setExpanded(!expanded);
    };

    console.log("Render Sidebar");
    return (
        <aside
            className={`absolute h-screen flex flex-col z-50 bg-white shadow-[4px_0px_10px_0px_rgba(0,0,0,0.25)] transition-all duration-200
          ${isSidebarOpen ? "left-0 w-full sm:w-100" : "-left-full w-0"}
          lg:static
          ${expanded ? "xl:w-100 lg:w-100" : "xl:w-20 lg:w-20"}
        `}
        >
            <div
                className={`h-20 flex items-center w-full ${
                    expanded ? "justify-between pl-6 pr-3" : "justify-center"
                }`}
            >
                {/* Display logo */}
                {expanded && (
                    <img
                        src="/images/ascend_logo.png"
                        alt="Logo"
                        className="h-14"
                    />
                )}

                {/* Menu button */}
                {isSidebarOpen && isMdScreen ? (
                    <div
                        onClick={closeSidebar}
                        className="text-2xl cursor-pointer hover:bg-ascend-lightblue p-3 rounded-[50px]  transition-hover duration-300"
                    >
                        <MdClose />
                    </div>
                ) : (
                    <button
                        className="cursor-pointer hover:bg-ascend-lightblue p-3 rounded-[50px] transition-hover duration-300"
                        onClick={toggleMenu}
                    >
                        <div className="w-7 h-7 hidden space-y-1 lg:flex flex-col items-end justify-center ">
                            <span
                                className={`${
                                    expanded
                                        ? "block h-[3px] w-4 bg-ascend-black rounded"
                                        : "block h-[3px] w-full bg-ascend-black rounded"
                                } transition-all duration-600`}
                            ></span>
                            <span className="block h-[3px] w-full bg-ascend-black rounded"></span>
                            <span
                                className={`${
                                    expanded
                                        ? "block h-[3px] w-3 bg-ascend-black rounded"
                                        : "block h-[3px] w-full bg-ascend-black rounded"
                                } transition-all duration-600`}
                            ></span>
                        </div>
                    </button>
                )}
            </div>
            {/* link.roles.includes(user?.role) */}
            {/* Links */}
            <ul className="flex-1 py-6 space-y-6 font-nunito-sans font-semibold overflow-y-auto">
                {links
                    .filter((link) => {
                        if (
                            Array.isArray(link.roles) &&
                            link.roles.includes(user?.role)
                        ) {
                            if (user?.role === "student") {
                                if (link.url === "/admission") return link; // Admission link is always visible to students

                                return user?.approved &&
                                    user?.enrollment_status === "enrolled" // Only show other links if approved and enrolled
                                    ? link
                                    : null;
                            }
                            return link;
                        }
                    })
                    .map((link, index) => {
                        return (
                            <li key={index}>
                                <SidebarLink
                                    linkUrl={link.url}
                                    text={link.text}
                                    icon={link.icon}
                                    expanded={expanded}
                                    setIsSidebarOpen={setIsSidebarOpen}
                                    closeSidebar={closeSidebar}
                                />
                            </li>
                        );
                    })}
            </ul>
        </aside>
    );
}
