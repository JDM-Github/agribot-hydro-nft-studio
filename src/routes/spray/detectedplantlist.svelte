<script lang="ts">
/**
 * @file detectedplantlist.svelte
 * @description Displays a list of detected plants and handles selection. Integrates with
 *              plant and connection stores, and provides feedback via toasts.
 * 
 * @props
 *   - plants: DetectedPlantArray containing all detected plants to display.
 *   - onSelectPlant: Callback function triggered when a plant is selected,
 *                    receives (plant: DetectedPlant, index: number).
 * 
 * @imports
 *   - DetectedPlant, DetectedPlantArray: Type definitions for plant detection results.
 *   - allPlants: Store containing all plant data.
 *   - isLivestreaming: Store indicating if livestream is active.
 *   - addToast: Store utility for displaying toast notifications.
 *   - get: Svelte store helper function.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------

// Types
import type { DetectedPlant, DetectedPlantArray, PlantList } from '$lib/type';

// Stores
import { isLivestreaming } from '$stores/connection';
import { addToast } from '$stores/toast';
import { get } from 'svelte/store';

// ----------------------------
// Props
// ----------------------------
export let plants: DetectedPlantArray;
export let onSelectPlant: (plant: DetectedPlant, index: number) => void;
</script>



<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------------------------------- -->

<section>
	<ul class="min-h-[230px] space-y-2 md:min-h-[350px]">
		{#if plants.length > 0}
			{#each plants as plant, index}
				<li class="relative flex w-full items-stretch rounded-lg border border-gray-100 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
					
					<!-- Plant image with optional disabled overlay -->
					<div class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full md:h-20 md:w-20">
						<img src={plant.image} alt={plant.key} class="h-14 w-14 rounded-full object-cover md:h-16 md:w-16" />
						{#if plant.disabled}
							<div class="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/60 px-1 text-[10px] text-red-300 md:text-xs">
								<span>Disabled</span>
								<button class="rounded bg-green-300 px-1 py-0.5 font-semibold text-black hover:bg-green-400"
									on:click|stopPropagation={() => {
										if (get(isLivestreaming) !== 'Stopped') {
											addToast('Action unavailable while livestreaming is active.', 'error', 3000);
										} else {
											plant.disabled = false;
										}
									}}>
									Enable
								</button>
							</div>
						{/if}
					</div>

					<div class="flex flex-1 flex-col justify-center p-2">
						<p class="text-sm font-semibold text-gray-900 dark:text-gray-200">{plant.key}</p>
						<div class="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400">
							<p><strong>Time:</strong> {plant.timestamp ?? 'Unknown'}</p>
						</div>
					</div>

					<div class="flex flex-col items-center justify-center space-y-1 p-2">
						<button class="rounded-md bg-green-500 p-2 text-white shadow-sm hover:bg-green-600 dark:bg-transparent dark:hover:bg-transparent dark:hover:text-green-400"
							aria-label="View plant details"
							on:click={() => onSelectPlant(plant, index)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</li>
			{/each}
		{:else}
			<li class="flex h-full min-h-[350px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
				No plants detected.
			</li>
		{/if}
	</ul>
</section>