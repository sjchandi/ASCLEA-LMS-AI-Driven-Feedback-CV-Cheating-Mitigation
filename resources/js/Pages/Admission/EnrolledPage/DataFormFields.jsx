import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import SecondaryButton from "../../../Components/Button/SecondaryButton";
import { regions, provinces, cities, barangays } from "select-philippines-address";
import { displayToast } from "../../../Utils/displayToast";
import DefaultCustomToast from "../../../Components/CustomToast/DefaultCustomToast";

const DataFormFields = ({ student, isEditDisabled, setIsEditDisabled, role}) => {
    //=========================== Local state to control form and editing ===========================//
    const [formData, setFormData] = useState({
        first_name: student.user?.first_name || "",
        last_name: student.user?.last_name || "",
        middle_name: student.user?.middle_name || "",
        email: student.user?.email || "",
        contact_number: student.user?.contact_number || "",
        birthdate: student.user?.birthdate || "",
        gender: student.user?.gender || "",
        house_no: student.user?.house_no || "",
        region_code: "",
        region: student.user?.region || "",
        province_code: "",
        province: student.user?.province || "",
        city_code: "",
        city: student.user?.city || "",
        barangay_code: "",
        barangay: student.user?.barangay || "",
        program: student.program || "",
        enrollment_status: student.enrollment_status || "",
    });

    //=========================== Location Lists ===========================//
    const [regionList, setRegionList] = useState([]);
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [barangayList, setBarangayList] = useState([]);

    //=========================== Init Region-Province-City-Barangay ===========================//
    useEffect(() => {
        let mounted = true;

        async function initLocation() {
            try {
                const regRes = await regions();
                if (!mounted) return;
                setRegionList(regRes);

                const foundRegion = regRes.find(
                    (r) =>
                        r.region_name?.toLowerCase().trim() ===
                        formData.region?.toLowerCase().trim()
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
                        p.province_name?.toLowerCase().trim() ===
                        formData.province?.toLowerCase().trim()
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
                        c.city_name?.toLowerCase().trim() ===
                        formData.city?.toLowerCase().trim()
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
                        b.brgy_name?.toLowerCase().trim() ===
                        formData.barangay?.toLowerCase().trim()
                );
                if (!foundBrgy) return;

                setFormData((prev) => ({
                    ...prev,
                    barangay_code: foundBrgy.brgy_code,
                    barangay: foundBrgy.brgy_name,
                }));
            } catch (err) {
                console.error("init location error", err);
            }
        }

        initLocation();
        return () => {
            mounted = false;
        };
    }, [student]);

    //=========================== Handle Region Change ===========================//
    const handleRegionChange = (regionCode) => {
        const selectedRegion = regionList.find((r) => r.region_code === regionCode);
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

        provinces(regionCode).then((res) => setProvinceList(res));
    };

    //=========================== Handle Province Change ===========================//
    const handleProvinceChange = (provinceCode) => {
        const selectedProvince = provinceList.find((p) => p.province_code === provinceCode);
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
        cities(provinceCode).then((res) => setCityList(res));
    };

    //=========================== Handle City Change ===========================//
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
        barangays(cityCode).then((res) => setBarangayList(res));
    };

    //=========================== Handle Barangay Change ===========================//
    const handleBarangayChange = (barangayCode) => {
        const selectedBarangay = barangayList.find((b) => b.brgy_code === barangayCode);
        if (!selectedBarangay) return;

        setFormData((prev) => ({
            ...prev,
            barangay_code: selectedBarangay.brgy_code,
            barangay: selectedBarangay.brgy_name,
        }));
    };

    //=========================== Generic Input Change ===========================//
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //=========================== Save Changes ===========================//
    const handleSave = (e) => {
        e.preventDefault();
        router.put(route("admission.updateStudent", student.student_id), formData, {
            onSuccess: (page) => {
                setIsEditDisabled(true);
                displayToast(
                    <DefaultCustomToast message={page.props.flash.success} />,
                    "success"
                );
            },
            onError: (errors) => {
                console.error(errors);
                displayToast(
                    <DefaultCustomToast message="Failed to update student info." />,
                    "error"
                );
            },
        });
    };

    //=========================== Cancel Changes ===========================//
    const handleCancel = () => {
        setFormData({
            first_name: student.user?.first_name || "",
            last_name: student.user?.last_name || "",
            middle_name: student.user?.middle_name || "",
            email: student.user?.email || "",
            contact_number: student.user?.contact_number || "",
            birthdate: student.user?.birthdate || "",
            gender: student.user?.gender || "",
            house_no: student.user?.house_no || "",
            region: student.user?.region || "",
            province: student.user?.province || "",
            city: student.user?.city || "",
            barangay: student.user?.barangay || "",
            program: student.program || "",
            enrollment_status: student.enrollment_status || "",
        });

        setIsEditDisabled(true);
    };
    return (
        <>
        <div className="flex justify-end items-center">
            {role === "admin" && (
                isEditDisabled ? (
                    <PrimaryButton
                        text="Edit"
                        btnColor="bg-ascend-blue"
                        doSomething={() => setIsEditDisabled(false)}
                    />
                ) : (
                    <div className="flex gap-3">
                        <SecondaryButton
                            text="Cancel"
                            btnColor="bg-ascend-red"
                            doSomething={handleCancel}
                        />
                        <PrimaryButton
                            text="Save"
                            btnColor="bg-ascend-blue"
                            doSomething={handleSave}
                        />
                    </div>
                )
            )}
        </div>


            <form autoComplete="off" className="mt-5">
                {/*===========================NAME FIELDS===========================*/}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Last Name */}
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>

                    {/* First Name */}
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>

                    {/* Middle Name */}
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                </div>

                {/*===========================PROGRAM AND ENROLLMENT STATUS===========================*/}
                {/*<div className="grid grid-cols-1 sm:grid-cols-1 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label>Program</label>
                        <select
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Program</option>
                            <option value="program1">Program 1</option>
                            <option value="program2">Program 2</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label>Enrollment Status</label>
                        <select
                            name="enrollment_status"
                            value={formData.enrollment_status}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Status</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="dropout">Dropout</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                </div>*/}

                {/*===========================ENROLLMENT STATUS & STUDENT CONTACT INFO===========================*/}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label>Enrollment Status</label>
                        <select
                            name="enrollment_status"
                            value={formData.enrollment_status}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Status</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="dropout">Dropout</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-nunito-sans text-size2 text-ascend-black">Phone Number</label>
                        <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 11);
                                handleChange({
                                    target: { name: "contact_number", value: onlyNumbers },
                                });
                            }}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label>Email</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                </div>

                {/*===========================BIRTHDAY & GENDER===========================*/}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="flex flex-col">
                        <label>Birthday</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`border px-3 pr-8 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={isEditDisabled}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                {/*===========================ADDRESS===========================*/}
                <div className="grid grid-cols-2 gap-5 mt-5">
                    {/* Region */}
                    <div className="flex flex-col">
                        <label>Region</label>
                        <select
                            value={formData.region_code}
                            disabled={isEditDisabled}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Region</option>
                            {regionList.map((reg) => (
                                <option key={reg.region_code} value={reg.region_code}>
                                    {reg.region_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Province */}
                    <div className="flex flex-col">
                        <label>Province</label>
                        <select
                            value={formData.province_code}
                            disabled={isEditDisabled || !provinceList.length}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Province</option>
                            {provinceList.map((prov) => (
                                <option key={prov.province_code} value={prov.province_code}>
                                    {prov.province_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* City */}
                    <div className="flex flex-col">
                        <label>City</label>
                        <select
                            value={formData.city_code}
                            disabled={isEditDisabled || !cityList.length}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select City</option>
                            {cityList.map((ct) => (
                                <option key={ct.city_code} value={ct.city_code}>
                                    {ct.city_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Barangay */}
                    <div className="flex flex-col">
                        <label>Barangay</label>
                        <select
                            value={formData.barangay_code}
                            disabled={isEditDisabled || !barangayList.length}
                            onChange={(e) => handleBarangayChange(e.target.value)}
                            className={`textField border px-3 py-2 ${
                                isEditDisabled ? "text-ascend-gray1" : ""
                            } border-ascend-gray1 focus:outline-ascend-blue`}
                        >
                            <option value="">Select Barangay</option>
                            {barangayList.map((brgy) => (
                                <option key={brgy.brgy_code} value={brgy.brgy_code}>
                                    {brgy.brgy_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </>
    );
};

export default DataFormFields;