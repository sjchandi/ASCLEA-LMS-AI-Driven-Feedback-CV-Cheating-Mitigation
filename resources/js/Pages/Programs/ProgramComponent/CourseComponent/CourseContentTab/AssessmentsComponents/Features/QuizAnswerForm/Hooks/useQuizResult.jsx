import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { displayToast } from "../../../../../../../../../Utils/displayToast";
import DefaultCustomToast from "../../../../../../../../../Components/CustomToast/DefaultCustomToast";

export default function useQuizResult() {
    const [isResetLoading, setIsResetLoading] = useState(false);

    const handleViewResult = (
        courseId,
        assessmentId,
        quizId,
        assessmentSubmissionId
    ) => {
        router.visit(
            route("quizzes.quiz.result", {
                course: courseId,
                assessment: assessmentId,
                quiz: quizId,
                assessmentSubmission: assessmentSubmissionId,
            }),
            { replace: true }
        );
    };

    const handleResetStudentResponse = (
        courseId,
        quizId,
        assessmentId,
        assessmentSubmissionId,
        setIsAlertModalOpen
    ) => {
        setIsResetLoading(true);
        router.delete(
            route("reset.student.assessment.submission", {
                course: courseId,
                quiz: quizId,
                assessment: assessmentId,
                assessmentSubmission: assessmentSubmissionId,
            }),
            {
                showProgress: false,
                onSuccess: (page) => {
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.success}
                        />,
                        "success"
                    );
                },
                onFinish: () => {
                    setIsResetLoading(false);
                    setIsAlertModalOpen(false);
                },
            }
        );
    };

    return { handleViewResult, handleResetStudentResponse, isResetLoading };
}
