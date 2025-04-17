<script lang="ts">
	import RadarChartComponent from '$lib/components/RadarChartComponent.svelte';
	import SetSchedule from '$lib/components/SetSchedule.svelte';
	import { writable, type Writable } from 'svelte/store';

	export let scanning;
	export let controlRobot;
	export let openModal;
	export let openCamera;

	export let schedule: any;
	export let objectDetection: Writable<string>;
	export let stageClassification: Writable<string>;
	export let diseaseSegmentation: Writable<string>;

	export let saveConfig;

	let objectDetectionionYolo = ['PlantODV1.0.0', 'PlantODV1.0.1', 'PlantODV1.0.2', 'PlantODV1.0.3'];
	let stageClassificationYolo = [
		'StageCLSV1.0.0',
		'StageCLSV1.0.1',
		'StageCLSV1.0.2',
		'StageCLSV1.0.3'
	];
	let diseaseSegmentationMaskRCNN = [
		'DiseaseSegV1.0.0',
		'DiseaseSegV1.0.1',
		'DiseaseSegV1.0.2',
		'DiseaseSegV1.0.3'
	];
	
	objectDetection.subscribe((val) => {
		if (!val) objectDetection.set(objectDetectionionYolo[0]);
	});
	stageClassification.subscribe((val) => {
		if (!val) stageClassification.set(stageClassificationYolo[0]);
	});
	diseaseSegmentation.subscribe((val) => {
		if (!val) diseaseSegmentation.set(diseaseSegmentationMaskRCNN[0]);
	});

	let modelPerformance = {
		objectDetectionionYolo: {
			'PlantODV1.0.0': {
				accuracy: 0.9,
				recall: 0.88,
				precision: 0.91,
				mAP50: 0.85,
				mAP50_95: 0.81
			},
			'PlantODV1.0.1': {
				accuracy: 0.91,
				recall: 0.89,
				precision: 0.92,
				mAP50: 0.86,
				mAP50_95: 0.82
			},
			'PlantODV1.0.2': {
				accuracy: 0.92,
				recall: 0.9,
				precision: 0.93,
				mAP50: 0.88,
				mAP50_95: 0.83
			},
			'PlantODV1.0.3': {
				accuracy: 0.93,
				recall: 0.91,
				precision: 0.94,
				mAP50: 0.89,
				mAP50_95: 0.84
			}
		},
		stageClassificationYolo: {
			'StageCLSV1.0.0': {
				accuracy: 0.85,
				recall: 0.83,
				precision: 0.84,
				mAP50: 0.81,
				mAP50_95: 0.76
			},
			'StageCLSV1.0.1': {
				accuracy: 0.87,
				recall: 0.85,
				precision: 0.86,
				mAP50: 0.83,
				mAP50_95: 0.78
			},
			'StageCLSV1.0.2': {
				accuracy: 0.88,
				recall: 0.86,
				precision: 0.87,
				mAP50: 0.84,
				mAP50_95: 0.79
			},
			'StageCLSV1.0.3': {
				accuracy: 0.89,
				recall: 0.87,
				precision: 0.88,
				mAP50: 0.85,
				mAP50_95: 0.8
			}
		},
		diseaseSegmentationMaskRCNN: {
			'DiseaseSegV1.0.0': {
				accuracy: 0.88,
				recall: 0.85,
				precision: 0.87,
				mAP50: 0.84,
				mAP50_95: 0.79
			},
			'DiseaseSegV1.0.1': {
				accuracy: 0.89,
				recall: 0.86,
				precision: 0.88,
				mAP50: 0.85,
				mAP50_95: 0.8
			},
			'DiseaseSegV1.0.2': {
				accuracy: 0.9,
				recall: 0.87,
				precision: 0.89,
				mAP50: 0.86,
				mAP50_95: 0.81
			},
			'DiseaseSegV1.0.3': {
				accuracy: 0.91,
				recall: 0.88,
				precision: 0.9,
				mAP50: 0.87,
				mAP50_95: 0.82
			}
		}
	};

	let previousModel = writable('Model A');
	let showToast = writable(false);
	let showRadarModal = false;
	let showScheduleModal = false;
	let oldSchedule: any = {};

	function confirmChange() {
		previousModel.set($objectDetection);
		showToast.set(false);
	}

	function cancelChange() {
		objectDetection.set($previousModel);
		showToast.set(false);
	}
