<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tab_detected', function (Blueprint $table) {
            $table->uuid('tabdetect_id')->primary(); // Primary key UUID
            $table->uuid('assessment_submission_id'); // FK to assessment_submissions

            $table->string('message'); 
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('assessment_submission_id')
                  ->references('assessment_submission_id')
                  ->on('assessment_submissions')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_detected');
    }
};
