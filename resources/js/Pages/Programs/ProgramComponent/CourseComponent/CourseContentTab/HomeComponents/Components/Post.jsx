import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";
import "../../../../../../../../css/quillTextEditor.css";
import DOMPurify from "dompurify";
import RoleGuard from "../../../../../../../Components/Auth/RoleGuard";
import { formatFullDate } from "../../../../../../../Utils/formatFullDate";
import { BiSolidMegaphone } from "react-icons/bi";
import PostForm from "./PostForm";
import { closeDropDown } from "../../../../../../../Utils/closeDropdown";
import ModalContainer from "../../../../../../../Components/ModalContainer";
import { usePage } from "@inertiajs/react";
import usePost from "../Hooks/usePost";
import { getRemainingDays } from "../../../../../../../Utils/getRemainingDays";

export default function Post({ postContent }) {
    const { program, course, auth } = usePage().props;
    const [isEditPostFormOpen, setIsEditPostFormOpen] = useState(false);

    // Snnitize the description
    const postHtml = DOMPurify.sanitize(postContent.post_description);

    // Custom hook
    const { handleUnpublishPost, handleArchivePost, handleRestorePost } =
        usePost({
            programId: program.program_id,
            courseId: course.course_id,
        });

    return (
        <>
            <div className="flex flex-col justify-between border border-ascend-gray1 shadow-shadow1 p-5 space-y-5 card-hover mt-5">
                <div className="flex items-center gap-2 md:gap-20">
                    <div className="flex-1 min-w-0 flex flex-wrap gap-5">
                        <div className="flex items-center gap-2">
                            <BiSolidMegaphone className="text-ascend-blue text-size5" />

                            <h1 className="text-size2 truncate font-bold">
                                New post
                            </h1>
                        </div>
                        {postContent.deleted_at ? (
                            <div className="flex flex-wrap gap-2">
                                <div className={`px-2 bg-ascend-red h-fit`}>
                                    <span className="text-size1 font-bold text-ascend-white">
                                        {"Archived"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            auth.user.role_name !== "student" && (
                                <div
                                    className={`px-2 ${
                                        postContent.status === "published"
                                            ? "px-2 bg-ascend-green"
                                            : "px-2 bg-ascend-yellow"
                                    }`}
                                >
                                    <span className="text-size1 font-bold text-ascend-white">
                                        {postContent.status === "published"
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                    {(auth.user.user_id === postContent.created_by ||
                        auth.user.role_name === "admin") && (
                        <RoleGuard allowedRoles={["admin", "faculty"]}>
                            <div className="h-8 flex items-center">
                                <div className="dropdown dropdown-end cursor-pointer">
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="rounded-4xl p-1 -mr-1 hover:bg-ascend-lightblue/35 transition-all duration-300"
                                    >
                                        <BsThreeDotsVertical className="text-size3" />
                                    </div>

                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content menu bg-ascend-white w-32 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                                    >
                                        {postContent.deleted_at ? (
                                            <li
                                                onClick={() => {
                                                    handleRestorePost(
                                                        postContent.post_id
                                                    );
                                                    closeDropDown();
                                                }}
                                            >
                                                <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                    Restore post
                                                </a>
                                            </li>
                                        ) : (
                                            <>
                                                {postContent.status !==
                                                "published" ? (
                                                    <li
                                                        onClick={() => {
                                                            setIsEditPostFormOpen(
                                                                true
                                                            );
                                                            closeDropDown();
                                                        }}
                                                    >
                                                        <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                            Edit post
                                                        </a>
                                                    </li>
                                                ) : (
                                                    <li
                                                        onClick={() => {
                                                            handleUnpublishPost(
                                                                postContent.post_id
                                                            );

                                                            closeDropDown();
                                                        }}
                                                    >
                                                        <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                            Unpublish post
                                                        </a>
                                                    </li>
                                                )}
                                                <li
                                                    onClick={() => {
                                                        handleArchivePost(
                                                            postContent.post_id
                                                        );
                                                        closeDropDown();
                                                    }}
                                                >
                                                    <a className="w-full text-left font-bold hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                        Archive post
                                                    </a>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </RoleGuard>
                    )}
                </div>
                <div className="flex flex-col justify-between  space-y-5">
                    <h1 className="flex-1 min-w-0 text-size4 truncate font-bold">
                        {postContent.post_title}
                    </h1>
                    <ReactQuill
                        value={postHtml}
                        readOnly={true}
                        theme={"bubble"}
                    />

                    <div className="flex flex-wrap-reverse justify-between items-baseline font-nunito-sans gap-2">
                        <span className="text-size1">
                            {postContent.deleted_at
                                ? `Archived on ${formatFullDate(
                                      postContent.deleted_at
                                  )}`
                                : postContent.updated_at !==
                                  postContent.created_at
                                ? `Updated on ${formatFullDate(
                                      postContent.updated_at
                                  )}`
                                : `Posted on ${formatFullDate(
                                      postContent.created_at
                                  )}`}
                        </span>
                        <span className="font-bold">
                            {`${postContent.author.first_name}
                        ${postContent.author.last_name}`}
                        </span>
                    </div>
                </div>
            </div>

            {isEditPostFormOpen && (
                <ModalContainer>
                    <PostForm
                        setIsPostFormOpen={setIsEditPostFormOpen}
                        isEdit={true}
                        postDetailsToEdit={postContent}
                        formWidth={"max-w-200"}
                        formTitle={"Edit Post"}
                    />
                </ModalContainer>
            )}
        </>
    );
}
