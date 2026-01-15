import { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { debounce } from "lodash";
import { displayToast } from "../../../../../../../../../Utils/displayToast";
import DefaultCustomToast from "../../../../../../../../../Components/CustomToast/DefaultCustomToast";
import useQuizAnswerStore from "../Stores/quizAnswerStore";
import useTabSwitchStore from "../Stores/useTabSwitchStore";
import saveAnswer from "../Services/quizAnswerService";
import useModulesStore from "../../../../ModulesComponents/Stores/modulesStore";
import { endCV } from "../../../../../../../../../Utils/cvController";

export default function useQuizAnswerForm() {
    const [questionRequiredError, setQuestionRequiredError] = useState(null);

    // Quiz answer store
    const updateStudentAnswer = useQuizAnswerStore(
        (state) => state.updateStudentAnswer
    );
    // Module store
    const unlockSectionAndSectionItems = useModulesStore(
        (state) => state.unlockSectionAndSectionItems
    );

    // Tab switch store
    const tabDetectionEnabled = useTabSwitchStore(
        (state) => state.tabDetectionEnabled
    );
    const setTabDetectionEnabled = useTabSwitchStore(
        (state) => state.setTabDetectionEnabled
    );

    const studentAnswers = useQuizAnswerStore((state) => state.studentAnswers);
    const isLoading = useQuizAnswerStore((state) => state.isLoading);
    const setIsLoading = useQuizAnswerStore((state) => state.setIsLoading);
    const setRemainingTime = useQuizAnswerStore(
        (state) => state.setRemainingTime
    );

    // This is used for navigating the pagination of quiz answer form
    // Has a parameter of page for getting the next or prev page
    // preserveUrl is used to prevent displaying the current page in the url
    const navigateQuizAnswerForm = ({
        courseId,
        assessmentId,
        quizId,
        page,
        isForBackBtn = false,
    }) => {
        if (isForBackBtn) {
            router.visit(
                route("assessment.quizzes.quiz", {
                    course: courseId,
                    assessment: assessmentId,
                    quiz: quizId,
                    page: page,
                }),
                { preserveState: true }
            );
        } else {
            window.open(
                route("assessment.quizzes.quiz", {
                    course: courseId,
                    assessment: assessmentId,
                    quiz: quizId,
                    page: page,
                }),

                "_blank"
            );
        }
    };

    // WEe have to validate if user fill all the required questiosns
    // before navigating to next page of the quiz
    const handleValidateRequiredQuestion = ({
        courseId,
        assessmentId,
        quizId,
        assessmentSubmissionId,
        page,
    }) => {
        if (!isLoading) {
            router.post(
                route("assessment.quiz.validate", {
                    course: courseId,
                    assessment: assessmentId,
                    quiz: quizId,
                    assessmentSubmission: assessmentSubmissionId,
                }),
                { page, answers: studentAnswers },
                {
                    only: ["questions"],
                    onError: (e) => {
                        console.error(e);
                        setQuestionRequiredError(e);
                        displayToast(
                            <DefaultCustomToast
                                message={"Some required questions are missing."}
                            />,
                            "error"
                        );
                    },
                    onSuccess: () => {
                        setQuestionRequiredError(null);
                    },
                }
            );
        }
    };

    const handleAnswerQuestion = (
        answer,
        setAnswer,
        courseId,
        assessmentSubmissionId,
        questionId
    ) => {
        setAnswer(answer);

        debouncedSaveAnswer(
            answer,
            courseId,
            assessmentSubmissionId,
            questionId
        );
    };

    const debouncedSaveAnswer = useMemo(
        () =>
            debounce(
                async (
                    answer,
                    courseId,
                    assessmentSubmissionId,
                    questionId
                ) => {
                    try {
                        setIsLoading(true);

                        const response = await saveAnswer({
                            courseId: courseId,
                            assessmentSubmissionId: assessmentSubmissionId,
                            questionId: questionId,
                            answer: answer,
                        });

                        console.log(response);
                        updateStudentAnswer(questionId, response.data.answer);
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setIsLoading(false);
                    }
                },
                300
            ),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSaveAnswer.cancel();
        };
    }, [debouncedSaveAnswer]);

    const submitQuiz = ({
        courseId,
        assessmentId,
        quizId,
        assessmentSubmissionId,
        cheating_mitigation,
        isTimerEnded = false,
    }) => {
        if (!isLoading) {
            router.post(
                route("quizzes.quiz.submit", {
                    course: courseId,
                    assessment: assessmentId,
                    quiz: quizId,
                    assessmentSubmission: assessmentSubmissionId,
                }),
                { answers: studentAnswers, isTimerEnded },
                {
                    only: ["questions"],
                    onError: (e) => {
                        console.error(e);
                        setQuestionRequiredError(e);
                        displayToast(
                            <DefaultCustomToast
                                message={"Some required questions are missing."}
                            />,
                            "error"
                        );
                    },
                    onSuccess: (page) => {
                        console.log(page);
                        if (page.props.assessment.section_item) {
                            const studentProgress =
                                page.props.assessment.section_item
                                    .student_progress;

                            unlockSectionAndSectionItems(
                                courseId,
                                page.props.assessment.section_item.section_id,
                                page.props.assessment.section_item
                                    .section_item_id,
                                studentProgress
                            );
                        }
                        if (
                            cheating_mitigation == true &&
                            typeof endCV === "function"
                        ) {
                            // Stopping CV if it's enabled
                            endCV();
                            setTabDetectionEnabled(false);
                        }

                        setQuestionRequiredError(null);
                        setRemainingTime(null);
                    },
                }
            );
        }
    };

    return {
        navigateQuizAnswerForm,
        isLoading,
        handleAnswerQuestion,
        debouncedSaveAnswer,
        handleValidateRequiredQuestion,
        questionRequiredError,
        submitQuiz,
    };
}
