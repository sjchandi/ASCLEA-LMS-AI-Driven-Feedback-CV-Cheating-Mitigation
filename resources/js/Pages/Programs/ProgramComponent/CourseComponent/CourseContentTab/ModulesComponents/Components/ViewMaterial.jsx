import { useState } from "react";
import BackButton from "../../../../../../../Components/Button/BackButton";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";
import "../../../../../../../../css/quillTextEditor.css";
import DOMPurify from "dompurify";
import "../../../../../../../../css/global.css";
import File from "../../File";
import { handleClickBackBtn } from "../../../../../../../Utils/handleClickBackBtn";
import { formatFullDate } from "../../../../../../../Utils/formatFullDate";
import { route } from "ziggy-js";
import ModalDocViewer from "../../../../../../../Components/ModalDocViewer";
import PrimaryButton from "../../../../../../../Components/Button/PrimaryButton";
import RoleGuard from "../../../../../../../Components/Auth/RoleGuard";
import useSection from "../Hooks/useSection";

export default function ViewMaterial({
    programId,
    courseId,
    material,
    studentProgress,
}) {
    const [fileUrl, setFileUrl] = useState(null);
    const [fileDownload, setFileDownload] = useState(null);
    const [fileName, setFileName] = useState(null);
    console.log(material);
    console.log(studentProgress);

    // Custom hook
    const { isLoading, handleDoneUndoneSectionItem } = useSection({
        programId,
        courseId,
    });

    const handleFileClick = (fileId, fileName) => {
        const url = route("material.file.stream", {
            program: programId,
            course: courseId,
            material: material.material_id,
            file: fileId,
        });

        const fileDownload = route("material.file.download", {
            program: programId,
            course: courseId,
            material: material.material_id,
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
        <div className="text-ascend-black space-y-5 font-nunito-sans">
            <div className="flex flex-wrap items-center justify-between">
                <BackButton doSomething={handleClickBackBtn} />
                {material.section_item && (
                    <RoleGuard allowedRoles={["student"]}>
                        <PrimaryButton
                            isDisabled={isLoading}
                            isLoading={isLoading}
                            doSomething={() =>
                                handleDoneUndoneSectionItem(
                                    material.section_item.section_id,
                                    material.section_item.section_item_id
                                )
                            }
                            text={
                                !material.section_item.student_progress ||
                                !material.section_item.student_progress.is_done
                                    ? "Mark as Done"
                                    : "Undone"
                            }
                        />
                    </RoleGuard>
                )}
            </div>
            <div className="space-y-5 pb-5 border-b border-ascend-gray1">
                <div className="flex items-start gap-2 md:gap-20">
                    <div className="w-full">
                        <h1 className="flex-1 min-w-0 text-size6 break-words font-semibold">
                            {material.material_title}
                        </h1>
                        <span className="text-size1">
                            {material.author.first_name}{" "}
                            {material.author.last_name} | Created at{" "}
                            {formatFullDate(material.created_at)}
                        </span>
                    </div>
                </div>

                {material.material_description && (
                    <ReactQuill
                        value={material.material_description}
                        readOnly={true}
                        theme={"bubble"}
                    />
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {material.material_files.length > 0 &&
                    material.material_files.map((file) => (
                        <File
                            key={file.material_file_id}
                            fileName={file.file_name}
                            onClick={() =>
                                handleFileClick(
                                    file.material_file_id,
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
        </div>
    );
}
