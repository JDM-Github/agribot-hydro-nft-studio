<script lang="ts">
	import { simpleMode } from '$lib/stores/mode';
	import { recommendedSprays } from '$lib/stores/plant';
	import { addToast } from '$lib/stores/toast';
	import type { Writable } from 'svelte/store';

	export let showSprayModal = false;
	export let allSprays: Writable<string[]>;
	export let allSpraysActive: Writable<boolean[]>;
	export let allDurations: Writable<number[]>;
	export let previousSprays: {
		spray: string[];
		active: boolean[];
		duration?: number[];
	};
	export let closeModal: () => void = () => {};
	let selectedSpray: { info: string; plants: { name: string; disease: string }[] } | null = null;
	let selectedSprayPosition = { x: 0, y: 0 };
	function applyRecommended(index: number, sprayName: string) {
		$allSprays[index] = sprayName;
	}
	function showSprayInfo(event: MouseEvent, sprayName: string) {
		const spray = recommendedSprays.find((s) => s.name === sprayName);
		if (spray) {
			selectedSpray = spray;
			selectedSprayPosition = { x: event.clientX, y: event.clientY };
		}
	}
	function hideSprayInfo() {
		selectedSpray = null;
	}
</script>

{#if showSprayModal}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
	>
		<div
			class="mx-16 w-full max-w-2xl rounded-lg border border-gray-300 bg-white p-6 shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900"
		>
			<h2 class="text-xl font-bold text-gray-800 lg:text-2xl dark:text-gray-200">Setup Spray</h2>

			<div class="mt-4 flex flex-col gap-3">
				{#each $allSprays as spray, i}
					<div class="flex items-center gap-3">
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" bind:checked={$allSpraysActive[i]} class="peer sr-only" />
							<div
								class="peer h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-4 peer-checked:after:border-white dark:bg-gray-600 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
							></div>
						</label>
						<span class="w-10 text-sm text-gray-600 lg:text-base dark:text-gray-300">#{i + 1}</span>

						<input
							type="text"
							bind:value={$allSprays[i]}
							placeholder="Enter spray name..."
							class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none lg:text-base dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
						/>

						<input
							type="number"
							bind:value={$allDurations[i]}
							min="1"
							placeholder="2"
							class="w-20 rounded-md border border-gray-300 bg-white px-2 py-2 text-center text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none lg:text-base dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
						/>
						<span class="text-sm text-gray-600 dark:text-gray-400">sec</span>

						<button
							class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
							on:click={() => {
								$allSprays[i] = '';
								$allDurations[i] = 2;
							}}
						>
							❌CLEAR
						</button>
					</div>
				{/each}
			</div>

			{#if !$simpleMode}
				<div class="mt-6">
					<h3 class="text-lg font-bold text-gray-700 lg:text-xl dark:text-gray-300">
						Recommended Sprays
					</h3>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each recommendedSprays as spray}
							<button
								class="relative flex items-center gap-2 rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 lg:text-base dark:bg-green-500 dark:hover:bg-green-800"
								on:click={() =>
									applyRecommended(
										$allSprays.findIndex((s: string) => s === ''),
										spray.name
									)}
								on:mouseenter={(event) => showSprayInfo(event, spray.name)}
								on:mouseleave={hideSprayInfo}
							>
								{spray.name}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if selectedSpray}
				<div
					class="fixed z-50 w-100 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg sm:w-52 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
					style="top: min({selectedSprayPosition.y +
						10}px, 80vh); left: min({selectedSprayPosition.x + 10}px, 80vw);"
				>
					<p class="font-bold text-green-600 dark:text-green-400">{selectedSpray.info}</p>
					<hr class="my-2 border-gray-300 dark:border-gray-700" />

					<p class="mt-2 font-semibold text-gray-600 dark:text-gray-300">Recommended for:</p>
					<ul class="mt-1 space-y-1">
						{#each selectedSpray.plants as plant}
							<li>
								<span class="text-blue-600 dark:text-blue-300">{plant.name}</span>
								<span class="text-gray-500 dark:text-gray-400"> | </span>
								<span class="text-red-600 dark:text-red-400">{plant.disease}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="mt-6 flex justify-end gap-2">
				<button
					class="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 lg:text-base"
					on:click={() => {
						allSprays.set(previousSprays.spray);
						allSpraysActive.set(previousSprays.active);
						allDurations.set(previousSprays.duration ?? Array(previousSprays.spray.length).fill(2));
						closeModal();
					}}
				>
					Cancel
				</button>
				<button
					class="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 lg:text-base"
					on:click={() => {
						closeModal();
						addToast('Spray setup saved successfully!', 'success', 3000);
						setTimeout(() => {
							addToast(
								'Changes staged. Remember to click "Save Configuration" to apply them.',
								'info',
								5000
							);
						}, 10);
					}}
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
