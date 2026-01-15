import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import PrimaryButton from "../../Components/Button/PrimaryButton";
import SecondaryButton from "../../Components/Button/SecondaryButton";
import BackButton from "../../Components/Button/BackButton";
import { handleClickBackBtn } from "../../Utils/handleClickBackBtn";
import { BiSolidEditAlt } from "react-icons/bi";
import {
    regions,
    provinces,
    cities,
    barangays,
} from "select-philippines-address";
import { displayToast } from "../../Utils/displayToast";
import DefaultCustomToast from "../../Components/CustomToast/DefaultCustomToast";
import Loader from "../../Components/Loader";

export default function Profile() {
    const { user } = usePage().props;
    const [isEdit, setIsEdit] = useState(false);
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const [emailError, setEmailError] = useState("");

    const [formData, setFormData] = useState({
        lastName: user?.lastName || "",
        firstName: user?.firstName || "",
        middleName: user?.middleName || "",
        phone: user?.phone || "",
        email: user?.email || "",
        birthday: user?.birthday || "",
        gender: user?.gender || "",
        houseNoSt: user?.houseNoSt || "",
        region: user?.region || "",
        province: user?.province || "",
        city: user?.city || "",
        barangay: user?.barangay || "",
    });

    const toggleEdit = () => {
        if (isEdit) {
            // Reset form data to original values on cancel
            setFormData({
                lastName: user?.lastName || "",
                firstName: user?.firstName || "",
                middleName: user?.middleName || "",
                phone: user?.phone || "",
                email: user?.email || "",
                birthday: user?.birthday || "",
                gender: user?.gender || "",
                houseNoSt: user?.houseNoSt || "",
                region: user?.region || "",
                province: user?.province || "",
                city: user?.city || "",
                barangay: user?.barangay || "",
            });
        }
        setIsEdit(!isEdit);
    };

    //===========================Profile Image===========================//
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [updateProfileError, setUpdateProfileError] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Immediately show preview
        setProfilePreview(URL.createObjectURL(file));
        setIsProfileLoading(true);

        router.post(
            route("profile.photo.update"), // or route("staff.profile.update", staffDetails.staff_id) if dynamic
            { _method: "put", profile_image: file },
            {
                showProgress: false,
                onError: (error) => {
                    setUpdateProfileError(error); // Save error to state
                    setIsProfileLoading(false); // Reset loading
                },
                onFinish: () => {
                    setIsProfileLoading(false); // Always reset loading after request
                },
            }
        );
    };

    //=================Location Lists=================//
    const [regionList, setRegionList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [barangayList, setBarangayList] = useState([]);

    useEffect(() => {
        let mounted = true;

        async function initLocation() {
            try {
                const regRes = await regions();
                if (!mounted) return;
                setRegionList(regRes);

                // Set codes based on user selection
                const foundRegion = regRes.find(
                    (r) =>
                        r.region_name?.toLowerCase() ===
                        user?.region?.toLowerCase()
                );
                if (!foundRegion) return;
                setFormData((prev) => ({
                    ...prev,
                    region_code: foundRegion.region_code,
                    region: foundRegion.region_name,
                }));

                const provRes = await provinces(foundRegion.region_code);
                if (!mounted) return;
                setProvinceList(provRes);
                const foundProv = provRes.find(
                    (p) =>
                        p.province_name?.toLowerCase() ===
                        user?.province?.toLowerCase()
                );
                if (!foundProv) return;
                setFormData((prev) => ({
                    ...prev,
                    province_code: foundProv.province_code,
                    province: foundProv.province_name,
                }));

                const cityRes = await cities(foundProv.province_code);
                if (!mounted) return;
                setCityList(cityRes);
                const foundCity = cityRes.find(
                    (c) =>
                        c.city_name?.toLowerCase() === user?.city?.toLowerCase()
                );
                if (!foundCity) return;
                setFormData((prev) => ({
                    ...prev,
                    city_code: foundCity.city_code,
                    city: foundCity.city_name,
                }));

                const brgyRes = await barangays(foundCity.city_code);
                if (!mounted) return;
                setBarangayList(brgyRes);
                const foundBrgy = brgyRes.find(
                    (b) =>
                        b.brgy_name?.toLowerCase() ===
                        user?.barangay?.toLowerCase()
                );
                if (!foundBrgy) return;
                setFormData((prev) => ({
                    ...prev,
                    barangay_code: foundBrgy.brgy_code,
                    barangay: foundBrgy.brgy_name,
                }));
            } catch (err) {
                console.error(err);
            }
        }

        initLocation();
        return () => (mounted = false);
    }, [user]);

    //=================Handlers=================//
    const handleRegionChange = (regionCode) => {
        const selectedRegion = regionList.find(
            (r) => r.region_code === regionCode
        );
        if (!selectedRegion) return;
        setFormData((prev) => ({
            ...prev,
            region_code: selectedRegion.region_code,
            region: selectedRegion.region_name,
            province_code: "",
            province: "",
            city_code: "",
            city: "",
            barangay_code: "",
            barangay: "",
        }));
        setProvinceList([]);
        setCityList([]);
        setBarangayList([]);
        provinces(regionCode).then(setProvinceList);
    };

    const handleProvinceChange = (provinceCode) => {
        const selectedProvince = provinceList.find(
            (p) => p.province_code === provinceCode
        );
        if (!selectedProvince) return;
        setFormData((prev) => ({
            ...prev,
            province_code: selectedProvince.province_code,
            province: selectedProvince.province_name,
            city_code: "",
            city: "",
            barangay_code: "",
            barangay: "",
        }));
        setCityList([]);
        setBarangayList([]);
        cities(provinceCode).then(setCityList);
    };

    const handleCityChange = (cityCode) => {
        const selectedCity = cityList.find((c) => c.city_code === cityCode);
        if (!selectedCity) return;
        setFormData((prev) => ({
            ...prev,
            city_code: selectedCity.city_code,
            city: selectedCity.city_name,
            barangay_code: "",
            barangay: "",
        }));
        setBarangayList([]);
        barangays(cityCode).then(setBarangayList);
    };

    const handleBarangayChange = (brgyCode) => {
        const selectedBrgy = barangayList.find((b) => b.brgy_code === brgyCode);
        if (!selectedBrgy) return;
        setFormData((prev) => ({
            ...prev,
            barangay_code: selectedBrgy.brgy_code,
            barangay: selectedBrgy.brgy_name,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const errors = [];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,10}$/;

        if (isAdmin) {
            if (!formData.email || formData.email.trim() === "") {
                errors.push("Email is required");
            } else if (!emailRegex.test(formData.email)) {
                errors.push("Email is invalid");
            }

            if (!formData.gender) {
                errors.push("Gender is required");
            }
        }

        if (errors.length > 0) {
            displayToast(
                <DefaultCustomToast message={errors.join(", ")} />,
                "error"
            );
            return;
        }

        // Only include fields that the user is allowed to update
        // Admin can update all personal info
        // Non-admin users can only update address info
        const payload = isAdmin
            ? {
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName,
                phone: formData.phone,
                email: formData.email,
                birthday: formData.birthday,
                gender: formData.gender,
                houseNoSt: formData.houseNoSt,
                region: formData.region,
                province: formData.province,
                city: formData.city,
                barangay: formData.barangay,
            }
            : {
                houseNoSt: formData.houseNoSt,
                region: formData.region,
                province: formData.province,
                city: formData.city,
                barangay: formData.barangay,
            };

        router.put(route("profile.update"), payload, {
            onSuccess: (page) => {
                setIsEdit(false);
                displayToast(
                    <DefaultCustomToast
                        message={
                            page.props.flash?.success ||
                            "Profile updated successfully!"
                        }
                    />,
                    "success"
                );
            },
            onError: () => {
                displayToast(
                    <DefaultCustomToast message="Failed to update profile." />,
                    "error"
                );
            },
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between">
                <BackButton doSomething={handleClickBackBtn} />

                {isEdit ? (
                    <div className="flex gap-2">
                        <SecondaryButton
                            doSomething={toggleEdit}
                            text={"Cancel"}
                        />
                        <PrimaryButton doSomething={handleSave} text={"Save"} />
                    </div>
                ) : (
                    <PrimaryButton doSomething={toggleEdit} text={"Edit"} />
                )}
            </div>

            <div className="justify-start flex items-center mt-5">
                <div className="relative w-18 h-18 bg-ascend-gray1 rounded-full shrink-0 group">
                    {/* Loading overlay */}
                    {isProfileLoading && (
                        <>
                            <div className="absolute inset-0 bg-ascend-lightblue opacity-40 rounded-full"></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Loader color="bg-ascend-blue" size="sm" />
                            </div>
                        </>
                    )}

                    {/* Profile image */}
                    {profilePreview || user.profile_image ? (
                        <img
                            src={
                                profilePreview // show selected preview first
                                    ? profilePreview
                                    : user.profile_image // fallback to current user image
                                    ? `/storage/${user.profile_image}`
                                    : "/images/default_profile.png"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <div
                            className={`w-full h-full bg-ascend-blue rounded-full shrink-0 flex items-center justify-center`}
                        >
                            <span
                                className={`text-size7 font-bold  text-ascend-white capitalize`}
                            >
                                {user.firstName[0]}
                            </span>
                        </div>
                    )}

                    {/* Edit overlay */}
                    <label
                        htmlFor="inputProfile"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 text-ascend-white opacity-0 hover:opacity-50 cursor-pointer rounded-full transition-opacity duration-200"
                    >
                        <BiSolidEditAlt className="text-size4" />
                    </label>

                    {/* Hidden file input */}
                    <input
                        id="inputProfile"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfileChange} // use the structured handler
                    />

                    {/* Optional: display upload error */}
                    {updateProfileError && (
                        <div className="absolute -bottom-6 text-red-500 text-xs">
                            {updateProfileError.message ||
                                "Failed to update profile"}
                        </div>
                    )}
                </div>
                <div className="flex flex-col ml-2">
                    <div className="flex items-center">
                        <div className="font-nunito-sans text-size4 ml-5 font-bold">
                            {`${user?.firstName} ${user?.lastName}`}
                        </div>
                    </div>
                    <div className="font-nunito-sans text-size2 ml-5">
                        {user?.role.charAt(0).toUpperCase() +
                            user?.role.slice(1)}
                    </div>
                </div>
            </div>

            <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={!isEdit || !isAdmin}
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={!isEdit || !isAdmin}
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            disabled={!isEdit || !isAdmin}
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            disabled={!isEdit || !isAdmin}
                            maxLength={11} // limits input to 11 characters
                            onChange={(e) => {
                                const value = e.target.value;
                                // Only allow digits
                                if (/^\d*$/.test(value)) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        phone: value,
                                    }));
                                }
                            }}
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled={!isEdit || !isAdmin}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({
                                    ...prev,
                                    email: value,
                                }));

                                if (
                                    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,10}$/.test(
                                        value
                                    )
                                ) {
                                    setEmailError(
                                        "Please enter a valid email address"
                                    );
                                } else {
                                    setEmailError("");
                                }
                            }}
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                        {isAdmin && emailError && (
                            <span className="text-red-500 text-sm">
                                {emailError}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Birthday
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            disabled={!isEdit || !isAdmin}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    birthday: e.target.value,
                                }))
                            }
                            className={`border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender} // use formData state
                            disabled={!isEdit || !isAdmin}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    gender: e.target.value,
                                }))
                            }
                            className={`textField border px-3 py-2 ${
                                !isEdit || !isAdmin ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="" disabled>
                                Select Gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            House no. Street
                        </label>
                        <input
                            type="text"
                            name="houseNoSt"
                            value={formData.houseNoSt} // use formData state
                            disabled={!isEdit}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    houseNoSt: e.target.value,
                                }))
                            }
                            className={`border px-3 py-2 ${
                                !isEdit ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Region
                        </label>
                        <select
                            disabled={!isEdit}
                            value={formData.region_code}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                !isEdit ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Region</option>
                            {regionList.map((r) => (
                                <option
                                    key={r.region_code}
                                    value={r.region_code}
                                >
                                    {r.region_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Province
                        </label>
                        <select
                            disabled={!isEdit || !provinceList.length}
                            value={formData.province_code}
                            onChange={(e) =>
                                handleProvinceChange(e.target.value)
                            }
                            className={`textField border px-3 py-2 ${
                                !isEdit ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Province</option>
                            {provinceList.map((p) => (
                                <option
                                    key={p.province_code}
                                    value={p.province_code}
                                >
                                    {p.province_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            City
                        </label>
                        <select
                            disabled={!isEdit || !cityList.length}
                            value={formData.city_code}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                !isEdit ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select City</option>
                            {cityList.map((c) => (
                                <option key={c.city_code} value={c.city_code}>
                                    {c.city_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Barangay
                        </label>
                        <select
                            disabled={!isEdit || !barangayList.length}
                            value={formData.barangay_code}
                            onChange={(e) =>
                                handleBarangayChange(e.target.value)
                            }
                            className={`textField border px-3 py-2 ${
                                !isEdit ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Barangay</option>
                            {barangayList.map((b) => (
                                <option key={b.brgy_code} value={b.brgy_code}>
                                    {b.brgy_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
}
