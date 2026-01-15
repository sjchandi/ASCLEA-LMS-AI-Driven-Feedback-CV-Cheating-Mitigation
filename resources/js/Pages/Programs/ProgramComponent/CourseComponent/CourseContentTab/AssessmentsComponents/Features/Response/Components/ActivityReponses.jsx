import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import BackButton from "../../../../../../../../../Components/Button/BackButton";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import { handleClickBackBtn } from "../../../../../../../../../Utils/handleClickBackBtn";
import { IoCaretDownOutline } from "react-icons/io5";
import { FaSort } from "react-icons/fa";
import { BiSortUp } from "react-icons/bi";
import { usePage } from "@inertiajs/react";
import Pagination from "../../../../../../../../../Components/Pagination";
import ResponseAttachedFiles from "./ResponseAttachedFiles";
import useSearchSortResponses from "../Hooks/useSearchSortResponses";
import ActivityResponseRow from "./ActivityResponseRow";
import useReturnActivity from "../Hooks/useReturnActivity";
import { closeDropDown } from "../../../../../../../../../Utils/closeDropdown";
import EmptyState from "../../../../../../../../../Components/EmptyState/EmptyState";
import AlertModal from "../../../../../../../../../Components/AlertModal";

export default function ActivityReponses() {
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const {
        programId,
        courseId,
        assessment,
        responses,
        responsesCount,
        gradedResponsesCount,
        returnedResponsesCount,
    } = usePage().props;

    // Custom hook
    const {
        debouncedSearch,
        handleSortSubmittedDate,
        sortSubmittedDate,
        handleFilterSubmissionStatus,
        search,
        submissionStatus,
        isSearchSortLoading,
    } = useSearchSortResponses({
        programId,
        courseId,
        assessmentId: assessment.assessment_id,
    });

    const {
        selectAll,
        selectedSubmittedActivities,
        handleSelectAll,
        handleSelectSubmittedActivity,
        handlePostGrades,
        isLoading,
    } = useReturnActivity({
        courseId,
        assessmentId: assessment.assessment_id,
        responses,
    });

    const handlePostGradesClick = () => {
        setOpenAlertModal(true);
    };

    return (
        <div className="space-y-5 font-nunito-sans">
            {/* Display alert modal */}
            {openAlertModal && (
                <AlertModal
                    title={"Post Grades Confirmation"}
                    description={
                        "Once posted, grades will be visible to students. Are you sure you want to continue?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() => {
                        handlePostGrades(setOpenAlertModal);
                    }}
                    isLoading={isLoading}
                />
            )}

            <div className="flex items-center w-full justify-between">
                <div className="flex">
                    <BackButton doSomething={handleClickBackBtn} />
                </div>

                <PrimaryButton
                    isDisabled={
                        (!selectAll &&
                            selectedSubmittedActivities.length === 0) ||
                        isLoading
                    }
                    doSomething={handlePostGradesClick}
                    text={"Post Grades"}
                />
            </div>
            <div className="w-full min-w-0">
                <h1 className="text-size6 break-words font-semibold">
                    {assessment.assessment_title}
                </h1>
                <div className="space-x-5 flex flex-wrap">
                    <span className="font-medium text-nowrap">
                        Total Points: {assessment.total_points}
                    </span>
                    <span className="font-medium text-nowrap">
                        Responses Received: {responsesCount}
                    </span>
                    <span className="font-medium text-nowrap">
                        Graded: {gradedResponsesCount}
                    </span>
                    <span className="font-medium text-nowrap">
                        Returned: {returnedResponsesCount}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
                <h1 className="text-size5 break-words font-semibold">
                    Student Outputs
                </h1>

                <div className="flex flex-wrap w-full sm:w-fit gap-2">
                    <select
                        onChange={handleFilterSubmissionStatus}
                        className={`textField border w-full sm:w-40 px-3 py-2  focus:outline-ascend-blue`}
                    >
                        <option value="">All</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                        <option value="returned">Returned</option>
                    </select>
                    <div className="relative w-full sm:w-60">
                        <input
                            className="border w-full pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                            type="text"
                            placeholder="Search name"
                            onChange={debouncedSearch}
                        />
                        <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead className="">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="w-0">
                                <div className="flex items-center mb-0 gap-2 text-ascend-black font-black">
                                    <input
                                        disabled={responses.data.length === 0}
                                        type="checkbox"
                                        checked={selectAll}
                                        className="accent-ascend-blue w-4 h-4 cursor-pointer"
                                        onChange={handleSelectAll}
                                    />
                                    <span>Select all</span>
                                </div>
                            </th>

                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Status
                            </th>
                            <th className="text-ascend-black font-black">
                                <div
                                    onClick={handleSortSubmittedDate}
                                    className="flex space-x-1 items-center hover:bg-ascend-lightblue transition-all duration-300 w-fit p-2 cursor-pointer"
                                >
                                    <p>Date of Submission</p>

                                    {!sortSubmittedDate ? (
                                        <span className="text-size4 ">
                                            <FaSort />
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-size4 ${
                                                sortSubmittedDate &&
                                                sortSubmittedDate === "desc"
                                                    ? "transform scale-y-[-1]"
                                                    : ""
                                            } transition-all duration-300`}
                                        >
                                            <BiSortUp />
                                        </span>
                                    )}
                                </div>
                            </th>

                            <th className="text-ascend-black font-black">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    {responses.data.length > 0 && (
                        <tbody>
                            {responses.data.map((response) => (
                                <React.Fragment
                                    key={response.assessment_submission_id}
                                >
                                    <ActivityResponseRow
                                        response={response}
                                        assessment={assessment}
                                        courseId={courseId}
                                        selectedSubmittedActivities={
                                            selectedSubmittedActivities
                                        }
                                        handleSelectSubmittedActivity={
                                            handleSelectSubmittedActivity
                                        }
                                    />

                                    {response.activityFiles &&
                                        response.activityFiles.length > 0 && (
                                            <ResponseAttachedFiles
                                                activityFiles={
                                                    response.activityFiles
                                                }
                                                assessmentSubmissionId={
                                                    response.assessment_submission_id
                                                }
                                            />
                                        )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    )}
                </table>

                {/* For displaying no data in the table*/}
                {!isSearchSortLoading &&
                    (responses.data.length === 0 &&
                    !search &&
                    !submissionStatus ? (
                        <EmptyState
                            imgSrc={"/images/illustrations/empty.svg"}
                            text={`“No responses have been submitted for this activity yet.”`}
                        />
                    ) : responses.data.length === 0 &&
                      (search || submissionStatus) ? (
                        <div className="flex justify-center py-5">
                            <p className="text-ascend-black">No data found</p>
                        </div>
                    ) : (
                        ""
                    ))}
            </div>

            {responses.data.length > 0 && (
                <div className="flex flex-wrap-reverse items-center justify-between gap-5">
                    <div className="flex gap-[1px]">
                        <PrimaryButton
                            text={"Download PDF"}
                            doSomething={() => {
                                window.location.href = route(
                                    "activity.responses.export.pdf",
                                    {
                                        program: programId,
                                        course: courseId,
                                        assessment: assessment.assessment_id,
                                    }
                                );
                            }}
                        />

                        {/* Dropdown button */}
                        <div className="dropdown dropdown-end cursor-pointer ">
                            <button
                                tabIndex={0}
                                role="button"
                                className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                            >
                                <div className="text-size1 ">
                                    {<IoCaretDownOutline />}
                                </div>
                            </button>

                            <ul
                                tabIndex={0}
                                className="text-size2 dropdown-content menu space-y-2 font-medium bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                            >
                                <li onClick={closeDropDown}>
                                    <a
                                        href={route(
                                            "activity.responses.export.pdf",
                                            {
                                                program: programId,
                                                course: courseId,
                                                assessment:
                                                    assessment.assessment_id,
                                            }
                                        )}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as PDF
                                    </a>
                                </li>
                                <li onClick={closeDropDown}>
                                    <a
                                        href={route(
                                            "activity.responses.export.csv",
                                            {
                                                program: programId,
                                                course: courseId,
                                                assessment:
                                                    assessment.assessment_id,
                                            }
                                        )}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as CSV
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {responses.total > 10 && (
                        <div className="w-full sm:w-fit">
                            <Pagination
                                links={responses.links}
                                currentPage={responses.current_page}
                                lastPage={responses.last_page}
                                only={["responses"]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
