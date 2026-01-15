import { useState, useEffect } from "react";
import { PiNotebookFill } from "react-icons/pi";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import { formatFullDate } from "../../../Utils/formatFullDate";
import useArchive from "./Hooks/useArchive";
import { getRemainingDays } from "../../../Utils/getRemainingDays";
import AlertModal from "../../../Components/AlertModal";

export default function ArchivedCourseCard({ courseData }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // States for alert modal
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [action, setAction] = useState(null);

    // Custom hook
    const { isLoading, handleRestoreCourse } = useArchive();

    const toggleExpanded = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Restore Course"}
                    description={
                        "Are you sure you want to restore this course?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() =>
                        handleRestoreCourse(
                            courseData.program.program_id,
                            courseData.course_id
                        )
                    }
                    isLoading={isLoading}
                />
            )}

            <div className="w-full max-w-100 h-full border border-ascend-gray1 shadow-shadow1 p-5 space-y-4 card-hover">
                <div className="flex items-start space-x-5 w-full">
                    <div className="p-2 rounded-[100px] bg-ascend-lightblue">
                        <PiNotebookFill className="text-5xl text-ascend-blue" />
                    </div>
                    <div className="w-full overflow-hidden">
                        <h1
                            title={`${
                                courseData.course_code
                                    ? `${courseData.course_code} - `
                                    : ""
                            } ${courseData.course_name}`}
                            className="text-size3 font-bold truncate w-full"
                        >
                            {courseData.course_code &&
                                `${courseData.course_code} - `}{" "}
                            {courseData.course_name}
                        </h1>
                        <span className="font-semibold">
                            Program: {courseData.program.program_name}
                        </span>
                        {courseData.course_description && (
                            <p className="text-size1 mt-2">
                                {isExpanded
                                    ? courseData.course_description
                                    : `${courseData.course_description.slice(
                                          0,
                                          80
                                      )}${
                                          courseData.course_description.length >
                                          80
                                              ? "..."
                                              : ""
                                      }`}
                            </p>
                        )}
                        {courseData.course_description && (
                            <div className="w-full text-end">
                                {courseData.course_description.length > 80 && (
                                    <span
                                        onClick={toggleExpanded}
                                        className="text-size1 font-bold"
                                    >
                                        {isExpanded ? "See less" : "See more"}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex  items-center gap-5">
                    <div className="flex flex-wrap justify-between items-center space-x-5">
                        <span className="text-size1">
                            Archived on {formatFullDate(courseData.deleted_at)}
                        </span>
                        <span className="text-size1">
                            Archived by{" "}
                            {courseData.archived_by
                                ? `${courseData.archived_by.first_name} ${courseData.archived_by.last_name}`
                                : courseData.program.archived_by
                                ? `${courseData.program.archived_by.first_name} ${courseData.program.archived_by.last_name}`
                                : "N/A"}
                        </span>
                    </div>

                    <PrimaryButton
                        text={"Restore"}
                        btnColor={"bg-ascend-yellow"}
                        doSomething={() => setOpenAlertModal(true)}
                    />
                </div>
            </div>
        </>
    );
}
