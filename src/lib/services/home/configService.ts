/**
 * @file configService.ts
 * @description Provides functions to manage the AGRIBOT configuration.
 *              Includes initialization, revert, upload/download, and save operations.
 *              Works with localStorage, cloud sync, and validation utilities.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import { Config } from '$class/config';
import RequestHandler from '$utils/request';
import { addToast, confirmToast, removeToast } from '$stores/toast';
import { validateAndNormalizeConfig } from '$utils/validation';
import type { PlantListTransformed, WritableBoolean, WritableModelArray } from '$lib/type';
import { get } from 'svelte/store';
import { isLivestreaming, userData } from '$lib/stores/connection';
import { ImageWithJSON } from '$class/imageJson';
import { saveToDB } from '$root/lib/utils/indexdb';

/** Shared configuration instance */
export const config: Config = new Config();

/**
 * Initialize configuration from localStorage if not already initialized.
 * @param isAlreadyInitialize - Writable boolean flag to prevent multiple initializations
 */
export function initiateConfig(
    userConfig: any,
    isAlreadyInitialize: WritableBoolean,
    yoloObjectDetection: WritableModelArray,
    yoloStageClassification: WritableModelArray,
    maskRCNNSegmentation: WritableModelArray,
) {
    if (!get(isAlreadyInitialize)) {
        try {
            const conf = userConfig.config || null;
            if (conf) {
                conf.objectDetection = conf.objectDetection && conf.objectDetection !== ""
                    ? conf.objectDetection
                    : get(yoloObjectDetection)[0]?.version || "";

                conf.stageClassification = conf.stageClassification && conf.stageClassification !== ""
                    ? conf.stageClassification
                    : get(yoloStageClassification)[0]?.version || "";

                conf.diseaseSegmentation = conf.diseaseSegmentation && conf.diseaseSegmentation !== ""
                    ? conf.diseaseSegmentation
                    : get(maskRCNNSegmentation)[0]?.version || "";

                config.applyConfig(conf);
                config.saveConfig();
            }
        } catch (err) {
            addToast('Error loading configuration.', 'error', 1000);
            console.error('initiateConfig error:', err);
        }
    }
}

/**
 * Revert configuration to the last saved state.
 */
export async function revertConfig() {
    if (await confirmToast('Revert to last saved configuration?')) {
        config.revertConfig();
        addToast('Configuration reverted to last saved state.', 'info', 3000);
    }
}

/**
 * Download the current configuration as a JSON file.
 */
export async function downloadConfig() {
    const toastId = addToast('Downloading configuration...', 'loading');
    await config.downloadConfig();
    removeToast(toastId);
    addToast('Configuration downloaded successfully.', 'success', 3000);
}

/**
 * Upload a configuration from a PNG image, validate it, and apply it.
 */
export function uploadConfig(
    allPlants: PlantListTransformed,
    yoloObjectDetection: WritableModelArray,
    yoloStageClassification: WritableModelArray,
    maskRCNNSegmentation: WritableModelArray,
) {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';

    input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            try {
                const arrayBuffer = e.target.result as ArrayBuffer;
                const buffer = new Uint8Array(arrayBuffer);

                const parsed = ImageWithJSON.readImageBuffer(buffer);
                if (!parsed) throw new Error("No config data found in PNG");

                const validated = validateAndNormalizeConfig(
                    parsed,
                    allPlants,
                    yoloObjectDetection,
                    yoloStageClassification,
                    maskRCNNSegmentation,
                );
                config.applyConfig(validated);

                addToast('Configuration loaded successfully from image.', 'success', 3000);
            } catch (err) {
                addToast('Invalid configuration image.', 'error', 3000);
                console.error('uploadConfig error:', err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    input.click();
}

/**
 * Save the current configuration to cloud and localStorage.
 * @param data - User-related data, including email for cloud API
 */
export async function saveConfig(userData: any, deviceID: string, isConnected: boolean) {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }
    const confirmed = await confirmToast('Save this configuration? This will overwrite your current settings.');
    if (!confirmed) return;

    let toastId = addToast('Updating configuration...', 'loading');
    const currentConfig = config.getCurrentConfig();
    try {
        const response = await RequestHandler.fetchData('post', 'user/update-config', {
            id: userData.user.id,
            config: currentConfig,
            deviceID: deviceID
        });
        removeToast(toastId);
        if (response.success) {
            config.saveConfig();
            userData.notifications = response.notifications;
            userData.user.config = currentConfig;
            await saveToDB('userData', userData, false);
            if (isConnected) {
                toastId = addToast('Updating configuration in AGRIBOT...', 'loading');
                const [success, _] = await RequestHandler.authFetch('update-config', 'POST', {
                    config: currentConfig
                });
                removeToast(toastId);
                if (!success)
                    addToast('Configuration saved to cloud, but robot not updated.', 'error', 4000);
                else
                    addToast('Configuration updated in AGRIBOT.', "success", 4000);
            }
            addToast('Configuration saved successfully.', 'success', 3000);
        } else {
            addToast(response.message || 'Updating configuration failed.', 'error', 3000);
        }
    } catch (err) {
        removeToast(toastId);
        addToast('An unexpected error occurred.', 'error', 3000);
        console.error('saveConfig error:', err);
    }
}
