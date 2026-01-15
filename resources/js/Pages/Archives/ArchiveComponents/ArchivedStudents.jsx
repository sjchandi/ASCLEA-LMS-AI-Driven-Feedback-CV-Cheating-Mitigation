import React, { useEffect, useState } from "react";
import useArchives from "../../../Stores/Archives/archivedStore";
import { usePage } from "@inertiajs/react";
import ArchivedStudentRow from "./ArchivedStudentRow";
import AlertModal from "../../../Components/AlertModal";
import Pagination from "../../../Components/Pagination";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import useArchive from "./Hooks/useArchive";
import { IoSearch } from "react-icons/io5";

export default function ArchivedStudents() {
    const { archivedStudents } = usePage().props;

    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [studentId, setStudentId] = useState(null);

    // Custom hook
    const {
        isLoading,
        handleRestoreStudent,
        search,
        debounceHandleSearch,
        searchName,
    } = useArchive();

    // Checks for changes in search then run the searchName function
    useEffect(() => {
        searchName("archivedStudents");
    }, [search]);

    return (
        <div className="font-nunito-sans space-y-5">
            <div className="flex justify-between items-center gap-5">
                <h1 className="text-size6 font-bold">Archived Students</h1>
                <div className="relative">
                    <input
                        className="border w-full sm:w-60 pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                        type="text"
                        placeholder="Search name"
                        onChange={debounceHandleSearch}
                    />
                    <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden">
                <table className="table">
                    <thead className="">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Archived by
                            </th>
                            <th className="text-ascend-black font-black">
                                Date archived
                            </th>
                        </tr>
                    </thead>
                    {archivedStudents.data.length > 0 && (
                        <tbody>
                            {archivedStudents.data.map((student) => (
                                <ArchivedStudentRow
                                    key={student.student_id}
                                    student={student}
                                    setOpenAlertModal={setOpenAlertModal}
                                    setStudentId={setStudentId}
                                />
                            ))}
                        </tbody>
                    )}
                </table>
            </div>

            {archivedStudents.data.length > 0 &&
                archivedStudents.total > 10 && (
                    <Pagination
                        links={archivedStudents.links}
                        currentPage={archivedStudents.current_page}
                        lastPage={archivedStudents.last_page}
                        only={["archivedStudents"]}
                    />
                )}

            {archivedStudents.data.length === 0 && (
                <EmptyState
                    imgSrc={"/images/illustrations/blank_canvas.svg"}
                    text={`“Looks empty! You haven’t archived any student yet.”`}
                />
            )}

            {/* Display alert modal */}
            {openAlertModal && (
                <AlertModal
                    title={"Restore Student"}
                    description={
                        "Are you sure you want to restore this student?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() =>
                        handleRestoreStudent(studentId, setOpenAlertModal)
                    }
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
