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
import type { WritableBoolean } from '$lib/type';
import { get } from 'svelte/store';
import { isLivestreaming } from '$lib/stores/connection';

/** Shared configuration instance */
export const config: Config = new Config();

/**
 * Initialize configuration from localStorage if not already initialized.
 * @param isAlreadyInitialize - Writable boolean flag to prevent multiple initializations
 */
export function initiateConfig(isAlreadyInitialize: WritableBoolean) {
    if (!get(isAlreadyInitialize)) {
        try {
            isAlreadyInitialize.set(true);
            const stored = localStorage.getItem('userConfig');
            if (stored) {
                const parsed = JSON.parse(stored);
                config.applyConfig(parsed);
                addToast('Loaded configuration from localStorage.', 'info', 3000);
            }
        } catch (err) {
            addToast('Error loading configuration from localStorage.', 'error', 3000);
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
export function downloadConfig() {
    config.downloadConfig();
    addToast('Configuration downloaded successfully.', 'success', 3000);
}

/**
 * Upload a configuration from a JSON file, validate it, and apply it.
 */
export function uploadConfig() {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            try {
                const parsed = JSON.parse(e.target.result as string);
                const validated = validateAndNormalizeConfig(parsed);
                config.applyConfig(validated);
                addToast('Configuration loaded successfully.', 'success', 3000);
            } catch (err) {
                addToast('Invalid configuration file.', 'error', 3000);
                console.error('uploadConfig error:', err);
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Save the current configuration to cloud and localStorage.
 * @param data - User-related data, including email for cloud API
 */
export async function saveConfig(data: any) {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }

    const confirmed = await confirmToast(
        'Save this configuration? This will overwrite your current settings.'
    );
    if (!confirmed) return;

    const toastId = addToast('Updating configuration...', 'loading');
    const currentConfig = config.getCurrentConfig();

    try {
        const response = await RequestHandler.fetchData('post', 'user/update-config', {
            email: (data.user as any).email,
            config: currentConfig
        });

        removeToast(toastId);

        if (response.success) {
            const [success, _] = await RequestHandler.authFetch('update-config', 'POST', {
                config: currentConfig
            });
            if (!success) {
                addToast('Configuration saved to cloud, but robot not updated.', 'error', 4000);
            }

            localStorage.setItem('userConfig', JSON.stringify(currentConfig));
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
