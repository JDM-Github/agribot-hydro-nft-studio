/**
 * @file robotStatus.ts
 * @description Provides reusable helper functions for checking AGRIBOT robot scanner
 *              and connection states. Useful for controlling camera feeds and
 *              preventing actions when the robot is busy or disconnected.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import { get } from 'svelte/store';
import { isConnected, isScanning, isRobotRunning, currentLink } from '$stores/connection';

/**
 * Check if the robot scanner is in a state where actions can be performed.
 * Returns `true` if robot scanner is ready, `false` if busy or disconnected.
 */
export function isRobotScannerAvailable(): boolean {
    return get(isConnected) && get(isRobotRunning) === 'Stopped';
}

/**
 * Returns `true` if robot scanner is busy (not ready for actions)
 */
export function isRobotScannerBusy(): boolean {
    return !isRobotScannerAvailable();
}

/**
 * Returns `true` if the robot is currently scanning
 */
export function isRobotScanning(): boolean {
    return get(isScanning);
}

/**
 * Returns `true` if the robot is not scanning
 */
export function isRobotNotScanning(): boolean {
    return !isRobotScanning();
}

/**
 * Returns `true` if the currentLink store is null or empty
 */
export function isCurrentLinkEmpty(): boolean {
    const link = get(currentLink);
    return !link || link.trim() === '';
}
