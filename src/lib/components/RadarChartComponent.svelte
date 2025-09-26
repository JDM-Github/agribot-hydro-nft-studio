<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { darkMode } from '$lib/stores/theme';
	import type { TransformModel } from '$types/model';

	export let title: string;
	export let models: string[];
	export let selected: string;
	export let dataMap: TransformModel;
	export let modelType: string;

	let canvasEl: HTMLCanvasElement;
	let chartInstance: Chart;

	// Map of metric keys to their display labels
	const metricConfig: Record<string, string> = {
		accuracy_top1: 'Accuracy Top-1',
		accuracy_top5: 'Accuracy Top-5',
		precision: 'Precision',
		recall: 'Recall',
		mAP50: 'mAP50',
		mAP50_95: 'mAP50-95'
	};

	function getColorForModel(): string {
		if (modelType === 'PlantOD') return 'rgba(59, 130, 246, 1)';
		if (modelType === 'StageCLS') return 'rgba(168, 85, 247, 1)';
		if (modelType === 'DiseaseSeg') return 'rgba(244, 63, 94, 1)';
		return 'rgba(107, 114, 128, 1)';
	}

	type MetricKey =
		| 'accuracy_top1'
		| 'accuracy_top5'
		| 'precision'
		| 'recall'
		| 'mAP50'
		| 'mAP50_95';
	function getActiveMetrics(): MetricKey[] {
		const activeKeys: MetricKey[] = [];

		models.forEach((modelName) => {
			const metrics = dataMap[modelName];
			if (metrics) {
				(Object.entries(metrics) as [MetricKey, number | string][]).forEach(([key, value]) => {
					if (value !== -1 && !activeKeys.includes(key)) {
						activeKeys.push(key);
					}
				});
			}
		});
		return activeKeys;
	}

	function createDatasets(metricKeys: MetricKey[]) {
		return models
			.filter((modelName) => dataMap[modelName])
			.map((modelName) => {
				const metrics = dataMap[modelName];
				const isSelected = modelName === selected;
				const baseColor = isSelected ? getColorForModel() : 'rgba(107, 114, 128, 1)';

				const values: number[] = metricKeys.map((key) => {
					const val = metrics[key];
					return val !== -1 ? val * 100 : null; 
				}).filter((v): v is number => v !== null);

				return {
					label: modelName,
					data: values,
					backgroundColor: baseColor.replace('1)', isSelected ? '0.4)' : '0.05)'),
					borderColor: baseColor,
					borderWidth: isSelected ? 4 : 1,
					pointBackgroundColor: baseColor,
					pointRadius: isSelected ? 6 : 2,
					fill: true,
					borderDash: isSelected ? [] : [4, 4]
				};
			});
	}


	function renderChart() {
		if (chartInstance) chartInstance.destroy();

		const rawKeys = getActiveMetrics();

		const metricKeys = rawKeys.filter((key) => metricConfig[key] !== undefined);
		const labels = metricKeys.map((key) => metricConfig[key]!);

		const isDark = $darkMode;
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
		const angleLineColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
		const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';

		console.log('Labels:', labels);
		console.log('Dataset values:', createDatasets(metricKeys).map(d => d.data));

		chartInstance = new Chart(canvasEl, {
			type: 'radar',
			data: {
				labels,
				datasets: createDatasets(metricKeys)
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'top' },
					title: { display: true, text: title }
				},
				scales: {
					r: {
						beginAtZero: true,
						min: 0,
						max: 100,
						ticks: { display: false },
						grid: { color: gridColor },
						angleLines: { color: angleLineColor },
						pointLabels: { color: labelColor }
					}
				}
			}
		});
	}

	onMount(() => renderChart());
	$: if (selected || dataMap || models) {
		renderChart();
	}
	onDestroy(() => {
		if (chartInstance) chartInstance.destroy();
	});
</script>

<div class="h-[300px] w-full md:w-[250px]">
	<canvas bind:this={canvasEl}></canvas>
</div>
