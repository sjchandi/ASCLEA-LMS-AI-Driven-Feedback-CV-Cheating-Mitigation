<?php

namespace App\Services\Programs;

use App\Models\Programs\Assessment;
use App\Models\Programs\Material;
use App\Models\Programs\Section;
use App\Models\Programs\SectionItem;
use Carbon\Carbon;

class SectionItemService
{
    public function getSectionItemCompleteDetails(SectionItem $sectionItem)
    {
        return $sectionItem->load([
            'item' => function ($morphTo) {
                $morphTo->morphWith([
                    // For Assessments
                    Assessment::class => [
                        'assessmentType',
                        'author:user_id,first_name,last_name',
                        'quiz:assessment_id,quiz_id,quiz_title',
                        'files:assessment_id,assessment_file_id,file_name,file_path',
                    ],

                    // For Materials
                    Material::class => [
                        'author:user_id,first_name,last_name',
                        'materialFiles:material_id,material_file_id,file_name,file_path',
                    ],
                ]);
            },
        ]);
    }
    public function createSectionItem(string $sectionId, string $itemId, $itemType)
    {
        $itemsCount  = SectionItem::where('section_id', $sectionId)->count();

        $sectionItem = SectionItem::create([
            'section_id' => $sectionId,
            'item_type' =>  $itemType,
            'item_id' => $itemId,
            'order' =>  $itemsCount + 1
        ]);

        return $this->getSectionItemCompleteDetails($sectionItem);
    }

    public function updateSectionItem(SectionItem $sectionItem)
    {
        $sectionItem->update([
            'updated_at' => Carbon::now()
        ]);

        $sectionItem->refresh();

        return $this->getSectionItemCompleteDetails($sectionItem);
    }

    public function sortSectionItem(Section $section, SectionItem $sectionItem, array $data)
    {
        // Updates the sort order of the dragged section item
        $sectionItem->update(['order' => $data['newSortOrder']]);

        // Reorder logic:
        // - If the section item is moved DOWN (newSortOrder > origSortOrder):
        //   We have to decrement all the section items between the original pos and new pos of the section item
        // - If the section item is moved UP (newSortOrder < origSortOrder):
        //   We have to increment all the section items between the original pos and new pos of the section item

        if ($data['newSortOrder'] > $data['origSortOrder']) {
            SectionItem::where('section_item_id', "!=", $sectionItem->section_item_id)
                ->where('section_id', $section->section_id)
                ->where('order', "<=", $data['newSortOrder'])
                ->where('order', '>', $data['origSortOrder'])
                ->decrement('order');
        } else {
            SectionItem::where('section_item_id', "!=", $sectionItem->section_item_id)
                ->where('section_id', $section->section_id)
                ->where('order', ">=", $data['newSortOrder'])
                ->where('order', '<', $data['origSortOrder'])
                ->increment('order');
        }
    }

    // Decrement the order of the folllowing items after an item was deleted
    public function decrementSectionItems(SectionItem $sectionItem)
    {
        SectionItem::where('section_id',  $sectionItem->section_id)
            ->where('order', ">", $sectionItem->order)
            ->decrement('order');
    }
}
