import { useEffect, useState } from "react";
import { calcPercentage } from "../../../../../../../../../Utils/calcPercentage";
import { Doughnut } from "react-chartjs-2";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import Loader from "../../../../../../../../../Components/Loader";
import useGetQUizResultFeedback from "../Hooks/useGetQUizResultFeedback";
import { cleanDecimal } from "../../../../../../../../../Utils/cleanDecimal";
import { convertDurationMinutes } from "../../../../../../../../../Utils/convertDurationMinutes";

export default function ResultFeedback({
    courseId,
    assessment,
    quiz,
    assessmentSubmission,
}) {
    // Custom hook
    const { handdleGetFeedback, isLoading, error, feedback } =
        useGetQUizResultFeedback({
            courseId: courseId,
            assessmentId: assessment.assessment_id,
            quizId: quiz.quiz_id,
            assessmentSubmissionId:
                assessmentSubmission.assessment_submission_id,
        });

    const percentage = calcPercentage(
        assessmentSubmission.score,
        quiz.quiz_total_points
    );

    const { hours, minutes } = convertDurationMinutes(
        assessmentSubmission.time_spent
    );

    // Get ai feedback once the component was rendered
    useEffect(() => {
        handdleGetFeedback();
    }, []);

    return (
        <div className="w-full space-y-5 border border-ascend-gray1 shadow-shadow1 p-5">
            <h1 className="font-bold text-size6">Result</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 space-x-0 lg:space-x-5 space-y-5 lg:space-y-0">
                <div className="col-span-1 flex flex-col items-center space-y-5">
                    <div className="relative w-40 h-40">
                        <Doughnut
                            data={{
                                labels: [],
                                datasets: [
                                    {
                                        data: [percentage, 100 - percentage],
                                        backgroundColor: ["#01007d", "#E0E0E0"],
                                        borderWidth: 0,
                                    },
                                ],
                            }}
                            options={{
                                cutout: "75%",
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { enabled: false },
                                },
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex justify-center w-30 items-center flex-col">
                                <h1 className="text-size6 font-bold text-ascend-black">
                                    {percentage}%
                                </h1>
                                <p className="text-size1 text-ascend-black text-center">
                                    {cleanDecimal(assessmentSubmission.score)}{" "}
                                    out of {quiz.quiz_total_points}
                                </p>
                            </div>
                        </div>
                    </div>
                    {quiz.duration > 0 && (
                        <div className="flex space-x-5 w-full">
                            <MdOutlineAccessTimeFilled className="text-ascend-blue text-5xl" />
                            <div>
                                <h1>Time Spent</h1>
                                {assessmentSubmission.time_spent > 0 ? (
                                    <p className="font-bold">
                                        {hours > 0
                                            ? hours === 1
                                                ? `${hours} hour`
                                                : `${hours} hours`
                                            : ""}
                                        {minutes > 0
                                            ? minutes === 1
                                                ? ` ${
                                                      hours > 0 ? "and" : ""
                                                  } ${minutes} minute`
                                                : ` ${
                                                      hours > 0 ? "and" : ""
                                                  } ${minutes} minutes`
                                            : ""}
                                    </p>
                                ) : (
                                    <p className="font-bold">0</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-span-2 flex flex-col space-y-5">
                    <h1 className="font-bold text-size5">
                        Feedback{" "}
                        <span className="text-size2 font-normal">
                            AI Generated
                        </span>
                    </h1>

                    {/* Displays error message */}
                    {error && (
                        <div
                            className={`w-full flex flex-col justify-center items-center h-full `}
                        >
                            <div className="w-[300px] h-[200px] overflow-hidden rounded-lg">
                                <img
                                    src={"/images/illustrations/error.svg"}
                                    alt="Image"
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>

                            <p className="text-size3 md:text-size5 sm:w-100 text-wrap text-center italic">
                                {error}
                            </p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader color="text-ascend-blue" />
                        </div>
                    ) : (
                        feedback && (
                            <div className="space-y-5">
                                {feedback.strengths &&
                                    feedback.strengths.length > 0 && (
                                        <div>
                                            <h1 className="font-bold text-size4">
                                                Strengths
                                            </h1>
                                            <ol className="list-decimal ml-5">
                                                {feedback.strengths.map(
                                                    (strength, index) => (
                                                        <li key={index}>
                                                            {strength}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </div>
                                    )}

                                {feedback.weaknesses &&
                                    feedback.weaknesses.length > 0 && (
                                        <div>
                                            <h1 className="font-bold text-size4">
                                                Weaknesses
                                            </h1>
                                            <ol className="list-decimal ml-5">
                                                {feedback.weaknesses.map(
                                                    (weakness, index) => (
                                                        <li key={index}>
                                                            {weakness}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </div>
                                    )}

                                {feedback.suggestions &&
                                    feedback.suggestions.length > 0 && (
                                        <div>
                                            <h1 className="font-bold text-size4">
                                                Suggestions
                                            </h1>
                                            <ol className="list-decimal ml-5">
                                                {feedback.suggestions.map(
                                                    (suggestion, index) => (
                                                        <li key={index}>
                                                            {suggestion}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </div>
                                    )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
