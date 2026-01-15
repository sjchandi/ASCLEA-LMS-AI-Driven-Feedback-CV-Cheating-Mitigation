<?php

namespace App\Http\Requests\Programs;

use Illuminate\Foundation\Http\FormRequest;

class SaveQuizRequest extends FormRequest
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
            'quiz_title' => 'required|string|max:255',
            'quiz_description' => 'nullable|string',
            'duration' => 'integer|min:0',
            'quiz_total_points' => 'nullable|numeric|min:0',
            'show_answers_after' => 'boolean',
            'cheating_mitigation' => 'boolean',
            'randomize' => 'boolean',
            'cv_options' => 'nullable|array',
            'cv_options.*' => 'string|in:book,laptop,cellphone,up,down,left,right',
        ];
    }
}
