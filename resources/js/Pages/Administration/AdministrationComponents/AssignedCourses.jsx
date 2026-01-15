import React from "react";
import { usePage, router } from "@inertiajs/react";
import EmptyState from "../../../Components/EmptyState/EmptyState";
import Pagination from "@/Components/Pagination";

export default function AssignedCourses() {
    const { assignedCourses } = usePage().props;

    return (
        <div className="font-nunito-sans space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-size6 font-bold">Assigned Courses</h1>
            </div>
            {/*===========================Assigned Courses Table===========================*/}
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
                        {assignedCourses?.data &&
                        assignedCourses.data.length > 0 ? (
                            assignedCourses.data.map((course, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-ascend-lightblue cursor-pointer"
                                >
                                    <td>{course.program_name}</td>
                                    <td>{course.course_code}</td>
                                    <td>{course.course_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3}>
                                    <EmptyState
                                        imgSrc={
                                            "/images/illustrations/not_assigned.svg"
                                        }
                                        text={`No assigned courses found. Head over to Programs to assign a course.`}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/*===========================Pagination: only show if there are courses===========================*/}

            {assignedCourses?.data &&
                assignedCourses.data.length > 0 &&
                assignedCourses?.last_page > 1 && ( // ⬅ only show if more than 1 page
                    <Pagination
                        links={assignedCourses.links}
                        currentPage={assignedCourses.current_page}
                        lastPage={assignedCourses.last_page}
                        only={["assignedCourses"]}
                    />
                )}
        </div>
    );
}
