/**
 * @file transform.ts
 * @description Provides a helper function to transform an array of machine learning models
 *              into a dictionary keyed by model version, with their evaluation metrics.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import type { Model, ModelArray, TransformModel } from "$types/model";
import type { PlantList, PlantListTransformed } from "../type";

/**
 * Converts an array of Model objects into a dictionary keyed by model version.
 * @param models - Array of Model objects to transform
 * @returns Dictionary of models keyed by version, containing metrics
 */
export function transformModels(models: ModelArray): TransformModel {
    const output: TransformModel = {};
    models.forEach((item: Model) => {
        output[item.version] = {
            description: item.description,
            accuracy_top1: parseFloat(item.accuracy_top1),
            accuracy_top5: parseFloat(item.accuracy_top5),
            precision: parseFloat(item.precision),
            recall: parseFloat(item.recall),
            mAP50: parseFloat(item.mAP50),
            mAP50_95: parseFloat(item.mAP50_95)
        };
    });
    return output;
}


export function transformPlantList(plants: PlantList): PlantListTransformed {
    return plants.reduce<PlantListTransformed>((acc, plant) => {
        acc[plant.name] = plant;
        return acc;
    }, {});
}