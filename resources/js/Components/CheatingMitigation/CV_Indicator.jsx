import React, { useRef, useState, useEffect } from "react";
import InitialCV_Modal from "./InitialCV_Modal";
import { FaCheckCircle, FaExclamationTriangle, FaCamera } from "react-icons/fa";
import Webcam from "react-webcam";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { update } from "lodash";
import { router } from "@inertiajs/react";
import { registerStopCV } from "@/Utils/cvController";

const Monitoring = ({ onFaceDetected, options, assessmentSubmissionId }) => {
    const [cameraStarted, setCameraStarted] = React.useState(false);
    const [faceDetected, setFaceDetected] = React.useState(false);
    const [objectDetected, setObjectDetected] = React.useState(false);
    const [missingFace, setMissingFace] = React.useState(false);
    const [lookingAway, setLookingAway] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [showTestModal, setShowTestModal] = React.useState(false);
    const [minimized, setMinimized] = useState(false);
    const webcamRef = useRef(null);
    const [webcamReady, setWebcamReady] = useState(false);
    const [latestScreenshot, setLatestScreenshot] = useState(null);
    const isRunningRef = useRef(false);

    const [count, setCount] = React.useState(0);
    const [warningLogs, setWarningLogs] = React.useState([]);

    const detectionIntervalRef = React.useRef(null);

    const host = import.meta.env.VITE_MAIN_URL;
    const port = import.meta.env.VITE_CV_PORT;

    const CV_BASE_URL = import.meta.env.VITE_CV_URL;

    const detectionHeadMap = {
        up: "Looking Up",
        down: "Looking Down",
        left: "Looking Left",
        right: "Looking Right",
    };

    const detectionItemsMap = {
        book: 73,
        laptop: 63,
        cellphone: 67,
    };

    const baseItems = [73, 63, 67];

    function processOptions(options) {
        if (!Array.isArray(options)) {
            return {
                itemsDetection: baseItems,
                allowedHeadDetection: [],
            };
        }

        // normalize input (remove plural "s", lowercase)
        const normalized = options.map((opt) =>
            opt.toLowerCase().replace(/s$/, "")
        );

        // separate into items vs directions
        const selectedItems = normalized.filter(
            (opt) => opt in detectionItemsMap
        );
        const selectedDirections = normalized.filter(
            (opt) => opt in detectionHeadMap
        );

        // filter base items if they are excluded
        const itemsDetection = baseItems.filter(
            (id) =>
                !selectedItems.includes(
                    Object.keys(detectionItemsMap).find(
                        (key) => detectionItemsMap[key] === id
                    )
                )
        );

        // map directions to dictionary
        const allowedHeadDetection = selectedDirections.map(
            (dir) => detectionHeadMap[dir]
        );

        return { itemsDetection, allowedHeadDetection };
    }

    const { itemsDetection, allowedHeadDetection } = processOptions(options);

    // Show modal on first mount
    React.useEffect(() => {
        setShowTestModal(true);
    }, []);

    // Close modal when face is detected
    React.useEffect(() => {
        let timer;
        if (faceDetected) {
            timer = setTimeout(() => {
                setShowTestModal(false);
                onFaceDetected?.();
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [faceDetected]);

    // Update warning count and logs
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            let warning = "";

            if (objectDetected && missingFace && lookingAway) {
                warning =
                    "Multiple violations: Object, Face Missing, Looking Away";
            } else if (objectDetected && missingFace) {
                warning = "Object and Face Missing";
            } else if (objectDetected && lookingAway) {
                warning = "Object and Looking Away";
            } else if (missingFace && lookingAway) {
                warning = "Face Missing and Looking Away";
            } else if (objectDetected) {
                warning = "Object-like detected";
            } else if (missingFace) {
                warning = "Missing face";
            } else if (lookingAway) {
                warning = "Looking away";
            }

            if (warning) {
                setWarningLogs((prevLogs) => {
                    if (prevLogs[prevLogs.length - 1] === warning)
                        return prevLogs; // avoid duplicates
                    return [...prevLogs, warning];
                });

                setCount((prev) => prev + 1);

                toast.warn(warning, {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                    transition: Bounce,
                    style: { fontSize: "16px", padding: "8px" },
                });

                const fileInfo = {
                    file_name: latestScreenshot?.file_name || null,
                    file_path: latestScreenshot?.file_path || null,
                    file_type: latestScreenshot?.file_type || "image/jpeg",
                };

                if (assessmentSubmissionId) {
                    router.post(
                        route("detected-cheatings.store"),
                        {
                            assessment_submission_id: assessmentSubmissionId,
                            message: warning,
                            ...fileInfo,
                        },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            showProgress: false,
                            onError: (errors) =>
                                console.error("Cheating log error:", errors),
                            onSuccess: () =>
                                console.log(
                                    "Cheating log submitted successfully!"
                                ),
                        }
                    );
                }
            }
        }, 300); // 300ms delay to allow state stabilization

        return () => clearTimeout(timeout);
    }, [objectDetected, missingFace, lookingAway]);

    const startCV = async () => {

        try {
            setError(null);
            setFaceDetected(false);
            setObjectDetected(false);
            setMissingFace(false);
            setLookingAway(false);
            setWarningLogs([]);
            setCount(0);
            setCameraStarted(true);
            isRunningRef.current = true;

            await fetch(`${CV_BASE_URL}/reset_cv`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const detectLoop = async () => {
                if (!isRunningRef.current) {
                    console.log("Detection loop stopped.");
                    return;
                }

                if (!webcamRef.current) {
                    setTimeout(detectLoop, 1000); // Retry
                    return;
                }

                const imageSrc = webcamRef.current.getScreenshot();

                if (!imageSrc) {
                    console.log("Webcam warming up... retrying");
                    setTimeout(detectLoop, 1000);
                    return;
                }

                try {
                    const response = await fetch(
                        `${CV_BASE_URL}/Asclea_Detection`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                image: imageSrc,
                                target_classes: itemsDetection,
                                allowedPositions: allowedHeadDetection,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Backend responded with error");
                    }

                    const data = await response.json();

                    setFaceDetected(data.detected_face);
                    setObjectDetected(data.detected_object);
                    setMissingFace(data.missing_face);
                    setLookingAway(data.looking_away);

                    setLatestScreenshot({
                        file_name: data.file_name,
                        file_path: data.file_path,
                        file_type: "image/jpeg",
                    });
                } catch (err) {
                    console.error("Error fetching detection data:", err);
                }

                setTimeout(detectLoop, 1000); // Loop every second
            };

            detectLoop(); // Start the loop
        } catch (error) {
            console.error("Failed to start camera:", error);
            setError("Something went wrong while starting the camera.");
            throw error;
        }
    };

    const stopCV = async () => {
        console.log("endCV triggered");
        isRunningRef.current = false;
        setCameraStarted(false);
        setWebcamReady(false);

        try {
            await fetch(`${CV_BASE_URL}/end-cv`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            console.log("Flask CV stopped successfully.");
        } catch (error) {
            console.error("Error stopping CV:", error);
        }
    };

    // Registered globally
    React.useEffect(() => {
        registerStopCV(stopCV);
    }, []);

    return (
        <>
            <div className="flex items-center space-x-6 font-bold font-nunito-sans text-size2">
                {/* Camera Status */}
                <div className="flex items-center space-x-3 mt-[2px]">
                    <span>Camera Status:</span>
                    {webcamReady ? (
                        <div className="flex items-center space-x-1 text-ascend-green">
                            <FaCheckCircle className="w-4 h-4 relative top-[-1px]" />
                            <span>Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1 text-ascend-red">
                            <FaExclamationTriangle className="w-4 h-4 relative top-[-1px]" />
                            <span>Inactive</span>
                        </div>
                    )}
                </div>
            </div>

            {cameraStarted && (
                <>
                    <div
                        className={`fixed z-[60] transition-all duration-300 rounded-md overflow-hidden bg-black
            ${
                showTestModal
                    ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-7 w-82 h-82 border-4 border-ascend-blue"
                    : "top-20 right-4 w-40 h-40 border-4 border-ascend-blue"
            }
            ${minimized ? "hidden" : ""}   // hide container when minimized
          `}
                    >
                        {/* Minimize Button */}
                        {!showTestModal && (
                            <button
                                onClick={() => setMinimized(true)}
                                className="absolute top-1 right-1 z-10 bg-ascend-blue bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                            >
                                —
                            </button>
                        )}

                        {/* Webcam*/}
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover pointer-events-none"
                            videoConstraints={{
                                width: 160,
                                height: 160,
                                facingMode: "user",
                            }}
                            onUserMedia={() => {
                                console.log("Webcam started successfully");
                                setWebcamReady(true);
                            }}
                            onUserMediaError={(err) => {
                                console.error("Webcam error:", err);
                                setWebcamReady(false);
                            }}
                        />
                    </div>

                    {/* Floating expand button */}
                    {minimized && (
                        <button
                            onClick={() => setMinimized(false)}
                            className="fixed md:bottom-8 right-4 z-[70] w-10 h-10 flex items-center justify-center rounded bg-ascend-blue text-white text-sm shadow-lg"
                        >
                            ⤢
                        </button>
                    )}
                </>
            )}
            <InitialCV_Modal
                show={showTestModal}
                toggleModal={() => setShowTestModal(false)}
                startCV={startCV}
                faceDetected={faceDetected}
                error={error}
                webcamRef={webcamRef}
                cameraStarted={cameraStarted}
                webcamReady={webcamReady}
            />

            <ToastContainer />
        </>
    );
};

export default Monitoring;
Monitoring.layout = null;
