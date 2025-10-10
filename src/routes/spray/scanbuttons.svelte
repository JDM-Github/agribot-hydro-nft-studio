<script lang="ts">
/**
 * @file scanbuttons.svelte
 * @description Provides control buttons for scanning operations, including starting,
 *              stopping, and opening the camera. Integrates with mode and connection stores.
 *
 * @props
 *   - openCamera: FunctionType to open the camera modal/view.
 *   - startRobot: FunctionType to start the robot scanning process.
 *   - stopRobot: FunctionType to stop the robot scanning process.
 *
 * @imports
 *   - simpleMode: Store for toggling simplified operation mode.
 *   - isScanning: Store indicating whether scanning is currently active.
 *   - FunctionType: Shared type definition for function props.
 *
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Stores
import { simpleMode } from '$stores/mode';
// Types
import type { FunctionType } from '$lib/type';
import { LiveStreamState, RobotState } from '$root/lib/enum';

// ----------------------------
// Props
// ----------------------------
export let openCamera: FunctionType;
export let startRobot: FunctionType;
export let stopRobot: FunctionType;

export let isConnected: boolean;
export let liveState: number;
export let scannerState: boolean;
export let robotState: number;
export let robotScanState: boolean;
</script>

<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

{#if !$simpleMode}
	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<!-- START button -->
		<button
			class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			class:bg-green-500={!scannerState}
			class:bg-gray-400={scannerState}
			class:dark:bg-green-600={!scannerState}
			class:dark:bg-gray-600={scannerState}
			class:hover:brightness-70={!scannerState}
			on:click={startRobot}
			disabled={scannerState ||
				!isConnected ||
				robotState !== RobotState.STOPPED ||
				liveState !== LiveStreamState.STOPPED ||
				robotScanState}
		>
			START
		</button>

		<!-- STOP button -->
		<button
			class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			class:bg-red-500={scannerState}
			class:bg-gray-400={!scannerState}
			class:dark:bg-red-600={scannerState}
			class:dark:bg-gray-600={!scannerState}
			class:hover:brightness-70={scannerState}
			on:click={stopRobot}
			disabled={!scannerState ||
				!isConnected ||
				robotState !== RobotState.STOPPED ||
				liveState !== LiveStreamState.STOPPED ||
				robotScanState}
		>
			STOP
		</button>
	</div>
{/if}

<button
	class="w-full rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-600 sm:w-auto md:hidden dark:bg-gray-700 dark:hover:bg-gray-800"
	on:click={openCamera}
>
	SHOW CAMERA
</button>
