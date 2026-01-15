import React from "react";
import useSearchSortResponses from "../Hooks/useSearchSortResponses";
import { IoSearch } from "react-icons/io5";
import { BiSortUp } from "react-icons/bi";
import { FaSort } from "react-icons/fa";
import { convertDurationMinutes } from "../../../../../../../../../Utils/convertDurationMinutes";
import Pagination from "../../../../../../../../../Components/Pagination";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { cleanDecimal } from "../../../../../../../../../Utils/cleanDecimal";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import { IoCaretDownOutline } from "react-icons/io5";
import { closeDropDown } from "../../../../../../../../../Utils/closeDropdown";
import EmptyState from "../../../../../../../../../Components/EmptyState/EmptyState";
import ProfileImage from "../../../../../../../../../Components/ProfileImage";

export default function QuizResponsesTable({
    programId,
    courseId,
    assessment,
    responses,
}) {
    const {
        debouncedSearch,
        handleSortScore,
        sortScore,
        handleSortTime,
        sortTime,
        search,
        isSearchSortLoading,
    } = useSearchSortResponses({
        programId,
        courseId,
        assessmentId: assessment.assessment_id,
    });

    const handleViewStudentQuizResult = (assessmentSubmissionId) => {
        router.visit(
            route("quizzes.quiz.result", {
                course: courseId,
                assessment: assessment.assessment_id,
                quiz: assessment.quiz.quiz_id,
                assessmentSubmission: assessmentSubmissionId,
            })
        );
    };

    return (
        <>
            <div className="flex flex-wrap gap-5 items-center justify-between">
                <div className="min-w-0">
                    <h1 className="text-size5 break-words font-semibold">
                        Student Scores
                    </h1>
                </div>
                <div className="relative">
                    <input
                        className="w-full sm:w-50 border pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                        type="text"
                        placeholder="Search name"
                        onChange={debouncedSearch}
                    />
                    <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                <div
                                    onClick={handleSortTime}
                                    className="flex space-x-1 items-center hover:bg-ascend-lightblue transition-all duration-300 w-fit p-2 cursor-pointer"
                                >
                                    <p>Time</p>
                                    {!sortTime ? (
                                        <span className="text-size4 ">
                                            <FaSort />
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-size4 ${
                                                sortTime && sortTime === "desc"
                                                    ? "transform scale-y-[-1]"
                                                    : ""
                                            } transition-all duration-300`}
                                        >
                                            <BiSortUp />
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th className="text-ascend-black font-black ">
                                <div
                                    onClick={handleSortScore}
                                    className="flex space-x-1 items-center hover:bg-ascend-lightblue transition-all duration-300 w-fit p-2 cursor-pointer"
                                >
                                    <p>Score</p>
                                    {!sortScore ? (
                                        <span className="text-size4 ">
                                            <FaSort />
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-size4 ${
                                                sortScore &&
                                                sortScore === "desc"
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
                                Warnings
                            </th>
                            <th className="text-ascend-black font-black">
                                Tab Changes
                            </th>
                        </tr>
                    </thead>
                    {responses.data.length > 0 && (
                        <tbody>
                            {responses.data.map((response) => (
                                <tr
                                    onClick={() =>
                                        handleViewStudentQuizResult(
                                            response.assessment_submission_id
                                        )
                                    }
                                    key={response.assessment_submission_id}
                                    className="hover:bg-ascend-lightblue cursor-pointer"
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <ProfileImage
                                                userData={response.submitted_by}
                                            />

                                            <div className="font-bold">
                                                {`${response.submitted_by.first_name} ${response.submitted_by.last_name}`}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {
                                            convertDurationMinutes(
                                                response.time_spent
                                            ).formattedTime
                                        }
                                    </td>
                                    <td>
                                        {cleanDecimal(response.score)}/
                                        {assessment.quiz.quiz_total_points}
                                    </td>
                                    <td
                                        className={
                                            response.detected_cheatings.length >
                                            0
                                                ? "text-ascend-red"
                                                : "text-ascend-green"
                                        }
                                    >
                                        {response.detected_cheatings.length}
                                    </td>
                                    <td
                                        className={
                                            response.detected_tabChange.length >
                                            0
                                                ? "text-ascend-red"
                                                : "text-ascend-green"
                                        }
                                    >
                                        {response.detected_tabChange.length}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>

                {/* For displaying no data in the table*/}
                {!isSearchSortLoading &&
                    (responses.data.length === 0 && !search ? (
                        <EmptyState
                            imgSrc={"/images/illustrations/empty.svg"}
                            text={`“No responses have been submitted for this quiz yet.”`}
                        />
                    ) : responses.data.length === 0 && search ? (
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
                                    "quiz.responses.export.pdf",
                                    {
                                        program: programId,
                                        course: courseId,
                                        assessment: assessment.assessment_id,
                                    }
                                );
                            }}
                        />

                        {/* Dropdown button */}
                        <div className="dropdown dropdown-end cursor-pointer">
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
                                            "quiz.responses.export.pdf",
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
                                            "quiz.responses.export.csv",
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
        </>
    );
}
