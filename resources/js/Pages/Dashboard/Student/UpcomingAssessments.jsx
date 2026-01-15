import React from "react";
import { usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import Pagination from "@/Components/Pagination";

export default function UpcomingAssessments() {
    const route = useRoute();
    const { pending_assessments } = usePage().props;

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true, replace: true });
        }
    };

    return (
        <div className="pt-5 space-y-5 font-nunito-sans">
            <h1 className="text-size4 font-bold">Pending Assessments</h1>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Course
                            </th>
                            <th className="text-ascend-black font-black">
                                Title
                            </th>
                            <th className="text-ascend-black font-black">
                                Due Date
                            </th>
                            <th className="text-ascend-black font-black">
                                Total Points
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pending_assessments.data &&
                        pending_assessments.data.length > 0 ? (
                            pending_assessments.data.map(
                                (assessment, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-ascend-lightblue cursor-pointer transition-all duration-300"
                                    >
                                        <td>
                                            {assessment.course_code} -{" "}
                                            {assessment.course_name}
                                        </td>
                                        <td>{assessment.assessment_title}</td>
                                        <td>
                                            {assessment.due_date ??
                                                "No Due Date"}
                                        </td>
                                        <td>{assessment.possible_score}</td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center text-ascend-gray4 py-4 italic"
                                >
                                    No pending assessments.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/*================= Pagination (if multiple pages exist) =================*/}
            {pending_assessments.data?.length > 0 &&
                pending_assessments.last_page > 1 && (
                    <div className="flex justify-end mt-5">
                        <Pagination
                            links={pending_assessments.links}
                            currentPage={pending_assessments.current_page}
                            lastPage={pending_assessments.last_page}
                            only={["pending_assessments"]}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
        </div>
    );
}
