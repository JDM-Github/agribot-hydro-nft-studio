<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import ViewPicture from '$lib/modal/ViewPicture.svelte';
	import { writable } from 'svelte/store';

	let robotStatus = 'Idle';
	let robotPosition = { x: 0, y: 0 };
	let gpsLocation = '37.7749° N, 122.4194° W';
	let currentTime = new Date().toLocaleTimeString();
	let currentDay = new Date().toDateString();
	let detectedPlant = 'Tomato';
	let detectedDisease = 'Powdery Mildew';

	let modalOpen = writable(false);
	let selectedImage = writable<any>(null);
	function openModal(image: any) {
		selectedImage.set({ ...image });
		modalOpen.set(true);
	}
	// let plantHistory = [
	// 	{ name: 'Lettuce', disease: 'Septoria blight', image: 'https://placehold.co/600x400/000000/FFF' },
	// 	{ name: 'Tomato', disease: 'Powdery Mildew', image: 'https://placehold.co/600x400/000000/FFF' }
	// ];

	let plantHistory = [
		{
			id: 1,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Tomato Plant',
			diseaseName: 'Late Blight',
			location: {
				address: 'Greenhouse #3, Farmville',
				latitude: 37.7749,
				longitude: -122.4194
			},
			imageSize: '600x400',
			generatedDescription:
				'A tomato plant showing symptoms of Late Blight, characterized by dark lesions on leaves.'
		},
		{
			id: 2,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Cucumber Plant',
			diseaseName: 'Powdery Mildew',
			location: {
				address: 'Field #7, Rural Area',
				latitude: 34.0522,
				longitude: -118.2437
			},
			imageSize: '600x400',
			generatedDescription:
				'Cucumber plant affected by Powdery Mildew, displaying white powder-like spots on leaves.'
		},
		{
			id: 3,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Strawberry Plant',
			diseaseName: 'Bacterial Spot',
			location: {
				address: 'Backyard Garden, Springville',
				latitude: 40.7128,
				longitude: -74.006
			},
			imageSize: '600x400',
			generatedDescription:
				'Strawberry plant infected with Bacterial Spot, showing small black spots on fruit and leaves.'
		},
		{
			id: 4,
			src: 'https://placehold.co/600x400/000000/FFF',
			timestamp: new Date().toLocaleString(),
			plantName: 'Lettuce Plant',
			diseaseName: 'Downy Mildew',
			location: {
				address: 'Organic Farm, Riverside',
				latitude: 51.5074,
				longitude: -0.1278
			},
			imageSize: '600x400',
			generatedDescription:
				'Lettuce plant showing signs of Downy Mildew, with yellow patches and gray fungal growth underneath leaves.'
		}
	];

	function controlRobot(status: string) {
		robotStatus = status;
	}
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 lg:px-16 dark:bg-gray-700 transition-all duration-500 ease-out"
>
	<div class="relative z-10 mb-4 flex flex-col gap-4 lg:flex-row">
		<div
			class="flex lg:w-1/2 min-h-[250px] items-center justify-center rounded-lg bg-gray-100 p-6 shadow-lg dark:bg-gray-800"
		>
			<p class="text-lg font-semibold text-gray-700 dark:text-gray-300">📷 Camera Feed</p>
		</div>

		<div class="flex lg:w-1/2 flex-col rounded-xl bg-white p-4 shadow-lg dark:bg-gray-900">
			<div
				class="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#fafffc] p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3 dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center gap-2">
					<span class="text-xl sm:text-2xl">⚙️</span>
					<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
						CAMERA INFORMATION
					</h2>
				</div>
			</div>

			<div
				class="mt-4 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
			>
				<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Record Day:</span>
						<span>{currentDay}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
						<span>{robotStatus}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Position:</span>
						<span>X: {robotPosition.x}, Y: {robotPosition.y}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">GPS Location:</span>
						<span>{gpsLocation}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Time:</span>
						<span>{currentTime}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Detected Plant:</span>
						<span>{detectedPlant}</span>
					</li>
					<li class="flex justify-between">
						<span class="font-medium text-gray-500 dark:text-gray-300">Disease:</span>
						<span>{detectedDisease}</span>
					</li>
				</ul>
			</div>

			<div
				class="mt-6 rounded-xl border border-gray-200 bg-gray-100 p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<h3 class="text-base font-bold text-gray-700 dark:text-gray-300">DETECTION HISTORY</h3>

				<div class="scrollbar-hide mt-4 flex gap-4 overflow-x-auto px-2 py-2 whitespace-nowrap">
					{#each plantHistory as plant}
						<button
							class="flex min-w-[140px] flex-col items-center rounded-lg bg-white p-3 shadow-md md:min-w-[160px] dark:bg-gray-900"
							on:click={() => openModal(plant)}
						>
							<img
								src={plant.src}
								alt={plant.plantName}
								class="h-24 w-24 rounded-lg border border-gray-300 object-cover dark:border-gray-700"
							/>
							<p class="mt-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
								{plant.plantName}
							</p>
							<p class="text-xs text-red-500">{plant.diseaseName}</p>
						</button>
					{/each}
				</div>
			</div>

			<div class="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
				<div class="flex gap-2">
					<button
						class="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
						on:click={() => controlRobot('Running')}
					>
						Run
					</button>
					<button
						class="rounded-lg bg-gray-400 px-5 py-2 text-gray-900 hover:bg-gray-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
						on:click={() => controlRobot('Paused')}
					>
						Pause
					</button>
					<button
						class="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800"
						on:click={() => controlRobot('Stopped')}
					>
						Stop
					</button>
				</div>
				<button
					class="rounded-lg bg-green-500 px-5 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
				>
					View Records
				</button>
			</div>
		</div>
	</div>
</div>

<Footer />
<ViewPicture
	modalOpen={$modalOpen}
	closeModal={() => modalOpen.set(false)}
	downloadImage={() => {}}
	selectedImage={$selectedImage}
/>
