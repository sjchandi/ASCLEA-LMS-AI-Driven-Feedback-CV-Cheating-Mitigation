import React from "react";

const CoursesTable = ({ learningMembers }) => {
    const allCourses = learningMembers.flatMap((lm) =>
        lm.courses.map((course) => ({
            programName: lm.program?.program_name || "No Program",
            courseCode: course.course?.course_code,
            courseName: course.course?.course_name,
        }))
    );

    return (
        <div className="font-nunito-sans space-y-2">
            <div className="flex justify-between items-center">
                <h1 className="text-size6 font-bold">Programs & Courses</h1>
            </div>

            {/*===========================Programs & Courses Table===========================*/}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Program Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Code
                            </th>
                            <th className="text-ascend-black font-black">
                                Course Name
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {allCourses.length > 0 ? (
                            allCourses.map((c, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-ascend-lightblue"
                                >
                                    <td>{c.programName}</td>
                                    <td>{c.courseCode}</td>
                                    <td>{c.courseName}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-5 text-ascend-gray2 italic"
                                >
                                    No programs enrolled and courses assigned.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CoursesTable;
