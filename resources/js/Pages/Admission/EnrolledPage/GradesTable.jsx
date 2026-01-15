import React from "react";

const GradesTable = ({ Grades }) => {
    return (
        <div className="font-nunito-sans space-y-2">
            <div className="flex justify-between items-center">
                <h1 className="text-size6 font-bold">Grades</h1>
            </div>

            {/*=========================== Assessments Table ===========================*/}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Program Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {Grades.length > 0 ? (
                            Grades.map((grade, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-ascend-lightblue"
                                >
                                    <td>{grade.program_name}</td>
                                    <td>{grade.course_name}</td>
                                    <td>{grade.grade}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-5 text-ascend-gray2 italic"
                                >
                                    No Grades yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GradesTable;
