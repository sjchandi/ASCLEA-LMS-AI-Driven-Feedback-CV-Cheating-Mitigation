import React from "react";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import EnrolledTable from "./EnrolledTable";

const EnrolledPage = ({ enrolledStudents, role }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-nunito-sans text-size6 font-bold">Student List</div>
        {/*<PrimaryButton text="Download" />*/}
      </div>

      <EnrolledTable enrolledStudents={enrolledStudents} role={role} />
    </>
  );
};

export default EnrolledPage;
