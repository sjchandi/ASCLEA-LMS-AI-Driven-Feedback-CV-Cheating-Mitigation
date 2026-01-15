import React, { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import SectionContentList from "./SectionContentList";
import MaterialForm from "./MaterialForm";
import AssessmentForm from "../../AssessmentsComponents/AssessmentForm";
import {
    closestCorners,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensors,
    useSensor,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import useModulesStore from "../Stores/modulesStore";
import RoleGuard from "../../../../../../../Components/Auth/RoleGuard";
import useSection from "../Hooks/useSection";
import { usePage } from "@inertiajs/react";
import { closeDropDown } from "../../../../../../../Utils/closeDropdown";
import SectionForm from "./SectionForm";
import ModalContainer from "../../../../../../../Components/ModalContainer";
import { getRemainingDays } from "../../../../../../../Utils/getRemainingDays";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AiFillLock } from "react-icons/ai";

export default function Section({ sectionDetails }) {
    const { program, course, auth } = usePage().props;
    // Modules store
    const setSectionItems = useModulesStore((state) => state.setSectionItems);

    // Custom hook
    const {
        isLoading,
        handleUpdateSectionStatus,
        handleArchiveSection,
        handleRestoreSection,
        handleSectionItemSorting,
    } = useSection({
        programId: program.program_id,
        courseId: course.course_id,
    });

    const [isEditSectionFormOpen, seIsEditSectionFormOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
    const [isAssessmentFormOpen, setIsAssessmentFormOpen] = useState(false);

    // Open material or assessment form
    const openForm = (e) => {
        // Open form if close
        if (
            e.currentTarget.getAttribute("name") === "add-material" &&
            !isMaterialFormOpen
        ) {
            if (isAssessmentFormOpen) {
                setIsAssessmentFormOpen(!isAssessmentFormOpen);
                setIsMaterialFormOpen(!isMaterialFormOpen);
            } else {
                setIsMaterialFormOpen(!isMaterialFormOpen);
            }
        } else if (
            e.currentTarget.getAttribute("name") === "add-assessment" &&
            !isAssessmentFormOpen
        ) {
            if (isMaterialFormOpen) {
                setIsMaterialFormOpen(!isMaterialFormOpen);
                setIsAssessmentFormOpen(!isAssessmentFormOpen);
            } else {
                setIsAssessmentFormOpen(!isAssessmentFormOpen);
            }
        }

        // Close the dropdown after clicked
        const elem = document.activeElement;
        if (elem) {
            elem?.blur();
        }
    };

    const toggleArrow = () => {
        setIsMaterialFormOpen(false);
        setIsExpanded(!isExpanded);
        setIsButtonDisyplayed(false);
    };

    // Helper function for getting the index
    const getSectionContentPos = (id) =>
        sectionDetails.items.findIndex(
            (content) => content.section_item_id === id
        );

    // Function for sorting the array
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id === over.id) return;
        const originalPos = getSectionContentPos(active.id);
        const newPos = getSectionContentPos(over.id);

        const updatedOrder = arrayMove(
            sectionDetails.items,
            originalPos,
            newPos
        ).map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        // Set the new order od section items
        setSectionItems(
            course.course_id,
            sectionDetails.section_id,
            updatedOrder
        );

        handleSectionItemSorting(
            sectionDetails.section_id,
            active.id,
            newPos,
            originalPos
        );
    };

    // This allows drag and drop in mobile device
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleClickEdit = () => {
        seIsEditSectionFormOpen(true);
        // setSectionDetails(sectionDetails);
        closeDropDown();
    };

    return (
        <>
            <div className="shadow-shadow1">
                <div className="flex items-center gap-2 md:gap-20 justify-between pl-2 pr-5 py-3 text-ascend-white bg-ascend-blue">
                    <div className="flex flex-1 min-w-0 items-center gap-2">
                        <IoIosArrowDown
                            onClick={toggleArrow}
                            className={`shrink-0 text-size5 ${
                                isExpanded ? "rotate-0" : "rotate-90"
                            } transition-all duration-300 cursor-pointer `}
                        />

                        <h1 className="text-size4 font-bold break-words min-w-0">
                            {sectionDetails.section_title}
                        </h1>

                        {/* Set the status label */}
                        {sectionDetails.deleted_at ? (
                            <div className="flex flex-wrap gap-2">
                                <div className={`px-2 bg-ascend-red h-fit`}>
                                    <span className="text-size1 font-bold text-ascend-white">
                                        {"Archived"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <RoleGuard allowedRoles={["admin"]}>
                                <div
                                    className={`px-2 ${
                                        sectionDetails.status === "published"
                                            ? "px-2 bg-ascend-green"
                                            : "px-2 bg-ascend-yellow"
                                    }`}
                                >
                                    <span className="text-size1 font-bold text-ascend-white">
                                        {sectionDetails.status === "published"
                                            ? "Published"
                                            : "Draft"}
                                    </span>
                                </div>
                            </RoleGuard>
                        )}
                    </div>

                    <RoleGuard allowedRoles={["admin"]}>
                        <div className="dropdown dropdown-end cursor-pointer">
                            <div
                                tabIndex={0}
                                role="button"
                                className="rounded-4xl p-1 -mr-1 transition-all duration-300 hover:bg-ascend-lightblue/10"
                            >
                                <BsThreeDotsVertical className="text-size3" />
                            </div>

                            <ul
                                tabIndex={0}
                                className="dropdown-content menu font-bold space-y-2 bg-ascend-white min-w-36 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                            >
                                {!sectionDetails.deleted_at ? (
                                    <>
                                        <li
                                            onClick={() => {
                                                handleUpdateSectionStatus(
                                                    sectionDetails.section_id
                                                );
                                                closeDropDown();
                                            }}
                                        >
                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                {sectionDetails.status ===
                                                "published"
                                                    ? "Unpublish section"
                                                    : "Publish section"}
                                            </a>
                                        </li>
                                        {sectionDetails.status === "draft" && (
                                            <>
                                                <li
                                                    name="add-material"
                                                    onClick={openForm}
                                                >
                                                    <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                        Add material
                                                    </a>
                                                </li>
                                                <li
                                                    name="add-assessment"
                                                    onClick={openForm}
                                                >
                                                    <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                        Add assessment
                                                    </a>
                                                </li>
                                                <li onClick={handleClickEdit}>
                                                    <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                        Edit section title
                                                    </a>
                                                </li>
                                            </>
                                        )}
                                        <li
                                            onClick={() => {
                                                handleArchiveSection(
                                                    sectionDetails.section_id
                                                );
                                                closeDropDown();
                                            }}
                                        >
                                            <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                                Archive section
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <li
                                        onClick={() => {
                                            handleRestoreSection(
                                                sectionDetails.section_id
                                            );
                                            closeDropDown();
                                        }}
                                    >
                                        <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                            Restore section
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </RoleGuard>
                </div>

                <div
                    className={`relative border-r bg-ascend-lightblue border-l border-b border-ascend-gray1 transition-all duration-500 ease-in-out ${
                        isExpanded
                            ? "max-h-200 opacity-100"
                            : "max-h-0 opacity-0"
                    }`}
                >
                    {sectionDetails.is_locked && (
                        <div className="absolute backdrop-blur-[3px] inset-0 bg-black/15 z-100 flex justify-center items-center overflow-y-auto h-full">
                            <div className="flex flex-col items-center">
                                <AiFillLock className="text-7xl text-ascend-blue" />
                                <h1 className="text-size4 font-medium text-ascend-black italic">
                                    This section is locked. Please complete the
                                    previous section to unlock it.
                                </h1>
                            </div>
                        </div>
                    )}
                    <div
                        className={`flex flex-col gap-3 ${
                            isExpanded ? "p-5" : "px-5 py-0"
                        }`}
                    >
                        {isExpanded && (
                            <>
                                {sectionDetails.items.length > 0 ? (
                                    <DndContext
                                        sensors={sensors}
                                        onDragEnd={handleDragEnd}
                                        collisionDetection={closestCorners}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <SectionContentList
                                            sectionDetails={sectionDetails}
                                        />
                                    </DndContext>
                                ) : (
                                    <h1 className="text-center">
                                        No content found.
                                    </h1>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isMaterialFormOpen && (
                <ModalContainer>
                    <MaterialForm
                        setIsMaterialFormOpen={setIsMaterialFormOpen}
                        formTitle={"Add Section Material"}
                        formWidth={"max-w-200"}
                        sectionId={sectionDetails.section_id}
                    />
                </ModalContainer>
            )}

            {isAssessmentFormOpen && (
                <ModalContainer>
                    <AssessmentForm
                        setIsAssessmentFormOpen={setIsAssessmentFormOpen}
                        formTitle={"Add Section Assessment"}
                        formWidth={"max-w-200"}
                        sectionId={sectionDetails.section_id}
                    />
                </ModalContainer>
            )}

            {isEditSectionFormOpen && (
                <ModalContainer>
                    <SectionForm
                        setIsSectionFormOpen={seIsEditSectionFormOpen}
                        isEdit={true}
                        sectionId={sectionDetails.section_id}
                        formTitle={"Edit Section"}
                        formWIdth={"max-w-200"}
                        sectionDetailsToEdit={sectionDetails}
                    ></SectionForm>
                </ModalContainer>
            )}
        </>
    );
}
