/**
 * @file Config.ts
 * @description Configuration store manager for handling plant detection, spraying, and scheduling settings.
 *              Provides methods to apply, revert, save, and download configuration states.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 * 
 * @note This module integrates with Svelte writable stores and maintains a baseline (initial) config
 *       that can be restored if changes need to be reverted.
 */

import { get, writable, type Writable } from "svelte/store";
import { config as newConfig } from "$stores/config";
import type { DetectedPlant, ConfigType, Schedule, Spray, WritableNumber, WritableString } from "$lib/type";
import { deepEqual } from "$utils/deepEqual";

/**
 * Config class
 * 
 * Manages reactive configuration values used across the application.
 * Provides methods to apply, revert, persist, and export configuration states.
 */
class Config {
    /** Model version identifiers */
    public objectDetectionVersion       : WritableString;
    public stageClassificationVersion   : WritableString;
    public diseaseSegmentationVersion   : WritableString;

    /** Core writable stores */
    public detectedPlants               : Writable<DetectedPlant[]>;
    public sprays                       : Writable<Spray>;
    public schedule                     : Writable<Schedule>;

    /** Model confidence thresholds */
    public objectDetectionConfidence    : WritableNumber;
    public stageClassificationConfidence: WritableNumber;
    public diseaseSegmentationConfidence: WritableNumber;

    /** Cached initial configuration for reversion */
    private initialConfig               : ConfigType;

    constructor() {
        // Initialize reactive stores with default config
        this.detectedPlants                = writable(newConfig.detectedPlants);
        this.schedule                      = writable(newConfig.schedule);
        this.sprays                        = writable(newConfig.sprays);
        this.objectDetectionVersion        = writable(newConfig.objectDetection);
        this.stageClassificationVersion    = writable(newConfig.stageClassification);
        this.diseaseSegmentationVersion    = writable(newConfig.diseaseSegmentation);
        this.objectDetectionConfidence     = writable(newConfig.objectDetectionConfidence);
        this.stageClassificationConfidence = writable(newConfig.stageClassificationConfidence);
        this.diseaseSegmentationConfidence = writable(newConfig.diseaseSegmentationConfidence);

        // Save a deep copy of the initial configuration
        this.initialConfig                 = structuredClone(newConfig);
    }

    /**
     * Apply a new configuration to the writable stores.
     * Falls back to default config values when properties are missing.
     */
    applyConfig(config: ConfigType) {
        this.detectedPlants.               set(config.detectedPlants || newConfig.detectedPlants);
        this.schedule.                     set(config.schedule || newConfig.schedule);
        this.sprays.                       set(config.sprays || newConfig.sprays);
        this.objectDetectionVersion.       set(config.objectDetection || newConfig.objectDetection);
        this.stageClassificationVersion.   set(config.stageClassification || newConfig.stageClassification);
        this.diseaseSegmentationVersion.   set(config.diseaseSegmentation || newConfig.diseaseSegmentation);
        this.objectDetectionConfidence.    set(config.objectDetectionConfidence || newConfig.objectDetectionConfidence);
        this.stageClassificationConfidence.set(config.stageClassificationConfidence || newConfig.stageClassificationConfidence);
        this.diseaseSegmentationConfidence.set(config.diseaseSegmentationConfidence || newConfig.diseaseSegmentationConfidence);
    }

    /**
     * Revert configuration to the last saved state.
     */
    revertConfig() {
        this.applyConfig(this.initialConfig);
    }

    /**
    * Persist the current configuration as the new baseline.
    */
    saveConfig() {
        this.initialConfig = this.getCurrentConfig();
    }

    /**
     * Extract the current configuration snapshot.
     */
    getCurrentConfig(): ConfigType {
        return {
            detectedPlants:                get(this.detectedPlants),
            schedule:                      get(this.schedule),
            sprays:                        get(this.sprays),
            objectDetection:               get(this.objectDetectionVersion),
            stageClassification:           get(this.stageClassificationVersion),
            diseaseSegmentation:           get(this.diseaseSegmentationVersion),
            objectDetectionConfidence:     get(this.objectDetectionConfidence),
            stageClassificationConfidence: get(this.stageClassificationConfidence),
            diseaseSegmentationConfidence: get(this.diseaseSegmentationConfidence)
        };
    }

    /**
     * Check if current configuration differs from the last saved baseline.
     */
    isDirty(): boolean {
        const current = this.getCurrentConfig();
        return !deepEqual(current, this.initialConfig);
    }

    /**
     * Download the current configuration as a JSON file.
     */
    downloadConfig() {
        const config = this.getCurrentConfig();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "config.json";
        a.click();
        URL.revokeObjectURL(url);
    }
}

export { Config };
