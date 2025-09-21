<script lang="ts">
	import { getTimestamp } from '$utils/time';
	import { allDiseases, allPlants } from '$lib/stores/plant';
	import type { Writable } from 'svelte/store';
	import { get } from 'svelte/store';

	export let showModal: boolean;
	export let closeModal: () => void;
	export let detectedPlants: Writable<
		{
			key: string;
			timestamp: string;
			willSprayEarly: boolean;
			disabled: boolean;
			disease: {
				[key: string]: boolean[];
			};
		}[]
	>;

	function addPlantToDetected(key: string) {
		const plant = allPlants[key];
		if (!plant) return;
		const newEntry: any = {
			key,
			timestamp: getTimestamp(),
			disabled: false,
			willSprayEarly: false,
			disease: {},
			disease_time_spray: {}
		};
		Object.keys(allDiseases).forEach((diseaseKey) => {
			newEntry.disease[diseaseKey] = Array(4).fill(false);
			newEntry.disease_time_spray[diseaseKey] = ['03:00', '22:00'];
		});
		detectedPlants.update((curr) => [...curr, newEntry]);
	}

	function removePlantFromDetected(key: string) {
		detectedPlants.set(get(detectedPlants).filter((p: any) => p.key !== key));
	}
</script>

{#if showModal}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
	>
		<div
			class="mx-12 w-full max-w-3xl rounded-lg border border-gray-300 bg-white p-7 shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900"
		>
			<h2 class="mb-5 text-xl font-semibold text-gray-800 dark:text-white">Add Plant</h2>

			<div class="grid max-h-[65vh] gap-5 overflow-y-auto">
				{#each Object.entries(allPlants) as [key, plant]}
					<div
						class="flex flex-col gap-3 rounded-md border border-gray-300 p-3 dark:border-gray-700"
					>
						<div class="flex items-center gap-5">
							<img src={plant.image} alt={plant.name} class="h-20 w-20 rounded object-cover" />
							<div class="flex-1">
								<p class="text-base font-medium text-gray-700 dark:text-gray-200">{plant.name}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{plant.type}</p>
							</div>
							{#if $detectedPlants.some((p: any) => p.key === key)}
								<button
									class="rounded bg-red-500 px-4 py-2 text-sm text-white shadow hover:bg-red-600"
									on:click={() => removePlantFromDetected(key)}
								>
									Remove
								</button>
							{:else}
								<button
									class="rounded bg-green-500 px-4 py-2 text-sm text-white shadow hover:bg-green-600"
									on:click={() => addPlantToDetected(key)}
								>
									Add
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-7 flex justify-end">
				<button
					class="rounded bg-gray-400 px-5 py-2 text-sm text-white hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
					on:click={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
