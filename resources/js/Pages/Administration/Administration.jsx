import { useMemo, useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import EmptyState from "../../Components/EmptyState/EmptyState";
import { IoSearch } from "react-icons/io5";
import { BiFilter } from "react-icons/bi";
import PrimaryButton from "../../Components/Button/PrimaryButton";
import { IoCaretDownOutline } from "react-icons/io5";
import AddStaffForm from "./AdministrationComponents/AddStaffForm";
import Pagination from "@/Components/Pagination";
import { debounce } from "lodash";

export default function Administration() {
    const route = useRoute();
    const { staffs, auth, filters } = usePage().props;

    //===========================Handle Add Staff===========================//
    const [openAddStaff, setOpenAddStaff] = useState(false);

    const toggleAddStaff = () => {
        setOpenAddStaff(!openAddStaff);
    };
    //===========================Handle View Staff===========================//
    const handleStaffClick = (userId) => {
        console.log(userId);
        router.visit(route("administration.view", userId));
    };
    //===========================Handle Search Staff===========================//
    const [search, setSearch] = useState(filters?.search || "");
    const [initialRender, setInitialRender] = useState(true);

    // Update search state
    const handleSearch = (value) => {
        setSearch(value);
        setInitialRender(false);
    };
    // Debounce effects
    const debounceHandleSearch = useMemo(() => {
        return debounce(handleSearch, 300);
    }, []);

    useEffect(() => {
        return () => debounceHandleSearch.cancel();
    }, []);

    useEffect(() => {
        if (!initialRender) {
            const query = {};
            if (search.trim()) query.search = search.trim();

            router.get(route("administration.index"), query, {
                showProgress: false,
                preserveState: true,
                replace: true,
            });
        }
    }, [search]);

    return (
        <div className="space-y-5 font-nunito-sans">
            <div className="flex flex-wrap gap-5 justify-between items-center">
                {/*===========================Add Staff===========================*/}
                <h1 className="text-size6 font-bold">Manage Staff</h1>
                <PrimaryButton
                    doSomething={toggleAddStaff}
                    text={"Add Staff"}
                />
            </div>
            <div className="flex justify-end items-center">
                {/*<BiFilter className="text-size5 shrink-0" />
                <div className="font-bold text-size2 pr-10">Filter</div>*/}
                <div className="relative">
                    {/*===========================Search Staff===========================*/}
                    <input
                        className="border w-full sm:w-60 pl-10 pr-3 py-2 border-ascend-black focus:outline-ascend-blue"
                        type="text"
                        placeholder="Search name"
                        defaultValue={search}
                        onChange={(e) => debounceHandleSearch(e.target.value)}
                    />
                    <IoSearch
                        onClick={() => handleSearch(search)}
                        className="absolute text-size4 left-3 top-1/2 -translate-y-1/2 text-ascend-gray1"
                    />
                </div>
            </div>
            {/*===========================Staff Table===========================*/}
            <div className="overflow-x-auto">
                <table className="table">
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Email
                            </th>
                            <th className="text-ascend-black font-black">
                                Role
                            </th>
                            <th className="text-ascend-black font-black">
                                Status
                            </th>
                            <th className="text-ascend-black font-black">
                                Last login
                            </th>
                            {/*<th className="text-ascend-black font-black">Last Logout</th>*/}
                        </tr>
                    </thead>
                    <tbody>
                        {staffs.data && staffs.data.length > 0 ? (
                            staffs.data.map((staff) => (
                                <tr
                                    key={staff.staff_id}
                                    className="group hover:bg-ascend-lightblue transition-all duration-300 cursor-pointer"
                                    onClick={() =>
                                        handleStaffClick(staff.staff_id)
                                    }
                                >
                                    <td className="py-5">
                                        <div className="font-bold group-hover:underline">
                                            {staff.user
                                                ? `${staff.user.first_name} ${
                                                      staff.user.middle_name
                                                          ? staff.user
                                                                .middle_name +
                                                            " "
                                                          : ""
                                                  }${staff.user.last_name}`
                                                : "N/A"}
                                            {staff.user?.user_id ===
                                                auth.user.user_id && (
                                                <span className="text-size1 font-normal">
                                                    {" "}
                                                    (You)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{staff.user.email || "N/A"}</td>
                                    <td>
                                        {staff.user?.role?.role_name
                                            ? staff.user.role.role_name
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              staff.user.role.role_name.slice(1)
                                            : "N/A"}
                                    </td>
                                    <td>
                                        {staff.status
                                            ? staff.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              staff.status.slice(1)
                                            : "N/A"}
                                    </td>
                                    <td>
                                        {staff.user?.last_login?.login_at
                                            ? new Date(
                                                  staff.user.last_login.login_at
                                              ).toLocaleString("en-US", {
                                                  month: "short",
                                                  day: "2-digit",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                              })
                                            : "N/A"}
                                    </td>
                                    {/*<td>{staff.user?.last_logout?.logout_at || "N/A"}</td>*/}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        paddingY="py-0"
                                        imgSrc="/images/illustrations/grades.svg"
                                        text="No staff members yet. Click 'Add Staff' to get started!"
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/*=================Download and Pagination will only show if data exists=================*/}
            {staffs.data && staffs.data.length > 0 && (
                <div className="flex flex-wrap-reverse items-center justify-between gap-5">
                    {/* Download Button (LEFT) */}
                    <div className="flex items-center gap-[1px]">
                        <PrimaryButton
                            text="Download PDF"
                            doSomething={() => {
                                window.location.href =
                                    route("staff.export.pdf");
                            }}
                        />
                        {/* Dropdown button */}
                        <div className="dropdown dropdown-end cursor-pointer">
                            <button
                                tabIndex={0}
                                role="button"
                                className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                            >
                                <div className="text-size1">
                                    {<IoCaretDownOutline />}
                                </div>
                            </button>

                            <ul
                                tabIndex={0}
                                className="text-size2 dropdown-content menu space-y-2 font-bold bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                            >
                                <li>
                                    <a
                                        href={route("staff.export.pdf")}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as PDF
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={route("staff.export.csv")}
                                        className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300"
                                    >
                                        Download as CSV
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Pagination (RIGHT) */}

                    {staffs?.data &&
                        staffs.data.length > 0 &&
                        staffs.last_page > 1 && ( // ⬅ Only show if more than 1 page
                            <div className="w-full sm:w-fit">
                                <Pagination
                                    links={staffs.links}
                                    currentPage={staffs.current_page}
                                    lastPage={staffs.last_page}
                                    only={["staffs"]}
                                />
                            </div>
                        )}
                </div>
            )}
            {/*================= Open add staff form =================*/}
            {openAddStaff && <AddStaffForm toggleForm={toggleAddStaff} />}
        </div>
    );
}
