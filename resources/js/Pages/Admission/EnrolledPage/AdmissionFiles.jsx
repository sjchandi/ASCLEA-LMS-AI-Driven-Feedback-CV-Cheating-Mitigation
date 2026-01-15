import React, { useState } from "react";
import { FaFileImage, FaFilePdf } from "react-icons/fa";
import ModalDocViewer from "../../../Components/ModalDocViewer";
import CustomSelect from "../../../Components/CustomInputField/CustomSelect";

const AdmissionFiles = ({ student }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileDownload, setFileDownload] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileFilter, setFileFilter] = useState("Active");

  const handleFileClick = (file) => {
    const url = route("admission.file.stream", {
      student: student.student_id,
      file: file.admission_file_id,
    });

    const downloadUrl = route("admission.file.download", {
      student: student.student_id,
      file: file.admission_file_id,
    });

    setFileUrl(url);
    setFileDownload(downloadUrl);
    setFileName(file.file_name);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div className="font-nunito-sans text-size6 font-bold">
          Attached Files
        </div>

        <CustomSelect
          selectField={
            <select
              className="w-35 border appearance-none border-ascend-black focus:outline-ascend-blue p-2 h-9 text-size1"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
            </select>
          }
        />
      </div>

      {student.admission_files && student.admission_files.length > 0 ? (
        <div className="mt-4">
          {student.admission_files
            .filter((file) =>
              fileFilter === "Active"
                ? file.deleted_at === null
                : file.deleted_at !== null
            )
            .map((file) => {
              const isImage = file.file_type.startsWith("image/");
              const isPdf = file.file_type === "application/pdf";
              const isRejected = file.deleted_at !== null;

              return (
                <div
                  key={file.admission_file_id}
                  onClick={() => handleFileClick(file)}
                  className="flex items-center justify-between border border-ascend-gray1 p-3 mb-2 mt-2 cursor-pointer hover:bg-ascend-lightblue transition-all"
                >
                  <div className="flex items-center gap-3">
                    {isImage && (
                      <FaFileImage
                        className={`text-2xl ${
                          isRejected
                            ? "text-ascend-red"
                            : "text-ascend-blue"
                        }`}
                      />
                    )}
                    {isPdf && (
                      <FaFilePdf
                        className={`text-2xl ${
                          isRejected
                            ? "text-ascend-red"
                            : "text-ascend-blue"
                        }`}
                      />
                    )}
                    {file.file_name}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="mt-3 text-ascend-gray1">No Admission files.</p>
      )}

      {fileUrl && (
        <ModalDocViewer
          onClose={() => {
            setFileUrl(null);
            setFileDownload(null);
            setFileName(null);
          }}
          fileUrl={fileUrl}
          fileName={fileName}
          fileDownload={fileDownload}
        />
      )}
    </div>
  );
};

export default AdmissionFiles;
