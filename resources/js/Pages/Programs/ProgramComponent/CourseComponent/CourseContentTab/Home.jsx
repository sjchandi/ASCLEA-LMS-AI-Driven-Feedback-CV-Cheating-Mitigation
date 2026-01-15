import { useState, useRef, useEffect, useCallback } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import PrimaryButton from "../../../../../Components/Button/PrimaryButton";
import PostForm from "./HomeComponents/Components/PostForm";
import Post from "./HomeComponents/Components/Post";
import usePostStore from "../../../../../Stores/Programs/CourseContent/postStore";
import EmptyState from "../../../../../Components/EmptyState/EmptyState";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import useCourseStore from "../../../../../Stores/Programs/courseStore";
import AddCourseForm from "../AddCourseForm";
import RoleGuard from "../../../../../Components/Auth/RoleGuard";
import { formatTime } from "../../../../../Utils/formatTime";
import { closeDropDown } from "../../../../../Utils/closeDropdown";
import DefaultCustomToast from "../../../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../../../Utils/displayToast";
import AlertModal from "../../../../../Components/AlertModal";
import PostList from "./HomeComponents/Components/PostList";

export default function Home({}) {
    const { program, course } = usePage().props;
    const programId = program.program_id;
    const courseId = course.course_id;

    // Course Store
    const setCourse = useCourseStore((state) => state.setCourseDetails);

    // Post Store
    const postList = usePostStore((state) => state.postList);
    const clearPostDetails = usePostStore((state) => state.clearPostDetails);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [openCourseForm, setOpenCourseForm] = useState(false);

    // States for alert modal
    const [openAlerModal, setOpenAlertModal] = useState(false);
    const [isArchiveLoading, setIsArchiveLoading] = useState(false);

    const targetForm = useRef(null);

    // Scroll into the form once opened
    useEffect(() => {
        if (isFormOpen) {
            targetForm.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isFormOpen]);

    const handleEditClick = () => {
        console.log(course);
        setCourse(course);
        setOpenCourseForm(true);

        // Close the dropdown after clicked
        closeDropDown();
    };

    const archiveCourse = () => {
        // Navigate first, then delete
        setIsArchiveLoading(true);
        router.delete(
            route("course.archive", {
                program: program.program_id,
                course: course.course_id,
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
                    setIsArchiveLoading(false);
                    setOpenAlertModal(false);
                },
            }
        );
    };

    const handleArchiveCourseClick = () => {
        setOpenAlertModal(true);
        // Close the dropdown after clicked
        closeDropDown();
    };

    console.log("RERENDER");

    return (
        <div className="space-y-5 w-full text-ascend-black font-nunito-sans">
            {/* Display alert modal */}
            {openAlerModal && (
                <AlertModal
                    title={"Archive Course"}
                    description={
                        "Are you sure you want to archive this course? It can be restored later if necessary."
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={archiveCourse}
                    isLoading={isArchiveLoading}
                />
            )}

            <div className="border-b border-ascend-gray1 pb-5">
                <div className="flex items-start gap-2 md:gap-20">
                    <h1 className="flex-1 min-w-0 text-size7 break-words font-semibold">
                        {`${
                            course?.course_code
                                ? `${course?.course_code} - `
                                : ""
                        }${course?.course_name}`}
                    </h1>

                    <RoleGuard allowedRoles={["admin"]}>
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
                                className="dropdown-content menu text-size2 bg-ascend-white min-w-36 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                            >
                                <li onClick={handleEditClick}>
                                    <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                        Edit course
                                    </a>
                                </li>
                                <li onClick={handleArchiveCourseClick}>
                                    <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                        Archive course
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </RoleGuard>
                </div>
                {course.course_day && (
                    <span className="text-size4 font-semibold">
                        {`${
                            course.course_day.charAt(0).toUpperCase() +
                            course.course_day.slice(1)
                        }: ${formatTime(course.start_time)} to
                    ${formatTime(course.end_time)}`}
                    </span>
                )}
                {course.course_description && (
                    <p className="break-words mt-3">
                        {course.course_description}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <h1 className="text-size6 font-bold">Home</h1>

                <RoleGuard allowedRoles={["admin", "faculty"]}>
                    <PrimaryButton
                        isDisabled={isFormOpen}
                        doSomething={() => setIsFormOpen(true)}
                        text="Write a Post"
                    />
                </RoleGuard>
            </div>

            {isFormOpen && (
                <div ref={targetForm}>
                    <PostForm setIsPostFormOpen={setIsFormOpen} />
                </div>
            )}

            <PostList courseId={courseId} programId={programId} />

            {/* Display EditCourse Form */}
            {openCourseForm && (
                <AddCourseForm
                    toggleModal={() => setOpenCourseForm(!openCourseForm)}
                    isEdit={openCourseForm}
                />
            )}
        </div>
    );
}
