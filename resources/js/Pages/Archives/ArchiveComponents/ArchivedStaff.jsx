import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Pagination from "../../../Components/Pagination";
import ArchivedStaffRow from "./ArchivedStaffRow";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import useArchive from "./Hooks/useArchive";
import AlertModal from "../../../Components/AlertModal";
import { IoSearch } from "react-icons/io5";

export default function ArchivedStaff() {
    const { archivedStaff } = usePage().props;

    // Custom hook
    const {
        isLoading,
        handleRestoreStaff,
        search,
        debounceHandleSearch,
        searchName,
    } = useArchive();

    // States for alert modal
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [staffId, setStaffId] = useState(null);

    useEffect(() => {
        searchName("archivedStaff");
    }, [search]);

    return (
        <div className="font-nunito-sans space-y-5">
            <div className="flex justify-between items-center gap-5">
                <h1 className="text-size6 font-bold">Archived Staff</h1>
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

            <div className="overflow-x-auto overflow-y-hidden space-y-5">
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
                    {archivedStaff.data.length > 0 && (
                        <tbody>
                            {archivedStaff.data.map((staff) => (
                                <ArchivedStaffRow
                                    key={staff.staff_id}
                                    staff={staff}
                                    setOpenAlertModal={setOpenAlertModal}
                                    setStaffId={setStaffId}
                                />
                            ))}
                        </tbody>
                    )}
                </table>
            </div>
            {archivedStaff.data.length > 0 && archivedStaff.total > 10 && (
                <Pagination
                    links={archivedStaff.links}
                    currentPage={archivedStaff.current_page}
                    lastPage={archivedStaff.last_page}
                    only={["archivedStaff"]}
                />
            )}

            {archivedStaff.data.length === 0 && (
                <EmptyState
                    imgSrc={"/images/illustrations/blank_canvas.svg"}
                    text={`“Looks empty! You haven’t archived any staff yet.”`}
                />
            )}

            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Restore Staff"}
                    description={"Are you sure you want to restore this staff?"}
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() =>
                        handleRestoreStaff(staffId, setOpenAlertModal)
                    }
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
