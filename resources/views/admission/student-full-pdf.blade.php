<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Academic Record</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 13px;
            color: #333;
            margin: 20px;
        }

        h1 {
            text-align: center;
            font-weight: 700;
            margin-bottom: 30px;
        }

        h2 {
            text-align: center;
            font-weight: 700;
            margin-top: 40px;
            margin-bottom: 20px;
        }

        .student-meta {
            margin-top: 20px;
            margin-bottom: 35px;
            line-height: 1.8;
        }

        .student-meta strong {
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th, td {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 10px;
            text-align: center;
        }

        th {
            background: #e4e4ff;
            font-weight: 600;
        }

        .text-left {
            text-align: left;
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
    <h1>Student Academic Record</h1>

    <div class="student-meta">
        <strong>Student Name:</strong> {{ $student->user->first_name }} {{ $student->user->last_name }}<br>
        <strong>Email Address:</strong> {{ $student->user->email ?? 'N/A' }}<br>
        <strong>Enrollment Status:</strong> {{ ucfirst($student->enrollment_status ?? 'N/A') }}
    </div>

    <h2>Programs & Enrolled Courses</h2>
    <table>
        <thead>
            <tr>
                <th class="text-left">Program Name</th>
                <th>Course Code</th>
                <th class="text-left">Course Name</th>
            </tr>
        </thead>
        <tbody>
            @forelse($learningMembers as $lm)
                @foreach($lm->courses as $c)
                <tr>
                    <td class="text-left">{{ $lm->program->program_name ?? 'N/A' }}</td>
                    <td>{{ $c->course->course_code ?? 'N/A' }}</td>
                    <td class="text-left">{{ $c->course->course_name ?? 'N/A' }}</td>
                </tr>
                @endforeach
            @empty
                <tr>
                    <td colspan="3">No programs or enrolled courses found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Completed Assessments</h2>
    <table>
        <thead>
            <tr>
                <th class="text-left">Assessment Name</th>
                <th class="text-left">Course Name</th>
                <th>Score</th>
                <th>Date Submitted</th>
            </tr>
        </thead>
        <tbody>
            @forelse($assessments as $a)
            <tr>
                <td class="text-left">{{ $a['assessment'] }}</td>
                <td class="text-left">{{ $a['course'] }}</td>
                <td>{{ number_format((float)$a['score'], 2) }}</td>
                <td>{{ $a['submitted_at'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4">No completed assessments recorded.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Final Grades</h2>
    <table>
        <thead>
            <tr>
                <th class="text-left">Program Name</th>
                <th class="text-left">Course Name</th>
                <th>Final Grade</th>
            </tr>
        </thead>
        <tbody>
            @forelse($grades as $g)
            <tr>
                <td class="text-left">{{ $g->course->program->program_name ?? 'N/A' }}</td>
                <td class="text-left">{{ $g->course->course_name ?? 'N/A' }}</td>
                <td style="font-weight: 700;">{{ number_format((float)$g->grade, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="3">No final grades available.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="pdf-footer">
        Generated on: {{ now()->format('F d, Y h:i A') }}
    </div>
</body>
</html>