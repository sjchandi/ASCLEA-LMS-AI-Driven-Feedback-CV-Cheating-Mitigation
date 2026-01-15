import React, { useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import Pagination from "@/Components/Pagination";
import { BiFilter } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import _ from "lodash";

export default function PaidStudentTable({ students, filters }) {
    const route = useRoute();
    const [search, setSearch] = useState(filters?.search || ""); // keep search state from backend

    const handleRowClick = (userId) => {
        if (!userId) {
            console.error("userId is undefined!");
            return;
        }
        router.visit(route("paymenthistory.payment.history", { userId }));
    };

    const debouncedSearch = useMemo(
        () =>
            _.debounce((value) => {
                router.get(
                    route("paymenthistory.index"),
                    { search: value },
                    { preserveState: true, replace: true }
                );
            }, 500), // 500ms delay
        []
    );

    const handlePageChange = (url) => {
        if (!url) return;
        router.get(url, { search }, { preserveState: true }); // keep search on pagination
    };

    return (
        <div className="space-y-5">
            {/* Search and filter */}
            <div className="flex items-center justify-between">
                <div className="font-nunito-sans text-size6 font-bold">
                    Paid Students
                </div>
                <div className="flex items-center justify-end">
                    <div className="relative">
                        <input
                            className="border w-full sm:w-60 pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);
                                debouncedSearch(value); // live search
                            }}
                        />{" "}
                        {/* absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1 */}
                        <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide font-nunito-sans">
                <table className="table w-full">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Email
                            </th>
                            <th className="text-ascend-black font-black">
                                Action
                            </th>
                        </tr>
                    </thead>

                    {students?.data?.length > 0 ? (
                        <tbody>
                            {students.data.map((s) => (
                                <tr
                                    key={s.id}
                                    onClick={() => handleRowClick(s.user_id)}
                                    className="hover:bg-ascend-lightblue transition-all duration-300 cursor-pointer"
                                >
                                    <td className="py-5">{s.name}</td>
                                    <td className="py-5">{s.email}</td>
                                    <td className="py-5">
                                        <span className="text-ascend-blue underline">
                                            View More
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <tbody>
                            <tr>
                                <td colSpan={4}>
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <EmptyState
                                            imgSrc={
                                                "/images/illustrations/empty-cat.svg"
                                            }
                                            text={
                                                search
                                                    ? `Hmm… we couldn’t find any students. Maybe try a different search?`
                                                    : "No paid students yet! Time to get the party started and enroll some students."
                                            }
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    )}
                </table>
            </div>

            {/*Pagination with search persistence */}
            {students?.links && (
                <Pagination
                    links={students.links}
                    currentPage={students.current_page}
                    lastPage={students.last_page}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
