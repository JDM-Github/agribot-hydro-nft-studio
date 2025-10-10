<script lang='ts'>
	import { Connection } from "$root/lib/class/connection";
    export let isActive: boolean;
    $: tcrt5000 = Connection.getTCRT5000();
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
	<h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">TCRT5000</h4>
	<div class="flex justify-between gap-3">
		<div class="flex flex-1 flex-col items-center">
			<span class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Left</span>
			<div
				class="h-10 w-full rounded-lg border transition-all"
				style="background-color: {
                    !isActive ? '#444' : ($tcrt5000.left ? '#000000' : '#ffffff')};
                    border-color: {
                    !isActive ? '#444' : ($tcrt5000.right ? '#333333' : '#cccccc')};"
			></div>
		</div>

		<div class="flex flex-1 flex-col items-center">
			<span class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Right</span>
			<div
				class="h-10 w-full rounded-lg border transition-all"
				style="background-color: {
                    !isActive ? '#444' : ($tcrt5000.right ? '#000000' : '#ffffff')};
                    border-color: {
                    !isActive ? '#444' : ($tcrt5000.left ? '#333333' : '#cccccc')};"
			></div>
		</div>
	</div>
</div>
