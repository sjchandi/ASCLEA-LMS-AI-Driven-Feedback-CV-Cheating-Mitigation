import { useState } from "react";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import DefaultCustomToast from "../../../Components/CustomToast/DefaultCustomToast";
import { displayToast } from "../../../Utils/displayToast";

export default function useBackupRestore() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerateBackupLoading, setIsGenerateBackupLoading] =
        useState(false);

    const backup = () => {
        setIsGenerateBackupLoading(true);
        router.post(
            route("backup"),
            {},
            {
                showProgress: false,
                onSuccess: (page) => {
                    console.log(page);
                    displayToast(
                        <DefaultCustomToast
                            message={page.props.flash.message}
                        />,
                        "info"
                    );
                },
                onError: (errors) => {
                    displayToast(
                        <DefaultCustomToast message={errors.error} />,
                        "error"
                    );
                },
                onFinish: () => {
                    setIsGenerateBackupLoading(false);
                },
            }
        );
    };

    const restore = (backupId, setOpenRestoreModal, setBackupId) => {
        setIsLoading(true);
        router.put(
            route("restore", { backup: backupId }),
            {},
            {
                showProgress: false,
                onSuccess: () => {
                    setOpenRestoreModal(false);
                    setBackupId(null);
                },
                onError: (errors) => {
                    displayToast(
                        <DefaultCustomToast message={errors.error} />,
                        "error"
                    );
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const deleteBackup = (backupId, setOpenAlertModal, setBackupId) => {
        setIsLoading(true);
        router.delete(route("backup.delete", { backup: backupId }), {
            showProgress: false,
            onSuccess: (page) => {
                setOpenAlertModal(false);
                displayToast(
                    <DefaultCustomToast message={page.props.flash.success} />,
                    "success"
                );
                setBackupId(null);
            },
            onError: (errors) => {
                displayToast(
                    <DefaultCustomToast message={errors.error} />,
                    "error"
                );
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return {
        backup,
        restore,
        deleteBackup,
        isLoading,
        isGenerateBackupLoading,
    };
}
