import { useState, useMemo, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import Pagination from "@/Components/Pagination";
import { IoSearch, IoCaretDownOutline } from "react-icons/io5";
import { debounce } from "lodash";
import PrimaryButton from "../../../Components/Button/PrimaryButton";

export default function PendingStudentsTable({ active }) {
    const route = useRoute();
    const { pendingStudents } = usePage().props;
    const [search, setSearch] = useState("");

    //=========================== Handle Row Click ===========================//
    const handleRowClick = (studentId) => {
        router.visit(route("pending.student.view", { student: studentId }));
    };

    //=========================== Handle Input Change ===========================//
    const handleInputChange = (e) => {
        setSearch(e.target.value); // update input instantly
        debouncedSearch(e.target.value); // debounce router call
    };

    //=========================== Debounced router call ===========================//
    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(
                    route("pending.students"),
                    { search: value, page: 1 },
                    {
                        preserveState: true,
                        showProgress: false,
                        only: ["pendingStudents"],
                    }
                );
            }, 300),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel(); // cleanup on unmount
    }, []);

    //=========================== Reset search/page when tab becomes active ===========================//
    useEffect(() => {
        if (active) {
            setSearch("");
            router.get(
                route("pending.students"),
                { page: 1 },
                {
                    preserveState: true,
                    showProgress: false,
                    only: ["pendingStudents"],
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

            {/*=========================== Table ===========================*/}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date Applied</th>
                            <th>Admission Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingStudents?.data?.length > 0 ? (
                            pendingStudents.data.map((student) => (
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
                                        {new Date(
                                            student.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td
                                        className={`py-5 ${
                                            student.admission_status ===
                                            "Accepted"
                                                ? "text-ascend-green"
                                                : student.admission_status ===
                                                  "Not Submitted"
                                                ? "text-ascend-blue"
                                                : student.admission_status ===
                                                  "Pending"
                                                ? "text-ascend-yellow"
                                                : student.admission_status ===
                                                  "Rejected"
                                                ? "text-ascend-red"
                                                : ""
                                        }`}
                                    >
                                        {student.admission_status}
                                    </td>
                                    <td className="py-5">
                                        <span className="text-ascend-blue underline">
                                            View More
                                        </span>
                                    </td>
                                </tr>
                            ))
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
            {pendingStudents?.data?.length > 0 && (
                <div className="flex flex-wrap-reverse items-center justify-between gap-5">
                    {/* Download Section (LEFT) */}
                    <div className="flex gap-[1px]">
                        <PrimaryButton
                            text="Download PDF"
                            doSomething={() => {
                                window.location.href = route(
                                    "admissions.pending.exportPdf"
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
                                    {/* href={route("admissions.pending.exportPdf")} */}
                                    <a
                                        href={route(
                                            "admissions.pending.exportPdf"
                                        )}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as PDF
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={route(
                                            "admissions.pending.exportCsv"
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

                    {pendingStudents?.links?.length > 0 &&
                        pendingStudents?.last_page > 1 && (
                            <div className="w-full sm:w-fit">
                                <Pagination
                                    links={pendingStudents.links}
                                    currentPage={pendingStudents.current_page}
                                    lastPage={pendingStudents.last_page}
                                    only={["pendingStudents"]}
                                />
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
