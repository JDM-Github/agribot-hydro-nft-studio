<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import PlantModal from '$lib/modal/PlantModal.svelte';
	import SetupSprayModal from '$lib/modal/SetupSprayModal.svelte';
	import Camera from './spray/camera.svelte';
	import Scannedheader from './spray/scannedheader.svelte';
	import SprayButton from './spray/spraybuttons.svelte';
	import { user } from '$lib/stores/auth';
	import { detectedPlants as dplants } from '$lib/stores/plant';
	import { writable } from 'svelte/store';
	import { currentLink, isConnected } from '$lib/stores/connection';
	import { addToast, removeToast } from '$lib/stores/toast';

	let showCamera = false;
	let selectedPlant: any = null;
	let detectedPlants: any[] = [];

	// ---------------------------------------
	let allSprays = ['', '', '', ''];
	let allSpraysActive = [true, true, true, true];
	let previousSprays = { spray: allSprays, active: allSpraysActive };
	// ---------------------------------------

	let schedule: any = {};
	let objectDetection = writable('');
	let stageClassification = writable('');
	let diseaseSegmentation = writable('');

	$: config = ($user as any)?.config;
	const createConfiguration = () => {
		const config = {
			sprays: {
				spray: ['', '', '', ''],
				active: [true, true, true, true]
			},
			detectedPlants: dplants,
			schedule: {
				frequency: 'monthly',
				time: '12:00',
				days: ['', '', '']
			},
			objectDetection: '',
			stageClassification: '',
			diseaseSegmentation: ''
		};
		detectedPlants = config.detectedPlants;
		schedule = config.schedule;
	};

	$: {
		if (config && Object.keys(config).length > 0) {
			detectedPlants = config.detectedPlants;
			schedule = config.schedule;
			objectDetection.set(config.objectDetection);
			stageClassification.set(config.stageClassification);
			diseaseSegmentation.set(config.diseaseSegmentation);
			allSprays = config.sprays?.spray ?? [];
			allSpraysActive = config.sprays?.active ?? [];
		} else {
			createConfiguration();
		}
	}
	let showModal = false;
	let showSprayModal = false;
	let scanning = false;

	const saveConfigToFile = (config: any) => {
		// const config = {
		// 	sprays: {
		// 		spray: allSprays,
		// 		active: allSpraysActive
		// 	},
		// 	detectedPlants,
		// 	schedule,
		// 	objectDetection: $objectDetection,
		// 	stageClassification: $stageClassification,
		// 	diseaseSegmentation: $diseaseSegmentation
		// };
		const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'test.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const saveConfig = async () => {
		const config = {
			sprays: {
				spray: allSprays,
				active: allSpraysActive
			},
			detectedPlants,
			schedule,
			objectDetection: $objectDetection,
			stageClassification: $stageClassification,
			diseaseSegmentation: $diseaseSegmentation
		};
		saveConfigToFile(config);
		// console.log(config);
		// const toastId = addToast('Updating config...', 'loading');
		// try {
		// 	const response = await RequestHandler.fetchData('post', 'user/update-config', {
		// 		email: ($user as any).email,
		// 		config
		// 	});
		// 	if (response.success) {
		// 		removeToast(toastId);
		// 		user.set(response.user);
		// 		addToast('Updated config successfully!', 'success', 3000);
		// 	} else {
		// 		removeToast(toastId);
		// 		addToast(response.message || 'Updating config error', 'error', 3000);
		// 	}
		// } catch (error) {
		// 	console.error('Update config error:', error);
		// 	removeToast(toastId);
		// 	addToast('An unexpected error occurred.', 'error', 3000);
		// }
	};

	function updateDetectedPlant(detected: any) {
		detectedPlants = detected;
	}
	function openPlantModal(index: any) {
		selectedPlant = index;
	}

	async function controlRobot(state: boolean) {
		const action = state ? 'Starting' : 'Stopping';
		const toastId = addToast(`${action} scanning...`, 'loading');

		try {
			const endpoint = state ? '/start_scan' : '/stop_scan';
			const response = await fetch(`${currentLink}${endpoint}`, {
				method: 'POST'
			});
			removeToast(toastId);

			if (response.ok) {
				scanning = state;
				addToast(`Scanning ${state ? 'started' : 'stopped'} successfully.`, 'success', 3000);
			} else {
				let errorMessage = 'Unknown error';
				try {
					const data = await response.json();
					errorMessage = data?.error || response.statusText;
				} catch (err) {
					errorMessage = response.statusText || 'Failed to parse error response.';
				}
				addToast(`Failed to ${state ? 'start' : 'stop'} scanning: ${errorMessage}`, 'error', 4000);
				console.error('Failed to control robot:', errorMessage);
			}
		} catch (err: any) {
			removeToast(toastId);
			addToast(`Network error: ${err.message}`, 'error', 4000);
			console.error('Network error while controlling robot:', err);
		}
	}
