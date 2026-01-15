import React, { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { route, useRoute } from "ziggy-js";
import BackButton from "../../../Components/Button/BackButton";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import useEnrolledStore from "../../../Stores/Admission/EnrolledStore";
import DataFormFields from "./DataFormFields";
import CoursesTable from "./CoursesTable";
import AssesstmentTable from "./AssesstmentTable";
import AdmissionFiles from "./AdmissionFiles";
import GradesTable from "./GradesTable";
import AlertModal from "../../../Components/AlertModal";
import { displayToast } from "../../../Utils/displayToast";
import DefaultCustomToast from "../../../Components/CustomToast/DefaultCustomToast";
import { BiSolidEditAlt } from "react-icons/bi";
import Loader from "../../../Components/Loader";
import { IoCaretDownOutline } from "react-icons/io5";

const StudentInfo = ({ role }) => {
    const {student, learningMembers, completedAssessments, Grades } = usePage().props;
    const [isEditDisabled, setIsEditDisabled] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [currentDownload, setCurrentDownload] = useState("PDF");

    // ================== ARCHIVE STUDENT HANDLER ==================
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [isArchiveLoading, setIsArchiveLoading] = useState(false);

    const handleArchive = () => {
        setIsArchiveLoading(true);

        router.delete(route("students.archive", student.student_id), {
            showProgress: false,
            onSuccess: (page) => {
                setIsArchiveLoading(false);
                setOpenAlertModal(false);
                displayToast(
                    <DefaultCustomToast
                        message={
                            page.props.flash.success ||
                            "Student archived successfully!"
                        }
                    />,
                    "success"
                );
            },
            onError: (errors) => {
                setIsArchiveLoading(false);
                displayToast(
                    <DefaultCustomToast message="Failed to archive student." />,
                    "error"
                );
            },
        });
    };

    // ================== PROFILE IMAGE HANDLER ==================
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [updateProfileError, setUpdateProfileError] = useState(null);

    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProfileLoading(true);

        router.post(
            route("student.profile.update", student.student_id),
            { _method: "put", profile_image: file },
            {
                showProgress: false,
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={
                                page.props.flash.success ||
                                "Profile photo updated successfully!"
                            }
                        />,
                        "success"
                    );
                },
                onError: (error) => {
                    setUpdateProfileError(error);
                    displayToast(
                        <DefaultCustomToast message="Failed to update profile photo. Please use a smaller image." />,
                        "error"
                    );
                },
                onFinish: () => {
                    setIsProfileLoading(false);
                },
            }
        );
    };

    const handleQuickExport = (format) => {
        setCurrentDownload(format);
        window.location.href = route("admission.export.student", {
            student: student.student_id,
            format: format.toLowerCase(),
        });
    };

    const handleExport = () => {
    window.location.href = route("admission.export.student", {
        student: student.student_id,
        format: currentDownload.toLowerCase(),
    });
};

    return (
        <>
            {/*===========================Alert Modal for Archiving Student===========================*/}
            {openAlertModal && (
                <AlertModal
                    title={"Archive Confirmation"}
                    description={
                        "Are you sure you want to archive this student?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={handleArchive}
                    isLoading={isArchiveLoading}
                />
            )}

            <div className="flex items-center justify-between">
                <BackButton doSomething={() => window.history.back()} />
                
                {role === "admin" && (
                <PrimaryButton
                    text="Archive"
                    btnColor="bg-ascend-red"
                    doSomething={() => setOpenAlertModal(true)}
                />)}

            </div>

            <div className="flex items-center mt-5">
                {/* Profile Image */}
                <div className="relative w-18 h-18 bg-ascend-gray1 rounded-full shrink-0 group">
                    {isProfileLoading && (
                        <>
                            <div className="absolute inset-0 bg-ascend-lightblue opacity-40 rounded-full"></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Loader color="bg-ascend-blue" size="sm" />
                            </div>
                        </>
                    )}

                    {student.user.profile_image ? (
                        <img
                            src={`/storage/${student.user.profile_image}`}
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
                                {student.user.first_name[0]}
                            </span>
                        </div>
                    )}

                    {role === "admin" && (
                        <> 
                            <label
                                htmlFor="inputProfile"
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 text-ascend-white opacity-0 hover:opacity-50 cursor-pointer rounded-full transition-opacity duration-200"
                            >
                                <BiSolidEditAlt className="text-size4" />
                            </label>

                            <input
                                id="inputProfile"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProfileChange}
                            />
                        </>
                    )}
                    </div>

                {/* Student Header */}
                <div className="flex flex-col ml-2">
                    <div className="flex items-center">
                        <div className="font-nunito-sans text-size4 ml-5 font-bold">
                            {student.user.first_name} {student.user.last_name}
                        </div>
                        <div
                            className={`font-nunito-sans text-size2 ml-2 text-ascend-white ${
                                student.enrollment_status === "enrolled"
                                    ? "bg-ascend-blue"
                                    : student.enrollment_status === "dropped"
                                    ? "bg-ascend-red"
                                    : "bg-ascend-yellow"
                            } px-3`}
                        >
                            {student.enrollment_status.charAt(0).toUpperCase() +
                                student.enrollment_status.slice(1)}
                        </div>
                    </div>
                    <div className="font-nunito-sans text-size2 ml-5">
                        Student
                    </div>
                </div>
            </div>

            {/* Approval Info */}
            <div className="mt-5 flex gap-5 font-nunito-sans text-size2">
                <h1 className="font-bold">
                    Approved At:{" "}
                    <span className="font-normal">
                        {student.approved_at
                            ? new Date(student.approved_at).toLocaleDateString(
                                  "en-US",
                                  {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  }
                              )
                            : ""}
                    </span>
                </h1>
                <h1 className="font-bold">
                    Approved by:{" "}
                    <span className="font-normal">
                        {student.approver
                            ? `${student.approver.first_name} ${student.approver.last_name}`
                            : ""}
                    </span>
                </h1>
            </div>
            {/* Data Form Fields */}
            <div className="mt-5">
                <DataFormFields
                    student={student}
                    setIsEditDisabled={setIsEditDisabled}
                    isEditDisabled={isEditDisabled}
                    role={role}
                />
            </div>

             {/*=========================== Tables Section (Downloadable) ===========================*/}         

            {/* Download Button */}    
            <div className="flex space-x-[2px] justify-end mt-10">
                {/* Main Download Button showing current selection */}
                <PrimaryButton
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    doSomething={handleExport}
                    text={`Download ${currentDownload}`}
                />

                {/* Dropdown button for changing format */}
                <div className="dropdown dropdown-end cursor-pointer">
                    <button
                        tabIndex={0}
                        role="button"
                        className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                    >
                        <div className="text-size1">
                            <IoCaretDownOutline />
                        </div>
                    </button>

                    <ul
                        tabIndex={0}
                        className="text-size2 dropdown-content menu space-y-2 font-medium bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                    >
                        <li onClick={() => handleQuickExport("PDF")}>
                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                Download as PDF
                            </a>
                        </li>
                        <li onClick={() => handleQuickExport("CSV")}>
                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                Download as CSV
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Courses Table */}
            <div>
                <CoursesTable learningMembers={learningMembers} />
            </div>
            {/* Assessment Table */}
            <div className="mt-10">
                <AssesstmentTable
                    completedAssessments={completedAssessments ?? []}
                />
            </div>
            {/* Grades Table */}
            <div className="mt-10">
                <GradesTable
                    Grades={Grades ?? []}
                />
            </div>
            {role === "admin" && (
            <div className="mt-10">
                <AdmissionFiles student={student} />
            </div>
            )}
        </>
    );
};

export default StudentInfo;
