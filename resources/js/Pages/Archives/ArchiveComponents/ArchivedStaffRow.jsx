import { useState } from "react";
import { formatFullDate } from "../../../Utils/formatFullDate";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import ProfileImage from "../../../Components/ProfileImage";

export default function ArchivedStaffRow({
    staff,
    setOpenAlertModal,
    setStaffId,
}) {
    const hanleActionClick = () => {
        setOpenAlertModal(true);
        setStaffId(staff.staff_id);
    };

    return (
        <tr className="hover:bg-ascend-lightblue">
            <td>
                <div className="flex items-center gap-3">
                    <ProfileImage userData={staff.user} />
                    <div className="font-bold">
                        {`${staff.user.first_name} ${staff.user.last_name}`}
                    </div>
                </div>
            </td>
            <td>
                {staff.archived_by
                    ? `${staff.archived_by.first_name} ${staff.archived_by.last_name}`
                    : "N/A"}
            </td>
            <td>{formatFullDate(staff.deleted_at)}</td>
            <td className="flex gap-2">
                <PrimaryButton
                    text={"Restore"}
                    btnColor={"bg-ascend-yellow"}
                    doSomething={hanleActionClick}
                />
            </td>
        </tr>
    );
}