</script>

<div
	class="mx-auto flex flex-col items-center justify-between space-y-2 rounded-lg p-3 md:flex-row md:space-y-0 md:space-x-4 dark:bg-gray-900"
>
	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<button
			class="w-full rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
			on:click={openModal}
		>
			SETUP SPRAY
		</button>

		<div class="relative w-full sm:w-auto">
			<select
				bind:value={$objectDetection}
				on:change={(event: any) => {
					objectDetection.set(event.target.value);
					showToast.set(true);
				}}
				class="w-full rounded-md bg-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
			>
				<option value="1.0.0">ModelV1.0.0</option>
				{#each objectDetectionionYolo as model}
					<option value={model}>{model}</option>
				{/each}
			</select>
		</div>

		<div class="relative w-full sm:w-auto">
			<select
				bind:value={$stageClassification}
				on:change={(event: any) => {
					stageClassification.set(event.target.value);
					showToast.set(true);
				}}
				class="w-full rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
			>
				{#each stageClassificationYolo as model}
					<option value={model}>{model}</option>
				{/each}
			</select>
		</div>

		<div class="relative w-full sm:w-auto">
			<select
				bind:value={$diseaseSegmentation}
				on:change={(event: any) => {
					diseaseSegmentation.set(event.target.value);
					showToast.set(true);
				}}
				class="w-full rounded-md bg-rose-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
			>
				{#each diseaseSegmentationMaskRCNN as model}
					<option value={model}>{model}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<button
			on:click={() => (showRadarModal = true)}
			class="w-full rounded-md bg-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-indigo-600 sm:w-auto dark:bg-indigo-600 dark:hover:bg-indigo-700"
		>
			Compare Models
		</button>

		<button
			on:click={() => {
				oldSchedule = { ...schedule };
				showScheduleModal = true;
			}}
			class="w-full rounded-md bg-green-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-green-600 sm:w-auto dark:bg-green-600 dark:hover:bg-green-700"
		>
			Set Schedule
		</button>
		<button
			class="w-full rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
			on:click={saveConfig}
		>
			Save Configuration
		</button>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<button
			class="w-full rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition sm:w-auto"
			class:bg-green-500={!scanning}
			class:bg-gray-400={scanning}
			class:dark:bg-green-600={!scanning}
			class:dark:bg-gray-600={scanning}
			on:click={() => controlRobot(true)}
			disabled={scanning}
		>
			START
		</button>

		<button
			class="w-full rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition sm:w-auto"
			class:bg-red-500={scanning}
			class:bg-gray-400={!scanning}
			class:dark:bg-red-600={scanning}
			class:dark:bg-gray-600={!scanning}
			on:click={() => controlRobot(false)}
			disabled={!scanning}
		>
			STOP
		</button>
	</div>

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
					models={objectDetectionionYolo}
					selected={$objectDetection}
					dataMap={modelPerformance.objectDetectionionYolo}
				/>

				<RadarChartComponent
					title="YOLOv8 Stage Classification"
					models={stageClassificationYolo}
					selected={$stageClassification}
					dataMap={modelPerformance.stageClassificationYolo}
				/>

				<RadarChartComponent
					title="Mask-RCNN Disease DiseaseSegmentation"
					models={diseaseSegmentationMaskRCNN}
					selected={$diseaseSegmentation}
					dataMap={modelPerformance.diseaseSegmentationMaskRCNN}
				/>
			</div>
		</div>
	</div>
{/if}

<SetSchedule
	{schedule}
	{oldSchedule}
	{showScheduleModal}
	onClose={() => (showScheduleModal = false)}
/>
{#if $showToast}
	<div class="fixed inset-0 z-40 bg-black/80"></div>
	<div
		class="fixed right-5 bottom-5 z-50 flex flex-col space-y-3 rounded-lg bg-red-600 px-5 py-4 text-white shadow-lg transition-opacity duration-300"
	>
		⚠️ <span>Warning: Changing the model will reset your setup!</span>
		<div class="flex justify-end space-x-3">
			<button
				on:click={confirmChange}
				class="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-gray-200"
			>
				OK
			</button>
			<button
				on:click={cancelChange}
				class="rounded-md bg-gray-300 px-3 py-1.5 text-sm font-bold text-gray-800 hover:bg-gray-400"
			>
				CANCEL
			</button>
		</div>
	</div>
{/if}
