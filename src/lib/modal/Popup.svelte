<script lang="ts">
	import { fly } from 'svelte/transition';

	let showPopup = true;
	let currentStep = 1;

	const nextStep = () => currentStep++;
	const closePopup = () => {
		showPopup = false;
		currentStep = 1;
	};
</script>

{#if showPopup}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
		<div
			in:fly={{ y: 20, duration: 300 }}
			class="w-full max-w-2xl transform rounded-2xl bg-white p-8 shadow-2xl transition-all dark:bg-gray-900 dark:text-white"
		>
			{#if currentStep === 1}
				<h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">📢 Disclaimer</h2>
				<p class="mb-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
					This website is a research tool and is still under development. All detections,
					scheduling, and configurations are meant to assist but must be verified by the operator.
					The developers are not responsible for any outcomes resulting from automated actions.
				</p>

				<div class="flex justify-end">
					<button
						class="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
						on:click={nextStep}
					>
						I Understand
					</button>
				</div>
			{:else if currentStep === 2}
				<h2 class="mb-4 text-2xl font-bold text-gray-100">🌱 Welcome to Agri-Bot Studio</h2>

				<p class="mb-4 text-base text-gray-300">
					Here’s how to get started with scanning and managing your greenhouse crops:
				</p>

				<ol class="ml-6 list-decimal space-y-3 text-sm text-gray-200">
					<li>
						<strong>Live Camera Feed:</strong> Check real-time detection from the camera panel on the
						left.
					</li>
					<li>
						<strong>Scanned Plants:</strong> View recent plant detections in the center dashboard.
					</li>
					<li>
						<strong>Setup Spray:</strong> Choose models like
						<span class="font-medium text-yellow-400">PlantODV</span>,
						<span class="font-medium text-pink-400">StageCLSV</span>, and
						<span class="font-medium text-red-400">DiseaseSegV</span> for targeted actions.
					</li>
					<li>
						<strong>Control Panel:</strong> Use
						<span class="font-semibold text-green-500">START</span>
						and <span class="font-semibold text-gray-300">STOP</span> to control scanning operations.
					</li>
					<li>
						<strong>Configuration:</strong> Save settings or compare models using action buttons below
						the control panel.
					</li>
				</ol>

				<div class="mt-6 text-sm text-gray-400 italic">
					💡 Tip: Use the gear icon to access advanced camera or model configurations.
				</div>

				<div class="mt-6 flex justify-end">
					<button
						class="rounded-md bg-green-600 px-5 py-2 font-semibold text-white shadow transition hover:bg-green-700"
						on:click={closePopup}
					>
						Finish
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
