<script lang="ts">
	export let searchPlants: (target: string) => void;
</script>

<div
	class="mb-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
>
	<div class="flex items-center gap-2">
		<span class="text-xl sm:text-2xl">🌿</span>
		<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">SCANNED PLANTS</h2>
	</div>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
		<input
			type="text"
			placeholder="Search plants..."
			class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
			on:input={(e) => searchPlants((e.target as HTMLInputElement).value)}
		/>
	</div>
</div>
