import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import Tabs from "../../Components/Tabs/Tabs";
import PendingPage from "./PendingPage/PendingPage";
import EnrolledPage from "./EnrolledPage/EnrolledPage";
import useActiveTabStore from "../../Stores/Admission/ActiveTabStore";
import useUserStore from "../../Stores/User/userStore";
import UnapprovedStudentAdmission from "./UnapprovedStudent/UnapprovedStudentAdmission";

const AdmissionPage = ({ student }) => {
    const user = useUserStore((state) => state.user);
    const { activeTab, setActiveTab } = useActiveTabStore();
    const { pendingStudents, enrolledStudents } = usePage().props;

    const [isLoading, setIsLoading] = useState(false);

    const tabs = ["Pending", "Enrolled Students"];

    const handleTabChange = (tabIndex) => {
        //if (activeTab === tabIndex) return;
        setActiveTab(tabIndex);
        setIsLoading(true);

        const onlyData = tabIndex === 0 ? ["pendingStudents"] : ["enrolledStudents"];

        router.get(
            route("admission.index"),
            {},
            {
                only: onlyData,
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <>
            {user && user?.role === "admin" ? (
                <div className="space-y-5">
                    <Tabs activeTab={activeTab} doSomething={handleTabChange} tabList={tabs} />

                    {/* Pending and Enrolled Tab */}
                    {!isLoading && activeTab === 0 && <PendingPage pendingStudents={pendingStudents} />}
                    {!isLoading && activeTab === 1 && <EnrolledPage enrolledStudents={enrolledStudents} role={user.role} />}
                </div>
            ) : user && user?.role === "faculty" ? (
                <EnrolledPage enrolledStudents={enrolledStudents} role={user.role} />
            ) : (
                <UnapprovedStudentAdmission student={student} />
            )}
        </>
    );
};

export default AdmissionPage;
