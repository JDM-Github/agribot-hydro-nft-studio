<script>
    export let closeTerms;
</script>
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
	<div
		class="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900 dark:text-gray-200"
	>
		<h2 class="mb-4 text-xl font-semibold">Terms & Conditions</h2>
		<p class="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
			Here you can put your terms and conditions text. Explain the rules, disclaimers, and
			responsibilities clearly. Users can scroll if it’s long.
		</p>
		<div class="flex justify-end">
			<button
				class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
				on:click={closeTerms}
			>
				Close
			</button>
		</div>
	</div>
</div>
