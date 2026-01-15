<!DOCTYPE html>
<html>

<head>
    <title>Quiz Responses</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
        }

        h1 {
            text-align: center;
        }

        h2,
        h3 {
            font-weight: 500;

        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 8px;
            text-align: center;
        }

        th {
            background: #e4e4ff;
            font-weight: 600;
        }

        .pdf-footer {
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 11px;
            color: #555;
        }
    </style>
</head>

<body>
    @php
    $calculationService = app(\App\Services\CalculationService::class);
    @endphp

    <h1>{{ $assessment->assessment_title }} Responses</h1>

    <h2>Summary</h2>
    <table>
        <thead>
            <tr>
                <th>Average Score</th>
                <th>Average Time</th>
                <th>Highest Score</th>
                <th>Lowest Score</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ number_format($summary['average_score']['score'], 2) }} ({{ $summary['average_score']['percentage'] }}%)</td>
                <td>
                    {{ $summary['average_time'] == 0 
                        ? '0' 
                        : $summary['average_time']['hours'].'h '.$summary['average_time']['minutes'].'m' }}
                </td>
                <td>{{ rtrim(rtrim(number_format($summary['highest_score']['score'], 2, '.', ''), '0'), '.') }} ({{ $summary['highest_score']['percentage'] }}%)</td>
                <td>{{ rtrim(rtrim(number_format($summary['lowest_score']['score'], 2, '.', ''), '0'), '.') }} ({{ $summary['lowest_score']['percentage'] }}%)</td>
            </tr>
        </tbody>
    </table>

    <h2>Frequently Missed Questions</h2>
    <table>
        <thead>
            <tr>
                <th>Question no.</th>
                <th>Question</th>
                <th>Missed Count</th>
                <th>Missed Rate</th>
            </tr>
        </thead>
        <tbody>
            @foreach($frequentlyMissedQuestions as $question)
            <tr>
                <td>{{ $question['question_number'] }}</td>
                <td>{{ $question['question'] }}</td>
                <td>{{ $question['missed_count'] }}</td>
                <td>{{ $question['missed_rate'] }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Feedback</h2>
    @if($feedback && isset($feedback->feedback))
    <div>
        <h3>Performance Summary</h3>
        <p>{{ $feedback->feedback->performance_summary }}</p>

        <h3>Performance Analysis</h3>
        <p>{{ $feedback->feedback->performance_analysis }}</p>

        <h3>Suggestions</h3>
        <ol>
            @foreach($feedback->feedback->suggestions as $suggestion)
            <li>{{ $suggestion }}</li>
            @endforeach
        </ol>
    </div>
    @else
    <p style="text-align: center;">No feedback available yet.</p>
    @endif

    <h2>Responses</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Time Spent</th>
                <th>Score</th>
                <th>Warnings</th>
            </tr>
        </thead>
        <tbody>
            @foreach($responses as $response)
            @php
            $timeSpent = $calculationService->calculateHoursAndMins($response->time_spent ?? 0);
            @endphp
            <tr>
                <td>
                    {{ $response->submittedBy->member->user
                        ? $response->submittedBy->member->user->first_name.' '.$response->submittedBy->member->user->last_name
                        : 'N/A' }}
                </td>
                <td>
                    {{ $timeSpent == 0 ? '0' : $timeSpent['hours'] . 'h ' . $timeSpent['minutes'] . 'm' }}
                </td>
                <td>{{ rtrim(rtrim(number_format($response->score, 2, '.', ''), '0'), '.') }} / {{ $assessment->quiz->quiz_total_points }}</td>
                <td>N/A</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="pdf-footer">
        Generated on: {{ now()->format('F d, Y h:i A') }}
    </div>
</body>

</html>