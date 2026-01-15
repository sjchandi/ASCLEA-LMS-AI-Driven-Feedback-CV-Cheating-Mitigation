import { create } from "zustand";
import { persist } from "zustand/middleware";

const useModulesStore = create(
    persist(
        (set) => ({
            activeTab: "materials",

            setActiveTab: (tab) => {
                set({
                    activeTab: tab,
                });
            },

            // Materia
            materialsByCourse: [],

            setMaterials: (courseId, list, page, hasMore) => {
                const { materialsByCourse } = useModulesStore.getState();

                // Check if the list for the course if it does mix the previous list to new ones
                const materialList = materialsByCourse[courseId]
                    ? [...materialsByCourse[courseId].list, ...list]
                    : [...list];

                // Map handle removing duplicate values based on the  id
                const uniqueMaterials = [
                    ...new Map(
                        materialList.map((a) => [a.material_id, a])
                    ).values(),
                ];

                set(() => ({
                    materialsByCourse: {
                        ...materialsByCourse,
                        [courseId]: {
                            list: uniqueMaterials,
                            page,
                            hasMore,
                        },
                    },
                }));
            },

            addNewMaterial: (newMaterial, courseId) => {
                const { materialsByCourse } = useModulesStore.getState();

                // Check if  a list already exist
                const courseState = materialsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };

                set({
                    materialsByCourse: {
                        ...materialsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: [newMaterial, ...courseState.list],
                        },
                    },
                });
            },

            updateMaterialList: (updatedMaterial, courseId) => {
                const { materialsByCourse } = useModulesStore.getState();

                const courseState = materialsByCourse[courseId];

                const updatedCourseMaterialList = courseState.list.map(
                    (material) =>
                        material.material_id === updatedMaterial.material_id
                            ? updatedMaterial
                            : material
                );

                set({
                    materialsByCourse: {
                        ...materialsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: updatedCourseMaterialList,
                        },
                    },
                });
            },

            // Section
            sectionsByCourse: [],

            setSections: (courseId, list, page, hasMore) => {
                const { sectionsByCourse } = useModulesStore.getState();

                // Check if the list for the course exist, if it does mix the previous list to new ones
                const sectionList = sectionsByCourse[courseId]
                    ? [...sectionsByCourse[courseId].list, ...list]
                    : [...list];

                // Map handle removing duplicate values based on the  id
                const uniqueMaterials = [
                    ...new Map(
                        sectionList.map((a) => [a.section_id, a])
                    ).values(),
                ];

                set(() => ({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            list: uniqueMaterials,
                            page,
                            hasMore,
                        },
                    },
                }));
            },

            addNewSection: (newSection, courseId) => {
                const { sectionsByCourse } = useModulesStore.getState();

                // Check if  a list already exist
                const courseState = sectionsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };

                set({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: [newSection, ...courseState.list],
                        },
                    },
                });
            },

            updateSectionList: (updatedSection, courseId) => {
                const { sectionsByCourse } = useModulesStore.getState();

                const courseState = sectionsByCourse[courseId];

                const updatedCourseSectionList = courseState.list.map(
                    (section) =>
                        section.section_id === updatedSection.section_id
                            ? updatedSection
                            : section
                );

                set({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: updatedCourseSectionList,
                        },
                    },
                });
            },

            // Section items

            // For settting the whole items in the section
            setSectionItems: (courseId, sectionId, sectionItems) => {
                const { sectionsByCourse } = useModulesStore.getState();

                const courseState = sectionsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };

                const updatedList = courseState.list.map((section) => {
                    if (section.section_id === sectionId) {
                        return {
                            ...section,
                            items: sectionItems,
                        };
                    }
                    return section;
                });

                set({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: updatedList,
                        },
                    },
                });
            },

            // For adding item in the secction items
            addNewSectionItem: (newSectionItem, courseId, sectionId) => {
                const { sectionsByCourse } = useModulesStore.getState();

                const courseState = sectionsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };

                // Update the item list of the section
                const updatedList = courseState.list.map((section) => {
                    if (section.section_id === sectionId) {
                        return {
                            ...section,
                            items: [...(section.items || []), newSectionItem],
                        };
                    }
                    return section;
                });
                console.log(updatedList);
                set({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: updatedList,
                        },
                    },
                });
            },

            // For updadting the item in section items
            updateSectionItems: (updatedSectionItem, courseId, sectionId) => {
                const { sectionsByCourse } = useModulesStore.getState();
                console.log(updatedSectionItem);
                const courseState = sectionsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };

                // Update the item list of the section
                const updatedList = courseState.list.map((section) => {
                    if (section.section_id === sectionId) {
                        const updatedSectionItems = section.items.map((i) =>
                            i.section_item_id ===
                            updatedSectionItem.section_item_id
                                ? updatedSectionItem
                                : i
                        );

                        return {
                            ...section,
                            items: updatedSectionItems,
                        };
                    }
                    return section;
                });

                set({
                    sectionsByCourse: {
                        ...sectionsByCourse,
                        [courseId]: {
                            ...courseState,
                            list: updatedList,
                        },
                    },
                });
            },

            // Handle logic ffor unlocking the next assessment or material
            unlockSectionAndSectionItems: (
                courseId,
                sectionId,
                sectionItemId,
                studentProgress
            ) => {
                const { sectionsByCourse, setSectionItems, updateSectionList } =
                    useModulesStore.getState();

                const courseState = sectionsByCourse[courseId] || {
                    list: [],
                    page: 1,
                    hasMore: true,
                };
                console.log(courseState);
                if (courseState.list.length > 0) {
                    const sectionIndex = courseState.list.findIndex(
                        (section) => section.section_id === sectionId
                    );

                    const section = courseState.list[sectionIndex];
                    const nextSection = courseState.list[sectionIndex + 1];

                    let sectionitemIndex = null;
                    let sectionItemsCount = section.items.length;

                    const updatedSectionItems = section.items.map(
                        (item, index) => {
                            // Update the student progress of the currentt item
                            if (item.section_item_id === sectionItemId) {
                                sectionitemIndex = index;

                                // Checks if the section item is the last item
                                // This will unlock next section
                                if (
                                    sectionItemsCount === index + 1 &&
                                    nextSection &&
                                    studentProgress.is_done
                                ) {
                                    let updatedNextSectionItems = [];

                                    if (nextSection.items.length > 0) {
                                        updatedNextSectionItems =
                                            nextSection.items.map(
                                                (item, index) => {
                                                    // Always unlock the first section item
                                                    // Check item.is_item_locked !==  undefined, if true the section wwas alreeady unlock
                                                    // so we will get the current value  of is_item_locked instead of manuaally setting it
                                                    if (index === 0) {
                                                        return {
                                                            ...item,
                                                            is_item_locked:
                                                                item.is_item_locked !==
                                                                undefined
                                                                    ? item.is_item_locked
                                                                    : false,
                                                        };
                                                    }
                                                    return {
                                                        ...item,
                                                        is_item_locked:
                                                            item.is_item_locked !==
                                                            undefined
                                                                ? item.is_item_locked
                                                                : true,
                                                    };
                                                }
                                            );
                                    }

                                    const updatedNextSection = {
                                        ...nextSection,
                                        is_locked: false, // Unlock the section
                                        items: updatedNextSectionItems,
                                    };

                                    updateSectionList(
                                        updatedNextSection,
                                        courseId
                                    );
                                }

                                return {
                                    ...item,
                                    student_progress: studentProgress,
                                };
                            }

                            // Check if the item is the next item
                            if (
                                Number.isInteger(sectionitemIndex) &&
                                sectionitemIndex + 1 === index &&
                                studentProgress.is_done
                            ) {
                                console.log("Unlock NEXT ITEM");
                                // Unlocks the next item
                                return {
                                    ...item,
                                    is_item_locked: false,
                                };
                            }

                            return item;
                        }
                    );

                    setSectionItems(courseId, sectionId, updatedSectionItems);
                }
            },
        }),
        {
            name: "modules-storage",
        }
    )
);

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        useModulesStore.persist.clearStorage();
    });
}

export default useModulesStore;
