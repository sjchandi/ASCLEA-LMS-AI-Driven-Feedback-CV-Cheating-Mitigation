import { useState } from "react";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import { formatFullDate } from "../../../Utils/formatFullDate";
import ProfileImage from "../../../Components/ProfileImage";

export default function ArchivedStudentRow({
    student,
    setStudentId,
    setOpenAlertModal,
}) {
    const handleActionClick = () => {
        setOpenAlertModal(true);
        setStudentId(student.student_id);
    };
    return (
        <tr className="hover:bg-ascend-lightblue">
            <td>
                <div className="flex items-center gap-3">
                    <ProfileImage userData={student.user} />

                    <div className="font-bold">
                        {`${student.user.first_name} ${student.user.last_name}`}
                    </div>
                </div>
            </td>
            <td>
                {student.archived_by
                    ? `${student.archived_by.first_name} ${student.archived_by.last_name}`
                    : "N/A"}
            </td>
            <td>{formatFullDate(student.deleted_at)}</td>
            <td className="flex gap-2">
                <PrimaryButton
                    text={"Restore"}
                    btnColor={"bg-ascend-yellow"}
                    doSomething={handleActionClick}
                />
            </td>
        </tr>
    );
}
