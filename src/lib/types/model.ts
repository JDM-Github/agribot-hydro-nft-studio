/**
 * @file model.ts
 * @description Type definition for machine learning model metadata.
 *              Used for storing model metrics and versioning information.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

/**
 * Represents a machine learning model and its evaluation metrics.
 */
export type Model = {
    /** Unique identifier for the model */
    id: string | number;

    /** Model version string (e.g., "v1.0.0") */
    version: string;

    /** Optional short description of the model */
    description: string;

    /** Precision score of the model (0 to 1) */
    precision: string;

    /** Recall score of the model (0 to 1) */
    recall: string;

    /** Mean Average Precision at IoU=0.5 (0 to 1) */
    mAP50: string;

    /** Mean Average Precision at IoU=0.5:0.95 (0 to 1) */
    mAP50_95: string;

    /** Top-1 accuracy (optional, -1 if not applicable) */
    accuracy_top1: string;

    /** Top-5 accuracy (optional, -1 if not applicable) */
    accuracy_top5: string;
};


export type ModelArray = Model[];

/** Dictionary of models keyed by version */
export type TransformModel = {
    [version: string]: {
        description: string;

        accuracy_top1: number;

        accuracy_top5: number;

        precision: number;

        recall: number;

        mAP50: number;

        mAP50_95: number;
    };
};