<script lang="ts">
import Footer from '$lib/components/Footer.svelte';
import ViewPicture from '$lib/modal/ViewPicture.svelte';
import { writable } from 'svelte/store';
import { onDestroy } from 'svelte';
import { addToast, removeToast } from '$lib/stores/toast';
import RequestHandler from '$lib/utils/request.js';
import { simpleMode } from '$lib/stores/mode.js';
import { capitalize } from '$utils/string.js';
import NotConnected from '$lib/components/NotConnected.svelte';
import { Connection } from '$root/lib/class/connection.js';
import Stoprobot from '../spray/stoprobot.svelte';
import { LiveStreamState, RobotState } from '$root/lib/enum';
import { currentLink } from '$root/lib/stores/connection';
import CameraFeed from './CameraFeed.svelte';
import LivestreamControls from './LivestreamControls.svelte';
export let data;

$: allState = Connection.getAllState({conn: true, robot: true, live: true, scan: true, rscan: true, performing: true, robotLive: true, stopCapture: true});
$: conn = allState.connection;
$: rstate = allState.robotrunning;
$: sstate = allState.scanningstate;
$: lstate  = allState.livestreamstate;
$: rcstate  = allState.robotscanningstate;
$: pstate = allState.performingscan;
$: rlstate = allState.robotlivestream;
$: scstate = allState.stopcapturingimage;

$: isConnected = $conn!;
$: robotState = $rstate!;
$: liveState = $lstate!;
$: scannerState = $sstate!;
$: robotScanState = $rcstate!;
$: performing = $pstate!;
$: robotLive = $rlstate!;
$: stopCapture = $scstate!;

$: liveFrameURL = Connection.getLiveFrameURL();
$: plantHistories = Connection.getLatestPlantHistories();
let user = data.user || null;
let currentDay = new Date().toDateString();
let currentTime = writable(new Date().toLocaleTimeString());

let modalOpen = writable(false);
let selectedImage = writable<any>(null);
export const wasdEnabled = writable(false);

function openModal(image: any) {
	selectedImage.set(image);
	modalOpen.set(true);
}
let selectedFile: File | null = null;
function handleFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		selectedFile = target.files[0];
		uploadImage();
	}
}

