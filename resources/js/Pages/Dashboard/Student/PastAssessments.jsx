import React from "react";
import { usePage, router } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";

export default function PastAssessments() {
    const { accomplished_assessments } = usePage().props;

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true, replace: true });
        }
    };

    return (
        <div className="pt-5 space-y-5 font-nunito-sans">
            <h1 className="text-size4 font-bold">Accomplished Assessments</h1>

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
                                Score
                            </th>
                            <th className="text-ascend-black font-black">
                                Submitted At
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accomplished_assessments.data &&
                        accomplished_assessments.data.length > 0 ? (
                            accomplished_assessments.data.map(
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
                                        <td>{assessment.score}</td>
                                        <td className="text-ascend-gray4">
                                            {assessment.submitted_at}
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center text-ascend-gray4 py-4 italic"
                                >
                                    No accomplished assessments yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/*================= Pagination (if multiple pages exist) =================*/}
            {accomplished_assessments.data?.length > 0 &&
                accomplished_assessments.last_page > 1 && (
                    <div className="flex justify-end mt-5">
                        <Pagination
                            links={accomplished_assessments.links}
                            currentPage={accomplished_assessments.current_page}
                            lastPage={accomplished_assessments.last_page}
                            only={["accomplished_assessments"]}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
        </div>
    );
}
