<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { darkMode } from '$lib/stores/theme';

	export let title: string;
	export let models: string[];
	export let selected: string;
	export let dataMap: Record<
		string,
		{
			accuracy: number;
			recall: number;
			precision: number;
			mAP50: number;
			mAP50_95: number;
		}
	>;
	export let modelType: string;

	let canvasEl: HTMLCanvasElement;
	let chartInstance: Chart;

	const metricLabels = ['Accuracy', 'Recall', 'Precision', 'mAP50', 'mAP50_95'];

	function getColorForModel(): string {
		if (modelType === 'PlantOD') return 'rgba(59, 130, 246, 1)';
		if (modelType === 'StageCLS') return 'rgba(168, 85, 247, 1)';
		if (modelType === 'DiseaseSeg') return 'rgba(244, 63, 94, 1)';
		return 'rgba(107, 114, 128, 1)';
	}

	function createDatasets() {
		return models
			.filter((modelName) => dataMap[modelName])
			.map((modelName) => {
				const metrics = dataMap[modelName];
				const isSelected = modelName === selected;
				const baseColor = isSelected ? getColorForModel() : 'rgba(107, 114, 128, 1)';
				return {
					label: modelName,
					data: [
						metrics.accuracy * 100,
						metrics.recall * 100,
						metrics.precision * 100,
						metrics.mAP50 * 100,
						metrics.mAP50_95 * 100
					],
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

        const isDark = $darkMode;
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
		const angleLineColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
		const labelColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';

		chartInstance = new Chart(canvasEl, {
			type: 'radar',
			data: {
				labels: metricLabels,
				datasets: createDatasets()
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
						beginAtZero: false,
						min: 70,
						max: 100,
						ticks: {
							display: false
						},
						grid: {
							color: gridColor
						},
						angleLines: {
							color: angleLineColor
						},
						pointLabels: {
							color: labelColor
						}
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

<div class="h-[300px] w-full md:w-[300px]">
	<canvas bind:this={canvasEl}></canvas>
</div>
