import React, { useState, useEffect } from "react";
import PrimaryButton from "../../Components/Button/PrimaryButton";
import { useForm, Link, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import useNotificationStore from "../../Stores/Notification/notificationStore";

export default function Login() {
    //  Notification store
    const clearNotificationState = useNotificationStore(
        (state) => state.clearNotificationState
    );

    const route = useRoute();
    const [successMsg, setSuccessMsg] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            email: "",
            password: "",
        });

    function login(e) {
        clearErrors();
        setSuccessMsg(null);
        e.preventDefault();
        post(route("login.user"), {
            replace: true,
            showProgress: false,
            onSuccess: () => reset("password", "email"),
        });
    }

    const [screenSize, setScreenSize] = useState(() =>
        typeof window !== "undefined" && window.innerWidth >= 768
            ? "medium"
            : "small"
    );

    // This will clear notifcaation state when user was redirected to login page after restore
    useEffect(() => {
        clearNotificationState();
    }, []);

    useEffect(() => {
        setSuccessMsg(flash.success ? flash.success : null);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");

        const handleResize = () => {
            setScreenSize(mediaQuery.matches ? "medium" : "small");
        };

        handleResize();
        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    const clipPathSmall = "polygon(100% 50px, 0% 0%, 0% 100%, 100% 100%)"; // for small screen
    const clipPathMedium = "polygon(10px 0px, 100% 0px, 100% 100%, 10% 100%)"; // for big or medium screen

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row">
            {/* LEFT SIDE - Login Form */}
            <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8">
                <img
                    src="/images/ascend_logo.png"
                    alt="Ascend Logo"
                    className="w-60 mb-6"
                />
                <h1 className="text-2xl font-nunito-sans font-bold mb-2 ">
                    Welcome!
                </h1>
                <p className="text-xl-1 font-nunito-sans  text mb-4">
                    Sign to your account to continue
                </p>

                <form onSubmit={login} className="w-full max-w-sm space-y-5">
                    {successMsg && (
                        <div
                            role="alert"
                            className="alert alert-success rounded-none font-nunito-sans"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 shrink-0 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>{successMsg}</span>
                        </div>
                    )}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            id="emailfloat"
                            className="block px-4 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <label
                            htmlFor="emailfloat"
                            className="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Email
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="passwordfloat"
                            className="block px-4 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer password-input"
                            placeholder=" "
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />
                        <label
                            htmlFor="passwordfloat"
                            className="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Password
                        </label>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="w-3 h-3 mr-2 text-blue-300 accent-ascend-blue font-nunito-sans"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />{" "}
                            Show password
                        </label>
                        <Link
                            href="/forget-password"
                            className="text-ascend-blue hover:underline font-nunito-sans"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {errors.error && (
                        <div
                            role="alert"
                            className="alert alert-error rounded-none font-nunito-sans mt-4"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 shrink-0 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>{errors.error}</span>
                        </div>
                    )}
                    <div className="grid">
                        <PrimaryButton
                            btnType="submit"
                            text="Login"
                            isDisabled={processing}
                            isLoading={processing}
                        />
                    </div>
                </form>
            </div>

            {/* RIGHT SIDE - Enroll section */}
            <div className="w-full h-100 md:h-screen md:w-1/2">
                <div
                    className="h-full bg-ascend-yellow pt-5 md:pt-0"
                    style={{
                        clipPath:
                            screenSize === "small"
                                ? clipPathSmall
                                : clipPathMedium,
                    }}
                >
                    <div
                        className="h-full md:h-full bg-ascend-blue md:ml-5 flex items-center p-5"
                        style={{
                            clipPath:
                                screenSize === "small"
                                    ? clipPathSmall
                                    : clipPathMedium,
                        }}
                    >
                        <div className=" text-white flex flex-col justify-center items-center p-10 w-full md:w-full">
                            <div className="z-10 text-center max-w-xs">
                                <h2 className="text-xl font-nunito-sans font-bold mb-2 mr-0">
                                    Not registered yet?
                                </h2>
                                <p className="mb-4 text-xl-1 font-nunito-sans">
                                    Register now to gain access and start your
                                    review journey!
                                </p>
                                <Link replace href={"/register"}>
                                    <div className="flex justify-center">
                                        <PrimaryButton
                                            text="Register"
                                            btnColor="bg-ascend-white"
                                            textColor="text-ascend-blue"
                                            className="mx-auto"
                                        ></PrimaryButton>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Login.layout = null;
