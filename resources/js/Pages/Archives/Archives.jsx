import { useEffect, useState } from "react";
import Tabs from "../../Components/Tabs/Tabs";
import ArchivedCourses from "./ArchiveComponents/ArchivedCourses";
import ArchivedStudents from "./ArchiveComponents/ArchivedStudents";
import ArchivedStaff from "./ArchiveComponents/ArchivedStaff";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import useArchiveStore from "./ArchiveComponents/Stores/archiveStore";

export default function Archives() {
    // Archive Store
    const activeTab = useArchiveStore((state) => state.activeTab);
    const setActiveTab = useArchiveStore((state) => state.setActiveTab);

    const [isLoading, setIsLoading] = useState(false);

    // Tab list
    const tabs = [
        { name: "Courses", onlyData: ["archivedCourses"] },
        { name: "Students", onlyData: [] },
        { name: "Administration", onlyData: ["archivedStaff"] },
    ];

    const handleClickTab = (tabIndex, onlyData) => {
        setActiveTab(tabIndex);
        setIsLoading(true);
        router.get(
            route("archives.index"),
            {},
            {
                only: onlyData,
                preserveScroll: false,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <div className="space-y-5">
            <div className="h-12 -mt-2 sm:-mt-5 border-b border-ascend-gray1 w-full py-1 flex sm:justify-center items-center overflow-x-auto space-x-1 font-nunito-sans text-ascend-black">
                {tabs.map((tab, index) =>
                    tab ? (
                        <div
                            key={index}
                            onClick={() => handleClickTab(index, tab.onlyData)}
                            className={`py-1.5 px-8 cursor-pointer font-bold hover:bg-ascend-lightblue  transition-all duration-300 ${
                                activeTab === index &&
                                "bg-ascend-lightblue text-ascend-blue"
                            }`}
                        >
                            <span>{tab.name}</span>
                        </div>
                    ) : null
                )}
            </div>

            {/* isloading prevents component to render while navigation is still loading */}
            {!isLoading && activeTab === 0 && <ArchivedCourses />}
            {!isLoading && activeTab === 1 && <ArchivedStudents />}
            {!isLoading && activeTab === 2 && <ArchivedStaff />}
        </div>
    );
}
