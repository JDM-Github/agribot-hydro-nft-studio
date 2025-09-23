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

// Utils
import { isRobotScannerAvailable, isRobotScanning, isCurrentLinkEmpty } from '$utils/robotStatus';

// Components
import Camerainfo from '$routes/spray/camerainfo.svelte';

// Stores
import { currentLink } from '$stores/connection';

// ----------------------------
// Props
// ----------------------------
export let cameraInfo: CameraInfo = CAMERA_INFO;
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
		{#if isRobotScannerAvailable() && isRobotScanning() && !isCurrentLinkEmpty()}
			<img
				src={`${currentLink}/scan_feed`}
				alt="Scanning Feed"
				class="max-h-full max-w-full rounded-md border object-contain dark:border-gray-600"
			/>
		{:else}
			<span class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
				📷 Live Camera Feed
			</span>
		{/if}
	</div>

	<Camerainfo {cameraInfo} />
</div>
