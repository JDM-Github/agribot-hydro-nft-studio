<script lang="ts">
/**
 * @file details.svelte
 * @description Displays and manages model configuration details for object detection,
 *              stage classification, and disease segmentation. Handles model bindings,
 *              confidence thresholds, and radar activation logic.
 * 
 * @props
 *   - config: Config object containing model versions and settings.
 *   - showRadalActivate: FunctionType to trigger radar activation modal/view.
 *   - objectDetection: WritableString for object detection version binding.
 *   - stageClassification: WritableString for stage classification version binding.
 *   - diseaseSegmentation: WritableString for disease segmentation version binding.
 *   - objectDetectionConfidence: WritableNumber for object detection confidence.
 *   - diseaseSegmentationConfidence: WritableNumber for segmentation confidence.
 *   - stageClassificationConfidence: WritableNumber for classification confidence.
 *   - yoloObjectDetection: WritableModelArray for YOLO object detection models.
 *   - yoloStageClassification: WritableModelArray for YOLO stage classification models.
 *   - maskRCNNSegmentation: WritableModelArray for Mask R-CNN segmentation models.
 * 
 * @imports
 *   - FunctionType, WritableModelArray, WritableString, WritableNumber: Type definitions.
 *   - Config: Type definition for configuration object.
 *   - isLivestreaming: Store for livestream connection state.
 *   - addToast: Store utility for displaying toast notifications.
 *   - simpleMode: Store for toggling simplified operation mode.
 *   - handleToggle, openId: Store utilities for modal/dialog state management.
 *   - get: Svelte store helper function.
 *   - CONFIDENCE_OPTION: Constant for confidence dropdown options.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Types
import type {
	FunctionType,
	WritableModelArray,
	WritableString,
	WritableNumber
} from '$lib/type';
import type { Config } from '$class/config';

// Stores
import { addToast } from '$stores/toast';
import { simpleMode } from '$stores/mode';
import { handleToggle, openId } from '$stores/openId';
import { get } from 'svelte/store';

// Constants
import { CONFIDENCE_OPTION } from '$constant/index';

export let liveState: number;
export let robotState: number;
export let robotScanState: boolean;
export let performing: boolean;
export let robotLive: boolean;
export let stopCapture: boolean;

export let config: Config;
export let showRadalActivate: FunctionType;

export let objectDetection: WritableString;
export let stageClassification: WritableString;
export let diseaseSegmentation: WritableString;

export let objectDetectionConfidence: WritableNumber;
export let diseaseSegmentationConfidence: WritableNumber;
export let stageClassificationConfidence: WritableNumber;

export let yoloObjectDetection: WritableModelArray;
export let yoloStageClassification: WritableModelArray;
export let maskRCNNSegmentation: WritableModelArray;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

{#if !$simpleMode}
	<div class="flex w-full flex-row flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<details
			class="relative w-full sm:w-auto"
			open={$openId === 'model'}
			on:toggle={(e) => handleToggle('model', e)}
		>
			<summary
				class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
			>
				Model Actions
			</summary>

			<div
				class="absolute z-10 mt-2 flex w-64 flex-wrap items-center justify-center gap-2 rounded-md bg-gray-300 p-2 shadow-lg md:w-80 dark:bg-gray-800"
			>
				<button
					on:click={showRadalActivate}
					class="w-full rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					Compare Models
				</button>
				<div class="relative w-full sm:w-auto">
					<select
						bind:value={$objectDetection}
						on:change={() => {
							if (robotState || robotScanState || liveState || robotLive || performing || stopCapture) {
								addToast('Action unavailable robot is currently busy.', 'error', 3000);
								return;
							}
							addToast('Object detection model changed!', 'success', 3000);
							setTimeout(() => {
								addToast(
									'Changes staged. Remember to click "Save Configuration" to apply them.',
									'info',
									5000
								);
							}, 10);
						}}
						class="max-h-40 w-full overflow-y-auto rounded-md bg-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-yellow-600
							dark:bg-yellow-600 dark:hover:bg-yellow-700"
					>
						{#each [...$yoloObjectDetection].sort( (a, b) => a.version.localeCompare(b.version) ) as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<select
						bind:value={$stageClassification}
						on:change={() => {
							if (robotState || robotScanState || liveState || robotLive || performing || stopCapture) {
								addToast('Action unavailable robot is currently busy.', 'error', 3000);
								return;
							}
							addToast('Stage classification model changed!', 'success', 3000);
							setTimeout(() => {
								addToast(
									'Changes staged. Remember to click "Save Configuration" to apply them.',
									'info',
									5000
								);
							}, 10);
						}}
						class="w-full rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
					>
						{#each [...$yoloStageClassification].sort( (a, b) => a.version.localeCompare(b.version) ) as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<select
						bind:value={$diseaseSegmentation}
						on:change={() => {
							if (robotState || robotScanState || liveState || robotLive || performing || stopCapture) {
								addToast('Action unavailable robot is currently busy.', 'error', 3000);
								return;
							}
							addToast('Disease segmentation model changed!', 'success', 3000);
							setTimeout(() => {
								addToast(
									'Changes staged. Remember to click "Save Configuration" to apply them.',
									'info',
									5000
								);
							}, 10);
						}}
						class="w-full rounded-md bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
					>
						{#each [...$maskRCNNSegmentation].sort( (a, b) => a.version.localeCompare(b.version) ) as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>
			</div>
		</details>

		<details
			class="relative w-full sm:w-auto"
			open={$openId === 'model-conf'}
			on:toggle={(e) => handleToggle('model-conf', e)}
		>
			<summary
				class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
			>
				Model Confidence
			</summary>

			<div
				class="absolute z-10 mt-2 flex w-full flex-row items-center justify-center gap-2 rounded-md bg-gray-300 p-2 shadow-lg md:w-80 dark:bg-gray-800"
			>
				<div class="relative w-full sm:w-auto">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
						Object Detection Confidence
					</label>
					<select
						bind:value={$objectDetectionConfidence}
						on:change={() =>
							addToast(
								`Object Detection confidence set to ${Math.round(
									get(config.objectDetectionConfidence) * 100
								)}%`,
								'success'
							)}
						class="w-full rounded-md bg-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
					>
						{#each CONFIDENCE_OPTION as c}
							<option value={c}>{Math.round(c * 100)}%</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
						Stage Classification Confidence
					</label>
					<select
						bind:value={$stageClassificationConfidence}
						on:change={() =>
							addToast(
								`Stage Classification confidence set to ${Math.round(
									get(config.stageClassificationConfidence) * 100
								)}%`,
								'success'
							)}
						class="w-full rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
					>
						{#each CONFIDENCE_OPTION as c}
							<option value={c}>{Math.round(c * 100)}%</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
						Disease Segmentation Confidence
					</label>
					<select
						bind:value={$diseaseSegmentationConfidence}
						on:change={() =>
							addToast(
								`Disease Segmentation confidence set to ${Math.round(
									get(config.diseaseSegmentationConfidence) * 100
								)}%`,
								'success'
							)}
						class="w-full rounded-md bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
					>
						{#each CONFIDENCE_OPTION as c}
							<option value={c}>{Math.round(c * 100)}%</option>
						{/each}
					</select>
				</div>
			</div>
		</details>
	</div>
{/if}