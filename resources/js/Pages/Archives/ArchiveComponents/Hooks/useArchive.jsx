import { useState, useMemo, useEffect } from "react";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import { displayToast } from "../../../../Utils/displayToast";
import DefaultCustomToast from "../../../../Components/CustomToast/DefaultCustomToast";
import { debounce } from "lodash";

export default function useArchive() {
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState("");

    // Course
    const handleRestoreCourse = (promgramId, courseId) => {
        setIsLoading(true);
        router.put(
            route("program.course.restore", {
                program: promgramId,
                course: courseId,
            }),
            {},
            {
                showProgress: false,
                only: ["archivedCourses", "flash"],
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.success}
                        />,
                        "success"
                    );
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    // Adminsitration
    const handleRestoreStaff = (staffId, setOpenAlertModal) => {
        setIsLoading(true);
        router.put(
            route("staff.restore", {
                id: staffId,
            }),
            {},
            {
                showProgress: false,
                only: ["archivedStaff", "flash"],
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.success}
                        />,
                        "success"
                    );
                    setOpenAlertModal(false);
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    // Students
    const handleRestoreStudent = (studentId, setOpenAlertModal) => {
        setIsLoading(true);
        router.put(
            route("student.restore", {
                student: studentId,
            }),
            {},
            {
                showProgress: false,
                only: ["archivedStudents", "flash"],
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.success}
                        />,
                        "success"
                    );
                    setOpenAlertModal(false);
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    // Search

    const debounceHandleSearch = useMemo(() => {
        const handleSearch = (e) => {
            setSearch(e.target.value);
        };

        return debounce(handleSearch, 300);
    }, []);

    useEffect(() => {
        return () => debounceHandleSearch.cancel();
    }, []);

    const searchName = (only) => {
        const query = {};

        if (search.trim()) query.search = search.trim();

        router.get(
            route("archives.index", { _query: query }),
            {},
            {
                showProgress: false,
                preserveScroll: true,
                preserveState: true,
                only: [only],
            }
        );
    };

    return {
        isLoading,
        handleRestoreCourse,
        handleRestoreStaff,
        handleRestoreStudent,
        search,
        debounceHandleSearch,
        searchName,
    };
}
