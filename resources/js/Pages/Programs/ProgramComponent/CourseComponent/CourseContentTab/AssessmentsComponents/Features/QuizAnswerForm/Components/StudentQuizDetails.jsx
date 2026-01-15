import { useEffect, useState } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { MdArrowUpward } from "react-icons/md";
import ViewEvidence from "./ViewEvidence";
import ViewTabEvidence from "./ViewTabEvidence";
import { calcPercentage } from "../../../../../../../../../Utils/calcPercentage";
import { convertDurationMinutes } from "../../../../../../../../../Utils/convertDurationMinutes";
import { cleanDecimal } from "../../../../../../../../../Utils/cleanDecimal";
import ProfileImage from "../../../../../../../../../Components/ProfileImage";
import PrimaryButton from "../../../../../../../../../Components/Button/PrimaryButton";
import AlertModal from "../../../../../../../../../Components/AlertModal";
import useQuizResult from "../Hooks/useQuizResult";
import { usePage } from "@inertiajs/react";

export default function StudentQuizDetails({
    assessmentSubmission,
    prevQuizAssessmentSubmitted,
    studentData,
    quiz,
    warningsCount,
}) {
    const { assessment, courseId, auth } = usePage().props;

    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const [tabSwitchEvidenceOpen, setTabSwitchEvidenceOpen] = useState(false);
    const [improvementRateDetails, setImprovementRateDetails] = useState({
        label: [],
        data: [],
        improvementPercent: 0,
    });
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    // Custom hook
    const { handleResetStudentResponse, isResetLoading } = useQuizResult();

    const calculateImprovementRate = () => {
        let improvementRateDetails = {};

        if (!prevQuizAssessmentSubmitted) {
            improvementRateDetails.label = ["No previous data"];
            improvementRateDetails.data = [0];
        } else {
            improvementRateDetails.label = ["Previous"];
            improvementRateDetails.data = [
                calcPercentage(
                    prevQuizAssessmentSubmitted.score,
                    prevQuizAssessmentSubmitted.assessment.quiz
                        .quiz_total_points
                ),
            ];
        }

        improvementRateDetails.label.push("Current");
        improvementRateDetails.data.push(
            calcPercentage(assessmentSubmission.score, quiz.quiz_total_points)
        );
        improvementRateDetails.improvementPercent =
            improvementRateDetails.data[1] - improvementRateDetails.data[0];

        return improvementRateDetails;
    };

    useEffect(() => {
        setImprovementRateDetails(() => calculateImprovementRate());
    }, [assessmentSubmission]);

    const [warningCount, setWarningCount] = useState(0);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    useEffect(() => {
        const fetchWarnings = async () => {
            try {
                const res = await fetch(
                    `/detected-cheatings/${assessmentSubmission.assessment_submission_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch warnings");

                const data = await res.json();
                setWarningCount(data.cheatings?.length || 0);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchTabSwitches = async () => {
            try {
                const res = await fetch(
                    `/tab-switching/${assessmentSubmission.assessment_submission_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch tab switches");

                const data = await res.json();
                setTabSwitchCount(data.tab_detects?.length || 0);
            } catch (error) {
                console.error(error);
            }
        };

        fetchWarnings();
        fetchTabSwitches();
    }, [assessmentSubmission.assessment_submission_id]);

    return (
        <div className="bg-ascend-white p-5 space-y-5 border border-ascend-gray1 shadow-shadow1">
            <div className="flex items-center justify-between">
                <h1 className="text-size6 font-bold">Student Quiz Result</h1>
                {(auth.user.role_name === "admin" ||
                    assessment.created_by === auth.user.user_id) && (
                    <PrimaryButton
                        text={"Reset"}
                        btnColor={"bg-ascend-yellow"}
                        doSomething={() => setIsAlertModalOpen(true)}
                    />
                )}
            </div>

            {isAlertModalOpen && (
                <AlertModal
                    title={"Confirm Reset"}
                    description={
                        "This will permanently reset the selected student’s response. Do you want to continue?"
                    }
                    closeModal={() => setIsAlertModalOpen(false)}
                    onConfirm={() =>
                        handleResetStudentResponse(
                            courseId,
                            quiz.quiz_id,
                            assessment.assessment_id,
                            assessmentSubmission.assessment_submission_id,
                            setIsAlertModalOpen
                        )
                    }
                    isLoading={isResetLoading}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="col-span-full lg:col-span-1 space-y-5">
                    <div className="flex items-center space-x-5">
                        <ProfileImage
                            userData={studentData}
                            profileImageSize={"w-20 h-20"}
                            textSize={"text-size7"}
                        />

                        <div>
                            <h1 className="text-size3 font-semibold break-all">
                                {`${studentData.first_name} ${studentData.last_name}`}
                            </h1>
                            <span className="break-all">
                                {studentData.email}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-row flex-wrap lg:flex-col space-x-5">
                        <div>
                            <h1 className="text-size4 font-bold text-ascend-gray3">
                                Score
                            </h1>
                            <div className="flex flex-wrap items-center gap-1">
                                <span className="text-size7 font-semibold">
                                    {`${cleanDecimal(
                                        assessmentSubmission.score
                                    )}/${quiz.quiz_total_points}`}
                                </span>
                                <span className="text-size4 font-bold text-ascend-gray3">
                                    {`${calcPercentage(
                                        assessmentSubmission.score,
                                        quiz.quiz_total_points
                                    )}%`}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-size4 font-bold text-ascend-gray3">
                                Time
                            </h1>
                            <div className="flex items-center gap-1">
                                <span className="text-size7 font-semibold">
                                    {
                                        convertDurationMinutes(
                                            assessmentSubmission.time_spent !==
                                                null
                                                ? assessmentSubmission.time_spent
                                                : 0
                                        ).formattedTime
                                    }
                                </span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-size4 font-bold text-ascend-gray3">
                                Warnings
                                <span
                                    onClick={() =>
                                        setIsEvidenceOpen(!isEvidenceOpen)
                                    }
                                    className="ml-2 text-ascend-black text-size1 cursor-pointer hover:text-ascend-blue transition-all duration-300 text-nowrap hover:underline"
                                >
                                    See details
                                </span>
                            </h1>
                            <div className="flex items-center gap-1">
                                <span className="text-size7 font-semibold">
                                    {warningCount}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-size4 font-bold text-ascend-gray3">
                                Tab Switches
                                <span
                                    onClick={() =>
                                        setTabSwitchEvidenceOpen(
                                            !tabSwitchEvidenceOpen
                                        )
                                    }
                                    className="ml-2 text-ascend-black text-size1 cursor-pointer hover:text-ascend-blue transition-all duration-300 text-nowrap hover:underline"
                                >
                                    See details
                                </span>
                            </h1>
                            <div className="flex items-center gap-1">
                                <span className="text-size7 font-semibold">
                                    {tabSwitchCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sm:col-span-2 space-y-5">
                    <div className="h-full sm:border border-ascend-gray1 sm:shadow-shadow1 sm:p-4 space-y-5">
                        <div className="flex justify-between items-center">
                            <h1 className="text-size4 font-bold">
                                Improvement Rate
                            </h1>

                            {improvementRateDetails.improvementPercent > 0 ? (
                                <span className="text-size1 flex items-center">
                                    {improvementRateDetails.improvementPercent}%
                                    <MdArrowUpward className="text-ascend-green text-size3" />
                                </span>
                            ) : improvementRateDetails.improvementPercent ===
                              0 ? (
                                <span className="text-size1 flex items-center">
                                    {improvementRateDetails.improvementPercent}%
                                </span>
                            ) : (
                                <span className="text-size1 flex items-center">
                                    {improvementRateDetails.improvementPercent}%
                                    <MdArrowUpward className="text-ascend-red text-size3 transform scale-y-[-1]" />
                                </span>
                            )}
                        </div>

                        <Bar
                            data={{
                                labels: improvementRateDetails.label,
                                datasets: [
                                    {
                                        label: "",
                                        data: improvementRateDetails.data,
                                        backgroundColor: ["#C51919", "#00a600"],
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    datalabels: {
                                        color: "#01007d",
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            callback: (value) => value + "%",
                                        },
                                    },
                                },
                            }}
                            plugins={[ChartDataLabels]}
                        ></Bar>
                    </div>
                </div>
            </div>

            {isEvidenceOpen && (
                <ViewEvidence
                    setIsEvidenceOpen={setIsEvidenceOpen}
                    assessmentSubmissionId={
                        assessmentSubmission.assessment_submission_id
                    }
                    studentData={studentData}
                />
            )}

            {tabSwitchEvidenceOpen && (
                <ViewTabEvidence
                    setIsEvidenceOpen={setTabSwitchEvidenceOpen}
                    assessmentSubmissionId={
                        assessmentSubmission.assessment_submission_id
                    }
                    studentData={studentData}
                />
            )}
        </div>
    );
}
