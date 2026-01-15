import { useState, useEffect } from "react";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import RoleGuard from "../../../../../../../../../Components/Auth/RoleGuard";
import useUpdateStudentAnswerStatus from "../Hooks/useUpdateStudentAnswerStatus";
import { RiFeedbackFill } from "react-icons/ri";
import useGetPerQuestionFeedback from "../Hooks/useGetPerQuestionFeedback";

export default function QuestionResultItem({
    courseId,
    assessmentSubmission,
    questionDetails,
    user,
    assessment,
    index,
    currentPage = 1,
}) {
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(true);
    const [hasCorrectOption, setHasCorrectOption] = useState(false);
    const [feedback, setFeedBack] = useState(() => {
        if (questionDetails?.student_answer?.feedback) {
            return JSON.parse(questionDetails.student_answer.feedback).feedback;
        }
        return null;
    });

    // Custom hook
    const { handleUpdate, isLoading } = useUpdateStudentAnswerStatus({
        courseId: courseId,
        assessmentSubmissionId: assessmentSubmission.assessment_submission_id,
        questionId: questionDetails.question_id,
        studentQuizAnswerId: questionDetails.student_answer
            ? questionDetails.student_answer.student_quiz_answer_id
            : null,
    });
    const { handleGetFeedback, isGetFeedbackLoading } =
        useGetPerQuestionFeedback({
            courseId: courseId,
            assessmentSubmissionId:
                assessmentSubmission.assessment_submission_id,
            questionId: questionDetails.question_id,
            studentQuizAnswerId: questionDetails.student_answer
                ? questionDetails.student_answer.student_quiz_answer_id
                : null,
        });

    useEffect(() => {
        if (questionDetails.options) {
            const hasCorrectOption = questionDetails.options.some(
                (option) => option.is_correct === true
            );

            setHasCorrectOption(hasCorrectOption);

            if (hasCorrectOption && !questionDetails.student_answer) {
                setIsAnswerCorrect(false);
            } else if (hasCorrectOption && questionDetails.student_answer) {
                setIsAnswerCorrect(questionDetails.student_answer.is_correct);
            }
        }
    }, [questionDetails]);

    // Caculate the question number
    // This is for when qquestions was randomized since we cant use
    // the question sort_order value
    const pageSize = 10;
    const questioNumber = pageSize * (currentPage - 1) + index + 1;

    return (
        <div className="p-5 shadow-shadow1 border border-ascend-gray1 space-y-5">
            {hasCorrectOption &&
                (isAnswerCorrect ? (
                    <div className="flex justify-between">
                        <div className="bg-ascend-green w-fit px-2 py-1 flex items-center">
                            <h1 className="font-bold text-ascend-white">
                                Correct
                            </h1>
                        </div>
                        {questionDetails.student_answer &&
                            assessment.created_by === user.user_id && (
                                <RoleGuard allowedRoles={["admin", "faculty"]}>
                                    <PrimaryButton
                                        isDisabled={isLoading}
                                        isLoading={isLoading}
                                        doSomething={() => handleUpdate(false)}
                                        text={"Mark as Incorrect"}
                                    />
                                </RoleGuard>
                            )}
                    </div>
                ) : (
                    <div className="flex justify-between">
                        <div className="bg-ascend-red w-fit px-2 py-1 flex items-center">
                            <h1 className="font-bold text-ascend-white">
                                Incorrect
                            </h1>
                        </div>
                        {questionDetails.student_answer &&
                            assessment.created_by === user.user_id && (
                                <RoleGuard allowedRoles={["admin", "faculty"]}>
                                    <PrimaryButton
                                        isDisabled={isLoading}
                                        isLoading={isLoading}
                                        doSomething={() => handleUpdate(true)}
                                        text={"Mark as Correct"}
                                    />
                                </RoleGuard>
                            )}
                    </div>
                ))}
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
                            {questionDetails.question_points > 0 &&
                            isAnswerCorrect
                                ? `${questionDetails.question_points} / ${
                                      questionDetails.question_points
                                  } ${
                                      questionDetails.question_points > 1
                                          ? "pts"
                                          : "pt"
                                  }`
                                : questionDetails.question_points > 0 &&
                                  !isAnswerCorrect
                                ? `${0} / ${questionDetails.question_points} ${
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
                                    className={`flex items-center px-3 py-2 ${
                                        option.is_correct
                                            ? "bg-ascend-lightgreen border border-ascend-green"
                                            : ""
                                    } `}
                                >
                                    <input
                                        type="radio"
                                        name={questionDetails.question_id}
                                        value={option.option_text}
                                        checked={
                                            questionDetails.student_answer &&
                                            questionDetails.student_answer
                                                .answer_id ===
                                                option.question_option_id
                                        }
                                        disabled
                                        className="w-5 h-5 accent-ascend-blue shrink-0"
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
                                value={
                                    questionDetails.student_answer
                                        ? questionDetails.student_answer
                                              .answer_text
                                        : ""
                                }
                                disabled
                                className="p-2 h-9 w-full border border-ascend-gray1 focus:outline-ascend-blue"
                            />
                        )}
                    </div>
                </div>
            </div>

            <RoleGuard allowedRoles={["student"]}>
                <>
                    {questionDetails.question_type === "identification" && (
                        <div className="flex flex-wrap">
                            <h1 className="mr-2 font-bold text-ascend-green">
                                Correct answers:
                            </h1>
                            <p>
                                {questionDetails.options
                                    .filter((option) => option.is_correct)
                                    .map((option) => option.option_text)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {!feedback && questionDetails.student_answer && (
                        <div className="flex justify-end">
                            <PrimaryButton
                                isDisabled={isGetFeedbackLoading}
                                isLoading={isGetFeedbackLoading}
                                doSomething={() =>
                                    handleGetFeedback(setFeedBack)
                                }
                                icon={<RiFeedbackFill />}
                                text={"Generate Feedback"}
                            />
                        </div>
                    )}

                    {feedback && (
                        <div className="flex flex-col p-5 text-ascend-black space-y-5 shadow-shadow1 border border-ascend-gray1">
                            <div className="flex items-center space-x-2">
                                <RiFeedbackFill className="text-size5 text-ascend-blue" />
                                <h1 className="text-size4 font-bold">
                                    Feedback
                                </h1>
                                <span className="text-size1">AI Generated</span>
                            </div>
                            <p>{feedback}</p>
                        </div>
                    )}
                </>
            </RoleGuard>
        </div>
    );
}
