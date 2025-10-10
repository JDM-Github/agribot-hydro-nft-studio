/**
 * @file plantService.ts
 * @description Provides functions to manage detected plants: disabling, removing, and filtering.
 *              Uses the shared `config` service and reactive Svelte stores.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import { get } from 'svelte/store';
import { config } from '$services/home/configService';
import { addToast, removeToast } from '$stores/toast';
import RequestHandler from '$utils/request';
import type { DetectedPlant, PlantListTransformed } from '$lib/type';
import { isLivestreaming } from '$stores/connection';

/**
 * Disable a detected plant at the given index.
 * @param selectedPlantIndex - Index of the plant to disable
 */
export function disablePlant(selectedPlantIndex: number) {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }

    config.detectedPlants.update((plants) => {
        const updated = [...plants];
        if (updated[selectedPlantIndex]) {
            updated[selectedPlantIndex].disabled = true;
        }
        return updated;
    });

    addToast('Plant disabled successfully.', 'info', 3000);
}

/**
 * Remove a detected plant by its key.
 * @param key - Unique key of the plant to remove
 */
export async function removePlant(key: string, sid: string) {
    if (get(isLivestreaming) !== 'Stopped') {
        addToast('Action unavailable while livestreaming.', 'error', 3000);
        return;
    }
    const toastId = addToast(`Removing "${key}"...`, 'loading');
    try {
        RequestHandler.authFetch(`remove_result`, 'POST', {
            key, sid
        });
        config.detectedPlants.update((plants) => plants.filter((p) => p.key !== key));
        addToast(`Removed "${key}" successfully.`, 'success', 3000);
    } catch (err: any) {
        addToast(`Failed to remove "${key}": ${err.message}`, 'error', 4000);
        console.error('Error removing plant:', err);
    } finally {
        removeToast(toastId);
    }
}

/**
 * Filter detected plants by a search term.
 * @param plants - Array of detected plants
 * @param search - Search string to filter by name
 * @returns Filtered array of detected plants
 */
export function filterDetectedPlants(plants: DetectedPlant[], allPlants: PlantListTransformed, search: string): DetectedPlant[] {
    return plants.filter((p) => {
        const name = allPlants[p.key]?.name?.toLowerCase() ?? '';
        return name.includes(search.trim().toLowerCase());
    });
}
