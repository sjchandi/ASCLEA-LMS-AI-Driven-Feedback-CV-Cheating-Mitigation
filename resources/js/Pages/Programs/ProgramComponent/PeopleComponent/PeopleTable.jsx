import { useMemo, useEffect, useState } from "react";
import EmptyState from "../../../../Components/EmptyState/EmptyState";
import { router } from "@inertiajs/react";
import { IoSearch } from "react-icons/io5";
import { route } from "ziggy-js";
import RoleGuard from "../../../../Components/Auth/RoleGuard";
import { usePage } from "@inertiajs/react";
import _ from "lodash";
import Pagination from "../../../../Components/Pagination";
import { debounce } from "lodash";
import DefaultCustomToast from "../../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../../Utils/displayToast";
import AlertModal from "../../../../Components/AlertModal";
import ProfileImage from "../../../../Components/ProfileImage";

export default function PeopleTable() {
    const { members, program, auth } = usePage().props;

    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [initialRender, setInitialRender] = useState(true);

    // State  for removing member
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isRemoveLoading, setIsRemoveLoading] = useState(false);

    const handleFilterChange = (role) => {
        setFilter(role);
        setInitialRender(false);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setInitialRender(false);
    };

    const debounceHandleSearch = useMemo(() => {
        return debounce(handleSearch, 300);
    }, []);

    useEffect(() => {
        return () => debounceHandleSearch.cancel();
    }, []);

    useEffect(() => {
        if (!initialRender) {
            console.log("GET MEMBERS");
            const query = {};

            if (filter) query.role = filter;
            if (search.trim()) query.search = search.trim();

            router.get(
                route("program.show", {
                    program: program.program_id,
                    _query: query,
                }),
                {},
                {
                    showProgress: false,
                    preserveScroll: true,
                    preserveState: true,
                    only: ["members"],
                }
            );
        }
    }, [filter, search]);

    const handleMemberClick = (learningMemberId, userId) => {
        if (auth.user.role_name !== "student" || auth.user.user_id === userId) {
            router.visit(
                route("program.member.view", {
                    program: program.program_id,
                    member: learningMemberId,
                })
            );
        }
    };

    const handleRemoveMember = () => {
        if (memberToRemove) {
            setIsRemoveLoading(true);
            router.delete(
                route("program.remove.member", {
                    program: program.program_id,
                    member: memberToRemove,
                }),
                {
                    showProgress: false,
                    only: ["members", "flash"],
                    onSuccess: (page) => {
                        displayToast(
                            <DefaultCustomToast
                                message={page.props.flash.success}
                            />,
                            "success"
                        );
                    },
                    onFinish: () => {
                        setMemberToRemove(null);
                        setOpenAlertModal(false);
                        setIsRemoveLoading(false);
                    },
                }
            );
        }
    };

    const handleOpenRemoveAlertModal = (e, learningMemberId) => {
        e.stopPropagation();
        setMemberToRemove(learningMemberId);
        setOpenAlertModal(true);
    };

    return (
        <div className="space-y-5">
            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Remove Learning Member"}
                    description={
                        "Are you sure you want to remove this member? The user will no longer have access to this program."
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={handleRemoveMember}
                    isLoading={isRemoveLoading}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
                <select
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className={`textField border w-full sm:w-40 px-3 py-2  focus:outline-ascend-blue`}
                >
                    <option value="">All</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                </select>
                <div className="relative">
                    <input
                        className="border w-full sm:w-60 pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                        type="text"
                        placeholder="Search"
                        onChange={debounceHandleSearch}
                    />
                    <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                </div>
            </div>
            <div className="overflow-x-auto overflow-y-hidden">
                <table className="table">
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Role
                            </th>
                            <th className="text-ascend-black font-black">
                                Email
                            </th>
                        </tr>
                    </thead>
                    {members.data && members.data.length > 0 && (
                        <>
                            <tbody>
                                {members.data.map((member) => (
                                    <tr
                                        key={member.user.user_id}
                                        onClick={() =>
                                            handleMemberClick(
                                                member.learning_member_id,
                                                member.user.user_id
                                            )
                                        }
                                        className={`group hover:bg-ascend-lightblue transition-all duration-300 ${
                                            auth.user.role_name !== "student" ||
                                            auth.user.user_id ===
                                                member.user.user_id
                                                ? "cursor-pointer"
                                                : ""
                                        }`}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <ProfileImage
                                                    userData={member.user}
                                                />

                                                <div
                                                    className={`font-bold ${
                                                        auth.user.role_name !==
                                                            "student" ||
                                                        auth.user.user_id ===
                                                            member.user.user_id
                                                            ? "group-hover:underline"
                                                            : ""
                                                    }`}
                                                >
                                                    {`${member.user.first_name} ${member.user.last_name}`}{" "}
                                                    {auth.user.user_id ===
                                                        member.user.user_id && (
                                                        <span className="text-size1 font-normal">
                                                            (You)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {_.capitalize(
                                                member.user.role.role_name
                                            )}
                                        </td>
                                        <td>{member.user.email}</td>
                                        <RoleGuard allowedRoles={["admin"]}>
                                            <td>
                                                <span
                                                    onClick={(e) =>
                                                        handleOpenRemoveAlertModal(
                                                            e,
                                                            member.learning_member_id
                                                        )
                                                    }
                                                    className="text-ascend-red transition-all duration-300 hover:bg-ascend-red hover:text-ascend-white font-bold py-1 px-2"
                                                >
                                                    Remove
                                                </span>
                                            </td>
                                        </RoleGuard>
                                    </tr>
                                ))}
                            </tbody>
                        </>
                    )}
                </table>
            </div>
            {members.data.length > 0 && members.total > 10 && (
                <Pagination
                    links={members.links}
                    currentPage={members.current_page}
                    lastPage={members.last_page}
                    only={["members"]}
                />
            )}
            {members.data && members.data.length === 0 && (
                <EmptyState
                    paddingY="py-0"
                    imgSrc={"/images/illustrations/alone.svg"}
                    text={`“It’s a bit lonely here... Add some people and let the learning begin!”`}
                />
            )}
        </div>
    );
}
