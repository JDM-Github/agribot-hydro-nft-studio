<script lang="ts">
	import { allPlants } from '$lib/stores/plant';
	import RequestHandler from '$lib/utils/request';
	import { onDestroy, onMount } from 'svelte';
	import { isScanning } from '$lib/stores/connection';

	export let detectedPlants;
	export let showCamera = false;
	export let closeCamera;
	export let currentLink;

	let latestResults: { label: string; timestamp: string }[] = [];
	const fetchResults = async () => {
		if (!$isScanning) return;

		const [success, data] = await RequestHandler.authFetch('latest_results', 'GET');
		if (!success) return;

		latestResults = data;
		let newPlant = [...$detectedPlants];
		for (const result of latestResults) {
			const exists = newPlant.some(plant => plant.key === result.label);

			if (!exists && allPlants[result.label]) {
				newPlant.push({
					key: result.label,
					timestamp: result.timestamp,
					disabled: false,
					disease: Object.fromEntries(
						allPlants[result.label].diseases.map(d => [d.name, []])
					)
				});
			}
		}
		detectedPlants.set(newPlant);
	};

	let intervalId: NodeJS.Timeout;
	let intervalId2: NodeJS.Timeout;
	onMount(() => {
		intervalId = setInterval(fetchResults, 1000);
		intervalId2 = setInterval(fetchCameraInfo, 100);
	});
	onDestroy(() => {
		clearInterval(intervalId);
		clearInterval(intervalId2);
	});

	let cameraInfo = { status: 'false', resolution: 'NOT SET', fps: 0, ip: 'NOT SET' };
	const fetchCameraInfo = async () => {
		if (!$isScanning) {
			cameraInfo = { status: 'false', resolution: 'NOT SET', fps: 0, ip: 'NOT SET' };
			return;
		}

		try {
			const [cameraSuccess, cameraData] = await RequestHandler.authFetch('camera_info', 'GET');
			let updatedInfo = {
				status: 'false',
				resolution: 'NOT SET',
				fps: 0,
				ip: cameraInfo.ip
			};

			if (cameraSuccess && cameraData) {
				updatedInfo = { ...updatedInfo, ...cameraData };
			}

			if (!updatedInfo.ip || updatedInfo.ip === 'NOT SET') {
				try {
					const ipResponse = await fetch('https://api.ipify.org?format=json');
					if (ipResponse.ok) {
						const ipData = await ipResponse.json();
						updatedInfo.ip = ipData.ip;
					} else {
						updatedInfo.ip = 'Unavailable';
					}
				} catch (err) {
					console.warn('Failed to fetch public IP:', err);
					updatedInfo.ip = 'Unavailable';
				}
			}

			cameraInfo = updatedInfo;
		} catch (err) {
			console.error('Error fetching camera info:', err);
			cameraInfo = { status: 'false', resolution: 'NOT SET', fps: 0, ip: 'Unavailable' };
		}
	};
</script>

<div
	class="hidden w-full transform overflow-hidden rounded-2xl bg-white shadow-lg duration-500 ease-out md:max-w-md md:flex-none lg:block dark:bg-gray-900"
>
	<div
		class="relative flex h-64 items-center justify-center bg-gray-100 shadow-inner md:h-80 dark:bg-gray-800"
	>
		{#if $isScanning}
			<img
				src={`${currentLink}/scan_feed`}
				alt={`${currentLink}/scan_feed`}
				class="h-auto w-full max-w-[90%] rounded-md border dark:border-gray-600"
			/>
		{:else}
			<span class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
				📷 Live Camera Feed
			</span>
		{/if}
	</div>

	<div class="space-y-4 divide-y divide-gray-100 p-4 dark:divide-gray-700">
		<h3 class="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
			<span class="text-green-500">🎥</span> Camera Information
		</h3>

		<ul class="space-y-2 pt-2 text-sm text-gray-600 dark:text-gray-400">
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">URL:</span>
				{currentLink}
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
				{#if cameraInfo.status === 'online'}
					<span
						class="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400"
						>● Online</span
					>
				{:else}
					<span class="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400"
						>● Offline</span
					>
				{/if}
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Resolution:</span>
				{cameraInfo.resolution}
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Frame Rate:</span>
				{cameraInfo.fps} FPS
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Public IP:</span>
				{cameraInfo.ip}
			</li>
		</ul>
	</div>
</div>

<div
	class="fixed inset-0 z-40 bg-black/80 transition-opacity duration-500 ease-out lg:hidden"
	class:opacity-0={!showCamera}
	class:opacity-100={showCamera}
	class:pointer-events-none={!showCamera}
	class:pointer-events-auto={showCamera}
></div>

<div
	class="fixed top-[80px] left-1/2 z-50 w-11/12 -translate-x-1/2 transform rounded-2xl bg-white shadow-lg transition-all duration-500 ease-out sm:block lg:hidden dark:bg-gray-900"
	class:opacity-0={!showCamera}
	class:opacity-100={showCamera}
	class:translate-y-16={!showCamera}
	class:translate-y-0={showCamera}
	class:pointer-events-none={!showCamera}
	class:pointer-events-auto={showCamera}
>
	<div
		class="relative flex h-64 items-center justify-center rounded-xl bg-gray-100 shadow-inner dark:bg-gray-800"
	>
		<span class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
			📷 Mobile Camera
		</span>
	</div>

	<div class="space-y-4">
		<h3 class="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
			<span class="text-green-500">🎥</span> Camera Information
		</h3>

		<ul class="space-y-2 pt-2 text-sm text-gray-600 dark:text-gray-400">
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Camera Name:</span> Greenhouse Cam
				1
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">IP Address:</span> 192.168.1.100
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
				<span class="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400"
					>● Online</span
				>
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Resolution:</span> 1920 x 1080
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Frame Rate:</span> 30 FPS
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Connection Type:</span> Wired Ethernet
			</li>
			<li class="flex justify-between">
				<span class="font-medium text-gray-500 dark:text-gray-300">Location:</span> Greenhouse Zone 4
			</li>
		</ul>

		<button
			class="flex w-full items-center justify-center rounded-xl bg-red-800 p-1 text-white shadow-lg transition hover:bg-red-700"
			on:click={closeCamera}
		>
			Close Camera
		</button>
	</div>
</div>
