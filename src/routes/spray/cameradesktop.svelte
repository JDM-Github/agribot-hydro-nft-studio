<script lang="ts">
/**
 * @file CameraDesktop.svelte
 * @description Provides a desktop-friendly view of the robot camera. Displays camera information,
 *              integrates with robot status utilities, and uses the connection store for live links.
 *
 * @props
 *   - cameraInfo: CameraInfo object initialized with default CAMERA_INFO.
 *
 * @imports
 *   - CAMERA_INFO: Constant containing default camera configuration.
 *   - CameraInfo: Type definition for camera information object.
 *   - isRobotScannerAvailable, isRobotScanning, isCurrentLinkEmpty: Utilities for checking robot status.
 *   - Camerainfo: Component for rendering detailed camera information.
 *   - currentLink: Store containing the current camera connection link.
 *
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Constants
import { CAMERA_INFO } from '$constant/cameraInfo';

// Types
import type { CameraInfo } from '$types/cameraInfo';

// Components
import Camerainfo from '$routes/spray/camerainfo.svelte';
import { Connection } from '$root/lib/class/connection';
// ----------------------------
// Props
// ----------------------------
export let cameraInfo: CameraInfo = CAMERA_INFO;
export let isConnected: boolean;
export let liveState: number;
export let scannerState: boolean;
export let robotState: number;
export let robotScanState: boolean;
export let performing: boolean;
export let robotLive: boolean;
export let stopCapture: boolean;

$: scanFrameUrl = Connection.getScanFrameURL();
</script>

<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div
	class="hidden w-full transform overflow-hidden rounded-2xl bg-white shadow-lg duration-500 ease-out md:max-w-md md:flex-none lg:block dark:bg-gray-900"
>
	<div
		class="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-inner md:h-80 dark:bg-gray-800"
	>
		{#if   isConnected
			&& scannerState
			&& !robotState
			&& !robotScanState
			&& !liveState
			&& !robotLive
			&& !performing
			&& !stopCapture
		}
			{#if !$scanFrameUrl}
				<span
					class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300"
				>
					📷 RUNNING
				</span>
			{:else}
				<img
					src={$scanFrameUrl}
					alt="Scanning Feed"
					class="max-h-full max-w-full rounded-md border object-contain dark:border-gray-600"
				/>
			{/if}
		{:else}
			<span class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
				📷 Live Camera Feed
			</span>
		{/if}
	</div>
	<Camerainfo {cameraInfo} />
</div>
