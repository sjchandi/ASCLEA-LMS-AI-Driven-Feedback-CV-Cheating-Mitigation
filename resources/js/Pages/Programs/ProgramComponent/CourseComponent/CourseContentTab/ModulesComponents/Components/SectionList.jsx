import { useEffect, useRef, useCallback } from "react";
import useModulesStore from "../Stores/modulesStore";
import Section from "./Section";
import useSection from "../Hooks/useSection";
import { usePage } from "@inertiajs/react";
import Loader from "../../../../../../../Components/Loader";
import EmptyState from "../../../../../../../Components/EmptyState/EmptyState";

export default function SectionList() {
    const { program, course } = usePage().props;

    // Module store
    const sectionsByCourse = useModulesStore((state) => state.sectionsByCourse);

    // Custom hook
    const { isLoading, handleFetchSections } = useSection({
        programId: program.program_id,
        courseId: course.course_id,
    });
    console.log(sectionsByCourse);
    const loaderRef = useRef(null);

    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];

            if (target.isIntersecting && !isLoading) {
                handleFetchSections();
            }
        },
        [isLoading]
    );

    useEffect(() => {
        // Create the observer function
        // Reset and re-create whenever there are changes in dependecies
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "100px",
            threshold: 0,
        });

        if (loaderRef.current) observer.observe(loaderRef.current);

        return () => {
            observer.disconnect();
        };
    }, [handleObserver]);

    useEffect(() => {
        console.log(sectionsByCourse[course.course_id]);
    }, [sectionsByCourse]);

    return (
        <div className="space-y-5">
            {sectionsByCourse[course.course_id] &&
                sectionsByCourse[course.course_id].list.length > 0 && (
                    <div className="flex flex-col space-y-5">
                        {/* Display the list of sections */}
                        {sectionsByCourse[course.course_id].list.map(
                            (section, index) => (
                                <Section
                                    key={section.section_id}
                                    sectionDetails={section}
                                />
                            )
                        )}
                    </div>
                )}

            {(!sectionsByCourse[course.course_id] ||
                sectionsByCourse[course.course_id].hasMore) && (
                <div ref={loaderRef} className=" w-full flex justify-center">
                    <Loader color="bg-ascend-blue" />
                </div>
            )}

            {sectionsByCourse[course.course_id] &&
                sectionsByCourse[course.course_id].list.length === 0 &&
                !sectionsByCourse[course.course_id].hasMore && (
                    <EmptyState
                        imgSrc={"/images/illustrations/empty.svg"}
                        text={`“There’s a whole lot of nothing going on—time to make something happen!”`}
                    />
                )}
        </div>
    );
}
