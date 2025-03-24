<script lang="ts">
	import { writable } from 'svelte/store';

	export let scanning;
	export let toggleScan;
	export let closeModal;
	export let openCamera;

	let models = ['Model A', 'Model B', 'Model C', 'Model D'];
	let selectedModel = writable('Model A');
	let previousModel = writable('Model A');
	let showToast = writable(false);

	function confirmModelChange(event: any) {
		selectedModel.set(event.target.value);
		showToast.set(true);
	}

	function confirmChange() {
		previousModel.set($selectedModel);
		showToast.set(false);
	}

	function cancelChange() {
		selectedModel.set($previousModel);
		showToast.set(false);
	}
</script>

<div
	class="mx-auto flex flex-col items-center justify-between space-y-2 rounded-lg p-3 md:flex-row md:space-y-0 md:space-x-3 dark:bg-gray-900"
>
	<div class="flex w-full flex-wrap items-center justify-center gap-2 md:justify-start lg:w-auto">
		<button
			class="w-full rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
			on:click={closeModal}
		>
			SETUP SPRAY
		</button>

		<div class="relative w-full sm:w-auto">
			<select
				bind:value={$selectedModel}
				on:change={confirmModelChange}
				class="w-full rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-green-600 sm:w-auto dark:bg-green-600 dark:hover:bg-green-700 text-center"
			>
				{#each models as model}
					<option value={model}>{model}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:flex-nowrap">
		<button
			class="w-full rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-md transition sm:w-auto"
			class:bg-green-500={!scanning}
			class:bg-gray-400={scanning}
			class:dark:bg-green-600={!scanning}
			class:dark:bg-gray-600={scanning}
			on:click={() => toggleScan(true)}
			disabled={scanning}
		>
			START
		</button>

		<button
			class="w-full rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-md transition sm:w-auto"
			class:bg-red-500={scanning}
			class:bg-gray-400={!scanning}
			class:dark:bg-red-600={scanning}
			class:dark:bg-gray-600={!scanning}
			on:click={() => toggleScan(false)}
			disabled={!scanning}
		>
			STOP
		</button>
	</div>

	<button
		class="w-full rounded-md bg-gray-500 px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-gray-600 sm:w-auto md:hidden dark:bg-gray-700 dark:hover:bg-gray-800"
		on:click={openCamera}
	>
		SHOW CAMERA
	</button>
</div>

{#if $showToast}
	<div class="fixed inset-0 z-40 bg-black/80"></div>
	<div
		class="fixed right-5 bottom-5 z-50 flex flex-col space-y-3 rounded-lg bg-red-600 px-5 py-4 text-white shadow-lg transition-opacity duration-300"
	>
		⚠️ <span>Warning: Changing the model will reset your setup!</span>
		<div class="flex justify-end space-x-3">
			<button
				on:click={confirmChange}
				class="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-gray-200"
			>
				OK
			</button>
			<button
				on:click={cancelChange}
				class="rounded-md bg-gray-300 px-3 py-1.5 text-sm font-bold text-gray-800 hover:bg-gray-400"
			>
				CANCEL
			</button>
		</div>
	</div>
{/if}
