<script lang="ts">
/**
 * @file cameramobile.svelte
 * @description Provides a mobile-friendly view of the robot camera. Displays camera information,
 *              manages camera state, and integrates with robot status utilities and connection stores.
 * 
 * @props
 *   - cameraInfo: CameraInfo object with default values from CAMERA_INFO.
 *   - showCamera: Boolean flag to control camera visibility state.
 *   - closeCamera: Function to close/hide the camera view.
 * 
 * @imports
 *   - CAMERA_INFO: Constant containing default camera settings.
 *   - CameraInfo: Type definition for camera information.
 *   - isCurrentLinkEmpty, isRobotScannerAvailable, isRobotScanning: Utilities for robot status checks.
 *   - Camerainfo: Component for rendering camera information details.
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

// Stores
import { currentLink } from '$stores/connection';
import type { FunctionType } from '$root/lib/type';
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

export let showCamera: boolean = false;
export let closeCamera: FunctionType;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div
	class="fixed inset-0 z-40 bg-black/80 transition-opacity duration-500 ease-out lg:hidden"
	class:opacity-0={!showCamera}
	class:opacity-100={showCamera}
	class:pointer-events-none={!showCamera}
	class:pointer-events-auto={showCamera}
></div>

<div
	class="fixed top-[80px] left-1/2 z-50 w-11/12 -translate-x-1/2 transform rounded-2xl bg-white shadow-lg transition-all duration-500 ease-out sm:block lg:hidden dark:bg-gray-900"
	class:opacity-0={!showCamera}
	class:opacity-100={showCamera}
	class:translate-y-16={!showCamera}
	class:translate-y-0={showCamera}
	class:pointer-events-none={!showCamera}
	class:pointer-events-auto={showCamera}
>
	<div
		class="relative flex h-64 items-center justify-center rounded-xl bg-gray-100 shadow-inner dark:bg-gray-800"
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
			<img
				src={$scanFrameUrl}
				alt="Scanning Feed"
				class="h-auto w-full max-w-[90%] rounded-md border dark:border-gray-600"
			/>
		{:else}
			<span class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
				📷 Mobile Camera Feed
			</span>
		{/if}
	</div>

	<Camerainfo {cameraInfo} />

	<button
		class="flex w-full items-center justify-center rounded-xl bg-red-800 p-2 text-white shadow-lg transition hover:bg-red-700"
		on:click={closeCamera}
	>
		Close Camera
	</button>
</div>
