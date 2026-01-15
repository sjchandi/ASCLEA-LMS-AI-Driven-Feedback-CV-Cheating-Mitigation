import { useState, useEffect } from "react";
import BackButton from "../../../../../../../../Components/Button/BackButton";
import { handleClickBackBtn } from "../../../../../../../../Utils/handleClickBackBtn";
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import { hasText } from "../../../../../../../../Utils/hasText";
import PrimaryButton from "../../../../../../../../Components/Button/PrimaryButton";
import { AiFillCheckCircle } from "react-icons/ai";
import AlertModal from "../../../../../../../../Components/AlertModal";
import useQuizAnswerForm from "./Hooks/useQuizAnswerForm";
import { convertDurationMinutes } from "../../../../../../../../Utils/convertDurationMinutes";

export default function QuizInstruction({
    courseId,
    quiz,
    assessment,
    assessmentSubmission,
}) {
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [duration, setDuration] = useState("");

    // Set the over duedate when the user has not starter the quiz and due dat isover
    const [isOverDueDate, setIsOverDueDate] = useState(
        !assessmentSubmission && assessment.due_datetime
            ? new Date() > new Date(assessment.due_datetime)
            : null
    );

    // Custom hook
    const { navigateQuizAnswerForm, isLoading } = useQuizAnswerForm();

    const handleStartCLick = () => {
        if (quiz.cheating_mitigation == true) {
            setOpenAlertModal(true);
        } else {
            navigateQuizAnswerForm({
                courseId: courseId,
                assessmentId: assessment.assessment_id,
                quizId: quiz.quiz_id,
            });
        }
    };

    useEffect(() => {
        const { hours, minutes } = convertDurationMinutes(quiz.duration);

        setDuration(
            `${hours > 0 ? `${hours} ${hours > 1 ? "hours" : "hour"}` : ""} ${
                minutes > 0
                    ? `${hours > 0 ? "and" : ""} ${minutes} ${
                          minutes > 1 ? "minutes" : "minute"
                      }`
                    : ""
            }`
        );
    }, []);

    return (
        <>
            {console.log(isLoading)}
            {openAlertModal && (
                <AlertModal
                    title={"Reminder"}
                    customBody={
                        <div className="space-y-3">
                            <h1>
                                This exam is being monitored for suspicious
                                behavior using your webcam and AI-based
                                detection. The following security measures are
                                in place:
                            </h1>
                            <ol className="list-decimal list-outside pl-4 space-y-1">
                                <li>
                                    Your webcam must remain active throughout
                                    the exam.
                                </li>
                                <li>
                                    The system uses AI to detect suspicious
                                    movements such as looking away from the
                                    screen, use of unauthorized materials, or
                                    absence from camera view.
                                </li>
                                <li>
                                    The system may capture screenshots during
                                    the exam if suspicious activity is
                                    identified. These will be reviewed by
                                    authorized academic personnel for possible
                                    violations.
                                </li>
                                <li>
                                    Any behavior violating exam policies may
                                    result in review, penalties, or
                                    disqualification.
                                </li>
                            </ol>

                            <h1>
                                By continuing, you agree to abide by the rules
                                and consent to camera-based monitoring and
                                automated analysis during the exam.
                            </h1>
                        </div>
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() => {
                        navigateQuizAnswerForm({
                            courseId: courseId,
                            assessmentId: assessment.assessment_id,
                            quizId: quiz.quiz_id,
                        });
                        setOpenAlertModal(false);
                    }}
                    isLoading={isLoading}
                />
            )}
            <div className="text-ascend-black space-y-5 font-nunito-sans">
                <div className="flex">
                    <BackButton doSomething={handleClickBackBtn} />
                </div>

                <div className="flex flex-col space-y-5 pb-5 border-b border-ascend-gray1">
                    <div className="flex flex-col space-y-2">
                        <div className="w-full min-w-0 flex flex-wrap justify-between items-center gap-5">
                            <h1 className="text-size6 break-words font-semibold">
                                {quiz.quiz_title}
                            </h1>
                            <div className="flex flex-wrap justify-between space-x-5">
                                <h1 className="font-bold">
                                    Duration: {duration}
                                </h1>
                                <h1 className="font-bold">
                                    Total points: {quiz.quiz_total_points}
                                </h1>
                            </div>
                        </div>
                        {quiz.cheating_mitigation == true && (
                            <h1 className="flex font-bold">
                                Cheating Mitigation:{" "}
                                <span className="flex items-center ml-2 text-ascend-green">
                                    <AiFillCheckCircle className="mr-1" />
                                    Enabled
                                </span>
                            </h1>
                        )}
                    </div>
                    {hasText(quiz.quiz_description) && (
                        <ReactQuill
                            value={DOMPurify.sanitize(quiz.quiz_description)}
                            readOnly={true}
                            theme={"bubble"}
                        />
                    )}
                </div>

                <div className="flex w-full justify-end">
                    <PrimaryButton
                        isDisabled={isOverDueDate}
                        text={"Start"}
                        doSomething={handleStartCLick}
                    />
                </div>

                {/* 
            <div className="flex flex-wrap justify-between">
                <h1 className="font-bold">
                    Possible Points: {assessment.total_points}
                </h1>
                <h1 className="font-bold">
                    {assessment.due_datetime
                        ? `Due on
                                ${formatDueDateTime(assessment.due_datetime)}`
                        : "No due date"}
                </h1>
            </div> */}
            </div>
        </>
    );
}
