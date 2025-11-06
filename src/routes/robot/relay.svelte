<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import RequestHandler from '$lib/utils/request';
	import { simpleMode } from '$lib/stores/mode';
	import { addToast, removeToast } from '$lib/stores/toast';

	export let sprays: any;
	export let scanning = false;
	export let isRobotRunning: boolean;
	let triggerMode = writable(false);

	let allClickedTrigger: Writable<number[]> = writable([])
	async function activateSpray(num: number) {
		try {
			let alreadyTriggered: boolean = false;
			allClickedTrigger.update(arr => {
				alreadyTriggered = arr.includes(num);
				if (!alreadyTriggered) arr.push(num);
				return arr;
			});
			if (alreadyTriggered) return;

			const toastId = addToast(`Spraying spray ${num}...`, 'loading');
			const [success, data] = await RequestHandler.authFetch(`trigger/${num}`, 'POST');

			removeToast(toastId);
            if (!success) {
                addToast(`Failed to trigger Spray ${num}`, 'error', 3000);
                return; 
            }
			else if (data.status === 'error') {
				addToast(data.message, 'error', 3000);
				return;
			} else {
				addToast(data.message || `Successfully trigger spray ${num}`, 'success', 3000);
			}
		} catch (err) {
			console.error(`Error triggering Spray ${num}:`, err);
			addToast(`Failed to trigger Spray ${num}`, 'error', 3000);
		} finally {
			allClickedTrigger.update(arr => arr.filter(n => n !== num));
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
	class="relative mb-4 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/60"
>
	<div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
		<div class="flex items-center gap-2">
			<span class="text-2xl">💧</span>
			<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
				Spray Controls
			</h2>
		</div>

		{#if !$simpleMode}
			<div class="flex flex-col items-center">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
					Trigger Mode
				</label>
				<input
					type="checkbox"
					bind:checked={$triggerMode}
					disabled={scanning || isRobotRunning || $allClickedTrigger.length < 0}
					class="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-500 focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
					title="Enable single-press trigger mode instead of hold mode"
				/>
			</div>
		{/if}
	</div>

	<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#each sprays.spray as sprayName, i}
			<div
				class="flex flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600 dark:hover:bg-gray-800"
			>
				<div class="mb-2 text-center text-sm text-gray-700 dark:text-gray-300">
					<p class="font-semibold">{sprayName}</p>
					<p>Active: 
						<span class="{sprays.active[i] ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}">
							{sprays.active[i] ? 'Yes' : 'No'}
						</span>
					</p>
					<p>Duration: {sprays.duration[i]}s</p>
				</div>

				<button
					disabled={scanning || isRobotRunning || $allClickedTrigger.includes(i + 1)}
					title={`Activate Spray ${i + 1}`}
					class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					on:mousedown={() => !$triggerMode && toggleSpray(i + 1, true)}
					on:mouseup={() => !$triggerMode && toggleSpray(i + 1, false)}
					on:click={() => $triggerMode && activateSpray(i + 1)}
				>
					{$triggerMode ? 'Trigger Spray' : 'Hold Spray'} {i + 1}
				</button>
			</div>
		{/each}
	</div>
</div>
