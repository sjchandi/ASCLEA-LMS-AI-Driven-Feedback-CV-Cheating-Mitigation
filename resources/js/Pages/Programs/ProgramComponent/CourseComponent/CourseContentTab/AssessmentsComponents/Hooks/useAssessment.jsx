import { useState } from "react";
import useAssessmentsStore from "../Stores/assessmentsStore";
import useModulesStore from "../../ModulesComponents/Stores/modulesStore";
import axios from "axios";
import { route } from "ziggy-js";
import { displayToast } from "../../../../../../../Utils/displayToast";
import DefaultCustomToast from "../../../../../../../Components/CustomToast/DefaultCustomToast";
import { closeDropDown } from "../../../../../../../Utils/closeDropdown";

export default function useAssessment({ programId, courseId }) {
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // For alert modal  when archivingg section assessment
    const [isArchiveAssessmentLoading, setIsArchiveAssessmentLoading] =
        useState(false);

    // Assessment store
    const addNewAssessment = useAssessmentsStore(
        (state) => state.addNewAssessment
    );
    const updateAssessmentInList = useAssessmentsStore(
        (state) => state.updateAssessmentInList
    );

    // Moddule store
    const addNewSectionItem = useModulesStore(
        (state) => state.addNewSectionItem
    );
    const updateSectionItems = useModulesStore(
        (state) => state.updateSectionItems
    );
    const setSectionItems = useModulesStore((state) => state.setSectionItems);

    const appendToFormData = (assessmentFormData, assessmentDetails) => {
        // Append data into FormData to enbale uploading files
        for (let key in assessmentDetails) {
            const value = assessmentDetails[key];

            // Skips appending data with null value
            // Make sure data is nullable in backend valdiation
            if (value === null || value === undefined) {
                continue;
            }

            // Append array values
            if (Array.isArray(value)) {
                value.forEach((v, i) => {
                    assessmentFormData.append(`${key}[${i}]`, v);
                });
            } else {
                assessmentFormData.append(key, value);
            }
        }
    };

    // Handles axios request for adding assesment
    const addAssessment = async (assessmentDetails, sectionId) => {
        // Append the assessment details to form data since
        // to enable file upaloading
        const assessmentFormData = new FormData();
        appendToFormData(assessmentFormData, assessmentDetails);

        const response = await axios.post(
            route("assessment.create", {
                program: programId,
                course: courseId,
            }),
            assessmentFormData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        if (sectionId) {
            // Add the asssessment in the section
            addNewSectionItem(response.data.data, courseId, sectionId);
        } else {
            addNewAssessment(response.data.data, courseId);
        }

        displayToast(
            <DefaultCustomToast message={response.data.success} />,
            "success"
        );
    };

    // Handles the axios request for updating
    const updateAssessment = async (
        assessmentDetails,
        sectionId,
        assessmentId
    ) => {
        // Append the assessment details to form data since
        // to enable file upaloading
        const assessmentFormData = new FormData();
        appendToFormData(assessmentFormData, assessmentDetails);
        assessmentFormData.append("_method", "PUT");

        const response = await axios.post(
            route("assessment.update", {
                program: programId,
                course: courseId,
                assessment: assessmentId,
            }),
            assessmentFormData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        if (sectionId) {
            updateSectionItems(response.data.data, courseId, sectionId);
        } else {
            // Change the updated assessment data in the list
            updateAssessmentInList(response.data.data, courseId);
        }

        displayToast(
            <DefaultCustomToast message={response.data.success} />,
            "success"
        );
    };

    const handleSubmit = async (
        assessmentDetails,
        sectionId,
        isEdit,
        setIsAssessmentFormOpen,
        assessmentId
    ) => {
        setIsLoading(true);
        setErrors(null);

        try {
            if (isEdit) {
                await updateAssessment(
                    assessmentDetails,
                    sectionId,
                    assessmentId
                );
            } else {
                await addAssessment(assessmentDetails, sectionId);
            }

            setIsAssessmentFormOpen(false);
        } catch (error) {
            console.error(error);
            // Check for value in response.data.errors
            // This is where the valdiation errors located
            // So we have to set it in the state that will display error
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                displayToast(
                    <DefaultCustomToast
                        message={"Something went wrong. Please try again."}
                    />,
                    "error"
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const unpublishAssessment = async (assessmentId) => {
        closeDropDown();

        try {
            const response = await axios.put(
                route("assessment.unpublish", {
                    program: programId,
                    course: courseId,
                    assessment: assessmentId,
                })
            );

            updateAssessmentInList(response.data.data, courseId);

            displayToast(
                <DefaultCustomToast message={response.data.success} />,
                "success"
            );
        } catch (error) {
            console.error(error);
            displayToast(
                <DefaultCustomToast
                    message={"Something went wrong. Please try again."}
                />,
                "error"
            );
        }
    };

    const handleArchiveAsessment = async (assessmentId) => {
        closeDropDown();

        try {
            setIsArchiveAssessmentLoading(true);

            const response = await axios.delete(
                route("assessment.archive", {
                    program: programId,
                    course: courseId,
                    assessment: assessmentId,
                })
            );

            // Check if sectionId has value
            // If true tthis mean material is a part of section
            updateAssessmentInList(response.data.data, courseId);

            displayToast(
                <DefaultCustomToast message={response.data.success} />,
                "success"
            );
        } catch (error) {
            console.error(error);
            displayToast(
                <DefaultCustomToast
                    message={"Something went wrong. Please try again."}
                />,
                "error"
            );
        } finally {
            setIsArchiveAssessmentLoading(false);
        }
    };

    const handleRestoreAsessment = async (assessmentId) => {
        closeDropDown();

        try {
            const response = await axios.put(
                route("assessment.restore", {
                    program: programId,
                    course: courseId,
                    assessment: assessmentId,
                })
            );
            console.log(response);
            updateAssessmentInList(response.data.restoredAssessment, courseId);

            displayToast(
                <DefaultCustomToast message={response.data.success} />,
                "success"
            );
        } catch (error) {
            console.error(error);
            displayToast(
                <DefaultCustomToast
                    message={"Something went wrong. Please try again"}
                />,
                "error"
            );
        }
    };

    return {
        errors,
        isLoading,
        isArchiveAssessmentLoading,
        handleSubmit,
        unpublishAssessment,
        handleArchiveAsessment,
        handleRestoreAsessment,
    };
}
