<script lang="ts">
	import RadarChartComponent from '$lib/components/RadarChartComponent.svelte';
	import SetSchedule from '$lib/components/SetSchedule.svelte';
	import { addToast } from '$lib/stores/toast';
	import { writable, type Writable } from 'svelte/store';
	import { isLivestreaming, isScanning } from '$lib/stores/connection';
	import { simpleMode } from '$lib/stores/mode';

	export let controlRobot;
	export let openModal;
	export let openCamera;
	export let openManualPlant: () => void = () => {};

	export let schedule: Writable<{
		frequency: string;
		runs: { time: string; upto: string }[];
		days: string[];
	}>;
	export let yoloObjectDetection: any;
	export let yoloStageClassification: any;
	export let maskRCNNSegmentation: any;
	export let objectDetection: Writable<string>;
	export let stageClassification: Writable<string>;
	export let diseaseSegmentation: Writable<string>;

	export const objectDetectionConfidence = writable(0.3);
	export const stageClassificationConfidence = writable(0.3);
	export const diseaseSegmentationConfidence = writable(0.3);
	const confidenceOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

	export let saveConfig;
	export let downloadConfig;
	export let uploadConfig;

	function transformModels(models: any) {
		const output: any = {};
		models.forEach((item: any) => {
			const modelKey = `${item.version}`;
			output[modelKey] = {
				accuracy: parseFloat(item.accuracy),
				recall: parseFloat(item.recall),
				precision: parseFloat(item.precision),
				mAP50: parseFloat(item.mAP50),
				mAP50_95: parseFloat(item.mAP50_95)
			};
		});
		return output;
	}
	let modelPerformance = {
		objectDetectionionYolo: transformModels($yoloObjectDetection),
		stageClassificationYolo: transformModels($yoloStageClassification),
		diseaseSegmentationMaskRCNN: transformModels($maskRCNNSegmentation)
	};

	let previousModel = writable($objectDetection);
	let showRadarModal = false;
	let showScheduleModal = false;
	let oldSchedule: any = {};
	function confirmChange() {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}

		previousModel.set($objectDetection);
		addToast('Object detection model changed!', 'success', 3000);
		setTimeout(() => {
			addToast(
				'Changes staged. Remember to click "Save Configuration" to apply them.',
				'info',
				5000
			);
		}, 10);
	}
</script>

<div
	class="mx-auto flex flex-col items-center justify-between space-y-2 rounded-lg p-3 md:flex-row md:space-y-0 md:space-x-4 dark:bg-gray-900"
