<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import RequestHandler from '$lib/utils/request';
	import { simpleMode } from '$lib/stores/mode';
	import { addToast } from '$lib/stores/toast';

	export let scanning = false;
	export let isRobotRunning: boolean;
	let triggerMode = writable(false);

	let allClickedTrigger: Writable<number[]> = writable([])
	async function activateSpray(num: number) {
		try {
			$allClickedTrigger.push(num);
			const [success, data] = await RequestHandler.authFetch(`trigger/${num}`, 'POST');
            if (!success) {
                addToast(`Failed to trigger Spray ${num}`, 'error', 3000);
                return; 
            }
			if (data.status === 'error') {
				addToast(data.message, 'error', 3000);
				return;
			}
		} catch (err) {
			console.error(`Error triggering Spray ${num}:`, err);
			addToast(`Failed to trigger Spray ${num}`, 'error', 3000);
		} finally {
			$allClickedTrigger.pop()
		}
	}

	async function toggleSpray(num: number, turnOn: boolean) {
		
		try {
			const state = turnOn ? 'on' : 'off';
			const [success, data] = await RequestHandler.authFetch(`relay/${num}/${state}`, 'POST');
            if (!success) {
                addToast(`Failed to trigger Spray ${num}`, 'error', 3000);
                return; 
            }
			if (data.status === 'error' && turnOn) {
				addToast(data.message, 'error', 3000);
				return;
			}
		} catch (err) {
			console.error(`Error controlling Spray ${num}:`, err);
			addToast(`Failed to control Spray ${num}`, 'error', 3000);
		}
	}
</script>

<div
	class="relative mb-3 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-[#fafffc] p-3 dark:border-gray-700 dark:bg-gray-900"
>
	<!-- Header -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span class="text-xl sm:text-2xl">💧</span>
			<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
				SPRAY CONTROLS
			</h2>
		</div>

		{#if !$simpleMode}
			<!-- Toggle Mode -->
			<div class="flex flex-col items-center">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
					Trigger Mode
				</label>
				<input
					type="checkbox"
					bind:checked={$triggerMode}
					disabled={scanning || isRobotRunning || $allClickedTrigger.length <= 0}
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-30 dark:border-gray-600"
					title="Enable single-press trigger mode instead of hold mode"
				/>
			</div>
		{/if}
	</div>

	<!-- Buttons Grid -->
	<div class="grid w-full grid-cols-4 gap-3">
		{#each [1, 2, 3, 4] as num}
			<div class="flex w-full flex-col items-center">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<button
					disabled={scanning || isRobotRunning || $allClickedTrigger.includes(num)}
					title={`Activate Spray ${num}`}
					class="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500"
					on:mousedown={() => !$triggerMode && toggleSpray(num, true)}
					on:mouseup={() => !$triggerMode && toggleSpray(num, false)}
					on:click={() => $triggerMode && activateSpray(num)}
				>
					{$triggerMode ? 'TRIGGER SPRAY' : 'HOLD SPRAY'}
					{num}
				</button>
			</div>
		{/each}
	</div>
</div>
