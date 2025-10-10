<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { simpleMode } from '$lib/stores/mode';
	import type { PlantListTransformed, Spray } from '$lib/type';
	import { SocketService } from '../socket';

	let expandedDisease = writable(null);
	function toggleDiseaseDetails(index: any) {
		expandedDisease.update((current: any) => (current === index ? null : index));
	}
	export let allPlantsTransformed: PlantListTransformed;
	export let selectedPlant: any;
	export let showModal = false;
	export let disabledPlant = () => {};
	export let removePlant = (key: string, sid: string) => {};
	export let closeModal = () => {};
	export let slots: Writable<Spray>;

	function disabledSelected() {
		disabledPlant();
		closeModal();
	}
	function toggleSlotBinding(diseaseName: string, slotIndex: any) {
		selectedPlant.disease[diseaseName][slotIndex] = !selectedPlant.disease[diseaseName][slotIndex];
	}
	function resetSlot(diseaseName: string) {
		selectedPlant.disease[diseaseName] = [false, false, false, false];
	}
</script>

{#if selectedPlant && showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2">
		<div
			class="relative w-full max-w-3xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
		>
			{#if $simpleMode}
				<div class="space-y-3 p-4 overflow-y-auto max-h-[500px]">
					<h3
						class="flex items-center justify-between border-b border-gray-300 pb-2 text-2xl font-extrabold tracking-wide text-gray-800 dark:border-gray-700 dark:text-gray-200"
					>
						<span>{selectedPlant.key}</span>

						<label class="flex cursor-pointer items-center">
							<span class="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
								>Spray Early</span
							>
							<div class="relative">
								<input
									type="checkbox"
									bind:checked={selectedPlant.willSprayEarly}
									class="sr-only"
								/>
								<div
									class="h-5 w-10 rounded-full bg-gray-300 shadow-inner transition-colors duration-300 dark:bg-gray-600"
								></div>
								<div
									class="dot absolute top-0.5 left-0 h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300"
									class:left-5={selectedPlant.willSprayEarly}
								></div>
							</div>
						</label>
					</h3>

					<div class="space-y-5">
						{#each allPlantsTransformed[selectedPlant.key].diseases as diseaseKey}
								<div
									class="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
								>
									<h4 class="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
										{diseaseKey.name}
									</h4>

									<ul class="mb-4 list-disc space-y-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
										{#each diseaseKey.sprays as spray}
											<li>💧 {spray}</li>
										{/each}
									</ul>

									<div class="mt-3 mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
										<!-- svelte-ignore a11y_label_has_associated_control -->
										<label class="text-sm text-gray-700 dark:text-gray-300">Spray Time:</label>
										<input
											type="time"
											bind:value={selectedPlant.disease_time_spray[diseaseKey.name][0]}
											min="03:00"
											max="22:00"
											class="rounded-md border border-gray-400 p-1 text-gray-800 dark:bg-gray-700 dark:text-white"
										/>
										<span class="text-gray-500">to</span>
										<input
											type="time"
											bind:value={selectedPlant.disease_time_spray[diseaseKey.name][1]}
											min="03:00"
											max="22:00"
											class="rounded-md border border-gray-400 p-1 text-gray-800 dark:bg-gray-700 dark:text-white"
										/>
									</div>

									<!-- Slot Buttons -->
									<div class="flex flex-wrap gap-3">
										<button
											on:click={() => resetSlot(diseaseKey.name)}
											class="rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors"
											class:bg-red-500={!selectedPlant.disease[diseaseKey.name].some((x: any) => x)}
											class:bg-gray-300={selectedPlant.disease[diseaseKey.name].some((x: any) => x)}
											class:text-white={!selectedPlant.disease[diseaseKey.name].some((x: any) => x)}
											class:text-gray-800={selectedPlant.disease[diseaseKey.name].some((x: any) => x)}
										>
											None
										</button>

										{#each selectedPlant.disease[diseaseKey.name] as slot, slotIndex}
											<button
												on:click={() => toggleSlotBinding(diseaseKey.name, slotIndex)}
												class="rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors"
												class:bg-green-500={slot}
												class:bg-gray-300={!slot}
												class:text-white={slot}
												class:text-gray-800={!slot}
											>
												Bind to {$slots.spray[slotIndex]}
											</button>
										{/each}
									</div>
								</div>
						{/each}
					</div>

					<div class="flex justify-end gap-2">
						<button
							on:click={disabledSelected}
							class="rounded-lg bg-red-700 px-5 py-2 text-white transition hover:bg-red-800"
						>
							Disabled
						</button>
						<button
							on:click={() => {
								closeModal();
								
								removePlant(selectedPlant.key, SocketService.id() ?? "");
							}}
							class="rounded-lg bg-red-900 px-5 py-2 text-white transition hover:bg-red-950"
						>
							Removed
						</button>
						<button
							on:click={closeModal}
							class="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
						>
							Close
						</button>
					</div>
				</div>
			{:else}
				<div class="h-48 w-full bg-gray-100 dark:bg-gray-700">
					<img
						src={allPlantsTransformed[selectedPlant.key].image}
						alt={allPlantsTransformed[selectedPlant.key].name}
						class="h-full w-full object-cover"
					/>
				</div>

				<div class="space-y-3 p-4">
					<h3
						class="flex items-center justify-between border-b border-gray-300 pb-2 text-2xl font-extrabold tracking-wide text-gray-800 dark:border-gray-700 dark:text-gray-200"
					>
						<span>{selectedPlant.key}</span>

						<!-- Modern Toggle Switch -->
						<label class="flex cursor-pointer items-center">
							<span class="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
								>Spray Early</span
							>
							<div class="relative">
								<input
									type="checkbox"
									bind:checked={selectedPlant.willSprayEarly}
									class="sr-only"
								/>
								<div
									class="h-5 w-10 rounded-full bg-gray-300 shadow-inner transition-colors duration-300 dark:bg-gray-600"
								></div>
								<div
									class="dot absolute top-0.5 left-0 h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300"
									class:left-5={selectedPlant.willSprayEarly}
								></div>
							</div>
						</label>
					</h3>

					<p class="leading-relaxed text-gray-600 dark:text-gray-400">
						{allPlantsTransformed[selectedPlant.key].description}
					</p>

					<div class="max-h-[300px] space-y-6 overflow-y-auto">
						{#each allPlantsTransformed[selectedPlant.key].diseases as diseaseKey, index}
							<div class="rounded-lg bg-gray-100 p-4 shadow-md dark:bg-gray-800">
								<div class="flex items-center justify-between">
									<h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
										{diseaseKey.name}
									</h4>
									<button on:click={() => toggleDiseaseDetails(index)} class="p-2">
										{#if $expandedDisease === index}
											<ChevronUp class="h-5 w-5 text-gray-500 dark:text-gray-300" />
										{:else}
											<ChevronDown class="h-5 w-5 text-gray-500 dark:text-gray-300" />
										{/if}
									</button>
								</div>

								{#if $expandedDisease === index}
									<div class="mt-3 space-y-2">
										<img
											src={diseaseKey.image}
											alt={diseaseKey.name}
											class="w-full rounded-lg object-cover shadow-sm"
										/>
										<p class="text-gray-600 dark:text-gray-400">
											{diseaseKey.description}
										</p>
									</div>
								{/if}

								<ul class="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-400">
									{#each diseaseKey.sprays as spray}
										<li>💧 {spray}</li>
									{/each}
								</ul>

								<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
									<!-- svelte-ignore a11y_label_has_associated_control -->
									<label class="text-sm text-gray-700 dark:text-gray-300">Spray Time:</label>
									<input
										type="time"
										bind:value={selectedPlant.disease_time_spray[diseaseKey.name][0]}
										min="03:00"
										max="22:00"
										class="rounded-md border border-gray-400 p-1 text-gray-800 dark:bg-gray-700 dark:text-white"
									/>
									<span class="text-gray-500">to</span>
									<input
										type="time"
										bind:value={selectedPlant.disease_time_spray[diseaseKey.name][1]}
										min="03:00"
										max="22:00"
										class="rounded-md border border-gray-400 p-1 text-gray-800 dark:bg-gray-700 dark:text-white"
									/>
								</div>

								<div class="mt-3 flex flex-wrap gap-2">
									<button
										on:click={() => resetSlot(diseaseKey.name)}
										class="rounded-lg px-3 py-1 text-sm transition"
										class:bg-red-500={!selectedPlant.disease[diseaseKey.name].some((x: boolean) => x)}
										class:bg-gray-300={selectedPlant.disease[diseaseKey.name].some((x: boolean) => x)}
										class:text-white={!selectedPlant.disease[diseaseKey.name].some((x: boolean) => x)}
										class:text-gray-800={selectedPlant.disease[diseaseKey.name].some((x: boolean) => x)}
									>
										None
									</button>

									{#each selectedPlant.disease[diseaseKey.name] as slot, slotIndex}
										<button
											on:click={() => toggleSlotBinding(diseaseKey.name, slotIndex)}
											class="rounded-lg px-3 py-1 text-sm transition"
											class:bg-green-500={slot}
											class:bg-gray-300={!slot}
											class:text-white={slot}
											class:text-gray-800={!slot}
										>
											Bind to {$slots.spray[slotIndex]}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<div class="flex justify-end gap-2">
						<button
							on:click={disabledSelected}
							class="rounded-lg bg-red-700 px-5 py-2 text-white transition hover:bg-red-800"
						>
							Disabled
						</button>
						<button
							on:click={() => {
								closeModal();
								removePlant(selectedPlant.key, SocketService.id() ?? "");
							}}
							class="rounded-lg bg-red-900 px-5 py-2 text-white transition hover:bg-red-950"
						>
							Removed
						</button>
						<button
							on:click={closeModal}
							class="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
						>
							Close
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