>
	{#if !$simpleMode}
		<div class="flex w-full flex-row flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
			<details class="relative w-full sm:w-auto">
				<summary
					class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
				>
					Model Actions
				</summary>

				<div
					class="absolute z-10 mt-2 flex w-64 flex-wrap items-center justify-center gap-2 rounded-md bg-gray-300 p-2 shadow-lg md:w-80 dark:bg-gray-800"
				>
					<button
						on:click={() => (showRadarModal = true)}
						class="w-full rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
					>
						Compare Models
					</button>
					<div class="relative w-full sm:w-auto">
						<select
							bind:value={$objectDetection}
							on:change={() => confirmChange()}
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
							on:change={(event: any) => {
								if ($isLivestreaming !== 'Stopped') {
									addToast('Action unavailable while livestreaming is active.', 'error', 3000);
									return;
								}

								stageClassification.set(event.target.value);
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
							on:change={(event: any) => {
								if ($isLivestreaming !== 'Stopped') {
									addToast('Action unavailable while livestreaming is active.', 'error', 3000);
									return;
								}

								diseaseSegmentation.set(event.target.value);
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

			<details class="relative w-full sm:w-auto">
				<summary
					class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
				>
					Model Confidence
				</summary>

				<div
					class="absolute z-10 mt-2 flex flex-row w-full items-center justify-center gap-2 rounded-md bg-gray-300 p-2 shadow-lg md:w-80 dark:bg-gray-800"
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
									`Object Detection confidence set to ${Math.round($objectDetectionConfidence * 100)}%`,
									'success'
								)}
							class="w-full rounded-md bg-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
						>
							{#each confidenceOptions as c}
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
									`Stage Classification confidence set to ${Math.round($stageClassificationConfidence * 100)}%`,
									'success'
								)}
							class="w-full rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
						>
							{#each confidenceOptions as c}
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
									`Disease Segmentation confidence set to ${Math.round($diseaseSegmentationConfidence * 100)}%`,
									'success'
								)}
							class="w-full rounded-md bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
						>
							{#each confidenceOptions as c}
								<option value={c}>{Math.round(c * 100)}%</option>
							{/each}
						</select>
					</div>
				</div>
			</details>
		</div>
	{/if}

	<div class="mx-auto flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/2">
		{#if !$simpleMode}
			<!-- Full mode: your existing details menus -->
			<details class="relative w-full sm:w-auto">
				<summary
					class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
				>
					Configuration Actions
				</summary>
				<div
					class="absolute z-10 mt-2 flex w-48 flex-col gap-1 rounded-md bg-gray-300 p-2 shadow-lg dark:bg-gray-800"
				>
					<button
						on:click={saveConfig}
						class="w-full rounded bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
					>
						Save Configuration
					</button>
					<button
						on:click={downloadConfig}
						class="w-full rounded bg-purple-500 px-3 py-2 text-xs font-medium text-white hover:bg-purple-600"
					>
						Download Configuration
					</button>
					<button
						on:click={uploadConfig}
						class="w-full rounded bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600"
					>
						Upload Configuration
					</button>
				</div>
			</details>

			<details class="relative w-full sm:w-auto">
				<summary
					class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
				>
					Setup Actions
				</summary>
				<div
					class="absolute z-10 mt-2 flex w-48 flex-col gap-1 rounded-md bg-gray-300 p-2 shadow-lg dark:bg-gray-800"
				>
					<button
						class="w-full rounded bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-600"
						on:click={() => {
							if ($isLivestreaming !== 'Stopped') {
								addToast('Action unavailable while livestreaming is active.', 'error', 3000);
								return;
							}
							openModal();
						}}
					>
						Setup Spray
					</button>
					<button
						on:click={() => {
							if ($isLivestreaming !== 'Stopped') {
								addToast('Action unavailable while livestreaming is active.', 'error', 3000);
								return;
							}
							showScheduleModal = true;
							oldSchedule = { ...$schedule };
						}}
						class="w-full rounded bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600"
					>
						Set Schedule
					</button>
					<button
						class="w-full cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
						on:click={() => {
							if ($isLivestreaming !== 'Stopped') {
								addToast('Action unavailable while livestreaming is active.', 'error', 3000);
								return;
							}
							openManualPlant();
						}}
					>
						Add Plant
					</button>
				</div>
			</details>
		{:else}
			<!-- Simple mode: slightly larger, cleaner buttons -->
			<button
				on:click={saveConfig}
				class="rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600"
			>
				Save Configuration
			</button>
			<button
				class="rounded bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-600"
				on:click={() => {
					if ($isLivestreaming !== 'Stopped') {
						addToast('Action unavailable while livestreaming is active.', 'error', 3000);
						return;
					}
					openModal();
				}}
			>
				Setup Spray
			</button>
			<button
				on:click={() => {
					if ($isLivestreaming !== 'Stopped') {
						addToast('Action unavailable while livestreaming is active.', 'error', 3000);
						return;
					}
					showScheduleModal = true;
					oldSchedule = { ...$schedule };
				}}
				class="rounded bg-green-500 px-4 py-3 text-sm font-medium text-white hover:bg-green-600"
			>
				Set Schedule
			</button>
			<button
				class="rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600"
				on:click={() => {
					if ($isLivestreaming !== 'Stopped') {
						addToast('Action unavailable while livestreaming is active.', 'error', 3000);
						return;
					}
					openManualPlant();
				}}
			>
				Add Plant
			</button>
		{/if}
	</div>

	{#if !$simpleMode}
		<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
			<button
				class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				class:bg-green-500={!$isScanning}
				class:bg-gray-400={$isScanning}
				class:dark:bg-green-600={!$isScanning}
				class:dark:bg-gray-600={$isScanning}
				class:hover:brightness-70={!$isScanning}
				on:click={() => controlRobot(true)}
				disabled={$isScanning}
			>
				START
			</button>

			<button
				class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				class:bg-red-500={$isScanning}
				class:bg-gray-400={!$isScanning}
				class:dark:bg-red-600={$isScanning}
				class:dark:bg-gray-600={!$isScanning}
				class:hover:brightness-70={$isScanning}
				on:click={() => controlRobot(false)}
				disabled={!$isScanning}
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
</div>

{#if showRadarModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div
			class="absolute w-[90vw] max-w-6xl rounded-xl border border-gray-300 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<button
				class="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-300"
				on:click={() => (showRadarModal = false)}
			>
				✕
			</button>

			<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">
				Model Performance Comparison
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<RadarChartComponent
					title="YOLOv8 Object Detection"
					models={$yoloObjectDetection.map((m: any) => m.version)}
					selected={$objectDetection}
					dataMap={modelPerformance.objectDetectionionYolo}
					modelType={'PlantOD'}
				/>
				<RadarChartComponent
					title="YOLOv8 Stage Classification"
					models={$yoloStageClassification.map((m: any) => m.version)}
					selected={$stageClassification}
					dataMap={modelPerformance.stageClassificationYolo}
					modelType={'StageCLS'}
				/>
				<RadarChartComponent
					title="Mask-RCNN Disease DiseaseSegmentation"
					models={$maskRCNNSegmentation.map((m: any) => m.version)}
					selected={$diseaseSegmentation}
					dataMap={modelPerformance.diseaseSegmentationMaskRCNN}
					modelType={'DiseaseSeg'}
				/>
			</div>
		</div>
	</div>
{/if}

<SetSchedule
	{schedule}
	{showScheduleModal}
	onClose={() => {
		schedule.set(oldSchedule);
		showScheduleModal = false;
	}}
	onSave={() => {
		showScheduleModal = false;
		addToast('Schedule saved successfully!', 'success', 3000);
		setTimeout(() => {
			addToast(
				'Changes staged. Remember to click "Save Configuration" to apply them.',
				'info',
				5000
			);
		}, 10);
	}}
/>
