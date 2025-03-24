<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { writable, derived } from 'svelte/store';

	let records = writable([
		{ date: 'January 6, 2025', slug: '2025-01-06' },
		{ date: 'January 5, 2025', slug: '2025-01-05' },
		{ date: 'January 4, 2025', slug: '2025-01-04' },
		{ date: 'January 3, 2025', slug: '2025-01-03' },
		{ date: 'January 2, 2025', slug: '2025-01-02' },
		{ date: 'January 1, 2025', slug: '2025-01-01' }
	]);

	let searchQuery = writable('');

	let currentPage = writable(1);
	const itemsPerPage = 12;

	const filteredRecords = derived([records, searchQuery], ([$records, $searchQuery]) => {
		return $records.filter((record) =>
			record.date.toLowerCase().includes($searchQuery.toLowerCase())
		);
	});

	const paginatedRecords = derived(
		[filteredRecords, currentPage],
		([$filteredRecords, $currentPage]) => {
			const start = ($currentPage - 1) * itemsPerPage;
			const end = start + itemsPerPage;
			return $filteredRecords.slice(start, end);
		}
	);

	const totalPages = derived(filteredRecords, ($filteredRecords) =>
		Math.ceil($filteredRecords.length / itemsPerPage)
	);

	function readMore(slug: string) {
		window.location.href = `/folder/${slug}`;
	}

	function goToPage(page: number) {
		currentPage.set(page);
	}
</script>

<main class="min-h-[calc(100vh-95px)] bg-gray-100 py-4 dark:bg-gray-800 transition-all duration-500 ease-out ">
	<div class="container mx-auto rounded-2xl bg-white p-4 px-4 dark:bg-gray-900">
		<div
			class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
		>
			<div class="flex items-center gap-2">
				<span class="text-xl sm:text-2xl">📁</span>
				<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">RECORDS</h2>
			</div>

			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search Records..."
					class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				/>
			</div>
		</div>

		<div
			class="mt-4 flex min-h-[250px] flex-wrap items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-800"
		>
			{#each $paginatedRecords as record, index}
				<div class="flex flex-col items-center">
					<button
						class="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 shadow-md sm:h-[100px] sm:w-[100px] md:h-[160px] md:w-[160px] lg:h-[100px] lg:w-[180px] dark:border-gray-700"
						style="animation-delay: {index * 50}ms;"
						on:click={() => readMore(record.slug)}
					>
						<img
							src={'https://placehold.co/600x400/000000/FFF'}
							alt="Record"
							class="absolute inset-0 h-full w-full object-cover"
						/>

						<div
							class="dark:inline-block hidden absolute inset-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent dark:from-gray-900/80 dark:via-gray-900/50 dark:to-transparent"
						></div>
					</button>

					<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">
						{record.date}
					</h3>
				</div>
			{/each}
		</div>

		{#if $filteredRecords.length === 0}
			<p class="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">No records found.</p>
		{/if}

		{#if $filteredRecords.length > itemsPerPage}
			<div class="mt-4 flex items-center justify-center gap-2">
				<button
					class="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					on:click={() => goToPage($currentPage - 1)}
					disabled={$currentPage === 1}
				>
					← Prev
				</button>

				<span class="text-sm text-gray-700 dark:text-gray-300">
					Page {$currentPage} of {$totalPages}
				</span>

				<button
					class="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					on:click={() => goToPage($currentPage + 1)}
					disabled={$currentPage === $totalPages}
				>
					Next →
				</button>
			</div>
		{/if}
	</div>
</main>
<Footer />
