import React, { useState } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line, Bar } from "react-chartjs-2";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";
import CustomSelect from "../../../Components/CustomInputField/CustomSelect";

function formatHours(decimalHours) {
    if (!decimalHours || decimalHours === 0) return "0 mins";

    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} mins`;
    return `${hours}:${minutes.toString().padStart(2, "0")} hrs`;
}

export default function StudentCharts({ dailyTimeSpent = [], courseImprovementRates = [] }) {
    const [selectedCourse, setSelectedCourse] = useState("");
    const selected = courseImprovementRates.find(c => c.course_name === selectedCourse);

    const labels = dailyTimeSpent.map(d =>
        new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const hours = dailyTimeSpent.map(d => d.hours);

    return (
        <div className="flex flex-col md:flex-row justify-between">
            {/* Daily Time Spent */}
            <div className="w-full md:w-[60%]">
                <div className="sm:border border-ascend-gray1 sm:shadow-shadow1 sm:p-4 space-y-5">
                    <h1 className="text-size4 font-bold">Daily Time Spent</h1>
                    <Line
                        data={{
                            labels,
                            datasets: [{
                                label: "Hours Spent",
                                data: hours,
                                borderColor: "#01007d",
                                backgroundColor: "#e4e4ff",
                            }],
                        }}
                        options={{
                            plugins: {
                                legend: { display: false },
                                datalabels: {
                                    color: "#01007d",
                                    formatter: (value) => (value === 0 ? "" : formatHours(value))
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.dataset.label || "";
                                            const rawValue = context.raw;
                                            return `${label}: ${formatHours(rawValue)}`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { callback: (value) => formatHours(value) },
                                },
                            },
                        }}
                        plugins={[ChartDataLabels]}
                    />
                </div>
            </div>

            {/* Improvement Rate */}
            <div className="w-full md:w-[40%] pt-5 md:pt-0 md:pl-5">
                <div className="h-full sm:border border-ascend-gray1 sm:shadow-shadow1 sm:p-4 space-y-5">
                    <div className="flex justify-between items-center">
                        <h1 className="text-size4 font-bold">Improvement Rate</h1>
                        <span className="text-size1 flex items-center">
                            {selected ? (
                                <>
                                    {/* Show the calculated improvement percentage */}
                                    {selected.improvement_rate}%
                                    
                                    {/* Only show the arrow if we have a "Current" value to compare against the baseline */}
                                    {selected.current_avg > 0 && (
                                        selected.improvement_rate >= 0 ? (
                                            <MdArrowUpward className="text-ascend-green text-size3" />
                                        ) : (
                                            <MdArrowDownward className="text-ascend-red text-size3" />
                                        )
                                    )}
                                </>
                            ) : (
                                "—"
                            )}
                        </span>
                    </div>
                    <CustomSelect
                        selectField={
                            <select
                                className="w-full rounded-none appearance-none border px-2 text-size1 py-2 focus:outline-ascend-blue"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">Select a course</option>
                                {courseImprovementRates.map((c, i) => (
                                    <option key={i} value={c.course_name}>
                                        {c.course_name}
                                    </option>
                                ))}
                            </select>
                        }
                    />

                    {/* Message or Bar Chart */}
                    {!selected ? (
                        <div className="flex items-center justify-center text-center h-48 text-ascend-gray4 italic">
                            Please select a course to see improvement rate.
                        </div>
                    ) : (
                        <Bar
                            data={{
                                labels: ["Previous", "Current"],
                                datasets: [{
                                    data: [selected.previous_avg, selected.current_avg],
                                    backgroundColor: ["#C51919", "#00a600"],
                                }],
                            }}
                            options={{
                                plugins: {
                                    legend: { display: false },
                                    datalabels: { color: "#01007d" },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: { callback: (value) => value + "%" },
                                    },
                                },
                            }}
                            plugins={[ChartDataLabels]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}