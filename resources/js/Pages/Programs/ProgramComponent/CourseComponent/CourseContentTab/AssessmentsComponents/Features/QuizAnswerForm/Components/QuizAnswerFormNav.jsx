import { useEffect, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { usePage } from "@inertiajs/react";
import useQuizAnswerForm from "../Hooks/useQuizAnswerForm";
import useQuizAnswerStore from "../Stores/quizAnswerStore";
import useTabSwitchStore from "../Stores/useTabSwitchStore";
import BackButton from "../../../../../../../../../Components/Button/BackButton";
import { handleClickBackBtn } from "../../../../../../../../../Utils/handleClickBackBtn";
import RoleGuard from "../../../../../../../../../Components/Auth/RoleGuard";
import CvMonitor from "../../../../../../../../../Components/CheatingMitigation/CV_Indicator";
import TabSwitchingDetector from "../../../../../../../../../Components/CheatingMitigation/TabSwitchingDetector";
import { endCV } from "../../../../../../../../../Utils/cvController";

export default function QuizAnswerFormNav() {
    const { courseId, assessmentId, assessmentSubmission, quiz, quizOptions } =
        usePage().props;

    // States
    const [isScrolledDown, setIsScrolledDown] = useState(false);

    // Custom hook
    const { submitQuiz } = useQuizAnswerForm();

    // Timer to start quiz with cv
    const [faceDetected, setFaceDetected] = useState(false);
    const cvOptions = quizOptions?.map((o) => o.options) || [];


    // Quiz answer store
    const remainingTime = useQuizAnswerStore((state) => state.remainingTime);
    const setRemainingTime = useQuizAnswerStore(
        (state) => state.setRemainingTime
    );

    // Tab switch store
    const tabDetectionEnabled = useTabSwitchStore(
        (state) => state.tabDetectionEnabled
    );

    const timer = (end) => {
        const interval = setInterval(async () => {
            const now = new Date().getTime() / 1000;
            const diff = end - now;

            if (diff <= 0) {
                clearInterval(interval);

                if (
                    quiz.cheating_mitigation == 1 &&
                    typeof endCV === "function"
                ) {
                    await endCV();
                    setTabDetectionEnabled(false);
                } // Stopping CV and tab switching detector after time ends

                submitQuiz({
                    courseId,
                    assessmentId,
                    quizId: quiz.quiz_id,
                    assessmentSubmissionId:
                        assessmentSubmission.assessment_submission_id,
                    isTimerEnded: true,
                });
                setRemainingTime("00:00:00");
            } else {
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = Math.floor(diff % 60);

                setRemainingTime(
                    `${String(hours).padStart(2, "0")}:${String(
                        minutes
                    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
                );
            }
        }, 1000);

        return interval;
    };

    useEffect(() => {
        if (
            quiz.cheating_mitigation == 0 &&
            quiz.duration > 0 &&
            !assessmentSubmission.submitted_at
        ) {
            const end = new Date(assessmentSubmission.end_at).getTime() / 1000;

            const interval = timer(end);

            return () => clearInterval(interval);
        }

        if (
            quiz.cheating_mitigation == 1 &&
            faceDetected &&
            quiz.duration > 0 &&
            !assessmentSubmission.submitted_at
        ) {
            const end = new Date(assessmentSubmission.end_at).getTime() / 1000;

            const interval = timer(end);

            return () => clearInterval(interval);
        }
    }, [faceDetected]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolledDown(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <nav
            className={`sticky top-0 z-998 bg-ascend-white transition-all duration-300 font-nunito-sans ${
                isScrolledDown ? "shadow-[0px_0px_15px_5px_#a1a1a1]" : ""
            }`}
        >
            <div className="relative sm:h-16 w-full flex gap-5 items-center justify-between px-5 lg:px-[100px]">
                <div
                    className={`flex h-20 items-center ${
                        assessmentSubmission.submitted_at
                            ? "justify-start"
                            : "justify-center"
                    } sm:justify-between gap-5 w-full`}
                >
                    <img
                        src="/images/ascend_logo.png"
                        alt=""
                        className={`w-30 ${
                            // Display the logo in the quiz result which is it's already submitted
                            assessmentSubmission.submitted_at
                                ? "block"
                                : "hidden"
                        } sm:block`}
                    />

                    {/* Only display when the quiz hasnt been submitted */}
                    {!assessmentSubmission.submitted_at && (
                        <div className="flex flex-wrap items-center space-x-5">
                            {quiz.cheating_mitigation == 1 && ( // Only show CV indicator if cheating mitigation is enabled
                                <div className="flex items-center">
                                    <CvMonitor
                                        onFaceDetected={() =>
                                            setFaceDetected(true)
                                        }
                                        options={cvOptions}
                                        assessmentSubmissionId={
                                            assessmentSubmission.assessment_submission_id
                                        }
                                        faceDetected={faceDetected}
                                    />

                                    <TabSwitchingDetector enabled={tabDetectionEnabled} 
                                    assessmentSubmissionId={
                                        assessmentSubmission.assessment_submission_id
                                    }
                                    
                                    />
                                    
                                </div>
                            )}

                            <span className="font-bold">
                                {remainingTime || ""}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <RoleGuard allowedRoles={["admin", "faculty"]}>
                <div className="px-5 lg:px-[100px] w-fit">
                    <BackButton doSomething={handleClickBackBtn} />
                </div>
            </RoleGuard>
        </nav>
    );
}
