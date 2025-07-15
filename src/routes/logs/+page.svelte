<script>
	import Footer from '$lib/components/Footer.svelte';
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
>
	<div class="mx-auto w-11/12 rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
		<div
			class="relative mb-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
		>
			<div class="flex items-center gap-2">
				<span class="text-xl sm:text-2xl">🌿</span>
				<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">ALL LOGS</h2>
			</div>
		</div>

		<div
			class="mx-2 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 lg:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
		>
			<ul class="min-h-[350px] space-y-2"></ul>
		</div>

	</div>
</div>
<Footer />
