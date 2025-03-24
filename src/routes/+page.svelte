<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import PlantModal from '$lib/modal/PlantModal.svelte';
	import SetupSprayModal from '$lib/modal/SetupSprayModal.svelte';
	import Camera from './spray/camera.svelte';
	import Scannedheader from './spray/scannedheader.svelte';
	import SprayButton from './spray/spraybuttons.svelte';

	let isConnected = false;
	let showCamera = false;
	let selectedPlant: any;

	let detectedPlants = [
		{
			id: 1,
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJKRPXQYgZjJmuQTgXVQNLoZRxRWe7aW09wg&s',
			description: 'Healthy tomato plant with	minor leaf spots.',
			name: 'Tomato',
			icon: '🍅',
			spray: 'Insecticide	A',
			row: 3,
			column: 5,
			timestamp: '2025-03-03 10:15:32',
			confidence: 98
		},
		{
			id: 2,
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJKRPXQYgZjJmuQTgXVQNLoZRxRWe7aW09wg&s',
			description: 'Blooming rose	plant.',
			name: 'Rose',
			icon: '🌹',
			spray: 'Fungicide B',
			row: 2,
			column: 4,
			timestamp: '2025-03-03 10:16:12',
			confidence: 95
		},
	];
	let showModal = false;
	let showSprayModal = false;
	let scanning = false;

	let plant = {
		image:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJKRPXQYgZjJmuQTgXVQNLoZRxRWe7aW09wg&s',
		name: 'Tomato Plant',
		description:
			'A healthy tomato plant known for its vibrant fruits and moderate care requirements.',
		diseases: [
			{
				name: 'Late Blight',
				description: 'A fungal disease causing dark spots on leaves and fruits.',
				image: 'https://placehold.co/600x400/000000/FFF',
				sprays: ['Copper Fungicide', 'Neem Oil'],
				severity: 'High'
			},
			{
				name: 'Powdery Mildew',
				description: 'A white, powdery fungus that covers leaves, reducing photosynthesis.',
				image: 'https://placehold.co/600x400/000000/FFF',
				sprays: ['Sulfur Spray', 'Neem Oil'],
				severity: 'Moderate'
			},
			{
				name: 'Bacterial Spot',
				description: 'Small, water-soaked lesions on leaves that grow into dark, necrotic spots.',
				image: 'https://placehold.co/600x400/000000/FFF',
				sprays: ['Copper Fungicide'],
				severity: 'Low'
			}
		]
	};

	function toggleScan(state: boolean) {
		scanning = state;
	}
	function openPlantModal(index: any) {
		selectedPlant = index;
	}
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 lg:px-16 dark:bg-gray-700 transition-all duration-500 ease-out "
>
	<div class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row">
		<Camera {showCamera} closeCamera={() => (showCamera = false)} />

		<div class="w-full rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
			<Scannedheader searchPlants={() => {}} />

			<div
				class="mx-2 max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 lg:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
			>
				<ul class="space-y-2 min-h-[350px]">
					{#each detectedPlants as plant, index}
						<li
							class="relative flex items-stretch rounded-lg border border-gray-100 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
						>
							<button
								class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full lg:h-20 lg:w-20"
								on:click={() => openPlantModal(index)}
							>
								<img
									src={plant.imageUrl}
									alt={plant.name}
									class="h-16 w-16 rounded-full object-cover"
								/>
							</button>

							<div class="flex flex-1 flex-col justify-center p-2">
								<p class="text-sm font-semibold text-gray-900 dark:text-gray-200">{plant.name}</p>
								<div class="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400">
									<p><strong>Time:</strong> {plant.timestamp ?? 'Unknown'}</p>
									<p>
										<strong>Confidence:</strong>
										{plant.confidence ? `${plant.confidence}%` : 'N/A'}
									</p>
								</div>
							</div>

							<div class="flex flex-col items-center justify-center space-y-1 p-2">
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<button
									class="rounded-md bg-green-500 p-2 text-white shadow-sm hover:bg-green-600 dark:bg-transparent dark:hover:bg-transparent dark:hover:text-green-400"
									on:click={() => {
										showModal = true;
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke="currentColor"
										class="h-4 w-4"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</div>

			<SprayButton
				{toggleScan}
				{scanning}
				closeModal={() => {
					showSprayModal = true;
				}}
				openCamera={() => (showCamera = true)}
			/>
		</div>
	</div>
</div>
<Footer />

<PlantModal
	{plant}
	bind:showModal
	closeModal={() => {
		showModal = false;
	}}
/>
<SetupSprayModal
	bind:showSprayModal
	closeModal={() => {
		showSprayModal = false;
	}}
/>