</script>

{#if !$isConnected}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col items-center justify-center bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-800"
	>
		<div
			class="flex h-full flex-col items-center justify-center text-center text-lg font-semibold text-gray-600 dark:text-gray-400"
		>
			<p>The device is not connected to AGRI-BOT. Please connect first.</p>
		</div>
	</div>
	<Footer />
{:else}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
	>
		<div class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row">
			<Camera
				{detectedPlants}
				{updateDetectedPlant}
				{scanning}
				{showCamera}
				{currentLink}
				closeCamera={() => (showCamera = false)}
			/>

			<div class="w-full rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
				<Scannedheader searchPlants={() => {}} />

				<div
					class="mx-2 max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 lg:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
				>
					<ul class="min-h-[350px] space-y-2">
						{#if detectedPlants.some((plant) => plant.active)}
							{#each detectedPlants as plant, index}
								{#if plant.active}
									<li
										class="relative flex items-stretch rounded-lg border border-gray-100 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
									>
										<button
											class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full lg:h-20 lg:w-20"
											on:click={() => openPlantModal(index)}
										>
											<img
												src={plant.image}
												alt={plant.name}
												class="h-16 w-16 rounded-full object-cover"
											/>
											{#if plant.disabled}
												<div
													class="absolute inset-0 flex items-center justify-center gap-3 space-y-1 rounded-full bg-black/60 text-xs text-red-300"
												>
													<span>Disabled</span>
													<!-- svelte-ignore node_invalid_placement_ssr -->
													<button
														class="rounded bg-green-300 px-2 py-1 text-xs font-semibold text-black hover:bg-green-400"
														on:click|stopPropagation={() => (plant.disabled = false)}
													>
														Enable
													</button>
												</div>
											{/if}
										</button>

										<div class="flex flex-1 flex-col justify-center p-2">
											<p class="text-sm font-semibold text-gray-900 dark:text-gray-200">
												{plant.name}
											</p>
											<div class="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400">
												<p><strong>Time:</strong> {plant.timestamp ?? 'Unknown'}</p>
											</div>
										</div>

										<div class="flex flex-col items-center justify-center space-y-1 p-2">
											<!-- svelte-ignore a11y_consider_explicit_label -->
											<button
												class="rounded-md bg-green-500 p-2 text-white shadow-sm hover:bg-green-600 dark:bg-transparent dark:hover:bg-transparent dark:hover:text-green-400"
												on:click={() => {
													selectedPlant = plant;
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
								{/if}
							{/each}
						{:else}
							<li
								class="flex h-full min-h-[350px] items-center justify-center text-sm text-gray-500 dark:text-gray-400"
							>
								No plants detected.
							</li>
						{/if}
					</ul>
				</div>
				<SprayButton
					{controlRobot}
					{scanning}
					openModal={() => {
						previousSprays = { spray: [...allSprays], active: [...allSpraysActive] };
						showSprayModal = true;
					}}
					openCamera={() => (showCamera = true)}
					{schedule}
					{objectDetection}
					{stageClassification}
					{diseaseSegmentation}
					{saveConfig}
				/>
			</div>
		</div>
	</div>
	<Footer />

	<PlantModal
		{selectedPlant}
		slots={allSprays}
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
		{allSprays}
		{allSpraysActive}
		{previousSprays}
	/>
	<!-- <Popup /> -->
{/if}
