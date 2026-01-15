import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../../../../../../../../css/global.css";
import { usePage } from "@inertiajs/react";
import RoleGuard from "../../../../../../../Components/Auth/RoleGuard";
import { formatFullDate } from "../../../../../../../Utils/formatFullDate";
import ModalContainer from "../../../../../../../Components/ModalContainer";
import MaterialForm from "./MaterialForm";
import { closeDropDown } from "../../../../../../../Utils/closeDropdown";
import useMaterial from "../Hooks/useMaterial";
import { getRemainingDays } from "../../../../../../../Utils/getRemainingDays";
import { BiSolidBook } from "react-icons/bi";

function MaterialItem({ materialDetails, setIsMaterialFormOpen }) {
    const { program, course, auth } = usePage().props;

    // Custom hook
    const {
        handleUnpublishMaterial,
        handleArchiveMaterial,
        handleRestoreMaterial,
        handleViewMaterial,
    } = useMaterial({
        programId: program.program_id,
        courseId: course.course_id,
    });

    const [isEditMaterialFormOpen, setIsEditMaterialFormOpen] = useState(false);

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    const handleClickEdit = () => {
        setIsEditMaterialFormOpen(true);
        closeDropDown();
        setIsMaterialFormOpen(false);
    };

    return (
        <>
            <div
                onClick={() => handleViewMaterial(materialDetails)}
                className={`flex flex-col justify-between border border-ascend-gray1 shadow-shadow1 p-5 space-y-5 card-hover mt-5 ${
                    materialDetails.deleted_at ? "" : "cursor-pointer"
                }`}
            >
                <div className="flex items-center gap-2 md:gap-20">
                    <div className="flex-1 min-w-0 flex flex-wrap gap-5">
                        <div className="flex items-center gap-2">
                            <BiSolidBook className="text-ascend-blue text-size5" />

                            <h1 className="text-size2 truncate font-bold">
                                New material
                            </h1>
                        </div>

                        {materialDetails.deleted_at ? (
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
                                        materialDetails.status === "published"
                                            ? "px-2 bg-ascend-green"
                                            : "px-2 bg-ascend-yellow"
                                    }`}
                                >
                                    <span className="text-size1 font-bold text-ascend-white">
                                        {materialDetails.status === "published"
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {(auth.user.user_id === materialDetails.created_by ||
                        auth.user.role_name === "admin") && (
                        <RoleGuard allowedRoles={["admin", "faculty"]}>
                            <div className="h-8 flex items-center">
                                <div
                                    onClick={stopPropagation}
                                    className="dropdown dropdown-end cursor-pointer"
                                >
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="rounded-4xl p-1 -mr-1 hover:bg-ascend-lightblue transition-all duration-300"
                                    >
                                        <BsThreeDotsVertical className="text-size3" />
                                    </div>

                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content menu space-y-2 font-bold bg-ascend-white w-45 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                                    >
                                        {materialDetails.deleted_at ? (
                                            <li
                                                onClick={() => {
                                                    handleRestoreMaterial(
                                                        materialDetails.material_id
                                                    );
                                                    closeDropDown();
                                                }}
                                            >
                                                <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                    Restore material
                                                </a>
                                            </li>
                                        ) : (
                                            <>
                                                {materialDetails.status ===
                                                "published" ? (
                                                    <>
                                                        <li
                                                            onClick={() => {
                                                                handleUnpublishMaterial(
                                                                    materialDetails.material_id
                                                                );
                                                                closeDropDown();
                                                            }}
                                                        >
                                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                                Unpublish
                                                                material
                                                            </a>
                                                        </li>
                                                        <li
                                                            onClick={() => {
                                                                handleArchiveMaterial(
                                                                    materialDetails.material_id
                                                                );
                                                                closeDropDown();
                                                            }}
                                                        >
                                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                                Archive material
                                                            </a>
                                                        </li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li
                                                            onClick={
                                                                handleClickEdit
                                                            }
                                                        >
                                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                                Edit material
                                                            </a>
                                                        </li>
                                                        <li
                                                            onClick={() => {
                                                                handleArchiveMaterial(
                                                                    materialDetails.material_id
                                                                );
                                                                closeDropDown();
                                                            }}
                                                        >
                                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                                Archive material
                                                            </a>
                                                        </li>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </RoleGuard>
                    )}
                </div>
                <h1 className="flex-1 min-w-0 text-size4 truncate font-bold">
                    {materialDetails.material_title}
                </h1>

                <div className="flex flex-wrap-reverse justify-between items-baseline font-nunito-sans gap-2">
                    <span className="text-size1">
                        {materialDetails.deleted_at
                            ? `Archived on ${formatFullDate(
                                  materialDetails.deleted_at
                              )}`
                            : materialDetails.updated_at !==
                              materialDetails.created_at
                            ? `Updated on ${formatFullDate(
                                  materialDetails.updated_at
                              )}`
                            : `Created on ${formatFullDate(
                                  materialDetails.created_at
                              )}`}
                    </span>
                    <span className="font-bold">
                        {materialDetails.author.first_name}{" "}
                        {materialDetails.author.last_name}
                    </span>
                </div>
            </div>

            {isEditMaterialFormOpen && (
                <ModalContainer>
                    <MaterialForm
                        formTitle={`Edit Material`}
                        isEdit={true}
                        materialId={materialDetails.material_id}
                        setIsMaterialFormOpen={setIsEditMaterialFormOpen}
                        formWidth="max-w-200"
                        materialDetailsToEdit={materialDetails}
                    />
                </ModalContainer>
            )}
        </>
    );
}

export default React.memo(MaterialItem);
