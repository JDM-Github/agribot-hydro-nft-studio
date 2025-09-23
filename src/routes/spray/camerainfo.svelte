<script lang="ts">
/**
 * @file camerainfo.svelte
 * @description Displays detailed information about the camera and its connection link.
 *              Integrates with connection store for the current link and uses CameraInfo type.
 * 
 * @props
 *   - cameraInfo: CameraInfo object containing camera metadata and status.
 * 
 * @imports
 *   - currentLink: Store containing the active camera connection link.
 *   - CameraInfo: Type definition for camera information object.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Stores
import { currentLink } from '$stores/connection';

// Types
import type { CameraInfo } from '$types/cameraInfo';

// ----------------------------
// Props
// ----------------------------
export let cameraInfo: CameraInfo;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div class="space-y-4 divide-y divide-gray-100 p-4 dark:divide-gray-700">
	<h3 class="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
		<span class="text-green-500">🎥</span> Camera Information
	</h3>

	<ul class="space-y-2 pt-2 text-sm text-gray-600 dark:text-gray-400">
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">URL:</span>
			{$currentLink || 'NOT CONNECTED'}
		</li>
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
			{#if cameraInfo.status === 'online'}
				<span class="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400">● Online</span>
			{:else}
				<span class="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">● Offline</span>
			{/if}
		</li>
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">Resolution:</span>
			{cameraInfo.resolution ?? 'N/A'}
		</li>
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">Frame Rate:</span>
			{cameraInfo.fps ?? 'N/A'} FPS
		</li>
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">Public IP:</span>
			{cameraInfo.ip ?? 'N/A'}
		</li>
		<li class="flex justify-between">
			<span class="font-medium text-gray-500 dark:text-gray-300">Detection Confidence:</span>
			{cameraInfo.detectionConf ?? 'N/A'}
		</li>
	</ul>
</div>