async function uploadImage() {
	if (!isConnected) {
		addToast('You are currently not connected to AGRIBOT.', 'error', 3000);
		return;
	}

	if (robotState) {
		addToast('AGRIBOT Robot are currently running.', 'error', 3000);
		return;
	}

	if (scannerState) {
		addToast('Scanner are currently running.', 'error', 3000);
		return;
	}

	if (robotScanState) {
		addToast('AGRIBOT Robot scanner are currently scanning.', 'error', 3000);
		return;
	}

	if (liveState) {
		addToast('Cannot upload when livestreaming.', 'error', 3000);
	}

	if (performing) {
		addToast('Cannot upload when performing a scan.', 'error', 3000);
	}

	if (stopCapture) {
		addToast('Cannot upload when capturing image.', 'error', 3000);
	}

	if (robotLive) {
		addToast('Cannot upload when robot is live.', 'error', 3000);
	}

	if (!selectedFile) {
		addToast('No file selected!', 'error', 3000);
		return;
	}

	const toastId = addToast('Uploading image...', 'loading');
	try {
		const formData = new FormData();
		formData.append('file', selectedFile);

		const email = user.email || '';
		if (!email) {
			removeToast(toastId);
			addToast('User email not found.', 'error', 3000);
			return;
		}
		const folderName = email.split('@')[0];
		formData.append('folder', folderName);
		const [success, data] = await RequestHandler.authFetch(`upload-image`, 'POST', formData);

		if (!success) {
			removeToast(toastId);
			addToast('Failed to upload image!', 'error', 3000);
			return;
		}
		removeToast(toastId);
		addToast(`${data.length} plant(s) detected!`, 'success', 3000);
	} catch (err) {
		console.error(err);
		removeToast(toastId);
		addToast('Upload failed!', 'error', 3000);
	}
}
async function captureImageAndDisplay() {
	if (!isConnected) {
		addToast('You are currently not connected to AGRIBOT.', 'error', 3000);
		return;
	}

	if (robotState) {
		addToast('AGRIBOT Robot are currently running.', 'error', 3000);
		return;
	}

	if (scannerState) {
		addToast('Scanner are currently running.', 'error', 3000);
		return;
	}

	if (robotScanState) {
		addToast('AGRIBOT Robot scanner are currently scanning.', 'error', 3000);
		return;
	}

	if (liveState === LiveStreamState.STOPPED) {
		addToast('Cannot capture image when not livestreaming.', 'error', 3000);
	}

	if (performing) {
		addToast('Cannot upload when performing a scan.', 'error', 3000);
	}

	if (robotLive) {
		addToast('Cannot upload when robot is live.', 'error', 3000);
	}

	const toastId = addToast('Capturing image...', 'loading');
	try {
		const email = user.email || '';
		if (!email) {
			removeToast(toastId);
			addToast('User email not found.', 'error', 3000);
			return;
		}
		const [success, data] = await RequestHandler.authFetch(
			`capture_and_return_blob`,
			"POST"
		);
		if (!success) {
			removeToast(toastId);
			addToast('Failed to capture image!', 'error', 3000);
		}
		removeToast(toastId);
		addToast(`${data.length} plant(s) detected!`, 'success', 3000);
	} catch (error) {
		removeToast(toastId);
		addToast('Failed to capture image!', 'error', 3000);
	}
}
async function controlLivestream(action: string) {
	if (!isConnected) {
		addToast('You are currently not connected to AGRIBOT.', 'error', 3000);
		return;
	}

	if (robotState) {
		addToast('AGRIBOT Robot are currently running.', 'error', 3000);
		return;
	}

	if (scannerState) {
		addToast('Scanner are currently running.', 'error', 3000);
		return;
	}

	if (robotScanState) {
		addToast('AGRIBOT Robot scanner are currently scanning.', 'error', 3000);
		return;
	}

	if (performing) {
		addToast('Cannot upload when performing a scan.', 'error', 3000);
	}

	if (stopCapture) {
		addToast('Cannot upload when capturing image.', 'error', 3000);
	}

	if (robotLive) {
		addToast('Cannot upload when robot is live.', 'error', 3000);
	}

	const stateText =
		action === 'Run'
			? 'already running'
			: action == 'Stop'
				? 'already stopped'
				: 'already paused';
	if (
		(liveState === LiveStreamState.RUNNING && action === 'Run') ||
		(liveState === LiveStreamState.STOPPED && action === 'Stop') ||
		(liveState === LiveStreamState.PAUSED && action === 'Pause')
	) {
		addToast(`Livestream are ${stateText}.`, 'error', 3000);
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
	} catch (err) {
		console.error('Failed to fetch camera info', err);
	}
};
const interval = setInterval(updateInfo, 1000);
onDestroy(() => clearInterval(interval));

</script>

