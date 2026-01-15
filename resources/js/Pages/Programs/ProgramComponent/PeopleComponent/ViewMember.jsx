import { useState } from "react";
import BackButton from "../../../../Components/Button/BackButton";
import PrimaryButton from "../../../../Components/Button/PrimaryButton";
import AssignCourseForm from "./AssignCourseForm";
import { handleClickBackBtn } from "../../../../Utils/handleClickBackBtn";
import RoleGuard from "../../../../Components/Auth/RoleGuard";
import EmptyState from "../../../../Components/EmptyState/EmptyState";
import { usePage } from "@inertiajs/react";
import { capitalize } from "lodash";
import { formatTime } from "../../../../Utils/formatTime";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import DefaultCustomToast from "../../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../../Utils/displayToast";
import AlertModal from "../../../../Components/AlertModal";
import ProfileImage from "../../../../Components/ProfileImage";

export default function ViewMember() {
    const {
        auth,
        member_data: memberData,
        assigned_courses: assignedCourses,
    } = usePage().props;
    console.log(memberData);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // States for alert modal
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [assignedCourseToRemove, setAssignedCourseToRemove] = useState(null);
    const [isRemoveLoading, setIsRemoveLoading] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleRemoveAssignedCourse = (assignedCourseId) => {
        setAssignedCourseToRemove(assignedCourseId);
        setOpenAlertModal(true);
    };

    const removeAssignedCourse = () => {
        if (assignedCourseToRemove) {
            setIsRemoveLoading(true);
            router.delete(
                route("program.member.assign.courses.remove", {
                    program: memberData.program_id,
                    member: memberData.learning_member_id,
                    assignedCourse: assignedCourseToRemove,
                }),
                {
                    showProgress: false,
                    onSuccess: (page) => {
                        displayToast(
                            <DefaultCustomToast
                                message={page.props.flash.success}
                            />,
                            "success"
                        );
                    },
                    onFinish: () => {
                        setAssignedCourseToRemove(null);
                        setIsRemoveLoading(false);
                        setOpenAlertModal(false);
                    },
                }
            );
        }
    };

    return (
        <div className=" space-y-5 text-ascend-black">
            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Remove Assigned Course"}
                    description={
                        "Are you sure you want to remove this course? The user will no longer have access to the course."
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={removeAssignedCourse}
                    isLoading={isRemoveLoading}
                />
            )}
            <div className="flex justify-between items-center ">
                <BackButton doSomething={handleClickBackBtn} />
                <RoleGuard allowedRoles={["admin"]}>
                    <PrimaryButton
                        doSomething={toggleModal}
                        text={"Assign Course"}
                    />
                </RoleGuard>
            </div>
            <div className="flex items-center space-x-5">
                <ProfileImage
                    userData={memberData.user}
                    profileImageSize={"w-16 h-16"}
                />

                <div className="flex flex-col">
                    <span className="text-size4 font-bold">{`${memberData.user.first_name} ${memberData.user.last_name}`}</span>
                    <span>{capitalize(memberData.user.role.role_name)}</span>
                </div>
            </div>

            {/* Course Table */}
            <div className="overflow-x-auto">
                <table className="table font-nunito-sans">
                    {/* head */}
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Course Code
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Schedule
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignedCourses &&
                            assignedCourses.length > 0 &&
                            assignedCourses.map((assignedCourse) => (
                                <tr
                                    key={assignedCourse.course.course_id}
                                    className="hover:bg-ascend-lightblue transition-all duration-300"
                                >
                                    <td>
                                        {assignedCourse.course.course_code
                                            ? assignedCourse.course.course_code
                                            : ""}
                                    </td>
                                    <td>{assignedCourse.course.course_name}</td>
                                    <td>
                                        {assignedCourse.course.course_day
                                            ? `${
                                                  capitalize(
                                                      assignedCourse.course
                                                          .course_day
                                                  ) +
                                                  `${
                                                      assignedCourse.course
                                                          .start_time
                                                          ? " - "
                                                          : ""
                                                  }`
                                              }  ${
                                                  assignedCourse.course
                                                      .start_time
                                                      ? `${formatTime(
                                                            assignedCourse
                                                                .course.end_time
                                                        )} to ${formatTime(
                                                            assignedCourse
                                                                .course.end_time
                                                        )}`
                                                      : ""
                                              }`
                                            : "No schedule"}
                                    </td>
                                    <RoleGuard allowedRoles={["admin"]}>
                                        <td>
                                            <span
                                                onClick={() =>
                                                    handleRemoveAssignedCourse(
                                                        assignedCourse.assigned_course_id
                                                    )
                                                }
                                                className="text-ascend-red transition-all duration-300 hover:bg-ascend-red hover:text-ascend-white font-bold py-1 px-2 cursor-pointer"
                                            >
                                                Remove
                                            </span>
                                        </td>
                                    </RoleGuard>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {assignedCourses.length === 0 && (
                    <EmptyState
                        imgSrc={"/images/illustrations/not_assigned.svg"}
                        text={
                            auth.user.role_name === "admin"
                                ? `No assigned courses found. Click Assign Course to kick off the learning.`
                                : "No courses assigned yet. Please check back soon."
                        }
                    />
                )}
            </div>

            {isModalOpen && <AssignCourseForm toggleModal={toggleModal} />}
        </div>
    );
}
