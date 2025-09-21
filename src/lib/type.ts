/**
 * @file types.ts
 * @description Defines TypeScript interfaces and types for plant detection, scheduling, spraying,
 *              and configuration management within the AGRIBOT system.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import type { Writable } from "svelte/store";
import type { Model } from "$lib/types/model";

/**
 * Represents a plant entity with metadata, image reference, and spray status.
 */
export interface PlantInterface {
	id: number;              // Unique identifier for the plant
	imageUrl: string;        // URL or path to the plant image
	description: string;     // Descriptive text for the plant
	name: string;            // Common name of the plant
	icon: string;            // Associated icon for UI display
	spray: string | null;    // Selected spray (if any) applied to the plant
	row: number;             // Greenhouse row location
	column: number;          // Greenhouse column location
	timestamp: string;       // Detection timestamp (ISO 8601 format)
	confidence: number;      // Confidence level of the detection (0–1 scale or %)
}

/**
 * Represents a plant detected by the vision system,
 * including disease detection states and spray scheduling.
 */
export type DetectedPlant = {
	key: string;                                 // Unique detection key
	timestamp: string;                           // Detection time
	disabled: boolean;                           // Flag to ignore this plant in processing
	willSprayEarly: boolean;                     // Indicates if the plant should be sprayed earlier than scheduled
	disease: {
		[key: string]: boolean[];                // Disease classification results by model key
	};
	disease_time_spray: {
		[key: string]: [string, string];         // Mapping of disease → [lastSprayTime, nextSprayTime]
	};
};

/**
 * Writable store specializations for stronger typing.
 */
export type WritableString  = Writable<string>;
export type WritableNumber  = Writable<number>;
export type WritableBoolean = Writable<boolean>;

export type WritableModel      = Writable<Model>;
export type WritableModelArray = Writable<Model[]>;

export type DetectedPlantArray = DetectedPlant[];

/**
 * Represents an automated spray schedule.
 */
export type Schedule = {
	frequency: string;                           // e.g., "daily", "weekly"
	runs: { time: string; upto: string }[];      // Array of run times with duration cutoffs
	days: string[];                              // Days of the week this schedule applies
};

/**
 * Represents spray configuration with chemical assignment,
 * activation flags, and duration per spray channel.
 */
export type Spray = {
	spray: [string, string, string, string];     // Names or IDs of assigned chemicals per channel
	active: [boolean, boolean, boolean, boolean];// Whether each channel is active
	duration: [number, number, number, number];  // Duration (in seconds) per channel
};


/**
 * Represents the global configuration object containing
 * detection models, thresholds, scheduling, and spray settings.
 */
export type ConfigType = {
	detectedPlants: DetectedPlant[];             // Currently detected plants
	sprays: Spray;                               // Spray configuration
	schedule: Schedule;                          // Spray schedule configuration

	objectDetection: string;                     // Object detection model version
	stageClassification: string;                 // Plant stage classification model version
	diseaseSegmentation: string;                 // Disease segmentation model version

	objectDetectionConfidence: number;           // Confidence threshold for object detection
	stageClassificationConfidence: number;       // Confidence threshold for stage classification
	diseaseSegmentationConfidence: number;       // Confidence threshold for disease segmentation
};


export type FunctionType = () => {};