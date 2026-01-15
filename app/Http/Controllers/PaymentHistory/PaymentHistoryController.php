<?php

namespace App\Http\Controllers\PaymentHistory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\PaymentHistory\Payment;
use App\Models\PaymentHistory\PaymentFile;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\Rule;
use App\Policies\PaymentHistory\PaymentPolicy;
use App\Services\PaymentHistory\PaymentHistoryService;

class PaymentHistoryController extends Controller
{
    protected  PaymentHistoryService $paymentHistoryService;

    public function __construct(PaymentHistoryService $paymentHistoryService)
    {
        $this->paymentHistoryService = $paymentHistoryService;
    }

    public function paidStudents(Request $request)
    {
        $user = auth()->user();

        if ($user->role->role_name === 'student') {
            abort(403, 'Unauthorized');
        }

        $search = $request->input('search'); // search term from frontend

        $students = Student::where('payment', 'paid')
            ->with([
                'user:user_id,first_name,last_name,middle_name,email',
                'learningMember.program:program_id,program_name',
            ])
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $students->getCollection()->transform(function ($student) {
            return [
                'id' => $student->student_id,
                'user_id' => $student->user_id,
                'name' => $student->user->first_name . ' ' . ($student->user->last_name ?? ''),
                'email' => $student->user->email ?? 'N/A',
                'program' => $student->learningMember->program->program_name ?? 'N/A',
            ];
        });

        return Inertia::render('Accounting/PaidStudents', [
            'students' => $students,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }


    public function paymentHistory($userId)
    {
        $student = Student::with('user')->where('user_id', $userId)->firstOrFail();

        $payments = Payment::withTrashed()
            ->where('user_id', $userId)
            ->latest('receipt_date')
            ->get();

        // Transform the collection
        $payments = $payments->map(function ($payment) {
            return [
                'payment_id'      => $payment->payment_id,
                'payment_method'  => $payment->payment_method,
                'transaction_id'  => $payment->transaction_id,
                'receipt_date'    => $payment->receipt_date,
                'payment_amount'  => $payment->payment_amount,
                'deleted_at'      => $payment->deleted_at,
            ];
        });

        $policy = new PaymentPolicy();
        $user = Auth::user();

        $can = [
            'view'     => true,
            'create'   => $policy->create($user), // admin only
            'download' => $user->role->role_name === 'admin', // admin only
            'viewTabs'    => $user->role->role_name === 'admin', // false for students
            'addPayment'  => $user->role->role_name === 'admin', // false for students
            'download'    => $user->role->role_name === 'admin',
        ];


        return Inertia::render('Accounting/StaffAccounting/PaymentHistoryPage', [
            'student' => [
                'id'      => $student->student_id,
                'user_id' => $student->user_id,
                'name'    => $student->user->first_name . ' ' . $student->user->last_name,
                'email'   => $student->user->email,
            ],
            'PaymentList' => $payments,
            'can'         => $can,
            'userRole' => auth()->user()->role->role_name,
        ]);
    }

    public function myPaymentHistory()
    {
        $userId = auth()->id();
        return $this->paymentHistory($userId);
    }



    public function storePayment(Request $request)
    {
        $policy = new PaymentPolicy();
        $user = auth()->user();

        if (! $policy->create($user)) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'payment_method' => 'required|string',
            'transaction_id' => 'required|string|unique:payments,transaction_id',
            'receipt_date' => 'required|date',
            'payment_amount' => 'required|integer|max:100000',
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Create the payment record
        $payment = Payment::create($request->only([
            'user_id',
            'payment_method',
            'transaction_id',
            'receipt_date',
            'payment_amount'
        ]));

        // Handle file upload
        if ($request->hasFile('proof')) {
            $file = $request->file('proof');

            $path = $file->store('payments', 'public');

            PaymentFile::create([
                'payment_file_id' => Str::uuid(),
                'payment_id'      => $payment->payment_id,
                'file_name'       => $file->getClientOriginalName(),
                'file_path'       => $path,
                'file_type'       => $file->getClientMimeType(),
                'uploaded_by'     => $request->user_id,
                'uploaded_at'     => now(),
            ]);
        }

        // Send notification
        $this->paymentHistoryService->sendPaymentHistoryNotification($payment);

        return redirect()->back()->with('success', 'Payment added successfully!');
    }


    public function viewPaymentInfo($paymentId)
    {
        $payment = Payment::withTrashed()
            ->where('payment_id', $paymentId)
            ->with(['user', 'files'])
            ->firstOrFail();

        $user = auth()->user();
        $policy = new PaymentPolicy();

        // Check if the user is allowed to view this payment
        if (! $policy->view($user, $payment)) {
            abort(403, 'Unauthorized action.');
        }

        // Only pass frontend permissions relevant to this user
        $can = [
            'view'     => true,                        // Everyone viewing this page can see
            'download' => $user->role->role_name === 'admin', // Only admin can download
            'edit'     => $user->role->role_name === 'admin', // Only admin can edit
            'archive'  => $user->role->role_name === 'admin', // Only admin can archive
            'restore'  => $user->role->role_name === 'admin', // Only admin can restore
            'viewArchive'  => $user->role->role_name === 'admin', // false for students
            'viewEdit' => $user->role->role_name === 'admin', // false for students
            'viewFilefilter' => $user->role->role_name === 'admin', // false for students

        ];

        return Inertia::render('Accounting/StaffAccounting/PaymentInfo', [
            'paymentId'       => $payment->payment_id,
            'studentId'       => $payment->user_id,
            'payment_method'  => $payment->payment_method,
            'transaction_id'  => $payment->transaction_id,
            'receipt_date'    => $payment->receipt_date,
            'payment_amount'  => $payment->payment_amount,
            'deleted_at'      => $payment->deleted_at,
            'user' => [
                'first_name'   => $payment->user->first_name,
                'last_name'   => $payment->user->last_name,
                'email'  => $payment->user->email,
                'status' => $payment->user->student->enrollment_status ?? null,
                'profile_image' => $payment->user->profile_image,
            ],
            'files' => $payment->files->map(fn($file) => [
                'id'   => $file->payment_file_id,
                'name' => $file->file_name,
                'url'  => asset('storage/' . $file->file_path),
                'type' => $file->file_type,
                'deleted_at' => $file->deleted_at,
            ]),
            'can' => $can,
            'userRole' => auth()->user()->role->role_name,
        ]);
    }


    public function updatePayment(Request $request, $paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        $user = auth()->user();
        $policy = new PaymentPolicy();

        // Check if user is allowed to update this payment
        if (! $policy->update($user, $payment)) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'payment_method' => 'required|string',
            'transaction_id' => 'required|string|unique:payments,transaction_id,' . $paymentId . ',payment_id',
            'receipt_date'   => 'required|date',
            'payment_amount' => 'required|integer',
            'proof'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $payment->update([
            'payment_method' => $request->payment_method,
            'transaction_id' => $request->transaction_id,
            'receipt_date'   => $request->receipt_date,
            'payment_amount' => $request->payment_amount,
        ]);

        if ($request->hasFile('proof')) {
            PaymentFile::where('payment_id', $payment->payment_id)->delete();

            $file = $request->file('proof');
            $path = $file->store('payments', 'public');

            PaymentFile::create([
                'payment_file_id' => \Illuminate\Support\Str::uuid(),
                'payment_id'      => $payment->payment_id,
                'file_name'       => $file->getClientOriginalName(),
                'file_path'       => $path,
                'file_type'       => $file->getClientMimeType(),
                'uploaded_by'     => $request->user_id ?? auth()->id(),
                'uploaded_at'     => now(),
            ]);
        }

        return back()->with('success', 'Payment updated successfully!');
    }


    public function viewPaymentFile($paymentId, $fileId)
    {
        // Load the file along with its payment (including soft-deleted payments)
        $file = PaymentFile::with(['payment' => fn($q) => $q->withTrashed()])
            ->where('payment_id', $paymentId)
            ->where('payment_file_id', $fileId)
            ->firstOrFail();

        // Make sure the payment exists
        if (! $file->payment) {
            abort(404, 'Payment not found.');
        }

        // Policy check: both admin and student can view
        $file = PaymentFile::where('payment_file_id', $fileId)->firstOrFail();
        $policy = new PaymentPolicy();
        $user = auth()->user();

        if (! $policy->view($user, $file->payment)) {
            abort(403, 'Unauthorized.');
        }

        return Inertia::render('Accounting/StaffAccounting/ViewPaymentFile', [
            'fileName'  => $file->file_name,
            'paymentId' => $paymentId,
            'fileId'    => $fileId,
            'fileUrl'   => route('paymenthistory.payment.file.stream', [
                'paymentId' => $paymentId,
                'fileId'    => $fileId,
            ]),
        ]);
    }


    public function streamPaymentFile($paymentId, $fileId)
    {
        $file = PaymentFile::where('payment_id', $paymentId)
            ->where('payment_file_id', $fileId)
            ->firstOrFail();

        $policy = new PaymentPolicy();
        $user = auth()->user();
        if (! $policy->view($user, $file->payment)) {
            abort(403, 'Unauthorized.');
        }

        return response()->file(storage_path("app/public/{$file->file_path}"));
    }

    public function downloadPaymentFile($paymentId, $fileId)
    {
        $file = PaymentFile::where('payment_id', $paymentId)
            ->where('payment_file_id', $fileId)
            ->firstOrFail();

        $policy = new PaymentPolicy();
        $user = auth()->user();

        // Only admin can download
        if (! $user->role->role_name === 'admin') {
            abort(403, 'Unauthorized.');
        }

        return response()->download(
            storage_path("app/public/{$file->file_path}"),
            $file->file_name
        );
    }

    public function restoreFile($paymentId, $fileId)
    {
        $file = PaymentFile::withTrashed()
            ->where('payment_id', $paymentId)
            ->where('payment_file_id', $fileId)
            ->firstOrFail();

        $user = auth()->user();
        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        PaymentFile::where('payment_id', $paymentId)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => now()]);

        $file->restore();

        return redirect()
            ->route('paymenthistory.paymentInfo.view', $paymentId)
            ->with('success', 'File reverted successfully!');
    }

