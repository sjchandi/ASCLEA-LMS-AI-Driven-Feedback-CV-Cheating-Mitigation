import { useState, useEffect } from "react";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./Sidebar/Sidebar";
import { usePage } from "@inertiajs/react";
import useUserStore from "../../Stores/User/userStore";
import { io } from "socket.io-client";
import useModulesStore from "../../Pages/Programs/ProgramComponent/CourseComponent/CourseContentTab/ModulesComponents/Stores/modulesStore";
import OnlineUsersSocketProvider from "../../Providers/OnlineUsersSocketProvider";

export default function MainLayout({ children }) {
    const setAuthUser = useUserStore((state) => state.setAuthUser);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMdScreen, setIsMdScreen] = useState(window.innerWidth < 1024);

    // Get the autheticated user data
    const { user } = usePage().props.auth;

    const rehydrateModuleStore = useModulesStore.persist.rehydrate;

    useEffect(() => {
        const handleFocus = () => {
            rehydrateModuleStore();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // Initialize the data uf auth user
    useEffect(() => {
        if (user) setAuthUser(user);
    }, []);

    // Get the width of window
    useEffect(() => {
        const handleResize = () => {
            setIsMdScreen(window.innerWidth < 1024);
            // console.log(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close sidebar
    const closeSidebar = () => {
        console.log("Render closeSidebar");
        setIsSidebarOpen(false);
    };

    return (
        <OnlineUsersSocketProvider user={user}>
            <div className="flex relative h-screen overflow-y-hidden">
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMdScreen={isMdScreen}
                    closeSidebar={closeSidebar}
                />
                {isSidebarOpen && (
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/25 z-40 lg:hidden transition-opacity duration-300"
                    />
                )}
                <div
                    className="flex flex-col items-center w-full h-screen overflow-x-hidden"
                    scroll-region=""
                >
                    <Navbar
                        setIsSidebarOpen={setIsSidebarOpen}
                        isMdScreen={isMdScreen}
                    />
                    <main
                        className="flex-1 flex justify-center items-start px-6 py-5 sm:px-8 w-full"
                        scroll-region=""
                    >
                        <div className="w-full max-w-[1400px]">{children}</div>
                    </main>
                </div>
            </div>
        </OnlineUsersSocketProvider>
    );
}
