import { useState, useEffect } from "react";
import PrimaryButton from "../../Components/Button/PrimaryButton";
import AlertModal from "../../Components/AlertModal";
import { router, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import useRegistrationStore from "../../Stores/Registration/registrationStore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
    regions,
    provinces,
    cities,
    barangays,
} from "select-philippines-address";

const RegistrationFields = () => {
    const route = useRoute();

    // Toggle Password State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Region, Province, City and Barangay
    const [regionList, setRegionList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [barangayList, setBarangayList] = useState([]);

    //Modal Terms and Condition
    const [isTermsConditionOpen, setIsTermsConditionOpen] = useState(false);
    const [approvedTerms, setApprovedTerms] = useState(false);

    useEffect(() => {
        regions().then((res) => {
            setRegionList(res);
        });
    }, []);

    const closeTermsConditionModal = () => {
        setIsTermsConditionOpen(false);
    };

    const approveTerms = () => {
        setApprovedTerms(true);
        setIsTermsConditionOpen(false);
    };

    const handleRegionChange = (regionCode) => {
        const selectedRegion = regionList.find(
            (r) => r.region_code === regionCode
        );
        handleRegistrationChange("region", selectedRegion.region_code);
        handleRegistrationChange("region_name", selectedRegion.region_name); // new
        provinces(regionCode).then((res) => {
            setProvinceList(res);
            setCityList([]);
            setBarangayList([]);
        });
    };

    const handleProvinceChange = (provinceCode) => {
        const selectedProvince = provinceList.find(
            (p) => p.province_code === provinceCode
        );
        handleRegistrationChange("province", selectedProvince.province_code);
        handleRegistrationChange(
            "province_name",
            selectedProvince.province_name
        ); // new
        cities(provinceCode).then((res) => {
            setCityList(res);
            setBarangayList([]);
        });
    };

    const handleCityChange = (cityCode) => {
        const selectedCity = cityList.find((c) => c.city_code === cityCode);
        handleRegistrationChange("city", selectedCity.city_code);
        handleRegistrationChange("city_name", selectedCity.city_name); // new
        barangays(cityCode).then((res) => {
            setBarangayList(res);
        });
    };

    const handleBarangayChange = (brgyCode) => {
        const selectedBarangay = barangayList.find(
            (b) => b.brgy_code === brgyCode
        );
        handleRegistrationChange("barangay", selectedBarangay.brgy_code);
        handleRegistrationChange("barangay_name", selectedBarangay.brgy_name); // new
    };

    // Registration store
    const registration = useRegistrationStore((state) => state.registration);
    const handleRegistrationChange = useRegistrationStore(
        (state) => state.handleRegistrationChange
    );
    const clearRegistration = useRegistrationStore(
        (state) => state.clearRegistration
    );

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const register = () => {
        setErrorMessage("");

        if (!approvedTerms) {
            setErrorMessage({ error: "You must agree to the terms and conditions." });
            return;
        }

        router.post(route("register.user"), registration, {
            replace: true, // Prevent user from going back to this page
            showProgress: false,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
            onError: (error) => {
                setErrorMessage(error);
                setLoading(false);
            },
            onSuccess: () => {
                clearRegistration();
                setLoading(false);
            },
        });
    };

    return (
        <>
            <div className="mx-auto max-w-4xl bg-white">
                <p className="text-xs text-red-500 font-nunito-sans mb-3">
                    * All Fields are Required.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div class="relative">
                        <input
                            type="text"
                            value={registration.last_name}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "last_name",
                                    e.target.value
                                )
                            }
                            id="LastNameOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="LastNameOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Last Name
                        </label>
                    </div>
                    <div class="relative">
                        <input
                            type="text"
                            value={registration.first_name}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "first_name",
                                    e.target.value
                                )
                            }
                            id="FirstNameOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="FirstNameOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            First Name{" "}
                        </label>
                    </div>
                    <div class="relative">
                        <input
                            type="text"
                            value={registration.middle_name}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "middle_name",
                                    e.target.value
                                )
                            }
                            id="MiddleNameOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="MiddleNameOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Middle Name{" "}
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                    <div>
                        <input
                            type="date"
                            value={registration.birthdate}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "birthdate",
                                    e.target.value
                                )
                            }
                            className="w-full border border-ascend-gray1 px-3 py-3 text-sm  focus:outline-ascend-blue"
                        />
                    </div>
                    <div>
                        <select
                            value={registration.gender}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "gender",
                                    e.target.value
                                )
                            }
                            className="textField w-full border border-ascend-gray1 px-3 py-3 text-sm focus:outline-ascend-blue"
                        >
                            <option value="">Select sex </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 pt-4">
                    <div class="relative">
                        <input
                            type="text"
                            value={registration.house_no}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "house_no",
                                    e.target.value
                                )
                            }
                            id="HouseStreetOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="HouseStreetOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            House no., Street{" "}
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                    {/* Region */}
                    <div>
                        <select
                            value={registration.region}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            className="textField w-full border border-ascend-gray1 px-3 py-3 text-sm focus:outline-ascend-blue"
                        >
                            <option value="">Select Region </option>
                            {regionList.map((reg) => (
                                <option
                                    key={reg.region_code}
                                    value={reg.region_code}
                                >
                                    {reg.region_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Province */}
                    <div>
                        <select
                            value={registration.province}
                            onChange={(e) =>
                                handleProvinceChange(e.target.value)
                            }
                            disabled={!provinceList.length}
                            className="textField w-full border border-ascend-gray1 px-3 py-3 text-sm focus:outline-ascend-blue"
                        >
                            <option value="">Select Province </option>
                            {provinceList.map((prov) => (
                                <option
                                    key={prov.province_code}
                                    value={prov.province_code}
                                >
                                    {prov.province_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* City */}
                    <div>
                        <select
                            value={registration.city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={!cityList.length}
                            className="textField w-full border border-ascend-gray1 px-3 py-3 text-sm focus:outline-ascend-blue"
                        >
                            <option value="">Select City </option>
                            {cityList.map((ct) => (
                                <option key={ct.city_code} value={ct.city_code}>
                                    {ct.city_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Barangay */}
                    <div>
                        <select
                            value={registration.barangay}
                            onChange={(e) =>
                                handleBarangayChange(e.target.value)
                            }
                            disabled={!barangayList.length}
                            className="textField w-full border border-ascend-gray1 px-3 py-3 text-sm focus:outline-ascend-blue"
                        >
                            <option value="">Select Barangay </option>
                            {barangayList.map((brgy) => (
                                <option
                                    key={brgy.brgy_code}
                                    value={brgy.brgy_code}
                                >
                                    {brgy.brgy_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                    <div class="relative">
                        <input
                            type="number"
                            value={registration.contact_number}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 11);
                                handleRegistrationChange(
                                    "contact_number",
                                    onlyNumbers
                                );
                            }}
                            id="ContactOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="ContactOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Contact Number
                        </label>
                    </div>
                    <div class="relative">
                        <input
                            type="text"
                            value={registration.email}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "email",
                                    e.target.value
                                )
                            }
                            id="EmailAddressOutlined"
                            class="block px-3 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <label
                            for="EmailAddressOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Email Address{" "}
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                    <div class="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={registration.password}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "password",
                                    e.target.value
                                )
                            }
                            id="PasswordOutlined"
                            className="block px-3 py-3 w-full text-sm bg-transparent border border-ascend-gray1 focus:outline-ascend-blue peer"
                            placeholder=" "
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <AiOutlineEyeInvisible className="h-5 w-5" />
                            ) : (
                                <AiOutlineEye className="h-5 w-5" />
                            )}
                        </button>
                        <label
                            for="PasswordOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Password
                        </label>
                    </div>
                    <div class="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={registration.password_confirmation}
                            onChange={(e) =>
                                handleRegistrationChange(
                                    "password_confirmation",
                                    e.target.value
                                )
                            }
                            id="CPasswordOutlined"
                            className="block px-3 py-3 w-full text-sm bg-transparent border border-ascend-gray1 focus:outline-ascend-blue peer"
                            placeholder=" "
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showConfirmPassword ? (
                                <AiOutlineEyeInvisible className="h-5 w-5" />
                            ) : (
                                <AiOutlineEye className="h-5 w-5" />
                            )}
                        </button>
                        <label
                            for="CPasswordOutlined"
                            class="absolute text-sm text-ascend-gray1 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-ascend-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                        >
                            Confirm Password{" "}
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                <input
                    type="checkbox"
                    className="accent-ascend-blue w-4 h-4 cursor-pointer"
                    checked={approvedTerms}
                    onChange={(e) => {
                        if (!approvedTerms) {
                            setIsTermsConditionOpen(true);
                        } else {
                            setApprovedTerms(false);
                        }
                    }}

                />
                <span>Terms and Conditions</span>
                </div>

                {errorMessage.error && (
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
                        <span>{errorMessage.error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 pt-4 mb-5">
                    <PrimaryButton
                        isDisabled={loading}
                        isLoading={loading}
                        doSomething={register}
                        text="Register"
                    />
                </div>
            </div>

            {isTermsConditionOpen && (
                <AlertModal
                    title={
                        "Terms and Conditions"
                    }
                    customBody={
                        <div className="text-size2 text-justify my-4 p-4 border border-ascend-gray1 max-h-64 overflow-y-auto">
                            <ol className="list-decimal pl-5 space-y-2 marker:font-semibold">
                                <li>
                                By using this Learning Management System (LMS), you agree to provide personal information
                                such as your name, email address, and other details required for registration and course
                                participation. This information is collected to ensure a smooth and personalized learning
                                experience.
                                </li>

                                <li>
                                During online quizzes or assessments, the LMS may monitor user activity and capture
                                screenshots to detect any suspicious behavior that may indicate academic dishonesty.
                                This process helps maintain fairness and integrity in the learning environment.
                                </li>

                                <li>
                                All personal data and quiz monitoring information collected by the LMS will be securely
                                stored and handled in compliance with applicable data protection laws. The data will be
                                used solely for educational purposes and system functionality.
                                </li>

                                <li>
                                By participating in quizzes and using the LMS, you explicitly consent to the collection
                                and monitoring of data as described in these terms.
                                </li>

                                <li>
                                Personal data will be retained only for as long as necessary to fulfill the purposes
                                outlined in this agreement. Users have the right to request information regarding their
                                data and its usage at any time.
                                </li>
                            </ol>
                        </div>
                    }
                    onConfirm={approveTerms}
                    closeModal={closeTermsConditionModal}
                />
            )}

        </>
    );
};

export default RegistrationFields;
