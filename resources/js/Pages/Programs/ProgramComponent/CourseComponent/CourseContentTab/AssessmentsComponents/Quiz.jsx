import React from "react";
import { SiGoogleforms } from "react-icons/si";
import { router } from "@inertiajs/react";
import { useRoute } from "ziggy-js";
import { usePage } from "@inertiajs/react";

export default function Quiz({ asssessment, quizDetails }) {
    const route = useRoute();
    console.log(quizDetails);

    console.log(usePage().props);

    const { auth, courseId } = usePage().props;

    const handleQuizClick = () => {
        if (auth.user.role_name === "student") {
            router.visit(
                route("assessment.quiz.instruction", {
                    course: courseId,
                    assessment: quizDetails.assessment_id,
                    quiz: quizDetails.quiz_id,
                })
            );
        } else if (
            auth.user.user_id === asssessment.created_by ||
            auth.user.role_name === "admin"
        ) {
            router.visit(
                route("assessment.quiz-form.edit", {
                    assessment: quizDetails.assessment_id,
                    quiz: quizDetails.quiz_id,
                })
            );
        }
    };

    return (
        <div
            onClick={handleQuizClick}
            className={`flex h-15 items-center space-x-4 p-2 border border-ascend-gray1 bg-ascend-white ${
                auth.user.role_name === "student" ||
                auth.user.user_id === asssessment.created_by ||
                auth.user.role_name === "admin"
                    ? "hover-change-bg-color cursor-pointer"
                    : ""
            }`}
        >
            <div className="w-full flex overflow-hidden font-semibold font-nunito-sans text-ascebd-black">
                <SiGoogleforms
                    className={`shrink-0 text-ascend-blue text-size5`}
                />
                <h4 className="ml-2 truncate">{quizDetails.quiz_title}</h4>
            </div>
        </div>
    );
}
