import { useState, useEffect } from "react";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import { RiFeedbackFill } from "react-icons/ri";
import axios from "axios";
import { route } from "ziggy-js";
import { usePage } from "@inertiajs/react";
import useGetStudentAnalyticsFeedback from "../Hooks/useGetStudentAnalyticsFeedback";
import Loader from "../../../../../../../../../Components/Loader";

export default function QuizReponsesFeedback() {
    const { programId, courseId, assessment, responsesCount } = usePage().props;
    const [feedback, setFeedback] = useState(() => {
        if (assessment.feedback) {
            return JSON.parse(assessment.feedback).feedback;
        }

        return null;
    });

    // Custom hook
    const { handleGenerateFeedback, isLoading, error } =
        useGetStudentAnalyticsFeedback({
            programId,
            courseId,
            assessmentId: assessment.assessment_id,
        });

    return (
        <div className="space-y-5 p-5 shadow-shadow1 border border-ascend-gray1">
            <div className="flex flex-wrap gap-5 items-center justify-between">
                <div className="flex items-end space-x-3">
                    <h1 className="text-size5 break-words font-semibold">
                        Feedback
                    </h1>
                    <span className="text-size3 text-ascend-gray3 mb-[2px]">
                        AI Generated
                    </span>
                </div>
                {responsesCount >= 10 && !isLoading && (
                    <PrimaryButton
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        doSomething={() => handleGenerateFeedback(setFeedback)}
                        icon={<RiFeedbackFill />}
                        text={"Generate Feedback"}
                    />
                )}
            </div>

            {isLoading && <Loader color="text-ascend-blue" />}

            {responsesCount < 10 && (
                <div
                    className={`w-full flex flex-col justify-center items-center h-full `}
                >
                    <div className="w-[300px] h-[200px] overflow-hidden rounded-lg">
                        <img
                            src={"/images/illustrations/not_enough_data.svg"}
                            alt="Image"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    <p className="text-size3 md:text-size5 sm:w-100 text-wrap text-center italic">
                        Not enough responses available to generate and update
                        feedback. Please try again once more data is collected.
                    </p>
                </div>
            )}

            {error && !isLoading && (
                <div
                    className={`w-full flex flex-col justify-center items-center h-full `}
                >
                    <div className="w-[300px] h-[200px] overflow-hidden rounded-lg">
                        <img
                            src={"/images/illustrations/not_enough_data.svg"}
                            alt="Image"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    <p className="text-size3 md:text-size5 sm:w-100 text-wrap text-center italic">
                        {error}
                    </p>
                </div>
            )}

            {feedback && !error && !isLoading && (
                <>
                    <div className="space-y-2">
                        <h1 className="text-size3 break-words font-semibold">
                            Performance Summary
                        </h1>
                        <p className="text-justify">
                            {feedback ? feedback.performance_summary : ""}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-size3 break-words font-semibold">
                            Performance Analysis
                        </h1>
                        <p className="text-justify">
                            {feedback ? feedback.performance_analysis : ""}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-size3 break-words font-semibold">
                            Suggestions
                        </h1>

                        <ol className="list-decimal ml-5">
                            {feedback &&
                                feedback.suggestions.length > 0 &&
                                feedback.suggestions.map((suggestion) => (
                                    <li>{suggestion}</li>
                                ))}
                        </ol>
                    </div>
                </>
            )}
        </div>
    );
}
