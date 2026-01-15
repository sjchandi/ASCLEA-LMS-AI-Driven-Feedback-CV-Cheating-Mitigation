<?php

namespace App\Http\Requests\Programs;

use Illuminate\Foundation\Http\FormRequest;

class SaveAssessmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'assessment_type' => 'required|exists:assessment_types,assessment_type',
            'assessment_title' => 'required|string|max:255',
            'assessment_description' => 'nullable|string',
            'due_datetime' => 'nullable|date|after:now',
            'total_points' => 'nullable|numeric|min:0',
            'status' => 'required|in:published,draft',
            'section_id' => 'nullable|string',

            // Files
            'assessment_files' => 'nullable|array|max:10',
            'assessment_files.*' => 'file|mimes:pdf,docx,pptx,png,jpg,jpeg|max:204800'
        ];
    }

    public function messages(): array
    {
        // Change the error message for max file uploads
        return [
            'assessment_files.max' => 'Maximum 10 files can be uploaded at once.',
        ];
    }

    public function attributes(): array
    {
        $attributes = [];

        // Change the atrribute to file name instead of index
        foreach ($this->file('assessment_files') ?? [] as $index => $file) {
            $attributes["assessment_files.$index"] = $file->getClientOriginalName();
        }

        $attributes['due_datetime'] = 'due date and time';

        return $attributes;
    }
}
