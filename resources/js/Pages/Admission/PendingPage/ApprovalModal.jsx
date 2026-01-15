import React, { useState } from "react";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import SecondaryButton from "../../../Components/Button/SecondaryButton";
import { router, usePage } from "@inertiajs/react";
import { displayToast } from '../../../Utils/displayToast';
import DefaultCustomToast from '../../../Components/CustomToast/DefaultCustomToast';

export default function ApprovalModal({ toggleModal }) {
    console.log("Render Approval Modal Form");

  const { student } = usePage().props;
  const [message, setMessage] = useState("");

  const handleApprove = (e) => {
    e.preventDefault();
    router.put(
      route("admission.updateStatus", student.student_id),
      {
        admission_status: "Accepted",
        admission_message: message,
      },
      {
        onSuccess: (page) => {
          toggleModal();
          displayToast(
            <DefaultCustomToast 
              message={page.props.flash.success || "Student approved successfully!"} 
            />,
            "success"
          );
        },
        onError: () => {
          displayToast(
            <DefaultCustomToast message="Failed to approve student." />,
            "error"
          );
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/25 z-100 flex items-center justify-center">
      <form
        onSubmit={handleApprove}
        className="bg-ascend-white opacity-100 p-5 w-130 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto my-10 shadow-2xl"
      >
        <h1 className="text-size4 font-bold text-center">Confirm Approval</h1>
        <h2 className="text-size3 text-center">
          Are you sure you want to approve this request?
        </h2>
        <div>
        </div>
        <div className="flex justify-center space-x-2">
          <SecondaryButton doSomething={toggleModal} text={"Close"} />
          <PrimaryButton btnType={"submit"} text={"Approve"} />
        </div>
      </form>
    </div>
  );
}
