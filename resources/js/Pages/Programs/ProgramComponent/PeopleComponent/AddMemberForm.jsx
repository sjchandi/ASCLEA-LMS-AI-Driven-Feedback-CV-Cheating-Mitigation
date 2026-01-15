import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { IoSearch } from "react-icons/io5";
import SecondaryButton from "../../../../Components/Button/SecondaryButton";
import PrimaryButton from "../../../../Components/Button/PrimaryButton";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import axios from "axios";
import Loader from "../../../../Components/Loader";
import { capitalize } from "lodash";
import debounce from "lodash.debounce";
import DefaultCustomToast from "../../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../../Utils/displayToast";
import ModalContainer from "../../../../Components/ModalContainer";
import ProfileImage from "../../../../Components/ProfileImage";

export default function AddMemberForm({ toggleModal }) {
    const { program } = usePage().props;

    // For handling add member
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [unSelectedUsers, setUnSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);

    // For displaying user list
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("");
    const [userList, setUserList] = useState([]);
    const loaderRef = useRef(null);

    const fetchUserList = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(
                route("program.list.users", {
                    program: program.program_id,
                    _query: {
                        page,
                        search: searchQuery,
                        role: filter,
                    },
                })
            );
            const users = [...userList, ...res.data.data];

            const uniqueUsers = [
                ...new Map(users.map((user) => [user.user_id, user])).values(),
            ];

            // Prevent duplicate value to be set in the user list
            setUserList(uniqueUsers);

            setIsLoading(false);
            setHasMore(res.data.current_page < res.data.last_page);
            setPage((prev) => prev + 1);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserList();
    }, [searchQuery, filter]);

    // Observer that fetch another page when the loader is intersecting in the viewport
    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];

            if (target.isIntersecting && !isLoading && hasMore) {
                fetchUserList();
            }
        },
        [isLoading, hasMore]
    );

    useEffect(() => {
        // Create the observer function
        // Reset and re-create whenever there are changes in dependecies
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "100px",
            threshold: 0,
        });

        if (loaderRef.current) observer.observe(loaderRef.current);

        return () => {
            observer.disconnect();
        };
    }, [handleObserver, searchQuery, filter]);

    // Debounce on change handlers
    const handleOnChangeSearchQuery = (e) => {
        setUserList([]);
        setUnSelectedUsers([]);
        setSelectedUsers([]);
        setSelectAll(false);
        setPage(1);
        setHasMore(true);
        setSearchQuery(e.target.value);
    };

    const debouncedSearchChange = useMemo(() => {
        return debounce(handleOnChangeSearchQuery, 300);
    }, []);

    const handleOnChangeFilter = (e) => {
        setUserList([]);
        setUnSelectedUsers([]);
        setSelectedUsers([]);
        setSelectAll(false);
        setPage(1);
        setHasMore(true);
        setFilter(e.target.value);
    };

    const debouncedFilterChange = useMemo(() => {
        return debounce(handleOnChangeFilter, 300);
    }, []);

    // This remove side effects of debouncer
    useEffect(() => {
        return () => {
            debouncedSearchChange.cancel();
            debouncedFilterChange.cancel();
        };
    }, []);

    const handleAddNewMemberChange = (userId) => {
        // Add and remove user 1 by 1
        const updatedUsers = selectedUsers.some((id) => id === userId) // Check if the id is allready in the list
            ? selectedUsers.filter((id) => id !== userId) // If true filter the list by removing the duplicated id
            : [...selectedUsers, userId]; // If false add the id to the list

        setSelectedUsers(updatedUsers);

        if (selectAll) {
            // Add the unselected users
            const updatedUnselectedUsers = unSelectedUsers.some(
                (id) => id === userId
            )
                ? unSelectedUsers.filter((id) => id !== userId)
                : [...unSelectedUsers, userId];

            if (updatedUsers.length > 0) {
                setUnSelectedUsers(updatedUnselectedUsers);
            } else {
                // Reset state if theres no updatedUsers
                // This means user clicked select all then unchecked all the user
                setSelectAll(false);
                setUnSelectedUsers([]);
            }
        }
    };

    const handleSelectAll = () => {
        // Set all the current loaded users as selected user
        if (!selectAll) {
            const allUsers = userList.map((user) => user.user_id);
            setSelectedUsers(allUsers);
        } else {
            setSelectedUsers([]);
            setUnSelectedUsers([]);
        }
        setSelectAll(!selectAll);
    };

    useEffect(() => {
        // If selectAll is true update the selectedUsers to check the checkbox as the user scrolls
        if (selectAll) {
            const allUsers = userList.map((user) => user.user_id);
            setSelectedUsers(allUsers);
        }
    }, [userList]);

    const handleAddMember = () => {
        if (selectAll || selectedUsers.length > 0) {
            setIsAddLoading(true);
            router.post(
                route("program.add.member", program.program_id),
                {
                    is_select_all: selectAll,
                    selected_users: selectedUsers,
                    unselected_users: unSelectedUsers,
                    filter: filter || null,
                    search: searchQuery || null,
                },
                {
                    showProgress: false,
                    except: ["courses", "program"],
                    onError: () => {
                        setIsAddLoading(false);
                    },
                    onSuccess: (page) => {
                        toggleModal();
                        setIsAddLoading(false);
                        displayToast(
                            <DefaultCustomToast
                                message={page.props.flash.success}
                            />,
                            "success"
                        );
                    },
                }
            );
        }
    };

    const handleCancel = () => {
        toggleModal();
    };

    return (
        <ModalContainer>
            <form
                onSubmit={(e) => handleAdd(e)}
                className="bg-ascend-white opacity-100 p-5 w-160 space-y-5"
            >
                <h1 className="text-size4 font-bold">Add Member</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative col-span-1 sm:col-span-2">
                        <input
                            onChange={debouncedSearchChange}
                            className="border w-full pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                            type="text"
                            placeholder="Search by typing name or email"
                        />
                        <IoSearch className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1" />
                    </div>
                    <select
                        className={`textField border w-full px-3 py-2  focus:outline-ascend-blue`}
                        onChange={debouncedFilterChange}
                    >
                        <option value="">All</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                    </select>
                </div>
                {userList.length > 0 && (
                    <div className="flex items-center mb-0 gap-2">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            className="accent-ascend-blue w-4 h-4"
                            onChange={handleSelectAll}
                        />
                        <span>Select all</span>
                    </div>
                )}
                <div className="h-72 overflow-y-auto divide-y-1 divide-ascend-gray1">
                    {userList.length > 0 &&
                        userList.map((user) => (
                            <div
                                key={user.user_id}
                                className="w-full flex items-center py-5"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.some(
                                        (id) => id === user.user_id
                                    )}
                                    className="accent-ascend-blue w-4 h-4 mr-5"
                                    onChange={() =>
                                        handleAddNewMemberChange(user.user_id)
                                    }
                                />

                                <ProfileImage userData={user} />

                                <div className="ml-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">
                                            {`${user.first_name} ${user.last_name}`}
                                        </span>
                                        <span className="text-size1 -mt-1">
                                            {capitalize(user.role.role_name)}
                                        </span>
                                    </div>
                                    <span className="text-size1">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        ))}

                    {hasMore && userList.length > 0 ? (
                        // First condition is the observed loader, display only if data has more user and userList is not empty
                        <div
                            ref={loaderRef}
                            className={`flex items-center py-3 `}
                        >
                            <Loader color="bg-ascend-blue" />
                        </div>
                    ) : isLoading && userList.length === 0 ? (
                        // Loader for intial render, searching, and filtering
                        // Display if the userList is empty which mean user used search, filter, or its an intial render
                        <div className="flex items-center min-h-full">
                            <Loader color="bg-ascend-blue" />
                        </div>
                    ) : (
                        !isLoading &&
                        userList.length === 0 && (
                            <div className="flex items-center justify-center min-h-full">
                                <h1 className="text-ascend-black font-nunito-sans text-size4">
                                    No users available
                                </h1>
                            </div>
                        )
                    )}
                </div>
                <div className="flex justify-end space-x-2">
                    <SecondaryButton
                        doSomething={handleCancel}
                        isDisabled={isAddLoading}
                        text={"Cancel"}
                    />
                    <PrimaryButton
                        isDisabled={isAddLoading}
                        isLoading={isAddLoading}
                        doSomething={handleAddMember}
                        text={"Add"}
                    />
                </div>
            </form>
        </ModalContainer>
    );
}
