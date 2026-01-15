import { useState, useMemo, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import Pagination from "@/Components/Pagination";
import { IoSearch, IoCaretDownOutline } from "react-icons/io5";
import { debounce } from "lodash";
import PrimaryButton from "../../../Components/Button/PrimaryButton";

export default function EnrolledStudentsTable({ active, role }) {
    const route = useRoute();
    const { enrolledStudents } = usePage().props;
    const [search, setSearch] = useState("");

    //=========================== Handle Row Click ===========================//
    const handleRowClick = (studentId) => {
        router.visit(route("enrolled.student.view", { student: studentId }));
    };

    //=========================== Update input immediately ===========================//
    const handleInputChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    //=========================== Debounced router call ===========================//
    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(
                    route("enrolled.students"),
                    { search: value, page: 1 },
                    {
                        preserveState: true,
                        showProgress: false,
                        only: ["enrolledStudents"],
                    }
                );
            }, 300),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel(); // cleanup on unmount
    }, []);

    //=========================== Reset page/search when tab becomes active ===========================//
    useEffect(() => {
        if (active) {
            setSearch("");
            router.get(
                route("enrolled.students"),
                { page: 1 },
                {
                    preserveState: false,
                    showProgress: false,
                    only: ["enrolledStudents"],
                }
            );
        }
    }, [active]);

    return (
        <div className="space-y-5">
            {/*=========================== Search Input ===========================*/}
            <div className="flex justify-end mb-3">
                <div className="relative">
                    <input
                        className="w-full sm:w-60 border h-10 pl-10 pr-3 border-ascend-black focus:outline-ascend-blue"
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={handleInputChange}
                    />
                    <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                </div>
            </div>

            {/*=========================== Students Table ===========================*/}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date Enrolled</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrolledStudents?.data?.length > 0 ? (
                            enrolledStudents.data.map((student) => {
                                const status =
                                    student.enrollment_status?.toLowerCase();
                                const statusColor =
                                    status === "enrolled"
                                        ? "text-ascend-blue"
                                        : status === "dropout"
                                        ? "text-ascend-red"
                                        : status === "withdrawn"
                                        ? "text-ascend-yellow"
                                        : "text-ascend-gray2";

                                return (
                                    <tr
                                        key={student.student_id}
                                        onClick={() =>
                                            handleRowClick(student.student_id)
                                        }
                                        className="hover:bg-ascend-lightblue cursor-pointer"
                                    >
                                        <td className="py-5">
                                            {student.user.first_name}{" "}
                                            {student.user.middle_name
                                                ? student.user.middle_name + " "
                                                : ""}
                                            {student.user.last_name}
                                        </td>
                                        <td className="py-5">
                                            {student.user.email}
                                        </td>
                                        <td className="py-5">
                                            {student.approved_at
                                                ? new Date(
                                                      student.approved_at
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td
                                            className={`py-5 capitalize ${statusColor}`}
                                        >
                                            {student.enrollment_status}
                                        </td>
                                        <td className="py-5">
                                            <span className="text-ascend-blue underline">
                                                View More
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        paddingY="py-0"
                                        imgSrc="/images/illustrations/Thinking.svg"
                                        text={`Nothing to see here… yet!`}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/*=========================== Download & Pagination ===========================*/}
            {enrolledStudents?.data?.length > 0 && role === 'admin' && (
                <div className="flex flex-wrap-reverse items-center justify-between gap-5">
                    {/* Download Section (LEFT) */}
                    <div className="flex gap-[1px]">
                        <PrimaryButton
                            text="Download PDF"
                            doSomething={() => {
                                window.location.href = route(
                                    "admissions.enrolled.exportPdf"
                                );
                            }}
                        />
                        <div className="dropdown dropdown-end cursor-pointer">
                            <button
                                tabIndex={0}
                                role="button"
                                className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                            >
                                <div className="text-size1">
                                    <IoCaretDownOutline />
                                </div>
                            </button>

                            <ul
                                tabIndex={0}
                                className="dropdown-content menu space-y-2 font-bold text-size2 text-ascend-black bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none"
                            >
                                <li>
                                    {/* href={route("admissions.enrolled.exportPdf")} */}
                                    <a
                                        href={route(
                                            "admissions.enrolled.exportPdf"
                                        )}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as PDF
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={route(
                                            "admissions.enrolled.exportCsv"
                                        )}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as CSV
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Pagination (RIGHT) */}
                    {enrolledStudents?.links?.length > 0 &&
                        enrolledStudents?.last_page > 1 && (
                            <div className="w-full sm:w-fit">
                                <Pagination
                                    links={enrolledStudents.links}
                                    currentPage={enrolledStudents.current_page}
                                    lastPage={enrolledStudents.last_page}
                                    only={["enrolledStudents"]}
                                />
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
