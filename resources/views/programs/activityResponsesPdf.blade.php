<!DOCTYPE html>
<html>

<head>
    <title>Activity Responses</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            /* Built-in font */
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
            /* Centers table content */
        }

        th {
            background: #e4e4ff;
            font-weight: 600;
        }

        /* Remove vertical borders */
        th:first-child,
        td:first-child {
            border-left: none;
        }

        th:last-child,
        td:last-child {
            border-right: none;
        }

        /* Footer */
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
    <h1>{{$assessment->assessment_title}} Responses</h1>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Date of Submission</th>
                <th>Grade</th>
            </tr>
        </thead>
        <tbody>
            @foreach($responses as $response)
            <tr>
                <td>{{ $response->submittedBy->member->user ? $response->submittedBy->member->user->first_name . ' ' . $response->submittedBy->member->user->last_name : 'N/A' }}</td>
                <td>{{ $response->submission_status ?? 'N/A' }}</td>
                <td>{{ $response->submitted_at ?? 'N/A' }}</td>
                <td>{{ rtrim(rtrim(number_format($response->score, 2, '.', ''), '0'), '.') }} / {{ $assessment->total_points }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <!-- Footer -->
    <div class="pdf-footer">
        Generated on: {{ now()->format('F d, Y h:i A') }}
    </div>
</body>

</html>