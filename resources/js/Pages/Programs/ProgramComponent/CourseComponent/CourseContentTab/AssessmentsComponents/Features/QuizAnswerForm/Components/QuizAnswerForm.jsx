import { useEffect } from "react";
import QuizAnswerFormNav from "./QuizAnswerFormNav";
import QuestionItem from "./QuestionItem";
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import { hasText } from "../../../../../../../../../Utils/hasText";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import SecondaryButton from "../../../../../../../../../Components/Button/SecondaryButton";
import useQuizAnswerForm from "../Hooks/useQuizAnswerForm";
import useQuizAnswerStore from "../Stores/quizAnswerStore";

export default function QuizAnswerForm({
    courseId,
    assessmentId,
    quiz,
    questions,
    assessmentSubmission,
}) {
    // Custom hook
    const {
        navigateQuizAnswerForm,
        handleValidateRequiredQuestion,
        questionRequiredError,
        submitQuiz,
    } = useQuizAnswerForm();

    // Quiz answer store
    const initializeStudentAnswers = useQuizAnswerStore(
        (state) => state.initializeStudentAnswers
    );
    const studentAnswers = useQuizAnswerStore((state) => state.studentAnswers);

    // Initalize the student answers
    // this will be use as a payload to validate if user answer all the required questions
    useEffect(() => {
        initializeStudentAnswers(
            questions.data.map((q) => {
                return {
                    question_id: q.question_id,
                    is_required: q.is_required,
                    student_answer: q.student_answer,
                };
            })
        );
    }, [questions.data]);

    const handleNextOrSubmit = async () => {
        if (questions.current_page === questions.last_page) {
            submitQuiz({
                courseId: courseId,
                assessmentId: assessmentId,
                quizId: quiz.quiz_id,
                cheating_mitigation: quiz.cheating_mitigation,
                assessmentSubmissionId:
                    assessmentSubmission.assessment_submission_id,
            });
        } else {
            handleValidateRequiredQuestion({
                courseId: courseId,
                assessmentId: assessmentId,
                quizId: quiz.quiz_id,
                assessmentSubmissionId:
                    assessmentSubmission.assessment_submission_id,
                page: questions.current_page + 1,
            });
        }
    };

    return (
        <div className="font-nunito-sans space-y-5">
            <QuizAnswerFormNav />

            <main className="flex justify-center px-5 pb-5 lg:px-[150px]">
                <div className="w-full max-w-235 space-y-5">
                    <div className="w-full space-y-5 border border-ascend-gray1 shadow-shadow1 p-5">
                        <h1 className="font-bold text-size6 whitespace-normal break-words">
                            {quiz.quiz_title}
                        </h1>
                        {hasText(quiz.quiz_description) && (
                            <ReactQuill
                                value={DOMPurify.sanitize(
                                    quiz.quiz_description
                                )}
                                readOnly={true}
                                theme={"bubble"}
                            />
                        )}
                    </div>

                    {/* Questions here */}
                    {questions &&
                        questions.data.length > 0 &&
                        questions.data.map((question, index) => (
                            <QuestionItem
                                key={question.question_id}
                                questionDetails={question}
                                index={index}
                                currentPage={questions.current_page}
                                requiredError={
                                    questionRequiredError &&
                                    questionRequiredError[question.question_id]
                                        ? questionRequiredError[
                                              question.question_id
                                          ]
                                        : ""
                                }
                            />
                        ))}

                    <div className="flex justify-end space-x-2 w-full">
                        {questions.current_page > 1 && (
                            <SecondaryButton
                                doSomething={() =>
                                    navigateQuizAnswerForm({
                                        courseId: courseId,
                                        assessmentId: assessmentId,
                                        quizId: quiz.quiz_id,
                                        page: questions.current_page - 1,
                                        isForBackBtn: true,
                                    })
                                }
                                text={"Back"}
                            />
                        )}
                        <PrimaryButton
                            doSomething={handleNextOrSubmit}
                            text={
                                questions.current_page < questions.last_page
                                    ? "Next"
                                    : "Submit"
                            }
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

QuizAnswerForm.layout = null;
