import { useState, useEffect } from "react";
import TextEditor from "../../TextEditor";
import PrimaryButton from "../../../../../../Components/Button/PrimaryButton";
import SecondaryButton from "../../../../../../Components/Button/SecondaryButton";
import "../../../../../../../css/global.css";
import DropFiles from "../../../../../../Components/DragNDropFiles/DropFiles";
import FileCard from "../../FileCard";
import { SiGoogleforms } from "react-icons/si";
import { IoCaretDownOutline } from "react-icons/io5";
import { closeDropDown } from "../../../../../../Utils/closeDropdown";
import { displayToast } from "../../../../../../Utils/displayToast";
import DefaultCustomToast from "../../../../../../Components/CustomToast/DefaultCustomToast";
import { capitalize } from "lodash";
import useAssessment from "./Hooks/useAssessment";
import { usePage } from "@inertiajs/react";

export default function AssessmentForm({
    formTitle,
    formWidth,
    sectionId = null,
    isEdit = false,
    assessmentId,
    setIsAssessmentFormOpen,
    assessmentDetailsToEdit,
}) {
    const { program, course } = usePage().props;

    // Custom hook
    const { errors, isLoading, handleSubmit } = useAssessment({
        programId: program.program_id,
        courseId: course.course_id,
    });

    // Local state
    const [assessmentDetails, setAssessmentDetails] = useState(
        assessmentDetailsToEdit && isEdit
            ? {
                  assessment_title: assessmentDetailsToEdit.assessment_title,
                  assessment_description:
                      assessmentDetailsToEdit.assessment_description,
                  status: assessmentDetailsToEdit.status,
                  assessment_type:
                      assessmentDetailsToEdit.assessment_type.assessment_type,
                  due_datetime: assessmentDetailsToEdit.due_datetime,
                  total_points: assessmentDetailsToEdit.total_points,
                  assessment_files: [],
                  uploaded_files: assessmentDetailsToEdit.files,
                  removed_files: [],
              }
            : {
                  assessment_title: "",
                  assessment_description: null,
                  status: "published",
                  assessment_type: "",
                  due_datetime: "",
                  total_points: 0,
                  assessment_files: [],
                  removed_files: [],
              }
    );

    // Handle changes to assessment details
    const handleAssessmentChange = (field, value) => {
        setAssessmentDetails((prev) => {
            if (field === "assessment_files" && Array.isArray(value)) {
                return {
                    ...prev,
                    [field]: [...prev[field], ...value], // append new files
                };
            } else {
                return {
                    ...prev,
                    [field]: value, // update other fields
                };
            }
        });
    };

    // Remove an attached file by index
    const removeAttachedFile = (fileIndex) => {
        setAssessmentDetails((prev) => ({
            ...prev,
            assessment_files: prev.assessment_files.filter(
                (_, index) => index !== fileIndex
            ),
        }));
    };

    // Remove an uploaded file by ID and track removed files
    const removeUploadedFile = (fileId) => {
        setAssessmentDetails((prev) => ({
            ...prev,
            uploaded_files: prev.uploaded_files.filter(
                (file) => file.assessment_file_id !== fileId
            ),
            removed_files: [...prev.removed_files, fileId],
        }));
    };

    useEffect(() => {
        if (sectionId) {
            // Add the  sectionId to the assessment details
            handleAssessmentChange("section_id", sectionId);
        }
    }, []);

    const cancelAssessmentForm = () => {
        setIsAssessmentFormOpen(false);
        // clearAssessmentDetails();
    };

    // Used for dropdown button to set the status of the assessment
    const statusChange = (fieldName, status) => {
        console.log("STATUS CHANGE");
        closeDropDown();
        handleAssessmentChange(fieldName, status);
    };

    const handleChooseAssessmentType = (assessmentType) => {
        // Check if type is quiz
        // Set the button to save as draft and status to draft
        // since user can only save quiz as draft to allow them to edit quiz form before publish
        if (assessmentType === "quiz" && !sectionId) {
            handleAssessmentChange("status", "draft");
        }

        handleAssessmentChange("assessment_type", assessmentType);
    };

    // Hanndles displaying of toast to inform user
    // that assessment has to be save as draft first to enable quiz form editing
    const handleClickQuizInform = () => {
        const message = "Please save as draft first to edit the quiz.";
        displayToast(<DefaultCustomToast message={message} />, "info");
    };

    return (
        <form
            className={`border ${formWidth} border-ascend-gray1 ${
                isEdit ? "" : "shadow-shadow1"
            } p-5 space-y-5 bg-ascend-white`}
        >
            <h1 className="text-size4 font-bold">
                {!assessmentDetails.assessment_type
                    ? "Choose Assessment Type"
                    : formTitle ||
                      `Add ${capitalize(assessmentDetails.assessment_type)}`}
            </h1>

            {/* Options for choosing the assessment type */}
            {!assessmentDetails.assessment_type && (
                <div className="flex flex-wrap justify-center gap-5">
                    <div className="grid w-60 lg:w-80">
                        <PrimaryButton
                            doSomething={() =>
                                handleChooseAssessmentType("activity")
                            }
                            fontWeight="font-bold"
                            text={"Activity"}
                        />
                    </div>
                    <div className="grid w-60 lg:w-80">
                        <PrimaryButton
                            doSomething={() =>
                                handleChooseAssessmentType("quiz")
                            }
                            fontWeight="font-bold"
                            text={"Quiz"}
                        />
                    </div>
                </div>
            )}

            {/* Assessment Fields Start*/}
            {assessmentDetails.assessment_type && (
                <div className="space-y-5">
                    <div
                        className={`grid grid-cols-1 sm:grid-cols-2 ${
                            assessmentDetails.assessment_type === "activity"
                                ? "lg:grid-cols-3"
                                : "lg:grid-cols-2"
                        } gap-5`}
                    >
                        <div>
                            <label className="font-bold">
                                Title<span className="text-ascend-red">*</span>
                            </label>
                            <input
                                type="text"
                                value={assessmentDetails.assessment_title}
                                onChange={(e) =>
                                    handleAssessmentChange(
                                        "assessment_title",
                                        e.target.value
                                    )
                                }
                                className={`px-3 py-2 w-full border border-ascend-gray1 focus:outline-ascend-blue ${
                                    errors && errors.assessment_title
                                        ? "border-2 border-ascend-red"
                                        : ""
                                }`}
                            />
                            {errors && errors.assessment_title && (
                                <span className="text-ascend-red">
                                    {errors.assessment_title}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="font-bold">
                                Due Date and Time
                            </label>
                            <input
                                value={assessmentDetails.due_datetime || ""}
                                onChange={(e) =>
                                    handleAssessmentChange(
                                        "due_datetime",
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => e.preventDefault()}
                                type="datetime-local"
                                className={`px-3 py-2 w-full border border-ascend-gray1 focus:outline-ascend-blue ${
                                    errors && errors.due_datetime
                                        ? "border-2 border-ascend-red"
                                        : ""
                                }`}
                            />
                            {errors && errors.due_datetime && (
                                <span className="text-ascend-red">
                                    {errors.due_datetime}
                                </span>
                            )}
                        </div>

                        {assessmentDetails.assessment_type === "activity" && (
                            <div>
                                <label className="font-bold">
                                    Total Points
                                </label>
                                <input
                                    value={assessmentDetails.total_points}
                                    onChange={(e) =>
                                        handleAssessmentChange(
                                            "total_points",
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        console.log(e.length);
                                        if (
                                            e.key === "-" ||
                                            e.key === "e" ||
                                            e.key === "+"
                                        ) {
                                            e.preventDefault(); // prevent invalid characters
                                        }
                                    }}
                                    type="number"
                                    min="0"
                                    className={`px-3 py-2 w-full border border-ascend-gray1 focus:outline-ascend-blue ${
                                        errors && errors.total_points
                                            ? "border-2 border-ascend-red"
                                            : ""
                                    }`}
                                />
                                {errors && errors.total_points && (
                                    <span className="text-ascend-red">
                                        {errors.total_points}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="font-bold">Description</label>
                        <TextEditor
                            value={assessmentDetails.assessment_description}
                            fieldName={"assessment_description"}
                            setValue={handleAssessmentChange}
                        />
                    </div>
                </div>
            )}
            {/* Assessment Fields End*/}

            {/* Quiz form palce holder to display */}
            {assessmentDetails.assessment_type === "quiz" && (
                <div className="space-y-5">
                    <div>
                        <label className="font-bold pb-5">Quiz Form</label>
                    </div>
                    <div
                        onClick={handleClickQuizInform}
                        className="flex h-15 items-center space-x-4 p-2 border border-ascend-gray1 bg-ascend-white hover-change-bg-color cursor-pointer"
                    >
                        <div className="w-full flex overflow-hidden font-semibold font-nunito-sans text-ascebd-black">
                            <SiGoogleforms className="text-size5 text-ascend-blue" />
                            <h4 className="ml-2 truncate">Quiz form</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Component for activity type */}
            {/* Display drop files */}
            {assessmentDetails.assessment_type === "activity" && (
                <DropFiles
                    disabled={isLoading}
                    handleFileChange={handleAssessmentChange}
                    fieldName={"assessment_files"}
                    withCancel={false}
                    allowedFiles={{
                        "image/png": [".png"],
                        "image/jpeg": [".jpeg", ".jpg"],
                        "application/pdf": [".pdf"],
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                            [".pptx"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            [".docx"],
                    }}
                />
            )}

            {/* Display the attached files */}
            {(assessmentDetails.assessment_files.length > 0 ||
                (isEdit && assessmentDetails?.uploaded_files.length > 0)) &&
                assessmentDetails.assessment_type === "activity" && (
                    <div>
                        <div className="mb-5">
                            <label className="font-bold">Attached Files</label>
                        </div>

                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ${
                                errors &&
                                Object.entries(errors).some(([key, message]) =>
                                    key.startsWith("assessment_files")
                                )
                                    ? "p-2 border-2 border-ascend-red"
                                    : ""
                            }`}
                        >
                            {isEdit &&
                                assessmentDetails.uploaded_files.map((file) => (
                                    <div key={file.assessment_file_id}>
                                        <FileCard
                                            removeAttachedFile={() =>
                                                removeUploadedFile(
                                                    file.assessment_file_id
                                                )
                                            }
                                            fileId={file.assessment_file_id}
                                            fileName={file.file_name}
                                        />
                                    </div>
                                ))}

                            {assessmentDetails.assessment_files.map(
                                (file, index) => {
                                    return (
                                        <div key={index}>
                                            <FileCard
                                                removeAttachedFile={
                                                    removeAttachedFile
                                                }
                                                fileId={index}
                                                fileName={file.name}
                                            />
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {errors && (
                            <div className="flex flex-col">
                                {Object.entries(errors).map(
                                    ([key, message]) => {
                                        if (
                                            key.startsWith("assessment_files")
                                        ) {
                                            return (
                                                <span className="text-ascend-red">
                                                    {message}
                                                </span>
                                            );
                                        }
                                    }
                                )}
                            </div>
                        )}
                    </div>
                )}

            {/* Form buttons Start*/}
            <div className={`flex justify-end`}>
                <div className="flex flex-wrap justify-end w-full sm:w-fit gap-2">
                    <SecondaryButton
                        isDisabled={isLoading}
                        doSomething={cancelAssessmentForm}
                        text={"Cancel"}
                    />

                    <div className="flex space-x-[0.5px]">
                        {assessmentDetails.assessment_type && (
                            <PrimaryButton
                                isDisabled={isLoading}
                                isLoading={isLoading}
                                doSomething={() =>
                                    handleSubmit(
                                        assessmentDetails,
                                        sectionId,
                                        isEdit,
                                        setIsAssessmentFormOpen,
                                        assessmentId
                                    )
                                }
                                text={
                                    sectionId && isEdit
                                        ? "Save"
                                        : assessmentDetails.status ===
                                          "published"
                                        ? "Publish"
                                        : "Save as draft"
                                }
                            />
                        )}

                        {/* Dropdown button */}
                        {/* Always publish if material is for aa section */}
                        {(isEdit ||
                            assessmentDetails.assessment_type === "activity") &&
                            !sectionId && (
                                <div className="dropdown dropdown-end cursor-pointer ">
                                    <button
                                        tabIndex={0}
                                        role="button"
                                        className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                                    >
                                        <div className="text-size1 ">
                                            {<IoCaretDownOutline />}
                                        </div>
                                    </button>

                                    <ul
                                        tabIndex={0}
                                        className="text-size2 dropdown-content menu space-y-2 font-medium bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                                    >
                                        <li
                                            onClick={() =>
                                                statusChange(
                                                    "status",
                                                    "published"
                                                )
                                            }
                                        >
                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                Publish
                                            </a>
                                        </li>
                                        <li
                                            onClick={() =>
                                                statusChange("status", "draft")
                                            }
                                        >
                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                Save as draft
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                    </div>
                </div>
            </div>
            {/* Form buttons End*/}
        </form>
    );
}
