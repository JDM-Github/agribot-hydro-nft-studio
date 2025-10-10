<script lang="ts">
	import { Connection } from "$root/lib/class/connection";
	export let isActive: boolean = true;
	$: ultrasonic = Connection.getUltrasonic();
</script>

<div
	class="col-span-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
	<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">ULTRASONIC DISTANCE</h4>
	{#if isActive}
		<p class="text-lg font-bold text-gray-800 dark:text-gray-100">
			{$ultrasonic} cm
		</p>
	{:else}
		<p class="text-lg font-bold text-gray-800 dark:text-gray-100">NOT CONNECTED</p>
	{/if}
	<div
		class="mt-2 h-3 rounded-full bg-green-500 transition-all duration-300"
		style="width:{Math.min($ultrasonic, 100)}%"
	></div>
</div>
