import { useState } from "react";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import EmptyState from "../../../../../../../../../Components/EmptyState/EmptyState";
import { formatDueDateTime } from "../../../../../../../../../Utils/formatDueDateTime";
import useQuizResult from "../Hooks/useQuizResult";
import AlertModal from "../../../../../../../../../Components/AlertModal";

export default function QuizSubmitted({
    courseId,
    assessment,
    quiz,
    assessmentSubmission,
}) {
    // Custom hook
    const { handleViewResult } = useQuizResult();

    const [openAlertModal, setOpenAlertModal] = useState(false);

    const clickViewResult = () => {
        // Show consent modal if quiz result viewing is enable
        // And the feedback is not yet  generated
        if (quiz.show_answers_after && !assessmentSubmission.feedback) {
            setOpenAlertModal(true);
        } else {
            handleViewResult(
                courseId,
                assessment.assessment_id,
                quiz.quiz_id,
                assessmentSubmission.assessment_submission_id
            );
        }
    };

    return (
        <>
            {openAlertModal && (
                <AlertModal
                    title={" Consent for AI-Generated Feedback"}
                    customBody={
                        <div className="space-y-3">
                            <p>
                                To help improve your learning experience, this
                                system uses Artificial Intelligence (AI) to
                                analyze your quiz results and generate
                                personalized feedback based on your performance.
                            </p>
                            <ol className="list-decimal list-outside pl-4 space-y-1">
                                <li>
                                    Your quiz responses and scores may be
                                    processed by an AI system to generate
                                    automated academic feedback.
                                </li>
                                <li>
                                    The data used is limited to your quiz
                                    results and related performance metrics.
                                </li>
                                <li>
                                    The AI-generated feedback is intended for
                                    learning support and guidance only.
                                </li>
                            </ol>

                            <p>
                                By continuing, you confirm that you understand
                                and consent to the use of your quiz result data
                                for AI-based analysis and feedback generation.
                            </p>
                        </div>
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() => {
                        handleViewResult(
                            courseId,
                            assessment.assessment_id,
                            quiz.quiz_id,
                            assessmentSubmission.assessment_submission_id
                        );
                        setOpenAlertModal(false);
                    }}
                />
            )}
            <div className="text-ascend-black space-y-5 font-nunito-sans bg-ascend-white px-5 lg:px-[100px] py-5">
                <div className="w-full min-w-0 flex flex-wrap justify-between items-center gap-5">
                    <h1 className="text-size6 font-semibold break-all">
                        {quiz.quiz_title}
                    </h1>

                    <div className="flex flex-wrap justify-between space-x-5">
                        <h1 className="font-bold">
                            Submitted on:{" "}
                            {formatDueDateTime(
                                assessmentSubmission.submitted_at
                            )}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-5">
                    <EmptyState
                        imgSrc={"/images/illustrations/completed.svg"}
                        text={
                            quiz && quiz.show_answers_after
                                ? `“You've already completed this quiz. You can go ahead and review your responses”`
                                : `“You've already completed this quiz.”`
                        }
                    />

                    {quiz && quiz.show_answers_after && (
                        <div className="flex justify-center w-full">
                            <PrimaryButton
                                doSomething={clickViewResult}
                                text={"View Results"}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

QuizSubmitted.layout = null;
