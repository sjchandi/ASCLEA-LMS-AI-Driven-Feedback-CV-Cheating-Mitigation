<?php

namespace App\Http\Controllers\Programs;

use App\Http\Controllers\Controller;
use App\Http\Requests\Programs\AddMaterialRequest;
use App\Models\Course;
use App\Models\Program;
use App\Models\Programs\Material;
use App\Models\Programs\MaterialFile;
use App\Services\HandlingPrivateFileService;
use App\Services\Programs\MaterialService;
use App\Services\Programs\SectionItemService;
use App\Services\Programs\SectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;

class MaterialController extends Controller
{
    protected MaterialService $materialService;
    protected SectionItemService $sectionItemService;
    protected SectionService $sectionService;

    public function __construct(MaterialService $materialService, SectionItemService $sectionItemService, SectionService $sectionService)
    {
        $this->materialService = $materialService;
        $this->sectionItemService = $sectionItemService;
        $this->sectionService = $sectionService;
    }

    public function addMaterial(AddMaterialRequest $request, Program $program, Course $course)
    {
        $validatedData = $request->validated();
        $validatedData['course_id'] = $course->course_id;
        $validatedData['created_by'] = $request->user()->user_id;

        // DB rollback when one of db transaction failed
        return DB::transaction(function () use ($request, $validatedData, $course, $program) {
            // Save the materials data in the table
            $material = Material::create($validatedData);

            // Save the files in file storage and table if it has value
            if ($request->hasFile("material_files")) {
                $this->materialService->saveMaterialFiles($request->material_files, $material);
            }

            if (array_key_exists('section_id', $validatedData) && !is_null($validatedData['section_id'])) {
                $sectionItem = $this->sectionItemService->createSectionItem($validatedData['section_id'], $material->material_id, Material::class);

                // Return the section item with material details
                return response()->json(['success' => "Material added in section successfully.", 'data' => $sectionItem]);
            }

            if ($material->status === "published") {
                $this->materialService->sendMaterialNotification($material, $course, $program);
            }

            // Return here the material details
            $materialCompleteDetails = $this->materialService->getmaterialCompleteDetails($material);

            return response()->json(['success' => "Material added successfully.", 'data' => $materialCompleteDetails]);
        });
    }

    public function getMaterials(Request $request, Program $program, Course $course)
    {
        $materialList = $this->materialService->getMaterialList($request->user(), $course->course_id);

        return response()->json($materialList);
    }

    public function updateMaterial(AddMaterialRequest $request, Program $program, Course $course, Material $material)
    {
        $validatedMaterialData = $request->validated();

        // DB rollback when one of db transaction failed
        return DB::transaction(function () use ($request, $validatedMaterialData, $material, $course, $program) {
            $upatedMaterial = $this->materialService->updateMaterial($material, $validatedMaterialData);

            if (!empty($request->removed_files)) {
                $this->materialService->removeMaterialFiles($request->removed_files);
            }

            if ($request->has("material_files")) {
                $this->materialService->saveMaterialFiles($validatedMaterialData['material_files'], $upatedMaterial);
            }

            if (array_key_exists('section_id', $validatedMaterialData) && !is_null($validatedMaterialData['section_id'])) {
                $sectionItem = $this->sectionItemService->updateSectionItem($upatedMaterial->sectionItem);

                // Return the section item with material details
                return response()->json(['success' => "Material added in section successfully.", 'data' => $sectionItem]);
            }

            if ($material->status === "published") {
                $this->materialService->sendMaterialNotification($material, $course, $program);
            }

            $materialCompleteDetails = $this->materialService->getmaterialCompleteDetails($upatedMaterial);

            return response()->json(['success' => "Material updated sucessfully.", 'data' => $materialCompleteDetails]);
        });
    }

    public function unpublishMaterial(Program $program, Course $course, Material $material)
    {
        // Updates the material status by using true as argument in the service
        $unpublishedmaterial = $this->materialService->updateMaterial($material, [], true);

        $materialCompleteDetails = $this->materialService->getmaterialCompleteDetails($unpublishedmaterial);

        return response()->json(['success' => "Assessment unpublished sucessfully.", 'data' => $materialCompleteDetails]);
    }

    public function archiveMaterial(Program $program, Course $course, Material $material)
    {
        $archivedMaterial = $this->materialService->archiveMaterial($material);

        return response()->json([
            "success" => "Material " . ($material->sectionItem ? 'deleted' : 'archived') . " successfully.",
            "data" => $archivedMaterial
        ]);
    }

    public function restoreMaterial(Program $program, Course $course, $material)
    {
        $restoredMaterial = $this->materialService->restoreMaterial($material);

        return response()->json(["success" => "Material restored successfully.", "data" => $restoredMaterial]);
    }

    public function viewMaterial(Request $request, Program $program, Course $course, Material $material)
    {
        $materialCompleteDetails = $this->materialService->getmaterialCompleteDetails($material);
        $assignedCourseId = $this->sectionService->getAssignedCourseId($request->user(), $course->course_id);

        // Check if the material iss part of section
        // This will be use to add a Done button in the client
        $materialCompleteDetails->load([
            'sectionItem.studentProgress' => function ($q) use ($assignedCourseId) {
                $q->where('assigned_course_id', $assignedCourseId);
            },
        ]);

        return Inertia::render('Programs/ProgramComponent/CourseComponent/CourseContentTab/ModulesComponents/Components/ViewMaterial', [
            'programId' => $program->program_id,
            'courseId' => $course->course_id,
            'material' => $materialCompleteDetails,
        ]);
    }

    public function streamMaterialFile(Program $program, Course $course, Material $material, MaterialFile $file)
    {
        return HandlingPrivateFileService::retrieveFile($file->file_path);
    }

    public function downloadMaterialFile(Program $program, Course $course, Material $material, MaterialFile $file)
    {
        return HandlingPrivateFileService::downloadFile($file->original_file_path,  $file->file_name);
    }
}
