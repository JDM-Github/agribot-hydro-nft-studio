<script lang="ts">
	import Guide from '$lib/modal/Guide.svelte';
	import type { Writable } from 'svelte/store';
	export let searchPlant: Writable<string>;
	export let revertConfig: () => void = () => {};
	let showTutorial = false;
	function toggleTutorial() {
		showTutorial = !showTutorial;
	}
</script>

<div
	class="relative mb-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
>
	<div class="flex items-center gap-2">
		<span class="text-xl sm:text-2xl">🌿</span>
		<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
			SCANNED PLANTS
		</h2>
	</div>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:gap-2">
		<input
			type="text"
			bind:value={$searchPlant}
			placeholder="Search plants..."
			class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 sm:w-48"
		/>

		<div class="flex w-full justify-between gap-2 sm:w-auto sm:justify-start">
			<button
				class="flex h-10 w-full flex-1 items-center justify-center rounded-md bg-green-600 text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400 sm:w-10 sm:rounded-full"
				title="Help"
				on:click={toggleTutorial}
			>
				<span class="text-lg font-bold sm:hidden">Help</span>
				<span class="hidden text-lg font-bold sm:inline">?</span>
			</button>
			<button
				class="flex h-10 w-full flex-1 items-center justify-center rounded-md bg-red-600 text-white shadow-md transition hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400 sm:w-10 sm:rounded-full"
				title="Revert"
				on:click={revertConfig}
			>
				<span class="text-lg sm:hidden">Reset</span>
				<span class="hidden text-lg sm:inline">↺</span>
			</button>
		</div>
	</div>
</div>

<Guide {showTutorial} {toggleTutorial} />
