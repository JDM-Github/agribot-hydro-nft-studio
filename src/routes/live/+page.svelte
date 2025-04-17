<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import ViewPicture from '$lib/modal/ViewPicture.svelte';
	import { writable } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import { addToast, removeToast } from '$lib/stores/toast';

	let gpsLocation = 'Fetching...';
	let robotPosition = { x: 0, y: 0 };
	let currentDay = new Date().toDateString();
	let currentTime = new Date().toLocaleTimeString();
	let robotStatus = 'Running';

	let modalOpen = writable(false);
	let selectedImage = writable<any>(null);
	function openModal(image: any) {
		selectedImage.set({ ...image });
		modalOpen.set(true);
	}
	let videoFeedUrl = '';

	async function captureImage() {
		const response = await fetch('http://127.0.0.1:8000/capture');
		if (response.ok) {
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'captured_image.jpg';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} else {
			alert('Failed to capture image');
		}
	}

	async function captureImageAndDisplay() {
		const toastId = addToast('Capturing image...', 'loading');

		try {
			const response = await fetch('http://127.0.0.1:8000/capture_and_return_blob');
			const data = await response.json();

			if (data.length === 0) {
				removeToast(toastId);
				addToast('No plants detected.', 'info', 3000);
				return;
			}

			data.forEach((plant: any) => {
				const newPlant = {
					id: Date.now(),
					src: plant.src,
					timestamp: plant.timestamp,
					plantName: plant.plantName,
					diseaseName: plant.diseaseName,
					imageSize: plant.imageSize,
					location: plant.location,
					generatedDescription: plant.generatedDescription
				};
				plantHistory = [newPlant, ...plantHistory].slice(0, 6);
			});

			removeToast(toastId);
			addToast(`${data.length} plant(s) detected!`, 'success', 3000);
		} catch (error) {
			removeToast(toastId);
			addToast('Failed to capture image!', 'error', 3000);
		}
	}

	async function controlRobot(action: string) {
		const response = await fetch(`http://127.0.0.1:8000/${action.toLowerCase()}`, {
			method: 'POST'
		});
		const data = await response.json();
		console.log(data);

		if (action === 'Run') {
			videoFeedUrl = 'http://127.0.0.1:8000/video_feed';
		} else {
			videoFeedUrl = '';
		}
	}

	const updateInfo = async () => {
		try {
			if (videoFeedUrl === '') return;
			const res = await fetch('http://127.0.0.1:8000/camera_info');
			const data = await res.json();

			gpsLocation = `Lat: ${data.gps.lat}, Lon: ${data.gps.lon}`;
			robotPosition = {
				x: data.gyro.x.toFixed(2),
				y: data.gyro.y.toFixed(2)
			};
			currentTime = new Date().toLocaleTimeString();
		} catch (err) {
			console.error('Failed to fetch camera info', err);
		}
	};

	const interval = setInterval(updateInfo, 1000);
	onDestroy(() => clearInterval(interval));

	let plantHistory: any = [];
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col
	bg-gradient-to-b from-gray-200 to-gray-300
	p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
>
	<div class="relative z-10 mb-4 flex flex-col gap-4 lg:flex-row">
		<div
			class="flex min-h-[250px] items-center justify-center rounded-lg bg-gray-100 p-6 shadow-lg lg:w-1/2 dark:bg-gray-900"
		>
			{#if videoFeedUrl}
				<img
					src={videoFeedUrl}
					alt="📷 Camera Feed"
					class="h-auto w-full max-w-[90%] rounded-md border dark:border-gray-600"
				/>
			{:else}
				<p class="text-lg font-semibold text-gray-700 dark:text-gray-300">📷 Camera Feed</p>
			{/if}
		</div>

		<div class="flex flex-col rounded-xl bg-white p-4 shadow-lg lg:w-1/2 dark:bg-gray-900">
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
				class="mt-1 rounded-lg border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
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
				</ul>
			</div>

			<div
				class="mt-6 rounded-xl border border-gray-200 bg-gray-100 p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<h3 class="text-base font-bold text-gray-700 dark:text-gray-300">DETECTION HISTORY</h3>

				<div
					class="scrollbar-hide mt-4 flex min-h-[140px] gap-4 overflow-x-auto px-2 py-2 whitespace-nowrap"
				>
					{#if plantHistory.length > 0}
						{#each plantHistory as plant}
							<button
								class="flex min-h-[140px] min-w-[140px] flex-col items-center rounded-lg bg-white p-3 shadow-md md:min-h-[160px] md:min-w-[160px] dark:bg-gray-900"
								on:click={() => openModal(plant)}
							>
								<img
									src={plant.src}
									alt={plant.plantName}
									class="h-[90%] w-[90%] rounded-lg border border-gray-300 object-contain dark:border-gray-700"
								/>
								<p class="mt-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
									{plant.plantName}
								</p>
								<p class="text-xs text-red-500">{plant.diseaseName}</p>
							</button>
						{/each}
					{:else}
						<div
							class="flex min-h-[140px] min-w-[140px] items-center justify-center rounded-lg bg-gray-300 shadow-md dark:bg-gray-900"
						>
							<p class="text-gray-400 dark:text-gray-500">No records</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
				<div class="flex gap-2">
					<button
						class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
						on:click={captureImageAndDisplay}
					>
						Capture
					</button>
					<button
						class="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
						on:click={() => controlRobot('Run')}
					>
						Run
					</button>
					<button
						class="rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800"
						on:click={() => controlRobot('Pause')}
					>
						Pause
					</button>
					<button
						class="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
						on:click={() => controlRobot('Stop')}
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
