<script lang="ts">
	import type { WifiManager } from "$root/lib/class/wifi";
	import { get } from "svelte/store";

    export let wifi: WifiManager;
</script>

<div
	class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex items-center gap-2">
		<span class="text-xl sm:text-2xl">📶</span>
		<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">MANAGE WIFI</h2>
	</div>
	<div class="flex gap-2">
		<button
			on:click={wifi.scanNetworks}
			class="rounded-lg bg-green-500 px-4 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-green-600 disabled:opacity-50"
			disabled={get(wifi.loading)}
		>
			{get(wifi.loading) ? 'Scanning...' : 'Scan Networks'}
		</button>
	</div>
</div>
