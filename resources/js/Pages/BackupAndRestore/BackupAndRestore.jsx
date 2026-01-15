import { useState, useEffect } from "react";
import EmptyState from "../../Components/EmptyState/EmptyState";
import dayjs from "dayjs";
import Pagination from "../../Components/Pagination";
import PrimaryButton from "../../Components/Button/PrimaryButton";
import AlertModal from "../../Components/AlertModal";
import useBackupRestore from "./Hooks/useBackupRestore";
import useBackupAndRestoreStore from "./Stores/backupAndRestoreStore";
import { router } from "@inertiajs/react";

export default function BackupAndRestore({ backups }) {
    const [openAlertModal, setOpenAlertModal] = useState(false);
    const [openRestoreModal, setOpenRestoreModal] = useState(false);
    const [restoreText, setRestoreText] = useState("");
    const [action, setAction] = useState(false);
    const [backupId, setBackupId] = useState(null);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    // Backup and Restore Store
    const refresh = useBackupAndRestoreStore((state) => state.refresh);

    useEffect(() => {
        if (!initialLoad) {
            console.log("RELOAD");
            router.reload({
                only: ["backups"],
            });
        } else {
            setInitialLoad(false);
        }
    }, [refresh]);

    const {
        deleteBackup,
        backup,
        restore,
        isLoading,
        isGenerateBackupLoading,
    } = useBackupRestore();

    const handleConfirmRestore = () => {
        setOpenAlertModal(false);
        setOpenRestoreModal(true);
    };

    const handleConfirmDelete = () => {
        if (backupId) {
            // console.log("DELETE");
            deleteBackup(backupId, setOpenAlertModal, setBackupId);
        }
    };

    const handleBackupRestoration = () => {
        if (restoreText === "RESTORE" && backupId) {
            console.log("RESTORE IN PRGORESS");
            restore(backupId, setOpenRestoreModal, setBackupId);
        } else {
            setError('You must type "RESTORE" exactly to confirm.');
        }
    };

    // For delete and restore button
    // Set the aaction wether its delete or restore
    // set the backup id
    // Open the alert modal
    const handleAction = (currentAction, backupId) => {
        setAction(currentAction);
        setOpenAlertModal(true);
        setBackupId(backupId);
    };

    return (
        <div className="font-nunito-sans space-y-5">
            <div className="w-full flex justify-between">
                <h1 className="text-size6 font-bold">Backup Files</h1>
                <PrimaryButton
                    text={"Generate Backup"}
                    doSomething={backup}
                    isLoading={isGenerateBackupLoading}
                    isDisabled={isGenerateBackupLoading}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead className="text-ascend-black">
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                File Name
                            </th>
                            <th className="text-ascend-black font-black">
                                Created At
                            </th>
                            <th className="text-ascend-black font-black">
                                File Size
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.data && backups.data.length > 0 ? (
                            backups.data.map((backup) => (
                                <tr
                                    key={backup.backup_id}
                                    className="group hover:bg-ascend-lightblue transition-all duration-300"
                                >
                                    <td className="py-5">{backup.file_name}</td>
                                    <td className="py-5">
                                        {dayjs(backup.created_at).format(
                                            "ddd, MMM D, YYYY h:mm A"
                                        )}
                                    </td>
                                    <td className="py-5">{backup.file_size}</td>
                                    <td className="flex gap-2">
                                        <PrimaryButton
                                            text={"Restore"}
                                            btnColor={"bg-ascend-yellow"}
                                            doSomething={() =>
                                                handleAction(
                                                    "restore",
                                                    backup.backup_id
                                                )
                                            }
                                        />
                                        <PrimaryButton
                                            text={"Delete"}
                                            btnColor={"bg-ascend-red"}
                                            doSomething={() =>
                                                handleAction(
                                                    "delete",
                                                    backup.backup_id
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">
                                    <EmptyState
                                        paddingY="py-0"
                                        imgSrc="/images/illustrations/not_enough_data.svg"
                                        text="No backups found. Click 'Generate Backup' to protect your data."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {backups.data &&
                backups.data.length > 0 &&
                backups.last_page > 1 && (
                    <div className="w-full">
                        <Pagination
                            links={backups.links}
                            currentPage={backups.current_page}
                            lastPage={backups.last_page}
                            only={["backups"]}
                        />
                    </div>
                )}

            {/* Display alert modal */}
            {openAlertModal && (
                <AlertModal
                    title={
                        action === "restore"
                            ? "Restore Backup"
                            : "Delete Backup"
                    }
                    description={
                        action === "restore"
                            ? "Are you sure you want to restore this backup? The system will be reverted to the state captured in this backup."
                            : "Are you sure you want to permanently delete this backup? This action cannot be undone and the backup will be permanently lost."
                    }
                    closeModal={() => setOpenAlertModal(false)}
                    onConfirm={() => {
                        if (action === "restore") {
                            handleConfirmRestore();
                        } else {
                            handleConfirmDelete();
                        }
                    }}
                    isLoading={isLoading}
                />
            )}

            {openRestoreModal && (
                <AlertModal
                    title={"Confirm Restore"}
                    customBody={
                        <div>
                            <p className="text-size3 text-ascend-black">
                                This action is irreversible. Type{" "}
                                <span className="font-bold text-red-600">
                                    RESTORE
                                </span>{" "}
                                to confirm backup restoration.
                            </p>

                            <input
                                type="text"
                                onChange={(e) => setRestoreText(e.target.value)}
                                className={`block px-4 py-3 w-full text-sm bg-transparent border-1 border-ascend-gray1 appearance-non  peer password-input focus:outline-ascend-blue ${
                                    error
                                        ? "border-ascend-red"
                                        : "border-ascend-gray1"
                                }`}
                            />
                            {error && (
                                <span className="text-ascend-red">{error}</span>
                            )}
                        </div>
                    }
                    closeModal={() => {
                        setOpenRestoreModal(false);
                        setError(null);
                        setRestoreText("");
                    }}
                    onConfirm={() => handleBackupRestoration()}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