{#if !isConnected}
	<NotConnected user={data.user} />
{:else if robotState}
	<Stoprobot whatRunning="robot" />
{:else if scannerState}
	<Stoprobot whatRunning="scanner" />
{:else if robotScanState}
    <Stoprobot whatRunning="robot scanner" />
{:else if robotLive}
	<Stoprobot whatRunning="robot live" />
{:else}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col
    bg-gradient-to-b from-gray-200 to-gray-300
    p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
	>
		<div
			class="relative z-10 mb-4 flex max-h-[100%] flex-col gap-4 md:max-h-[550px] lg:mx-auto lg:flex-row {$simpleMode
				? ''
				: 'lg:w-10/12'}"
			class:md:w-4xl={$simpleMode}
			class:md:mx-auto={$simpleMode}
		>
			{#if $simpleMode}
				<div
					class="flex w-full flex-col items-center gap-4 rounded-xl bg-white p-3 shadow-lg sm:gap-6 sm:p-4 dark:bg-gray-900"
				>
					<CameraFeed
						connected={isConnected}
						scanState={scannerState}
						robotState={robotState}
						robotScanState={robotScanState}
						liveState={liveState}
						performing={performing}
						stopCapture={stopCapture}
						robotLive={robotLive}
						liveFrameURL={$liveFrameURL!}
						simpleMode={true}
					/>

					<div
						class="flex w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium shadow-sm sm:w-auto sm:flex-row sm:gap-8 sm:text-sm dark:bg-gray-800"
					>
						<span class="flex items-center gap-1 text-gray-800 dark:text-gray-400">
							<span
								class="inline-block h-2 w-2 rounded-full {liveState === LiveStreamState.RUNNING
									? 'bg-green-500'
									: liveState === LiveStreamState.PAUSED
										? 'bg-yellow-500'
										: 'bg-red-500'}"
							></span>
							Status: {liveState === LiveStreamState.RUNNING
								? 'Running'
								: liveState === LiveStreamState.PAUSED
									? 'Paused'
									: 'Stopped'}
						</span>
						<span class="text-gray-800 dark:text-gray-400">🕒 {$currentTime}</span>
					</div>

					<div
						class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3"
					>
						<LivestreamControls
							{controlLivestream}
							connected={isConnected}
							scanState={scannerState}
							robotState={robotState}
							robotScanState={robotScanState}
							liveState={liveState}
							performing={performing}
						stopCapture={stopCapture}
						robotLive={robotLive}
						/>
					</div>
				</div>
			{:else}
				<div
					class="relative flex min-h-[250px] w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 shadow-lg lg:w-1/2 dark:bg-gray-900"
				>
					<CameraFeed
						connected={isConnected}
						scanState={scannerState}
						robotState={robotState}
						robotScanState={robotScanState}
						liveState={liveState}
						performing={performing}
						stopCapture={stopCapture}
						robotLive={robotLive}
						liveFrameURL={$liveFrameURL!}
						simpleMode={false}
					/>
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
								<span
									class="font-medium text-gray-500 dark:text-gray-300 {liveState ===
									LiveStreamState.RUNNING
										? 'bg-green-500'
										: liveState === LiveStreamState.PAUSED
											? 'bg-yellow-500'
											: 'bg-red-500'}"
								></span>
								Status: {liveState === LiveStreamState.RUNNING
									? 'Running'
									: liveState === LiveStreamState.PAUSED
										? 'Paused'
										: 'Stopped'}
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
						<div class="flex justify-between">
							<h3 class="text-base font-bold text-gray-700 dark:text-gray-300">
								DETECTION HISTORY
							</h3>
							<input
								type="file"
								id="fileInput"
								class="hidden"
								accept="image/*"
								on:change={handleFileChange}
							/>
							<button
								class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
								on:click={() => (document as any).getElementById('fileInput').click()}
								disabled={!isConnected || scannerState || robotState !== RobotState.STOPPED || robotScanState || liveState !== LiveStreamState.STOPPED || robotLive || performing || stopCapture}
							>
								Upload Image
							</button>
						</div>
						<div
							class="scrollbar-hide mt-4 flex min-h-[140px] gap-4 overflow-x-auto px-2 py-2 whitespace-nowrap"
						>
							{#if $plantHistories.length > 0}
								{#each $plantHistories as plant}
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
										<p class="text-xs text-red-500">{capitalize(plant.plantHealth)}</p>
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
								disabled={!isConnected || scannerState || robotState !== RobotState.STOPPED || robotScanState || liveState === LiveStreamState.STOPPED || robotLive || performing || stopCapture}
							>
								Capture
							</button>
							<LivestreamControls
								{controlLivestream}
								connected={isConnected}
								scanState={scannerState}
								robotState={robotState}
								robotScanState={robotScanState}
								liveState={liveState}
								performing={performing}
								stopCapture={stopCapture}
								robotLive={robotLive}
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<ViewPicture
		modalOpen={$modalOpen}
		closeModal={() => modalOpen.set(false)}
		downloadImage={() => {}}
		selectedImage={$selectedImage}
		noDownloadDelete={true}
	/>
{/if}
<Footer />
