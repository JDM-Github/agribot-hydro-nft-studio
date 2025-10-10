<script lang="ts">
	import { goto } from '$app/navigation';
/**
 * @file scannedheader.svelte
 * @description Provides the header section for scanned plant results, including 
 *              search functionality, configuration reset, and access to a tutorial guide.
 * 
 * @props
 *   - searchPlant: Writable<string> store for filtering scanned plants by name.
 *   - revertConfig: Function to revert or reset the current plant scanning configuration.
 * 
 * @imports
 *   - Guide: Modal component for displaying the tutorial/guide.
 *   - Writable: Svelte store type used for the searchPlant prop.
 * 
 * @localState
 *   - showTutorial: Controls visibility of the tutorial modal.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

import Guide from '$modal/Guide.svelte';
import { deviceID, userData } from '$root/lib/stores/connection';
import { addToast, removeToast } from '$root/lib/stores/toast';
import { saveToDB } from '$root/lib/utils/indexdb';
import { RefreshCw } from 'lucide-svelte';

// Types
import type { Writable } from 'svelte/store';

// ----------------------------
// Props
// ----------------------------
export let searchPlant: Writable<string>;
export let revertConfig: () => void = () => {};

// ----------------------------
// Local State
// ----------------------------
let syncing = false;
let showTutorial = false;

async function forceCustomSync() {
	syncing = true;
	const toastId = addToast('Force syncing user, models, and plants...', 'loading');
	try {
		const res = await fetch('/api/custom-sync', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userData: $userData,
				deviceID: $deviceID,
				willUpdateUser: true,
				willUpdateModels: true,
				willUpdatePlants: true,
			})
		});
		const response = await res.json();
		removeToast(toastId);
		if (res.ok && response.success) {
			await saveToDB('userData', response.data);
			addToast('Force sync of user, models, and plants is successful!', 'success', 3000);
			await goto('/', { invalidateAll: true });
		} else {				
			addToast('Force sync of user, models, and plants failed..', 'error', 3000);
		}
	} catch (error) {
		removeToast(toastId);
		addToast(`An unexpected error occurred. ${error}`, 'error', 3000);
	}
	syncing = false;
}
</script>




<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div
	class="relative mb-3 flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
>
	<div class="flex items-center gap-2">
		<span class="text-xl sm:text-2xl">🌿</span>
		<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">SCANNED PLANTS</h2>
	</div>

	<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
		<input
			type="text"
			bind:value={$searchPlant}
			placeholder="Search plants..."
			class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
		/>

		<div class="flex w-full justify-between gap-2 sm:w-auto sm:justify-start">
			<button
				class="flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-md bg-green-600 text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:outline-none sm:w-auto sm:px-4 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400"
				title="Help"
				on:click={() => showTutorial = !showTutorial}
			>
				<span class="text-sm font-medium">Help</span>
			</button>

			<button
				class="flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-md bg-red-600 text-white shadow-md transition hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none sm:w-auto sm:px-4 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400"
				title="Revert"
				on:click={revertConfig}
			>
				<span class="text-sm font-medium">Reset</span>
			</button>

			<button
				class="flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 text-white shadow-md transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none sm:w-auto sm:px-4 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 disabled:opacity-50"
				title="Force Custom Sync"
				on:click={forceCustomSync}
				disabled={syncing}
			>
				{#if syncing}
					<RefreshCw class="h-4 w-4 animate-spin" />
					<span class="text-sm font-medium">Syncing...</span>
				{:else}
					<RefreshCw class="h-4 w-4" />
					<span class="text-sm font-medium">Sync</span>
				{/if}
			</button>
		</div>
	</div>
</div>

<Guide {showTutorial} toggleTutorial={() => showTutorial = !showTutorial} />
