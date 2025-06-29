<script lang="ts">
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';
	import { writable, derived } from 'svelte/store';
	import { isConnected } from '$lib/stores/connection';

	export let data;
	let records = writable(data.records);

	let searchQuery = writable('');
	let currentPage = writable(1);
	const itemsPerPage = 12;

	const filteredRecords = derived([records, searchQuery], ([$records, $searchQuery]) => {
		return $records.filter((record: any) =>
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
		goto(`/folder/${slug}`);
	}
	function goToPage(page: number) {
		currentPage.set(page);
	}
</script>

{#if !$isConnected}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col items-center justify-center bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-800"
	>
		<div
			class="flex h-full flex-col items-center justify-center text-center text-lg font-semibold text-gray-600 dark:text-gray-400"
		>
			<p>The device is not connected to AGRI-BOT. Please connect first.</p>
		</div>
	</div>
	<Footer />
{:else}
	<main
		class="relative flex min-h-[calc(100vh-95px)] flex-col
	bg-gradient-to-b from-gray-200 to-gray-300
	p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
	>
		<div class="container mx-auto rounded-2xl bg-white p-4 px-4 dark:bg-gray-900">
			<div
				class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-800"
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

			{#if $paginatedRecords.length === 0}
				<p class="mt-3 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
					No records found.
				</p>
			{:else}
				<div class="mt-2 flex min-h-[180px] flex-wrap items-center justify-center gap-6">
					{#each $paginatedRecords as record, index}
						<div class="flex flex-col items-center">
							<button
								class="group relative flex h-[100px] w-[100px] cursor-pointer items-center justify-center rounded-3xl
					   bg-gray-200 hover:bg-gray-300 sm:h-[120px] sm:w-[120px]
					   md:h-[140px] md:w-[140px] lg:h-[120px] lg:w-[160px] dark:bg-gray-800 dark:hover:bg-gray-700"
								style="animation-delay: {index * 50}ms;"
								aria-label="but"
								on:click={() => readMore(record.slug)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-16 w-16 text-green-300 transition-colors
						   duration-300 group-hover:text-green-600
						   sm:h-20 sm:w-20
						   md:h-24 md:w-24 dark:text-green-300 dark:group-hover:text-green-400"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.25 12.75v6.75a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25h-7.5l-2.25-2.25H4.5a2.25 2.25 0 00-2.25 2.25v9z"
									/>
								</svg>
							</button>

							<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">
								{record.date}
							</h3>
						</div>
					{/each}
				</div>
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
{/if}
