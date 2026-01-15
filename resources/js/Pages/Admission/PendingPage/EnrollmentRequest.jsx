import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import BackButton from "../../../Components/Button/BackButton";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import ApprovalModal from "./ApprovalModal";
import RejectionModal from "./RejectionModal";
import { FaFileImage, FaFilePdf } from "react-icons/fa";
import ModalDocViewer from "../../../Components/ModalDocViewer";
import CustomSelect from "../../../Components/CustomInputField/CustomSelect";

const EnrollmentRequest = () => {
  const { student } = usePage().props; // directly from Inertia
  const [isModalOpenApprove, setIsModalOpenApprove] = useState(false);
  const [isModalOpenReject, setIsModalOpenReject] = useState(false);

  const toggleModalApprove = () => setIsModalOpenApprove(!isModalOpenApprove);
  const toggleModalReject = () => setIsModalOpenReject(!isModalOpenReject);

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ url: "", name: "" });
  const [fileUrl, setFileUrl] = useState(null);
  const [fileDownload, setFileDownload] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [filefilter, setFilefilter] = useState("Active");

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

  const handleViewFileClose = () => { 
    setFileUrl(null); 
    setFileName(null); 
    setFileDownload(null); 
  };


  return (
    <div className="space-y-5">
      {/* Header with Back + Approve/Reject */}
      <div className="flex justify-between items-center">
        <BackButton doSomething={() => window.history.back()} />
        <div className="flex space-x-3">
          
          {student.admission_status === "Rejected" || student.admission_status === "Not Submitted"  ? (
            <PrimaryButton
              text="Reject"
              btnColor="bg-ascend-gray1"
              textColor="text-white"
              isDisabled={true}
              doSomething={toggleModalReject}
            />
          ) : (
            <PrimaryButton
              text="Reject"
              btnColor="bg-ascend-red"
              textColor="text-white"
              isDisabled={false}
              doSomething={toggleModalReject}
            />
          )}

          <PrimaryButton
            text="Approve"
            btnColor="bg-ascend-blue"
            textColor="text-white"
            doSomething={toggleModalApprove}
          />
        </div>
      </div>

      {/* Student Info */}
      <div className="pl-4">
        <div className="font-nunito-sans text-size6 font-bold mt-5">
          Program Enrollment Request
        </div>

        <div className="mt-5 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="font-nunito-sans text-size3 font-bold">Full Name</div>
            <div className="font-nunito-sans text-size3 mt-3">
              {student.user.first_name}{" "}
              {student.user.middle_name ? student.user.middle_name + " " : ""}
              {student.user.last_name}
            </div>
          </div>
          <div>
            <div className="font-nunito-sans text-size3 font-bold">Date of Application</div>
            <div className="font-nunito-sans text-size3 mt-3">
              {new Date(student.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="font-nunito-sans text-size3 font-bold mt-5">Address</div>
            <div className="font-nunito-sans text-size3 mt-3">
              {student.user.house_no || "N/A"}, {student.user.barangay || "N/A"}, {student.user.city || "N/A"}, {student.user.province || "N/A"}, <br />{student.user.region || "N/A"}
            </div>
          </div>
          <div>
            <div className="font-nunito-sans text-size3 font-bold mt-5">Current Status</div>
            <div className="font-nunito-sans text-size3 mt-3">
               <div className={`font-nunito-sans text-size3 mt-3 ${
                  student.admission_status === "Accepted" ? "text-ascend-green" :
                  student.admission_status === "Not Submitted" ? "text-ascend-blue" :
                  student.admission_status === "Pending" ? "text-ascend-yellow" :
                  student.admission_status === "Rejected" ? "text-ascend-red" : ""
                }`}>
                  {student.admission_status}
                </div>
            </div>
          </div>


        </div>

        {/* Admission Files */}
        <div className="mt-6">
          <div className="mt-6 flex items-center justify-between">
            <div className="font-nunito-sans text-size6 font-bold">Attached Files</div>

            {/* File Filter */}
            <div>
              <CustomSelect
                selectField={
                  <select
                    className="w-35 border appearance-none border-ascend-black p-2 h-9 text-size1 focus:outline-ascend-blue"
                    value={filefilter}
                    onChange={(e) => setFilefilter(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                }
              />
            </div>
          </div>

          {/* Filtered Files */}
          {student.admission_files && student.admission_files.length > 0 ? (
            <div className="mt-4">
              {student.admission_files
                .filter((file) =>
                  filefilter === "Active" ? file.deleted_at === null : file.deleted_at !== null
                )
                .map((file) => {
                  const isImage = file.file_type.startsWith("image/");
                  const isPdf = file.file_type === "application/pdf";
                  const isRejected = file.deleted_at !== null; // check if deleted

                  return (
                    <div
                      key={file.admission_file_id}
                      onClick={() => handleFileClick(file)}
                      className="flex items-center justify-between border border-ascend-gray1 p-3 mb-2 mt-2 cursor-pointer hover:bg-ascend-lightblue transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {isImage && (
                          <FaFileImage
                            className={`text-2xl flex-shrink-0 ${isRejected ? "text-ascend-red" : "text-ascend-blue"}`}
                          />
                        )}
                        {isPdf && (
                          <FaFilePdf
                            className={`text-2xl flex-shrink-0 ${isRejected ? "text-ascend-red" : "text-ascend-blue"}`}
                          />
                        )}
                        {file.file_name}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="mt-3 text-ascend-gray1">No files uploaded.</p>
          )}
        </div>

      </div>

      {/* Modals */}
      {isModalOpenApprove && <ApprovalModal toggleModal={toggleModalApprove} />}
      {isModalOpenReject && <RejectionModal toggleModal={toggleModalReject} />}
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

export default EnrollmentRequest;
