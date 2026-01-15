import { forwardRef } from "react";
import { router } from "@inertiajs/react";
import { IoPersonCircle, IoLogOutSharp } from "react-icons/io5";
import { route } from "ziggy-js";
import { closeDropDown } from "../../../Utils/closeDropdown";
import axios from "axios";
import NProgress from "nprogress";

const ProfileDropdown = forwardRef((props, ref) => {
    NProgress.configure({ showSpinner: false }); // Remove spinner

    const handleProfileClick = () => {
        router.visit(route("profile"));

        // Close the dropdown
        props.setDropdown("");
    };

    const handleLogout = async () => {
        try {
            // Close the dropdown
            props.setDropdown("");

            NProgress.start();
            await axios.post(route("logout.user")).then(() => {
                window.location.href = "/login"; // Redirect to login page
            });
        } catch (error) {
            console.error(error);
        } finally {
            NProgress.done();
        }
    };

    return (
        <div
            ref={ref}
            className="absolute z-40 top-full right-6 sm:left-auto w-48 py-2 bg-white shadow-lg border-ascend-gray1 border max-h-[60vh] overflow-y-auto"
        >
            <div className="font-nunito-sans w-full text-ascend-black font-bold flex flex-col space-y-2">
                <div
                    onClick={handleProfileClick}
                    className="flex space-x-2 px-5 py-3 hover:bg-ascend-lightblue transition-hover duration-300 cursor-pointer"
                >
                    <IoPersonCircle className="text-size5" />
                    <span>Profile</span>
                </div>
                <div
                    onClick={handleLogout}
                    className="flex space-x-2 px-5 py-3 hover:bg-ascend-lightblue transition-hover duration-300 cursor-pointer"
                >
                    <IoLogOutSharp className="text-size5" />
                    <span>Sign out</span>
                </div>
            </div>
        </div>
    );
});

export default ProfileDropdown;
