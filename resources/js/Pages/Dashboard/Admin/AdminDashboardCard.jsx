import React from "react";
import { PiStudentFill } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiFileList2Fill } from "react-icons/ri";
import DashboardCard from "../Component/DashboardCard";
import { useState, useEffect } from "react";
import { useSocket } from "../../../Providers/OnlineUsersSocketProvider";
import useOnlineStudentStore from "../Stores/onlineStudentStore";

export default function StaffDashboardCard({ stats }) {
    const onlineStudents = useOnlineStudentStore(
        (state) => state.onlineStudents
    );

    const socket = useSocket();

    // useEffect(() => {
    //     if (!socket) return;

    //     socket.on("online_students", setOnlineStudents);

    //     // Cleanup: only remove the listener
    //     return () => {
    //         socket.off("online_students", setOnlineStudents);
    //     };
    // }, [socket]);

    return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <DashboardCard
                value={stats?.total_students || 0}
                icon={<PiStudentFill className="text-ascend-blue" />}
                label="Total Students"
            />
            <DashboardCard
                value={stats?.total_educators || 0}
                icon={<FaChalkboardTeacher className="text-ascend-yellow" />}
                label="Total Educators"
            />
            <DashboardCard
                value={stats?.pending_enrollees || 0}
                icon={<RiFileList2Fill className="text-[#FF663C]" />}
                label="Pending Enrollees"
            />
            <DashboardCard
                value={onlineStudents.length} // if you implement online_students
                icon={
                    <span className="text-size5 relative">
                        <BsFillPeopleFill />
                        <div className="absolute -right-1 bottom-0 bg-ascend-green w-[10px] h-[10px] rounded-xl" />
                    </span>
                }
                label="Online Students"
            />
        </div>
    );
}
