import { useState, useEffect } from "react";
import useQuizAnswerForm from "../Hooks/useQuizAnswerForm";
import { usePage } from "@inertiajs/react";

export default function QuestionItem({
    questionDetails,
    requiredError,
    index,
    currentPage = 1,
}) {
    const { assessmentSubmission, courseId } = usePage().props;

    // Custom hook
    const { handleAnswerQuestion } = useQuizAnswerForm();

    const [answer, setAnswer] = useState(
        questionDetails.student_answer
            ? questionDetails.question_type !== "identification"
                ? questionDetails.student_answer.answer_id
                : questionDetails.student_answer.answer_text
            : ""
    );

    // Caculate the question number
    // This is for when qquestions was randomized since we cant use
    // the question sort_order value
    const pageSize = 10;
    const questioNumber = pageSize * (currentPage - 1) + index + 1;

    return (
        <div className="p-5 shadow-shadow1 border border-ascend-gray1 space-y-5">
            <div className="flex">
                {`${questioNumber}.`}
                <div className="w-full min-w-0 ml-2 space-y-5">
                    <div className="flex items-start gap-2 md:gap-20">
                        <p className="flex-1 min-w-0 break-words">
                            {questionDetails.question}

                            {questionDetails.is_required == true && (
                                <span className="text-ascend-red ml-1">*</span>
                            )}
                        </p>

                        <span className="font-bold">
                            {questionDetails.question_points
                                ? `${questionDetails.question_points} ${
                                      questionDetails.question_points > 1
                                          ? "pts"
                                          : "pt"
                                  }`
                                : ""}
                        </span>
                    </div>

                    {/* Option list */}
                    <div className="flex flex-col space-y-4">
                        {questionDetails.question_type === "multiple_choice" ||
                        questionDetails.question_type === "true_or_false" ? (
                            questionDetails.options.length > 0 &&
                            questionDetails.options.map((option) => (
                                <label
                                    key={option.question_option_id}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name={questionDetails.question_id}
                                        value={option.option_text}
                                        checked={
                                            answer === option.question_option_id
                                        }
                                        className="w-5 h-5 accent-ascend-blue shrink-0"
                                        onChange={() =>
                                            handleAnswerQuestion(
                                                option.question_option_id,
                                                setAnswer,
                                                courseId,
                                                assessmentSubmission.assessment_submission_id,
                                                questionDetails.question_id
                                            )
                                        }
                                    />
                                    <span className="ml-3 min-w-0 break-words">
                                        {option.option_text}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter answer"
                                value={answer}
                                onChange={(e) =>
                                    handleAnswerQuestion(
                                        e.target.value,
                                        setAnswer,
                                        courseId,
                                        assessmentSubmission.assessment_submission_id,
                                        questionDetails.question_id
                                    )
                                }
                                className="p-2 h-9 w-full border border-ascend-gray1 focus:outline-ascend-blue"
                            />
                        )}
                    </div>
                </div>
            </div>
            <span className="text-ascend-red">{requiredError}</span>
        </div>
    );
}
