<script lang="ts">
	import RequestHandler from "$lib/utils/request";
	import { onMount } from "svelte";

	let waterSensors: number[] = [0, 0, 0, 0];
	let refreshInterval: any;

	async function fetchWaterSensors() {
		try {
			const [success, response] = await RequestHandler.authFetch("/water-sensors", "GET");
			if (success && response?.readings) {
				waterSensors = response.readings;
			}
		} catch (err) {
			console.error("Failed to fetch water sensors:", err);
		}
	}

	// onMount(() => {
	// 	fetchWaterSensors();
	// 	refreshInterval = setInterval(fetchWaterSensors, 2000);
	// 	return () => clearInterval(refreshInterval);
	// });
</script>

<div
	class="col-span-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
	<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">WATER SENSORS</h4>
	<div class="mt-2 grid grid-cols-4 gap-3">
		{#each waterSensors as ws, i}
			<div
				class="flex flex-col items-center rounded-lg bg-gray-50 p-2 shadow-inner transition dark:bg-gray-800"
			>
				<span class="text-xs font-medium">WS{i + 1}</span>
				<span class="{ws ? 'text-blue-500' : 'text-gray-400'} text-xl">💧</span>
				<p class="text-xs">{ws ? 'Wet' : 'Dry'}</p>
			</div>
		{/each}
	</div>
</div>
