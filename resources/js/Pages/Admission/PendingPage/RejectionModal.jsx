import React, { useState } from "react";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import SecondaryButton from "../../../Components/Button/SecondaryButton";
import { router, usePage } from "@inertiajs/react";
import { displayToast } from '../../../Utils/displayToast';
import DefaultCustomToast from '../../../Components/CustomToast/DefaultCustomToast';

export default function RejectionModal({ toggleModal }) {
  console.log("Render Reject Modal Form");

  const { student } = usePage().props;
  const [message, setMessage] = useState("");

  const handleReject = (e) => {
    e.preventDefault();

    if (message.trim() === "") {
      displayToast(
        <DefaultCustomToast message="Rejection message cannot be empty." />,
        "error"
      );
      return;
    }

    router.put(
      route("admission.updateStatus", student.student_id),
      {
        admission_status: "Rejected",
        admission_message: message,
      },
      {
        onSuccess: (page) => {
          toggleModal();
          displayToast(
            <DefaultCustomToast
              message={page.props.flash.success || "Student Enrollment Request has been rejected."}
            />,
            "error"
          );
        },
        onError: () => {
          displayToast(
            <DefaultCustomToast message="Failed to reject student." />,
            "error"
          );
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/25 z-100 flex items-center justify-center">
      <form
        onSubmit={handleReject}
        className="bg-ascend-white opacity-100 p-5 w-130 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto my-10 shadow-2xl"
      >
        <h1 className="text-size4 font-bold text-center">Confirm Rejection</h1>
        <h2 className="text-size3 text-center">
          Are you sure you want to reject this request?
        </h2>
        <div>
          <label htmlFor="rejection-message">Add Message</label>
          <textarea
            id="rejection-message"
            className="border w-full p-2 mt-2 focus:outline-ascend-blue"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <SecondaryButton doSomething={toggleModal} text={"Close"} />
          <PrimaryButton btnType={"submit"} btnColor={"bg-ascend-red"} text={"Reject"} />
        </div>
      </form>
    </div>
  );
}
