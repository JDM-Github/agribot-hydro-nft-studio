<script lang="ts">
	import { Connection } from "$root/lib/class/connection";
	export let isActive: boolean;
	$: readings = Connection.getReadings()
</script>

<div
	class="col-span-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
	<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">WATER SENSORS</h4>
	<div class="mt-2 grid grid-cols-4 gap-3">
		{#each $readings as ws, i}
			<div
				class="flex flex-col items-center rounded-lg bg-gray-50 p-2 shadow-inner transition dark:bg-gray-800"
			>
				<span class="text-xs font-medium">WS{i + 1}</span>
				<span class="{!isActive ? 'text-gray-700' : (ws ? 'text-blue-500' : 'text-gray-400')} text-xl">◆</span>
				<p class="text-xs">{!isActive ? 'Not Connected' : (ws ? 'Wet' : 'Dry')}</p>
			</div>
		{/each}
	</div>
</div>
