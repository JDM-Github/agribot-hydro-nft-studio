<script lang="ts">
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';
	import { deviceID, userData } from '$root/lib/stores/connection';
	import { addToast, removeToast } from '$root/lib/stores/toast';
	import { saveToDB } from '$root/lib/utils/indexdb';
	import { RefreshCw } from 'lucide-svelte';
	import { writable, derived, type Writable } from 'svelte/store';

	let records: Writable<any> = writable([]);
	userData.subscribe((user) => {
		if (!user) return;
		records.set(user.folders || []);
	});

	let searchQuery = writable('');
	let sortOrder = writable<'asc' | 'desc'>('desc');
	let currentPage = writable(1);
	const itemsPerPage = 12;

	const filteredRecords = derived([records, searchQuery], ([$records, $searchQuery]) => {
		return $records.filter((record: any) =>
			record.date.toLowerCase().includes($searchQuery.toLowerCase())
		);
	});

	const sortedRecords = derived([filteredRecords, sortOrder], ([$filteredRecords, $sortOrder]) => {
		return [...$filteredRecords].sort((a, b) => {
			currentPage.set(1);
			if ($sortOrder === 'asc') {
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			} else {
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
		});
	});

	const paginatedRecords = derived(
		[sortedRecords, currentPage],
		([$sortedRecords, $currentPage]) => {
			const start = ($currentPage - 1) * itemsPerPage;
			const end = start + itemsPerPage;
			return $sortedRecords.slice(start, end);
		}
	);

	const totalPages = derived(sortedRecords, ($sortedRecords) =>
		Math.ceil($sortedRecords.length / itemsPerPage)
	);

	function readMore(slug: string) {
		goto(`/folder/${slug}`);
	}

	function goToPage(page: number) {
		currentPage.set(page);
	}

	let contextMenuVisible = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let selectedFolder: any = null;

	function openFolder(slug: string) {
		readMore(slug);
	}

	function showContextMenu(event: MouseEvent, folder: any) {
		event.preventDefault();
		selectedFolder = folder;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		contextMenuVisible = true;
	}

	async function deleteFolder(folder: string) {
		contextMenuVisible = false;
		const res = await fetch('/api/delete-folder', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ folder })
		});
		if (res.ok) {
			records.update(($records) => $records.filter((r: any) => r.slug !== folder));
		}
	}

	let recSyncing = false;
	async function forceRecordSync() {
		recSyncing = true;
		const toastId = addToast('Force syncing records folder...', 'loading');
		try {
			const res = await fetch('/api/custom-sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userData: $userData,
					deviceID: $deviceID,
					willUpdateTailscale: true
				})
			});
			const response = await res.json();
			removeToast(toastId);
			if (res.ok && response.success) {
				await saveToDB('userData', response.data);
				addToast('Force sync of records folder is successful!', 'success', 3000);
				await goto('/record', { invalidateAll: true });
			} else {
				addToast('Force sync of records folder failed..', 'error', 3000);
			}
		} catch (error) {
			removeToast(toastId);
			addToast(`An unexpected error occurred. ${error}`, 'error', 3000);
		}

		recSyncing = false;
	}
</script>

{#if contextMenuVisible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute z-50 w-44 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
		style="top: {contextMenuY}px; left: {contextMenuX}px"
		on:click={() => (contextMenuVisible = false)}
	>
		<button
			class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
			on:click={() => openFolder(selectedFolder.slug)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-4 w-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 7.5A1.5 1.5 0 014.5 6h5.379a1.5 1.5 0 011.06.44l1.12 1.12a1.5 1.5 0 001.06.44H19.5A1.5 1.5 0 0121 9.5v7a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5v-9z"
				/>
			</svg>
			<span>Open</span>
		</button>

		<button
			class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-600/40"
			on:click={() => deleteFolder(selectedFolder.slug)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-4 w-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M6 7.5h12m-9 3v6m6-6v6M4.5 7.5h15a.75.75 0 01.75.75v.75H3.75v-.75a.75.75 0 01.75-.75zM9 4.5h6a.75.75 0 01.75.75V6H8.25v-.75A.75.75 0 019 4.5z"
				/>
			</svg>
			<span>Delete</span>
		</button>
	</div>
{/if}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main
	class="relative flex min-h-[calc(100vh-95px)] flex-col
	bg-gradient-to-b from-gray-200 to-gray-300
	p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
	on:click={() => (contextMenuVisible = false)}
>
	<div class="container mx-auto rounded-2xl bg-white p-4 px-4 dark:bg-gray-900">
		<div
			class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-2">
				<span class="text-xl sm:text-2xl">📁</span>
				<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">RECORDS</h2>
			</div>

			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search Records..."
					class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				/>

				<select
					bind:value={$sortOrder}
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				>
					<option value="desc">Sort: Newest First</option>
					<option value="asc">Sort: Oldest First</option>
				</select>

				<button
					on:click={forceRecordSync}
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
					disabled={recSyncing}
				>
					{#if recSyncing}
						<RefreshCw class="h-4 w-4 animate-spin" />
						<span>Syncing...</span>
					{:else}
						<RefreshCw class="h-4 w-4" />
						<span>Force Sync</span>
					{/if}
				</button>
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
							class="group relative flex h-[100px] w-[100px] cursor-pointer items-center justify-center rounded-3xl bg-gray-200 hover:bg-gray-300 sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px] lg:h-[120px] lg:w-[160px] dark:bg-gray-800 dark:hover:bg-gray-700"
							style="animation-delay: {index * 50}ms;"
							aria-label="but"
							on:click={() => readMore(record.slug)}
							on:contextmenu={(e) => showContextMenu(e, record)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-16 w-16 text-green-300 transition-colors duration-300 group-hover:text-green-600 sm:h-20 sm:w-20 md:h-24 md:w-24 dark:text-green-300 dark:group-hover:text-green-400"
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
