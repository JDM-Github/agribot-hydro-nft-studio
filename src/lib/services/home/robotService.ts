/**
 * @file robotService.ts
 * @description Provides functions to control the AGRIBOT robot: starting and stopping scanning.
 *              Handles network requests, reactive state updates, and user notifications.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import { get } from 'svelte/store';
import { addToast, removeToast } from '$stores/toast';
import { isConnected, isLivestreaming, isScanning } from '$stores/connection';
import RequestHandler from '$utils/request';

/**
 * Start or stop the robot scanning process.
 * 
 * @param state - `true` to start scanning, `false` to stop scanning
 */
export async function controlScanner(state: boolean,
    isConnected: boolean,
    robotState: number,
    liveState: number,
    scanState: boolean,
    robotScanState: boolean
) {
    if (!isConnected) {
        addToast('You are currently not connected to AGRIBOT.', 'error', 3000);
        return;
    }

    if (robotState) {
        addToast('AGRIBOT Robot are currently running.', 'error', 3000);
        return;
    }

    if (liveState) {
        addToast('Livestream are currently running.', 'error', 3000);
        return;
    }

    const stateText = state ? 'already running' : 'already stopped';
    if (scanState == state) {
        addToast(`Scanner are ${stateText}.`, 'error', 3000);
        return;
    }

    if (robotScanState) {
        addToast('AGRIBOT Robot scanner are currently scanning.', 'error', 3000);
        return;
    }

    const action = state ? 'Starting' : 'Stopping';
    const toastId = addToast(`${action} scanning...`, 'loading');

    try {
        const endpoint = state ? 'start_scan' : 'stop_scan';
        const [success, data] = await RequestHandler.authFetch(endpoint, 'POST');
        removeToast(toastId);

        if (success) {
            addToast(`Scanning ${state ? 'started' : 'stopped'} successfully.`, 'success', 3000);
        } else {
            const errorMessage = data?.error || 'Unknown error';
            addToast(`Failed to ${state ? 'start' : 'stop'} scanning: ${errorMessage}`, 'error', 4000);
            console.error(`Failed to control robot: ${errorMessage}`);
        }
    } catch (err: any) {
        removeToast(toastId);
        addToast(`Network error: ${err.message}`, 'error', 4000);
        console.error('Network error while controlling robot:', err);
    }
}