    public function archivePayment($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        if (auth()->user()->role->role_name !== 'admin') {
            abort(403, 'Unauthorized.');
        }
        $payment->delete();

        return redirect()
            ->route('paymenthistory.payment.history', $payment->user_id)
            ->with('success', 'Payment archived successfully!');
    }

    public function restorePayment($paymentId)
    {
        $payment = Payment::withTrashed()->findOrFail($paymentId);
        if (auth()->user()->role->role_name !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        if ($payment->trashed()) {
            $payment->restore();
        }

        return redirect()
            ->route('paymenthistory.payment.history', $payment->user_id)
            ->with('success', 'Payment restored successfully!');
    }

    public function exportPdf($userId)
    {
        $user = auth()->user();

        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $payments = Payment::with('user.role')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->get();

        if ($payments->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No payment records found for this user.'
            ], 404);
        }

        $student = $payments->first()->user;
        $studentName = $student ? ($student->first_name . '_' . $student->last_name) : 'Unknown_User';

        $pdf = Pdf::loadView('paymenthistory.payments-pdf', compact('payments'));

        return $pdf->download("PaymentHistory_{$studentName}.pdf");
    }

    public function exportCsv($userId)
    {
        $user = auth()->user();

        if ($user->role->role_name !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $payments = Payment::with('user.role')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->get();

        if ($payments->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No payment records found for this user.'
            ], 404);
        }

        $student = $payments->first()->user;
        $studentName = $student ? ($student->first_name . '_' . $student->last_name) : 'Unknown_User';

        $fileName = "PaymentHistory_{$studentName}.csv";

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Payment Method', 'Transaction ID', 'Receipt Date', 'Payment Amount'];

        $callback = function () use ($payments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->payment_method,
                    $payment->transaction_id,
                    $payment->receipt_date,
                    $payment->payment_amount,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
