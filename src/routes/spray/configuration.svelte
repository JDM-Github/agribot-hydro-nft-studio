<script lang="ts">
/**
 * @file Configuration.svelte
 * @description Provides configuration controls for spraying operations, scheduling,
 *              and plant management. Handles saving, downloading, uploading configuration,
 *              and integrates with stores for livestreaming, mode, and modal toggles.
 * 
 * @props
 *   - saveConfig: FunctionType to save the current configuration.
 *   - downloadConfig: FunctionType to download configuration to a file.
 *   - uploadConfig: FunctionType to upload configuration from a file.
 *   - openSprayModal: FunctionType to open the spray modal.
 *   - setSchedule: FunctionType to set scheduling options for spraying.
 *   - openManualPlant: FunctionType to open manual plant selection/view.
 * 
 * @imports
 *   - isLivestreaming: Store for livestream connection state.
 *   - addToast: Store utility for toast notifications.
 *   - simpleMode: Store for toggling simplified mode.
 *   - handleToggle, openId: Store utilities for modal/dialog state.
 *   - FunctionType: Type definition for function props.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Stores
import { isLivestreaming } from '$stores/connection';
import { addToast } from '$stores/toast';
import { simpleMode } from '$stores/mode';
import { handleToggle, openId } from '$stores/openId';

// Types
import type { FunctionType } from '$lib/type';

// ----------------------------
// Props
// ----------------------------
export let saveConfig: FunctionType;
export let downloadConfig: FunctionType;
export let uploadConfig: FunctionType;
export let openSprayModal: FunctionType;
export let setSchedule: FunctionType;
export let openManualPlant: FunctionType;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<div class="mx-auto flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto md:w-1/2">
	{#if !$simpleMode}
		<details
			class="relative w-full sm:w-auto"
			open={$openId === 'config'}
			on:toggle={(e) => handleToggle('config', e)}
		>
			<summary
				class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
			>
				Configuration Actions
			</summary>
			<div
				class="absolute z-10 mt-2 flex w-48 flex-col gap-1 rounded-md bg-gray-300 p-2 shadow-lg dark:bg-gray-800"
			>
				<button
					on:click={saveConfig}
					class="w-full rounded bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
				>
					Save Configuration
				</button>
				<button
					on:click={async () => await downloadConfig()}
					class="w-full rounded bg-purple-500 px-3 py-2 text-xs font-medium text-white hover:bg-purple-600"
				>
					Download Configuration
				</button>
				<button
					on:click={uploadConfig}
					class="w-full rounded bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600"
				>
					Upload Configuration
				</button>
			</div>
		</details>

		<details
			class="relative w-full sm:w-auto"
			open={$openId === 'action'}
			on:toggle={(e) => handleToggle('action', e)}
		>
			<summary
				class="w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-950"
			>
				Setup Actions
			</summary>
			<div
				class="absolute z-10 mt-2 flex w-48 flex-col gap-1 rounded-md bg-gray-300 p-2 shadow-lg dark:bg-gray-800"
			>
				<button
					class="w-full rounded bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-600"
					on:click={() => {
						if ($isLivestreaming !== 'Stopped') {
							addToast('Action unavailable while livestreaming is active.', 'error', 3000);
							return;
						}
						openSprayModal();
					}}
				>
					Setup Spray
				</button>
				<button
					on:click={setSchedule}
					class="w-full rounded bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600"
				>
					Set Schedule
				</button>
				<button
					class="w-full cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-600 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
					on:click={() => {
						if ($isLivestreaming !== 'Stopped') {
							addToast('Action unavailable while livestreaming is active.', 'error', 3000);
							return;
						}
						openManualPlant();
					}}
				>
					Add Plant
				</button>
			</div>
		</details>
	{:else}
		<button
			on:click={saveConfig}
			class="rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600"
		>
			Save Configuration
		</button>
		<button
			class="rounded bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-600"
			on:click={() => {
				if ($isLivestreaming !== 'Stopped') {
					addToast('Action unavailable while livestreaming is active.', 'error', 3000);
					return;
				}
				openSprayModal();
			}}
		>
			Setup Spray
		</button>
		<button
			on:click={setSchedule}
			class="rounded bg-green-500 px-4 py-3 text-sm font-medium text-white hover:bg-green-600"
		>
			Set Schedule
		</button>
		<button
			class="rounded bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600"
			on:click={() => {
				if ($isLivestreaming !== 'Stopped') {
					addToast('Action unavailable while livestreaming is active.', 'error', 3000);
					return;
				}
				openManualPlant();
			}}
		>
			Add Plant
		</button>
	{/if}
</div>