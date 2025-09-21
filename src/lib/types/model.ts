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

    /** Overall accuracy of the model (0 to 1) */
    accuracy: number;

    /** Precision score of the model (0 to 1) */
    precision: number;

    /** Recall score of the model (0 to 1) */
    recall: number;

    /** Mean Average Precision at IoU=0.5 (0 to 1) */
    mAP50: number;

    /** Mean Average Precision at IoU=0.5:0.95 (0 to 1) */
    mAP50_95: number;
};
