import { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import Pagination from "../../../../../../Components/Pagination";
import { FaSort } from "react-icons/fa";
import { BiSortUp } from "react-icons/bi";
import { usePage } from "@inertiajs/react";
import { IoCaretDownOutline } from "react-icons/io5";
import PrimaryButton from "../../../../../../Components/Button/PrimaryButton";
import { closeDropDown } from "../../../../../../Utils/closeDropdown";
import useSearchSortGrades from "./Hooks/useSearchSortGrades";
import StudentGradeRow from "./Components/StudentGradeRow";
import useReturnGrades from "./Hooks/useReturnGrades";
import AlertModal from "../../../../../../Components/AlertModal";
import EmptyState from "../../../../../../Components/EmptyState/EmptyState";

export default function GradesTable() {
    const { students, program, course } = usePage().props;

    const [hasGradedStudent, setHasGradedStudent] = useState(false);
    const [openAlertModal, setOpenAlertModal] = useState(false);

    // Custom hook
    const {
        debouncedSearch,
        isSearchSortLoading,
        sortLastName,
        handleSortLastName,
        sortFirstName,
        handleSortFirstName,
        filterStatus,
        search,
        status,
    } = useSearchSortGrades({
        programId: program.program_id,
        courseId: course.course_id,
    });

    const {
        handleSelectAll,
        handlePostStudentGrades,
        handleSelectStudentGrade,
        isLoading,
        selectAll,
        selectedStudentGrades,
    } = useReturnGrades({
        programId: program.program_id,
        courseId: course.course_id,
        students: students.data,
    });

    useEffect(() => {
        // This state is use for disabling the select all checkbox
        setHasGradedStudent(
            students.data.length > 0 &&
                students.data.some((student) => student.grade) // Check if there's at;easat 1 student graded
        );
    }, [students]);

    return (
        <div className="space-y-5">
            {/* Display alert modal */}
            {openAlertModal && (
                <AlertModal
                    title={"Post Grades Confirmation"}
                    description={
                        "Once posted, grades will be visible to students. Are you sure you want to continue?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() => {
                        handlePostStudentGrades(setOpenAlertModal);
                    }}
                    isLoading={isLoading}
                />
            )}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <h1 className="text-size6 font-bold">{course.course_name}</h1>
                <PrimaryButton
                    isDisabled={selectedStudentGrades.length === 0 || isLoading}
                    doSomething={() => setOpenAlertModal(true)}
                    text="Post Grades"
                />
            </div>
            <div className="w-full flex justify-end">
                <div className="flex flex-wrap w-full sm:w-fit gap-2">
                    <select
                        onChange={filterStatus}
                        className={`textField border w-full sm:w-40 px-3 py-2  focus:outline-ascend-blue`}
                    >
                        <option value="">All</option>
                        <option value="no_grade">No grade</option>
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
                                        disabled={!hasGradedStudent}
                                        type="checkbox"
                                        checked={selectAll}
                                        className="accent-ascend-blue w-4 h-4 cursor-pointer"
                                        onChange={handleSelectAll}
                                    />
                                    <span>Select all</span>
                                </div>
                            </th>
                            <th className="text-ascend-black font-black">
                                <div
                                    onClick={handleSortLastName}
                                    className="flex space-x-1 items-center hover:bg-ascend-lightblue transition-all duration-300 w-fit p-2 cursor-pointer"
                                >
                                    <p>Last Name</p>
                                    {!sortLastName ? (
                                        <span className="text-size4 ">
                                            <FaSort />
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-size4 ${
                                                sortLastName &&
                                                sortLastName === "desc"
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
                                <div
                                    onClick={handleSortFirstName}
                                    className="flex space-x-1 items-center hover:bg-ascend-lightblue transition-all duration-300 w-fit p-2 cursor-pointer"
                                >
                                    <p>First Name</p>
                                    {!sortFirstName ? (
                                        <span className="text-size4 ">
                                            <FaSort />
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-size4 ${
                                                sortFirstName &&
                                                sortFirstName === "desc"
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
                                Status
                            </th>
                            <th className="text-ascend-black font-black">
                                Email
                            </th>
                            <th className="text-ascend-black font-black">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    {students.data.length > 0 && (
                        <tbody>
                            {students.data.map((student, index) => (
                                <StudentGradeRow
                                    key={student.assigned_course_id}
                                    student={student}
                                    selectedStudentGrades={
                                        selectedStudentGrades
                                    }
                                    handleSelectStudentGrade={
                                        handleSelectStudentGrade
                                    }
                                />
                            ))}
                        </tbody>
                    )}
                </table>
                {/* For displaying no data in the table*/}
                {!isSearchSortLoading &&
                    (students.data.length === 0 && !search && !status ? (
                        <EmptyState
                            imgSrc={"/images/illustrations/empty.svg"}
                            text={`“There are no students to be graded.”`}
                        />
                    ) : students.data.length === 0 && (search || students) ? (
                        <div className="flex justify-center py-5">
                            <p className="text-ascend-black">No data found</p>
                        </div>
                    ) : null)}
            </div>

            {students.data.length > 0 && (
                <div className="flex flex-wrap-reverse items-center justify-between gap-5">
                    <div className="flex gap-[1px]">
                        <PrimaryButton
                            text={"Download PDF"}
                            doSomething={() => {
                                window.location.href = route(
                                    "export.student.grades.pdf",
                                    {
                                        program: program.program_id,
                                        course: course.course_id,
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
                                            "export.student.grades.pdf",
                                            {
                                                program: program.program_id,
                                                course: course.course_id,
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
                                            "export.student.grades.csv",
                                            {
                                                program: program.program_id,
                                                course: course.course_id,
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

                    {students.total > 10 && (
                        <div className="w-full sm:w-fit">
                            <Pagination
                                links={students.links}
                                currentPage={students.current_page}
                                lastPage={students.last_page}
                                only={["students"]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
