import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { displayToast } from "../../../Utils/displayToast";
import PrimaryButton from "../../../Components/Button/PrimaryButton";
import AddPaymentModal from "./AddPaymentModal";
import { usePaymentTabs } from "../../../Stores/PaymentHistory/usePaymentTabs";
import { IoCaretDownOutline } from "react-icons/io5";
import DefaultCustomToast from "../../../Components/CustomToast/DefaultCustomToast";

const PaymentHistoryPage = ({ PaymentList, student, can, userRole }) => {
    const handleRowClick = (paymentId) => {
        if (userRole === "student") {
            router.visit(
                route("student.paymenthistory.paymentInfo.view", paymentId)
            );
        } else {
            router.visit(route("paymenthistory.paymentInfo.view", paymentId));
        }
    };

    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const { activeTab, setActiveTab } = usePaymentTabs();
    const [payments, setPayments] = useState(PaymentList || []);
    const [isLoading, setIsLoading] = useState(false);
    const [currentDownload, setCurrentDownload] = useState("PDF");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleAddPayment = () => {
        setShowAddPaymentModal(!showAddPaymentModal);
    };

    const handleExport = async (type) => {
        setIsLoading(true);
        setTimeout(async () => {
            try {
                const url = route(
                    type === "pdf"
                        ? "paymenthistory.export.pdf"
                        : "paymenthistory.export.csv",
                    { userId: student.user_id }
                );

                const res = await fetch(url, { method: "GET" });

                if (!res.ok) {
                    const data = await res.json();
                    displayToast(
                        <DefaultCustomToast
                            message={
                                data.message ||
                                "No payment records found for this user."
                            }
                        />,
                        "error"
                    );
                    return;
                }

                // extract filename from Content-Disposition if available
                let filename = `PaymentHistory.${type}`;
                const disposition = res.headers.get("Content-Disposition");

                if (disposition && disposition.includes("filename=")) {
                    const match = disposition.match(/filename="?([^"]+)"?/);
                    if (match && match[1]) {
                        filename = match[1];
                    }
                }

                const blob = await res.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = downloadUrl;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                link.remove();

                // success toast
                displayToast(
                    <DefaultCustomToast
                        message={`Payment history downloaded as ${type.toUpperCase()}`}
                    />,
                    "success"
                );
                setIsLoading(false);
            } catch (error) {
                displayToast(
                    <DefaultCustomToast message="Something went wrong while exporting." />,
                    "error"
                );
                setIsLoading(false);
            }
        }, 0);
    };

    // Filter payments based on active tab
    const filteredPayments =
        activeTab === 0
            ? PaymentList.filter((p) => p.deleted_at === null)
            : PaymentList.filter((p) => p.deleted_at !== null);

    return (
        <>
            {can.viewTabs && (
                <div className="h-12 border-b border-ascend-gray1 w-full py-1 flex justify-center items-center overflow-x-auto space-x-1 font-nunito-sans text-ascend-black">
                    <div
                        onClick={() => setActiveTab(0)}
                        className={`py-1.5 px-8 cursor-pointer font-bold hover:bg-ascend-lightblue transition-all duration-300 ${
                            activeTab === 0 &&
                            "bg-ascend-lightblue text-ascend-blue"
                        }`}
                    >
                        Active
                    </div>
                    <div
                        onClick={() => setActiveTab(1)}
                        className={`py-1.5 px-8 cursor-pointer font-bold hover:bg-ascend-lightblue transition-all duration-300 ${
                            activeTab === 1 &&
                            "bg-ascend-lightblue text-ascend-blue"
                        }`}
                    >
                        Archived
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="font-nunito-sans text-size6 font-bold mt-5">
                    {student.name}
                </div>
                {can.addPayment && activeTab === 0 && (
                    <PrimaryButton
                        text="Add Payment"
                        doSomething={toggleAddPayment}
                    />
                )}
            </div>

            {can.download && activeTab === 0 && filteredPayments.length > 0 && (
                <div className="flex space-x-[2px]">
                    {/* Main Download Button showing current selection */}
                    <PrimaryButton
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        doSomething={() =>
                            handleExport(currentDownload.toLowerCase())
                        }
                        text={`Download ${currentDownload.toUpperCase()}`}
                    />

                    {/* Dropdown button for changing format */}
                    <div className="dropdown dropdown-end cursor-pointer">
                        <button
                            tabIndex={0}
                            role="button"
                            className="px-3 h-10 bg-ascend-blue hover:opacity-80 flex items-center justify-center cursor-pointer text-ascend-white transition-all duration-300"
                        >
                            <div className="text-size1">
                                <IoCaretDownOutline />
                            </div>
                        </button>

                        <ul
                            tabIndex={0}
                            className="text-size2 dropdown-content menu space-y-2 font-medium bg-ascend-white min-w-40 mt-1 px-0 border border-ascend-gray1 shadow-lg !transition-none text-ascend-black"
                        >
                            <li onClick={() => setCurrentDownload("PDF")}>
                                <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                    Download as PDF
                                </a>
                            </li>
                            <li onClick={() => setCurrentDownload("CSV")}>
                                <a className="w-full text-left hover:bg-ascend-lightblue hover:text-ascend-blue transition duration-300">
                                    Download as CSV
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto mt-5">
                <table className="table w-full font-nunito-sans">
                    <thead>
                        <tr className="border-b-2 border-ascend-gray3">
                            <th className="text-ascend-black font-black">
                                Payment method
                            </th>
                            <th className="text-ascend-black font-black">
                                Payment transaction ID
                            </th>
                            <th className="text-ascend-black font-black">
                                Receipt date
                            </th>
                            <th className="text-ascend-black font-black">
                                Payment amount
                            </th>
                            {activeTab === 1 && (
                                <th className="text-ascend-black font-black">
                                    Deleted At
                                </th>
                            )}
                        </tr>
                    </thead>
                    {filteredPayments.length > 0 ? (
                        <tbody>
                            {filteredPayments.map((ph) => (
                                <tr
                                    key={ph.payment_id}
                                    onClick={() =>
                                        handleRowClick(ph.payment_id)
                                    }
                                    className="hover:bg-ascend-lightblue transition-all duration-300 cursor-pointer"
                                >
                                    <td className="py-5">
                                        {ph.payment_method}
                                    </td>
                                    <td className="py-5">
                                        {ph.transaction_id}
                                    </td>
                                    <td className="py-5">{ph.receipt_date}</td>
                                    <td className="py-5">
                                        {ph.payment_amount}
                                    </td>
                                    {activeTab === 1 && (
                                        <td className="py-5">
                                            {ph.deleted_at
                                                ? new Date(ph.deleted_at)
                                                      .toISOString()
                                                      .split("T")[0] // YYYY-MM-DD
                                                : "-"}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <tbody>
                            <tr>
                                <td
                                    colSpan={activeTab === 1 ? 6 : 5}
                                    className="text-center py-5"
                                >
                                    No records found.
                                </td>
                            </tr>
                        </tbody>
                    )}
                </table>
            </div>

            {showAddPaymentModal && (
                <AddPaymentModal
                    userId={student.user_id}
                    togglePaymentForm={toggleAddPayment}
                />
            )}
        </>
    );
};

export default PaymentHistoryPage;
