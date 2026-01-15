import React from "react";
import { usePage } from "@inertiajs/react";
import EmptyState from "../../Components/EmptyState/EmptyState";

const GradesTable = () => {
    const { grades } = usePage().props;

    return (
        <>
            <div className="overflow-x-auto">
                <table className="table ">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3 font-nunito-sans">
                            <th className="text-ascend-black font-black">
                                Course Code
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Description
                            </th>
                            <th className="text-ascend-black font-black">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    {grades.length > 0 && (
                        <tbody>
                            {grades.map((grade) => (
                                <tr
                                    key={grade.grade_id}
                                    className="hover:bg-ascend-lightblue transition-all duration-300"
                                >
                                    <td className="py-5">
                                        {grade.course.course_code || "N/A"}
                                    </td>
                                    <td className="py-5">
                                        {grade.course.course_name}
                                    </td>
                                    <td className="py-5">{grade.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {grades.length === 0 && (
                    <EmptyState
                        imgSrc={"/images/illustrations/blank_canvas.svg"}
                        text={`“There are no grades available yet.”`}
                    />
                )}
            </div>
        </>
    );
};

export default GradesTable;
