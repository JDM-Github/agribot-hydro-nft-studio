<script lang="ts">
	import RadarChartComponent from "$components/RadarChartComponent.svelte";
	import type { Config } from "$class/config";
	import type { FunctionType, WritableModelArray } from "$lib/type";
	import { get } from "svelte/store";
    import type { TransformModel } from "$types/model";

    export let config: Config;
    export let showRadarModal: boolean;
    export let closeRadarModal: FunctionType;

    export let yoloObjectDetection: WritableModelArray;
	export let yoloStageClassification: WritableModelArray;
	export let maskRCNNSegmentation: WritableModelArray;
    export let modelPerformance: {
        objectDetectionionYolo: TransformModel;
		stageClassificationYolo: TransformModel;
		diseaseSegmentationMaskRCNN: TransformModel;
    }
</script>
{#if showRadarModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div
			class="absolute w-[90vw] max-w-7xl rounded-xl border border-gray-300 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<button
				class="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-300"
				on:click={closeRadarModal}
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
					selected={get(config.objectDetectionVersion)}
					dataMap={modelPerformance.objectDetectionionYolo}
					modelType={'PlantOD'}
				/>
				<RadarChartComponent
					title="YOLOv8 Stage Classification"
					models={$yoloStageClassification.map((m: any) => m.version)}
					selected={get(config.stageClassificationVersion)}
					dataMap={modelPerformance.stageClassificationYolo}
					modelType={'StageCLS'}
				/>
				<RadarChartComponent
					title="Mask-RCNN Disease DiseaseSegmentation"
					models={$maskRCNNSegmentation.map((m: any) => m.version)}
					selected={get(config.diseaseSegmentationVersion)}
					dataMap={modelPerformance.diseaseSegmentationMaskRCNN}
					modelType={'DiseaseSeg'}
				/>
			</div>
		</div>
	</div>
{/if}
