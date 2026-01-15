import { useEffect, useState } from "react";
import BackButton from "../../../../../../Components/Button/BackButton";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";
import "../../../../../../../css/quillTextEditor.css";
import DOMPurify from "dompurify";
import "../../../../../../../css/global.css";
import File from "../File";
import Quiz from "./Quiz";
import { handleClickBackBtn } from "../../../../../../Utils/handleClickBackBtn";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { formatFullDate } from "../../../../../../Utils/formatFullDate";
import { formatDueDateTime } from "../../../../../../Utils/formatDueDateTime";
import RoleGuard from "../../../../../../Components/Auth/RoleGuard";
import { hasText } from "../../../../../../Utils/hasText";
import { closeDropDown } from "../../../../../../Utils/closeDropdown";
import AcitivityMyWork from "./Features/Response/Components/AcitivityMyWork";
import ModalDocViewer from "../../../../../../Components/ModalDocViewer";
import { cleanDecimal } from "../../../../../../Utils/cleanDecimal";
import DefaultCustomToast from "../../../../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../../../../Utils/displayToast";
import AlertModal from "../../../../../../Components/AlertModal";

export default function ViewAssessment({
    programId,
    courseId,
    assessment,
    assessmentSubmission,
    auth,
}) {
    const [fileUrl, setFileUrl] = useState(null);
    const [fileDownload, setFileDownload] = useState(null);
    const [fileName, setFileName] = useState(null);

    // States for assessment reset
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [isResetLoading, setIsResetLoading] = useState(false);

    const handleClickViewResponses = () => {
        router.visit(
            route("assessment.responses.view", {
                program: programId,
                course: courseId,
                assessment: assessment.assessment_id,
            })
        );
        closeDropDown();
    };

    const handleClickResetAssessment = () => {
        setIsResetLoading(true);
        router.delete(
            route("assessment.reset", {
                program: programId,
                course: courseId,
                assessment: assessment.assessment_id,
            }),
            {
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.success}
                        />,
                        "success"
                    );
                },
                onFinish: () => {
                    setIsResetLoading(false);
                    setOpenAlertModal(false);
                },
                showProgress: false,
            }
        );
        closeDropDown();
    };

    const handleFileClick = (fileId, fileName) => {
        const url = route("program.course.file.stream", {
            program: programId,
            course: courseId,
            assessment: assessment.assessment_id,
            file: fileId,
        });

        const fileDownload = route("program.course.file.download", {
            program: programId,
            course: courseId,
            assessment: assessment.assessment_id,
            file: fileId,
        });

        setFileUrl(url);
        setFileDownload(fileDownload);
        setFileName(fileName);
    };

    const handleViewFileClose = () => {
        setFileUrl(null);
        setFileName(null);
        setFileDownload(null);
    };

    return (
        <>
            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Reset Confirmation"}
                    description={
                        "This action will permanently reset all assessment responses associated with this item. Once reset, the data cannot be recovered. We strongly recommend downloading or exporting the assessment data before proceeding. Are you sure you want to continue?"
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={handleClickResetAssessment}
                    isLoading={isResetLoading}
                />
            )}

            <div className="text-ascend-black space-y-5 font-nunito-sans">
                <div className="flex">
                    <BackButton doSomething={handleClickBackBtn} />
                </div>
                <div className="space-y-5 pb-5 border-b border-ascend-gray1">
                    <div className="flex items-start gap-2 md:gap-20">
                        <div className="w-full min-w-0">
                            <h1 className="text-size6 break-words font-semibold">
                                {assessment.assessment_title}
                            </h1>
                            <span className="text-size1">
                                {`${assessment.author.first_name} ${assessment.author.last_name}`}
                                {assessment.due_datetime &&
                                    ` | ${formatFullDate(
                                        assessment.due_datetime
                                    )}`}
                            </span>
                        </div>

                        {(auth.user.role_name === "admin" ||
                            auth.user.user_id === assessment.created_by) && (
                            <RoleGuard allowedRoles={["admin", "faculty"]}>
                                <div className="dropdown dropdown-end cursor-pointer ">
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="rounded-4xl p-3 hover:bg-ascend-lightblue transition-all duration-300"
                                    >
                                        <BsThreeDotsVertical className="text-size5 text-ascend-black" />
                                    </div>

                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content menu bg-ascend-white w-42 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                                    >
                                        <li onClick={handleClickViewResponses}>
                                            <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                View responses
                                            </a>
                                        </li>
                                        {(auth.user.user_id ===
                                            assessment.created_by ||
                                            auth.user.role_name ===
                                                "admin") && (
                                            <li
                                                onClick={() => {
                                                    setOpenAlertModal(true);
                                                    closeDropDown();
                                                }}
                                            >
                                                <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                    Reset assessment
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </RoleGuard>
                        )}
                    </div>

                    {hasText(assessment.assessment_description) && (
                        <ReactQuill
                            value={DOMPurify.sanitize(
                                assessment.assessment_description
                            )}
                            readOnly={true}
                            theme={"bubble"}
                        />
                    )}
                </div>
                <div className="flex flex-wrap justify-between">
                    {assessmentSubmission &&
                    assessmentSubmission.submission_status === "returned" ? (
                        <h1 className="font-bold">
                            Graded: {cleanDecimal(assessmentSubmission.score)} /{" "}
                            {assessment.total_points}
                        </h1>
                    ) : (
                        <h1 className="font-bold">
                            Possible Points: {assessment.total_points}
                        </h1>
                    )}

                    <h1 className="font-bold">
                        {assessment.due_datetime
                            ? `Due on
                    ${formatDueDateTime(assessment.due_datetime)}`
                            : "No due date"}
                    </h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {assessment.quiz && (
                        <Quiz
                            asssessment={assessment}
                            quizDetails={assessment.quiz}
                        />
                    )}
                    {assessment.files.length > 0 &&
                        assessment.files.map((file) => (
                            <File
                                key={file.assessment_file_id}
                                fileName={file.file_name}
                                onClick={() =>
                                    handleFileClick(
                                        file.assessment_file_id,
                                        file.file_name
                                    )
                                }
                            />
                        ))}
                </div>

                {fileUrl && (
                    <ModalDocViewer
                        fileName={fileName}
                        fileUrl={fileUrl}
                        onClose={handleViewFileClose}
                        fileDownload={fileDownload}
                    />
                )}

                {/* The section for student to upload their works for the activity */}
                {assessment.assessment_type.assessment_type === "activity" &&
                    auth.user.role_name === "student" && <AcitivityMyWork />}
            </div>
        </>
    );
}
