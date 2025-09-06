<script lang="ts">
	import { onDestroy } from 'svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PlantModal from '$lib/modal/PlantModal.svelte';
	import SetupSprayModal from '$lib/modal/SetupSprayModal.svelte';
	import Camera from './spray/camera.svelte';
	import Scannedheader from './spray/scannedheader.svelte';
	import SprayButton from './spray/spraybuttons.svelte';
	import { simpleMode } from '$lib/stores/mode';
	import { config as exportedConfig, allPlants } from '$lib/stores/plant';
	import { get, writable, type Writable } from 'svelte/store';
	import {
		currentLink,
		isConnected,
		isRobotRunning,
		isLivestreaming,
		isScanning
	} from '$lib/stores/connection';
	import { addToast, confirmToast, removeToast } from '$lib/stores/toast';
	import { onMount } from 'svelte';
	import ManuallyAddPlant from '$lib/modal/ManuallyAddPlant.svelte';
	import RequestHandler from '$lib/utils/request';
	import { beforeNavigate } from '$app/navigation';
	import { deepEqual, validateAndNormalizeConfig } from '$lib/helpers/utility';
	import NotConnected from '$lib/components/NotConnected.svelte';
	export let data;

	let showManualPlant = false;
	let showCamera = false;
	let selectedPlantIndex: number = -1;
	let selectedPlant: any = null;
	let previousSprays: any;
	const searchPlant = writable<string>('');
	// ---------------------------------------
	const allSprays = writable(['', '', '', '']);
	const allSpraysActive = writable([true, true, true, true]);
	const allDurations = writable([2, 2, 2, 2]);

	const objectDetection = writable<string>('');
	const stageClassification = writable<string>('');
	const diseaseSegmentation = writable<string>('');
	const schedule = writable<{
		frequency: string;
		runs: { time: string; upto: string }[];
		days: string[];
	}>({
		frequency: 'monthly',
		runs: [
			{ time: '06:00', upto: '07:00' },
			{ time: '12:00', upto: '13:00' },
			{ time: '18:00', upto: '19:00' }
		],
		days: []
	});

	let isAlreadyInitialize = false;
	let initialConfig: any = null;
	const yoloObjectDetection = writable<any>(null);
	const yoloStageClassification = writable<any>(null);
	const maskRCNNSegmentation = writable<any>(null);
	const objectDetectionConfidence = writable(0.3);
	const stageClassificationConfidence = writable(0.3);
	const diseaseSegmentationConfidence = writable(0.3);

	let detectedPlants: Writable<
		{
			key: string;
			timestamp: string;
			disabled: boolean;
			willSprayEarly: boolean;
			disease: {
				[key: string]: boolean[];
			};
			disease_time_spray: {
				[key: string]: [string, string]; 
			};
		}[]
	> = writable([]);

	// ---------------------------------------

	function isConfigDirty() {
		const current = getCurrentConfig();
		if (!initialConfig) return true;
		if (Object.keys(current).length !== Object.keys(initialConfig).length) return true;
		return !deepEqual(getCurrentConfig(), initialConfig);
	}

	function getCurrentConfig() {
		return {
			sprays: {
				spray: get(allSprays),
				active: get(allSpraysActive),
				duration: get(allDurations)
			},
			detectedPlants: get(detectedPlants),
			schedule: get(schedule),
			objId: $yoloObjectDetection.find((w: any) => w.version == $objectDetection).id,
			stageId: $yoloStageClassification.find((w: any) => w.version == $stageClassification).id,
			segmentationId: $maskRCNNSegmentation.find((w: any) => w.version == $diseaseSegmentation).id,
			objectDetectionConfidence: get(objectDetectionConfidence),
			stageClassificationConfidence: get(stageClassificationConfidence),
			diseaseSegmentationConfidence: get(diseaseSegmentationConfidence)
		};
	}

	function applyConfig(config: any) {
		allSprays.set(config.sprays?.spray ?? ['', '', '', '']);
		allSpraysActive.set(config.sprays?.active ?? [true, true, true, true]);
		allDurations.set(config.sprays?.duration ?? [2, 2, 2, 2]);
		objectDetection.set(
			data.models.yoloobjectdetection.find((w: any) => w.id === config.objId)?.version ||
				data.models.yoloobjectdetection[0].version ||
				'NONE'
		);
		stageClassification.set(
			data.models.yolostageclassification.find((w: any) => w.id === config.stageId)?.version ||
				data.models.yolostageclassification[0].version ||
				'NONE'
		);
		diseaseSegmentation.set(
			data.models.maskrcnnsegmentation.find((w: any) => w.id === config.segmentationId)?.version ||
				data.models.maskrcnnsegmentation[0].version ||
				'NONE'
		);
		detectedPlants.set(config.detectedPlants ?? []);
		schedule.set(
			config.schedule ?? {
				frequency: 'monthly',
				time: '12:00',
				upto: '14:00',
				days: ['', '', '']
			}
		);
		objectDetectionConfidence.set(config.objectDetectionConfidence ?? 0.3);
		stageClassificationConfidence.set(config.stageClassificationConfidence ?? 0.3);
		diseaseSegmentationConfidence.set(config.diseaseSegmentationConfidence ?? 0.3);
	}

	function initiateEverything() {
		if (!isAlreadyInitialize && $isConnected) {
			isAlreadyInitialize = true;
			yoloObjectDetection.set(data.models.yoloobjectdetection);
			yoloStageClassification.set(data.models.yolostageclassification);
			maskRCNNSegmentation.set(data.models.maskrcnnsegmentation);
			try {
				const stored = localStorage.getItem('userConfig');
				if (stored) {
					const parsed = JSON.parse(stored);
					initialConfig = JSON.parse(JSON.stringify(parsed));
					applyConfig(parsed);
					addToast('Loaded config from localStorage.', 'info', 3000);
				} else {
					initialConfig = JSON.parse(JSON.stringify(exportedConfig));
					applyConfig(exportedConfig);
					addToast('Loaded config from exportedConfig.', 'info', 3000);
				}
			} catch (err) {
				addToast('Error loading config from localStorage', 'error', 3000);
				applyConfig(exportedConfig);
			}
		}
	}

	$: if ($isConnected) {
		initiateEverything();
	}

	onMount(() => {
		const handler = (event: BeforeUnloadEvent) => {
			if (isConfigDirty() || $isScanning || showSprayModal || showManualPlant) {
				event.preventDefault();
			}
		};
		window.addEventListener('beforeunload', handler);
		onDestroy(() => {
			window.removeEventListener('beforeunload', handler);
		});
	});

	beforeNavigate(async (navigation) => {
		if (isConfigDirty()) {
			const leave = confirm('You have unsaved changes. Leave anyway?');
			if (!leave) {
				navigation.cancel();
			}
		} else if ($isScanning) {
			const leave = confirm('Camera is open. Close it before leaving?');
			if (!leave) {
				navigation.cancel();
			}
		} else if (showSprayModal) {
			const leave = confirm('Spray setup is open. Close it before leaving?');
			if (!leave) {
				navigation.cancel();
			}
		} else if (showManualPlant) {
			const leave = confirm('Manual plant addition is open. Close it before leaving?');
			if (!leave) {
				navigation.cancel();
			}
		}
	});

	let showModal = false;
	let showSprayModal = false;
	async function revertConfig() {
		if (
			await confirmToast(
				'Are you sure you want to revert to the last save configuration? This will discard all unsaved changes.'
			)
		) {
			applyConfig(initialConfig);
			addToast('Configuration reverted to last save state.', 'info', 3000);
		}
	}

	function downloadConfig() {
		const configData = {
			sprays: {
				spray: $allSprays,
				active: $allSpraysActive,
				duration: $allDurations
			},
			detectedPlants: $detectedPlants,
			schedule: $schedule,
			objId: $yoloObjectDetection.find((w: any) => w.version == $objectDetection).id,
			stageId: $yoloStageClassification.find((w: any) => w.version == $stageClassification).id,
			segmentationId: $maskRCNNSegmentation.find((w: any) => w.version == $diseaseSegmentation).id,
			objectDetectionConfidence: $objectDetectionConfidence,
			stageClassificationConfidence: $stageClassificationConfidence,
			diseaseSegmentationConfidence: $diseaseSegmentationConfidence
		};
		const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'config.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		addToast('Config downloaded successfully.', 'success', 3000);
	}

	function uploadConfig() {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (event: any) => {
			const file = event.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (e: any) => {
				try {
					const parsed = JSON.parse(e.target.result as string);
					const validated = validateAndNormalizeConfig(parsed);
					applyConfig(validated);
					addToast('Configuration loaded successfully.', 'success', 3000);
					setTimeout(() => {
						addToast(
							'Changes staged. Remember to click "Save Configuration" to apply them.',
							'info',
							5000
						);
					}, 10);
				} catch (err) {
					addToast('Invalid configuration file.', 'error', 3000);
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	const saveConfig = async () => {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}

		if (
			!(await confirmToast(
				'Are you sure you want to save this configuration? This will overwrite your current settings.'
			))
		)
			return;
		const toastId = addToast('Updating config...', 'loading');
		const config = getCurrentConfig();

		try {
			const response = await RequestHandler.fetchData('post', 'user/update-config', {
				email: (data.user as any).email,
				config
			});
			if (response.success) {
				const [sucess, _] = await RequestHandler.authFetch('update-config', 'POST', {
					config
				});
				if (!sucess) {
					addToast('Config saved to cloud, but robot not updated.', 'error', 4000);
				}
				removeToast(toastId);
				addToast('Updated config successfully!', 'success', 3000);
				initialConfig = JSON.parse(JSON.stringify(config));
				localStorage.setItem('userConfig', JSON.stringify(config));
				setTimeout(() => {
					addToast('Config saved to localStorage.', 'info', 3000);
				}, 10);
			} else {
				removeToast(toastId);
				addToast(response.message || 'Updating config error', 'error', 3000);
			}
		} catch (error) {
			console.error('Update config error:', error);
			removeToast(toastId);
			addToast('An unexpected error occurred.', 'error', 3000);
		}
	};

	function disabledPlant() {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}
		$detectedPlants[selectedPlantIndex].disabled = true;
	}

	async function removePlant(key: string) {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}

		const toastId = addToast(`Removing "${key}"...`, 'loading');
		await RequestHandler.authFetch(`remove_result?key=${encodeURIComponent(key)}`, 'GET');
		removeToast(toastId);
		detectedPlants.set(get(detectedPlants).filter((p: any) => p.key !== key));
		addToast(`Removed "${key}" successfully.`, 'success', 3000);
	}

	async function controlRobot(state: boolean) {
		if ($isLivestreaming !== 'Stopped') {
			addToast('Action unavailable while livestreaming is active.', 'error', 3000);
			return;
		}

		const action = state ? 'Starting' : 'Stopping';
		const toastId = addToast(`${action} scanning...`, 'loading');

		try {
			const endpoint = state ? 'start_scan' : 'stop_scan';
			const [success, data] = await RequestHandler.authFetch(endpoint, 'POST');
			removeToast(toastId);

			if (success) {
				isScanning.set(state);
				addToast(`Scanning ${state ? 'started' : 'stopped'} successfully.`, 'success', 3000);
			} else {
				const errorMessage = data?.error || 'Unknown error';
				addToast(`Failed to ${state ? 'start' : 'stop'} scanning: ${errorMessage}`, 'error', 4000);
				console.error('Failed to control robot:', errorMessage);
			}
		} catch (err: any) {
			removeToast(toastId);
			addToast(`Network error: ${err.message}`, 'error', 4000);
			console.error('Network error while controlling robot:', err);
		}
	}

	$: filteredDetectedPlants = $detectedPlants.filter((p) => {
		const name = allPlants[p.key]?.name?.toLowerCase() ?? '';
		return name.includes($searchPlant.trim().toLowerCase());
	});
</script>

{#if !$isConnected}
	<NotConnected />
{:else if $isRobotRunning != 'Stopped'}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col items-center justify-center bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-800"
	>
		<div
			class="flex h-full flex-col items-center justify-center text-center text-lg font-semibold text-gray-600 dark:text-gray-400"
		>
			<p>The robot loop is currently running. Do you want to stop it?</p>
			<button
				class="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
			>
				Stop Robot Loop
			</button>
		</div>
	</div>
	<Footer />
{:else}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
	>
		<div
			class="relative z-10 mb-4 flex flex-col gap-4 md:flex-row"
			class:w-6xl={$simpleMode}
			class:mx-auto={$simpleMode}
		>
			{#if !$simpleMode}
				<Camera {detectedPlants} {showCamera} closeCamera={() => (showCamera = false)} />
			{/if}
			<div class="w-full rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
				<Scannedheader {searchPlant} {revertConfig} />
				<div
					class="mx-2 max-h-[250px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 md:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
				>
					<ul class="min-h-[230px] space-y-2 md:min-h-[350px]">
						{#if filteredDetectedPlants.length > 0}
							{#each filteredDetectedPlants as plant, index}
								<li
									class="relative flex w-full items-stretch rounded-lg border border-gray-100 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
								>
									<button
										class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full md:h-20 md:w-20"
									>
										<img
											src={allPlants[plant.key].image}
											alt={allPlants[plant.key].name}
											class="h-14 w-14 rounded-full object-cover md:h-16 md:w-16"
										/>
										{#if plant.disabled}
											<div
												class="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/60 px-1 text-[10px] text-red-300 md:text-xs"
											>
												<span>Disabled</span>
												<!-- svelte-ignore node_invalid_placement_ssr -->
												<button
													class="rounded bg-green-300 px-1 py-0.5 font-semibold text-black hover:bg-green-400"
													on:click|stopPropagation={() => {
														if ($isLivestreaming !== 'Stopped') {
															addToast(
																'Action unavailable while livestreaming is active.',
																'error',
																3000
															);
														} else {
															plant.disabled = false;
														}
													}}
												>
													Enable
												</button>
											</div>
										{/if}
									</button>

									<div class="flex flex-1 flex-col justify-center p-2">
										<p class="text-sm font-semibold text-gray-900 dark:text-gray-200">
											{allPlants[plant.key].name}
										</p>
										<div class="mt-1 space-y-1 text-xs text-gray-500 dark:text-gray-400">
											<p><strong>Time:</strong> {plant.timestamp ?? 'Unknown'}</p>
										</div>
									</div>

									<div class="flex flex-col items-center justify-center space-y-1 p-2">
										<button
											class="rounded-md bg-green-500 p-2 text-white shadow-sm hover:bg-green-600 dark:bg-transparent dark:hover:bg-transparent dark:hover:text-green-400"
											aria-label="View plant details"
											on:click={() => {
												if ($isLivestreaming !== 'Stopped') {
													addToast(
														'Action unavailable while livestreaming is active.',
														'error',
														3000
													);
													return;
												}
												selectedPlantIndex = index;
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
				{#if $yoloObjectDetection && $yoloStageClassification && $maskRCNNSegmentation}
					<SprayButton
						{controlRobot}
						openModal={() => {
							previousSprays = {
								spray: [...$allSprays],
								active: [...$allSpraysActive],
								duration: [...$allDurations]
							};
							showSprayModal = true;
						}}
						openCamera={() => (showCamera = true)}
						{schedule}
						{yoloObjectDetection}
						{yoloStageClassification}
						{maskRCNNSegmentation}
						{objectDetection}
						{stageClassification}
						{diseaseSegmentation}
						{saveConfig}
						{downloadConfig}
						{uploadConfig}
						openManualPlant={() => (showManualPlant = true)}
						{objectDetectionConfidence}
						{stageClassificationConfidence}
						{diseaseSegmentationConfidence}
					/>
				{/if}
			</div>
		</div>
	</div>
	<Footer />

	<PlantModal
		{removePlant}
		{disabledPlant}
		{selectedPlant}
		slots={$allSprays}
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
		{allDurations}
		{previousSprays}
	/>
	<ManuallyAddPlant
		{detectedPlants}
		showModal={showManualPlant}
		closeModal={() => (showManualPlant = false)}
	/>
{/if}
