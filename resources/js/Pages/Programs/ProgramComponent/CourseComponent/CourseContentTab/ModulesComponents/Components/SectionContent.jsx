import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { router, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import { MdOutlineDragIndicator } from "react-icons/md";
import RoleGuard from "../../../../../../../Components/Auth/RoleGuard";
import { closeDropDown } from "../../../../../../../Utils/closeDropdown";
import ModalContainer from "../../../../../../../Components/ModalContainer";
import MaterialForm from "./MaterialForm";
import AssessmentForm from "../../AssessmentsComponents/AssessmentForm";
import { AiFillLock } from "react-icons/ai";
import { AiFillCheckCircle } from "react-icons/ai";

export default function SectionContent({
    disabled,
    itemDetails,
    sectionId = null,
    sectionDetails,
}) {
    const route = useRoute();

    const { program, course } = usePage().props;

    const [openEditForm, setOpenEditForm] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        setActivatorNodeRef,
    } = useSortable({
        id: itemDetails.section_item_id,
        transition: {
            duration: 300, // milliseconds
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
        animateLayoutChanges: () => false,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined,
    };

    const handleSectionContentClick = () => {
        if (!sectionDetails.deleted_at) {
            if (itemDetails.item_type === "App\\Models\\Programs\\Material") {
                router.visit(
                    route("material.view", {
                        program: program.program_id,
                        course: course.course_id,
                        material: itemDetails.item.material_id,
                    }),
                    {
                        preserveScroll: false,
                    }
                );
            } else {
                router.visit(
                    route("program.course.assessment.view", {
                        program: program.program_id,
                        course: course.course_id,
                        assessment: itemDetails.item.assessment_id,
                    }),
                    {
                        preserveScroll: false,
                    }
                );
            }
        }
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    const handleClickEdit = () => {
        setOpenEditForm(true);
        closeDropDown();
    };

    return (
        <>
            <div className="relative">
                {!sectionDetails.is_locked && itemDetails.is_item_locked && (
                    <div className="absolute inset-0 bg-black/15 z-100 flex justify-center items-center overflow-y-auto h-full">
                        <div className="flex flex-col items-center">
                            <AiFillLock className="text-size5    text-ascend-blue" />
                        </div>
                    </div>
                )}
                <div
                    onClick={handleSectionContentClick}
                    ref={setNodeRef}
                    {...attributes}
                    style={style}
                    className="bg-ascend-white border border-ascend-gray1"
                >
                    {!disabled && (
                        <div
                            style={{ touchAction: "none" }}
                            ref={setActivatorNodeRef}
                            {...(!disabled && listeners)}
                            className="flex justify-center cursor-grab py-1"
                        >
                            <MdOutlineDragIndicator className="rotate-90" />
                        </div>
                    )}
                    <div
                        className={`flex items-center gap-2 md:gap-20 justify-between pr-5 pl-5 pb-5 ${
                            sectionDetails.deleted_at ? "" : "cursor-pointer"
                        } ${disabled ? "pt-5" : null} text-ascend-black`}
                    >
                        <div className="flex items-center space-x-5">
                            <RoleGuard allowedRoles={["student"]}>
                                {itemDetails.student_progress &&
                                itemDetails.student_progress.is_done ? (
                                    <AiFillCheckCircle className="text-size6 text-ascend-green border border-ascend-gray3 rounded-full" />
                                ) : (
                                    <div className="w-7 h-7 border border-ascend-gray3 rounded-full"></div>
                                )}
                            </RoleGuard>
                            <h1 className="text-size2 font-bold break-words flex-1 min-w-0">
                                {`${itemDetails.order}. `}
                                {itemDetails.item_type ===
                                "App\\Models\\Programs\\Material"
                                    ? itemDetails.item.material_title
                                    : itemDetails.item.assessment_title}
                            </h1>
                        </div>

                        {!disabled && (
                            <RoleGuard allowedRoles={["admin"]}>
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
                                        className="dropdown-content menu space-y-2 font-bold bg-ascend-white w-32 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                                    >
                                        <li onClick={handleClickEdit}>
                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                Edit
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </RoleGuard>
                        )}
                    </div>
                </div>
            </div>

            {openEditForm && (
                <ModalContainer>
                    {itemDetails.item_type ===
                    "App\\Models\\Programs\\Material" ? (
                        <MaterialForm
                            formTitle={"Edit Material"}
                            isEdit={true}
                            setIsMaterialFormOpen={setOpenEditForm}
                            materialId={itemDetails.item.material_id}
                            formWidth="max-w-200"
                            sectionId={sectionId}
                            materialDetailsToEdit={itemDetails.item}
                        />
                    ) : (
                        <AssessmentForm
                            formTitle={"Edit Assessment"}
                            isEdit={true}
                            setIsAssessmentFormOpen={setOpenEditForm}
                            assessmentId={itemDetails.item.assessment_id}
                            formWidth="max-w-200"
                            sectionId={sectionId}
                            assessmentDetailsToEdit={itemDetails.item}
                        />
                    )}
                </ModalContainer>
            )}
        </>
    );
}
