import React from "react";

const AssesstmentTable = ({ completedAssessments }) => {
    console.log(completedAssessments)
    return (
        <div className="font-nunito-sans space-y-2">
            <div className="flex justify-between items-center">
                <h1 className="text-size6 font-bold">Completed Assessments</h1>
            </div>

            {/*=========================== Assessments Table ===========================*/}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Assessment Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Points
                            </th>
                            <th className="text-ascend-black font-black">
                                Date Submitted
                            </th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {completedAssessments.length > 0 ? (
                            completedAssessments.map((assessment, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-ascend-lightblue"
                                >
                                    <td>{assessment.assessment_name}</td>
                                    <td>{assessment.course_name}</td>
                                    {assessment.status === 'submitted' ? (
                                        <td className="text-ascend-red">Not Graded</td>
                                    ) : (
                                    <td>{assessment.score}</td>
                                    )}
                                    <td>
                                        {new Date(
                                            assessment.submitted_at
                                        ).toLocaleString()}     
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-5 text-ascend-gray2 italic"
                                >
                                    No assessments completed.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssesstmentTable;
