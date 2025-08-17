<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import ViewPicture from '$lib/modal/ViewPicture.svelte';
	import { writable } from 'svelte/store';
	import { onDestroy } from 'svelte';
	import { addToast, confirmToast, removeToast } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	import { currentLink, isConnected, isRobotRunning, isScanning } from '$lib/stores/connection';
	import RequestHandler from '$lib/utils/request.js';
	import { simpleMode } from '$lib/stores/mode.js';
	import { capitalize } from '$lib/helpers/utility.js';
	export let data;

	let user = data.user || null;
	let plantHistory: any = data.images || [];
	let showingCamera = !data.no_camera;
	let videoFeedUrl = '';
	let robotIsLivestreaming =
		data.is_livestreaming == 'Stopped'
			? 'Stand By'
			: data.is_livestreaming == 'Paused'
				? 'Paused'
				: 'Running';
	if (data.is_livestreaming == 'Running') {
		videoFeedUrl = `${$currentLink}/video_feed`;
	} else if (data.is_livestreaming == 'Paused') {
		videoFeedUrl = data.last_frame;
	}

	let currentDay = new Date().toDateString();
	let currentTime = writable(new Date().toLocaleTimeString());

	let modalOpen = writable(false);
	let selectedImage = writable<any>(null);
	let capturedFullFrame = writable<any>("");
	let capturedFullFrameModal = writable(false);
	export const wasdEnabled = writable(false);

	function openModal(image: any) {
		selectedImage.set(image);
		modalOpen.set(true);
	}

	async function captureImageAndDisplay() {
		if ($isScanning) {
			addToast("Camera is currently scanning. Can't capture.", 'error', 3000);
			return;
		}
		const toastId = addToast('Capturing image...', 'loading');

		try {
			if ($isRobotRunning == 'Running') {
				removeToast(toastId);
				addToast("Robot is currently running. Can't capture.", "error");
				return;
				// if (
				// 	await confirmToast(
				// 		'The robot is currently running. Do you want to temporarly stopped it before capturing an image?'
				// 	)
				// ) {
				// 	await RequestHandler.authFetch(`pause_robot_loop`, 'POST', { camera: '1' });
				// } else {
				// 	addToast('Image capture cancelled.', 'info', 3000);
				// 	return;
				// }
			}
			const email = user.email || '';
			if (!email) {
				removeToast(toastId);
				addToast('User email not found.', 'error', 3000);
				return;
			}
			const folderName = email.split('@')[0];
			const [success, data] = await RequestHandler.authFetch(
				`capture_and_return_blob?folder=${folderName}`
			);
			if (!success) {
				removeToast(toastId);
				addToast('Failed to capture image!', 'error', 3000);
			}

			if (data.length === 0) {
				removeToast(toastId);
				addToast('No plants detected.', 'info', 3000);
				return;
			}
			data.detections.forEach((plant: any) => {
				const newPlant = {
					id: Date.now(),
					src: plant.src,
					timestamp: plant.timestamp,
					plantName: plant.plantName,
					plantHealth: plant.plantHealth,
					imageSize: plant.imageSize,
					locationOnCapture: plant.locationOnCapture,
					generatedDescription: plant.generatedDescription
				};
				plantHistory = [newPlant, ...plantHistory].slice(0, 6);
			});
			removeToast(toastId);
			addToast(`${data.detections.length} plant(s) detected!`, 'success', 3000);
		} catch (error) {
			removeToast(toastId);
			capturedFullFrame.set(null);
			addToast('Failed to capture image!', 'error', 3000);
		}
	}

	async function controlLivestream(action: string) {
		if ($isScanning) {
			addToast('Camera is currently scanning. Livestream will never work.', 'error', 3000);
			return;
		}

		const actionLabel =
			action === 'Run'
				? 'Starting robot livestream'
				: action == 'Stop'
					? 'Stopping robot livestream'
					: 'Robot livestream paused';
		const toastId = addToast(`${actionLabel}...`, 'loading');

		try {
			const [success, _] = await RequestHandler.authFetch(`${action.toLowerCase()}`, 'POST');
			removeToast(toastId);

			if (success) {
				if (action === 'Run') {
					showingCamera = true;
					videoFeedUrl = `${$currentLink}/video_feed`;
					robotIsLivestreaming = 'Running';
				} else if (action === 'Stop') {
					showingCamera = false;
					capturedFullFrame.set(null);
					robotIsLivestreaming = 'Stand By';
				} else {
					robotIsLivestreaming = 'Paused';
				}
				addToast(
					`Robot livestream ${action === 'Run' ? 'started' : action == 'Stop' ? 'stopped' : 'paused'} successfully.`,
					'success',
					3000
				);
			} else {
				let errorMessage = 'Unknown error';
				addToast(`Failed to ${action.toLowerCase()} robot: ${errorMessage}`, 'error', 4000);
				console.error(`Failed to ${action.toLowerCase()} robot:`, errorMessage);
			}
		} catch (err: any) {
			removeToast(toastId);
			addToast(`Network error: ${err.message}`, 'error', 4000);
			console.error('Network error while controlling robot:', err);
		}
	}

	const updateInfo = async () => {
		try {
			currentTime.set(new Date().toLocaleTimeString());
			if (videoFeedUrl === '') return;
		} catch (err) {
			console.error('Failed to fetch camera info', err);
		}
	};
	const interval = setInterval(updateInfo, 1000);
	onDestroy(() => clearInterval(interval));
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
		class="relative flex min-h-[calc(100vh-95px)] flex-col
    bg-gradient-to-b from-gray-200 to-gray-300
    p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
	>
		<div
			class="relative z-10 mb-4 flex lg:mx-auto max-h-[100%] flex-col gap-4 md:max-h-[550px] lg:flex-row {$simpleMode ? '' : 'lg:w-10/12'}"
			class:md:w-4xl={$simpleMode}
			class:md:mx-auto={$simpleMode}
		>
			{#if $simpleMode}
				<div
					class="flex w-full flex-col items-center gap-4 rounded-xl bg-white p-3 shadow-lg sm:gap-6 sm:p-4 dark:bg-gray-900"
				>
					<!-- Camera Feed -->
					{#if videoFeedUrl && showingCamera}
						<div
							class="relative w-full overflow-hidden rounded-xl border border-gray-200 shadow-md dark:border-gray-700"
						>
							<img
								src={videoFeedUrl}
								alt="📷 Camera Feed"
								class="max-h-[300px] w-full object-contain sm:max-h-[500px]"
							/>
							<span
								class="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white sm:top-3 sm:left-3"
							>
								Live Feed
							</span>
						</div>
					{:else}
						<div
							class="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-gray-300 bg-gray-100 sm:min-h-[400px] dark:border-gray-600 dark:bg-gray-800"
						>
							<p class="text-base font-semibold text-gray-700 sm:text-lg dark:text-gray-300">
								📷 Camera Feed
							</p>
						</div>
					{/if}

					<!-- Status Strip -->
					<div
						class="flex w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium shadow-sm sm:w-auto sm:flex-row sm:gap-8 sm:text-sm dark:bg-gray-800"
					>
						<span class="flex items-center gap-1 text-gray-800 dark:text-gray-400">
							<span
								class="inline-block h-2 w-2 rounded-full {robotIsLivestreaming === 'Running'
									? 'bg-green-500'
									: robotIsLivestreaming === 'Paused'
										? 'bg-yellow-500'
										: 'bg-red-500'}"
							></span>
							Status: {robotIsLivestreaming}
						</span>
						<span class="text-gray-800 dark:text-gray-400">🕒 {$currentTime}</span>
					</div>

					<!-- Controls -->
					<div
						class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3"
					>
						<button
							class="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base dark:bg-green-700 dark:hover:bg-green-800"
							on:click={() => controlLivestream('Run')}
							disabled={robotIsLivestreaming === 'Running'}
						>
							{robotIsLivestreaming === 'Paused' ? 'Resume' : 'Run Livestream'}
						</button>

						<button
							class="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base dark:bg-gray-700 dark:hover:bg-gray-800"
							on:click={() => controlLivestream('Pause')}
							disabled={robotIsLivestreaming === 'Stand By' || robotIsLivestreaming === 'Paused'}
						>
							Pause
						</button>

						<button
							class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base dark:bg-red-700 dark:hover:bg-red-800"
							on:click={() => controlLivestream('Stop')}
							disabled={robotIsLivestreaming === 'Stand By'}
						>
							Stop
						</button>

						<button
							on:click={() => {
								const today = new Date();
								const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${today.getFullYear()}`;
								goto(`/folder/${todayDate}`);
							}}
							class="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 sm:text-base dark:bg-green-600 dark:hover:bg-green-700"
						>
							View Today Records
						</button>
					</div>
				</div>

				<!-- FULL MODE VIEW -->
			{:else}
				<div
					class="relative flex min-h-[250px] w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 shadow-lg lg:w-1/2 dark:bg-gray-900"
				>
					{#if videoFeedUrl && showingCamera}
						{#if showingCamera}
							<img
								src={videoFeedUrl}
								alt="📷 Camera Feed"
								class="h-full max-h-[400px] max-w-[400px] rounded-md object-contain dark:border dark:border-gray-600"
							/>
						{/if}
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

						<button
							class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400"
							title="Help"
						>
							<span class="text-lg font-bold">?</span>
						</button>
					</div>

					<div
						class="mt-1 rounded-lg border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
							<li class="flex justify-between">
								<span class="font-medium text-gray-500 dark:text-gray-300">URL:</span>
								<span>{$currentLink}</span>
							</li>
							<li class="flex justify-between">
								<span class="font-medium text-gray-500 dark:text-gray-300">Record Day:</span>
								<span>{currentDay}</span>
							</li>
							<li class="flex justify-between">
								<span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
								<span>{robotIsLivestreaming}</span>
							</li>
							<li class="flex justify-between">
								<span class="font-medium text-gray-500 dark:text-gray-300">Time:</span>
								<span>{$currentTime}</span>
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
											class="h-auto max-h-[120px] w-auto max-w-[120px] rounded-lg border border-gray-300 object-contain dark:border-gray-700"
										/>
										<p
											class="mt-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											{capitalize(plant.plantName)}
										</p>
										<p class="text-xs text-red-500">{capitalize(plant.diseaseName)}</p>
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
								class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
								on:click={captureImageAndDisplay}
								disabled={robotIsLivestreaming === 'Stand By'}
							>
								Capture
							</button>
							<button
								class="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
								on:click={() => controlLivestream('Run')}
								disabled={robotIsLivestreaming === 'Running'}
							>
								{robotIsLivestreaming === 'Paused' ? 'Resume' : 'Run Livestream'}
							</button>

							<button
								class="rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
								on:click={() => controlLivestream('Pause')}
								disabled={robotIsLivestreaming === 'Stand By' || robotIsLivestreaming === 'Paused'}
							>
								Pause
							</button>

							<button
								class="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
								on:click={() => controlLivestream('Stop')}
								disabled={robotIsLivestreaming === 'Stand By'}
							>
								Stop
							</button>
						</div>
						<button
							on:click={() => {
								const today = new Date();
								const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${today.getFullYear()}`;
								goto(`/folder/${todayDate}`);
							}}
							class="rounded-lg bg-green-500 px-5 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
						>
							View Today Records
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<Footer />
	<ViewPicture
		modalOpen={$modalOpen}
		closeModal={() => modalOpen.set(false)}
		downloadImage={() => {}}
		selectedImage={$selectedImage}
	/>
	{#if $capturedFullFrameModal}
		<button
			class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			on:click={() => capturedFullFrameModal.set(false)}
		>
			<img
				src={$capturedFullFrame}
				alt="Captured Frame Full Size"
				class="max-h-[90%] max-w-[90%] rounded-lg shadow-2xl"
			/>
		</button>
	{/if}
{/if}
