import React, { useEffect, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import ProfileImage from "../../../../../../../../../Components/ProfileImage";
import Loader from "../../../../../../../../../Components/Loader";

export default function ViewTabSwitches({
    setIsEvidenceOpen,
    assessmentSubmissionId,
    studentData,
}) {
    const [tabSwitches, setTabSwitches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTabSwitches = async () => {
            try {
                const res = await fetch(
                    `/tab-switching/${assessmentSubmissionId}`
                );
                if (!res.ok) throw new Error("Failed to fetch tab switches");

                const data = await res.json();

                // Matches your backend key: tab_detects
                setTabSwitches(data.tab_detects || []);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTabSwitches();
    }, [assessmentSubmissionId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/25 z-999 flex items-center justify-center font-nunito-sans">
                <div className="bg-ascend-white w-200 p-10 text-center text-size4 font-semibold">
                    <Loader color="text-ascend-blue" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/25 z-999 flex items-center justify-center font-nunito-sans">
            <div className="bg-ascend-white opacity-100 p-5 w-200 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto my-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-size4 font-bold">Tab Switch Activity</h1>

                    <div
                        onClick={() => setIsEvidenceOpen(false)}
                        className="hover:bg-ascend-lightblue transition-all duration-300 p-1 rounded-4xl cursor-pointer"
                    >
                        <MdOutlineClose className="text-size5" />
                    </div>
                </div>

                {/* Student Info */}
                <div className="flex flex-wrap gap-5 items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <ProfileImage
                            userData={studentData}
                            profileImageSize={"w-20 h-20"}
                            textSize={"text-size7"}
                        />

                        <div>
                            <h1 className="text-size3 font-semibold">
                                {studentData.first_name}{" "}
                                {studentData.last_name}
                            </h1>
                            <span>{studentData.email}</span>
                        </div>
                    </div>
                </div>
                {tabSwitches.map((item, index) => (
                    <div key={index} className="py-1 border-b border-ascend-gray1">
                        <span className="text-size2">
                            {item.message}
                        </span>
                    </div>
                ))}

                {tabSwitches.length === 0 && (
                    <div className="text-center text-ascend-gray1 py-10">
                        No tab switching detected
                    </div>
                )}
            </div>
        </div>
    );
}
