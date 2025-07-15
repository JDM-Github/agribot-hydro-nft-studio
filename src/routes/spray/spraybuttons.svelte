<script lang="ts">
	import RadarChartComponent from '$lib/components/RadarChartComponent.svelte';
	import SetSchedule from '$lib/components/SetSchedule.svelte';
	import { addToast, confirmToast } from '$lib/stores/toast';
	import { writable, type Writable } from 'svelte/store';

	export let scanning;
	export let controlRobot;
	export let openModal;
	export let openCamera;
	export let openManualPlant: () => void = () => {};

	export let schedule: Writable<{
		frequency: string;
		time: string;
		days: string[];
	}>;
	export let yoloObjectDetection: any;
	export let yoloStageClassification: any;
	export let maskRCNNSegmentation: any;
	export let objectDetection: Writable<string>;
	export let stageClassification: Writable<string>;
	export let diseaseSegmentation: Writable<string>;

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
	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<details class="relative w-full sm:w-auto">
			<summary
				class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
			>
				Model Selection Actions
			</summary>

			<div class="absolute z-10 mt-2 md:w-80 w-64 flex flex-wrap items-center justify-center gap-2 rounded-md bg-gray-300 p-2 shadow-lg dark:bg-gray-800">
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
						class="w-full rounded-md bg-yellow-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
					>
						{#each $yoloObjectDetection as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<select
						bind:value={$stageClassification}
						on:change={(event: any) => {
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
						{#each $yoloStageClassification as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>

				<div class="relative w-full sm:w-auto">
					<select
						bind:value={$diseaseSegmentation}
						on:change={(event: any) => {
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
						{#each $maskRCNNSegmentation as model}
							<option value={model.version}>{model.version}</option>
						{/each}
					</select>
				</div>
			</div>
		</details>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
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
					on:click={openModal}
				>
					Setup Spray
				</button>
				<button
					on:click={() => {
						showScheduleModal = true;
						oldSchedule = { ...$schedule };
					}}
					class="w-full rounded bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600"
				>
					Set Schedule
				</button>
				<button
					class="w-full cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
					on:click={openManualPlant}
				>
					Add Plant
				</button>
			</div>
		</details>
	</div>

	<!-- <div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<button
			on:click={() => (showRadarModal = true)}
			class="w-full rounded-md bg-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-indigo-600 sm:w-auto dark:bg-indigo-600 dark:hover:bg-indigo-700"
		>
			Compare Models
		</button>

		<button
			on:click={() => {
				showScheduleModal = true;
				oldSchedule = { ...$schedule };
			}}
			class="w-full rounded-md bg-green-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-green-600 sm:w-auto dark:bg-green-600 dark:hover:bg-green-700"
		>
			Set Schedule
		</button>

		<button
			on:click={saveConfig}
			class="w-full rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
		>
			Save Configuration
		</button>

		<button
			on:click={downloadConfig}
			class="w-full rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-purple-600 sm:w-auto dark:bg-purple-600 dark:hover:bg-purple-700"
		>
			Download Configuration
		</button>

		<button
			on:click={uploadConfig}
			class="w-full rounded-md bg-orange-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-orange-600 sm:w-auto dark:bg-orange-600 dark:hover:bg-orange-700"
		>
			Upload Configuration
		</button>
	</div> -->

	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/3">
		<button
			class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			class:bg-green-500={!scanning}
			class:bg-gray-400={scanning}
			class:dark:bg-green-600={!scanning}
			class:dark:bg-gray-600={scanning}
			class:hover:brightness-70={!scanning}
			on:click={() => controlRobot(true)}
			disabled={scanning}
		>
			START
		</button>

		<button
			class="w-full cursor-pointer rounded-md px-4 py-2 text-xs font-medium text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			class:bg-red-500={scanning}
			class:bg-gray-400={!scanning}
			class:dark:bg-red-600={scanning}
			class:dark:bg-gray-600={!scanning}
			class:hover:brightness-70={scanning}
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
