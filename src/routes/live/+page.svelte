<script lang="ts">
    import Footer from '$lib/components/Footer.svelte';
    import ViewPicture from '$lib/modal/ViewPicture.svelte';
    import { writable } from 'svelte/store';
    import { onDestroy } from 'svelte';
    import { addToast, confirmToast, removeToast } from '$lib/stores/toast';
    import { goto } from '$app/navigation';
    import {
        currentLink,
        isConnected,
        isRobotRunning,
        isScanning
    } from '$lib/stores/connection';
	import RequestHandler from '$lib/utils/request.js';
    export let data;

    let user = data.user || null;
    let plantHistory: any = [];
    let showingCamera = !data.no_camera;
    let videoFeedUrl = '';
    let robotStatus =
        data.robot_state == 'Stopped'
            ? 'Stand By'
            : data.robot_state == 'Paused'
                ? 'Paused'
                : 'Running';
    if (data.robot_state == 'Running') {
        videoFeedUrl = `${currentLink}/video_feed`;
    } else if (data.robot_state == 'Paused') {
        videoFeedUrl = data.last_frame;
    }

    let currentDay = new Date().toDateString();
    let currentTime = writable(new Date().toLocaleTimeString());

    let modalOpen = writable(false);
    let selectedImage = writable<any>(null);
    let capturedFullFrame = writable<any>(null);
    let capturedFullFrameModal = writable(false);
    export const wasdEnabled = writable(false);

    function openModal(image: any) {
        selectedImage.set({ ...image });
        modalOpen.set(true);
    }

    async function activateSprayer(id: number) {
        await fetch(`${currentLink}/spray/${id}`, { method: 'POST' });
    }

    async function captureImageAndDisplay() {
        if ($isScanning) {
            addToast("Camera is currently scanning. Can't capture.", "error", 3000);
            return;
        }
        const toastId = addToast('Capturing image...', 'loading');

        try {
            const r = await fetch(`${currentLink}/is_robot_loop_running`);
            const d = await r.json();
            if ($isRobotRunning || d.is_running) {
                removeToast(toastId);
                if (
                    await confirmToast(
                        'The robot is currently running. Do you want to temporarly stopped it before capturing an image?'
                    )
                ) {
                    await fetch(`${currentLink}/pause_robot_loop`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ camera: '1' })
                    });
                } else {
                    addToast('Image capture cancelled.', 'info', 3000);
                    return;
                }
            }
            const email = user.email || '';
            if (!email) {
                removeToast(toastId);
                addToast('User email not found.', 'error', 3000);
                return;
            }
            const folderName = email.split('@')[0];
            const [success, data] = await RequestHandler.authFetch(`${currentLink}/capture_and_return_blob?folder=${folderName}`);
            if (!success) {
                removeToast(toastId);
                addToast('Failed to capture image!', 'error', 3000)
            }

            if (data.length === 0) {
                removeToast(toastId);
                addToast('No plants detected.', 'info', 3000);
                return;
            }
            capturedFullFrame.set(data.fullFrame);
            data.detections.forEach((plant: any) => {
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
            capturedFullFrame.set(null);
            addToast('Failed to capture image!', 'error', 3000);
        }
    }

    async function controlRobotLoop(action: string) {
		if ($isScanning) {
            addToast("Camera is currently scanning. Can't control the robot.", "error", 3000);
            return;
        }

        const endpointMap: { [key: string]: string } = {
            run: '/run_robot_loop',
            pause: '/pause_robot_loop',
            stop: '/stop_robot_loop'
        };

        const actionMap: { [key: string]: string } = {
            run: 'Robot loop started',
            pause: 'Robot loop paused',
            stop: 'Robot loop stopped'
        };

        const endpoint = endpointMap[action];
        const actionMessage = actionMap[action];

        if (!endpoint || !actionMessage) {
            console.error(`Invalid robot loop action: ${action}`);
            addToast('Invalid robot loop action.', 'error', 3000);
            return;
        }

        const toastId = addToast(`${actionMessage}...`, 'loading');
        try {
            const response = await fetch(`${currentLink}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}'
            });

            if (response.ok) {
                removeToast(toastId);
                addToast(`${actionMessage} successfully.`, 'success', 3000);
                if (action === 'run') {
                    isRobotRunning.set('Running');
                } else if (action === 'pause') {
                    isRobotRunning.set('Paused');
                } else if (action === 'stop') {
                    isRobotRunning.set('Stopped');
                }
            } else {
                const error = await response.json().catch(() => ({}));
                const message = error.message || 'Unexpected server error';
                removeToast(toastId);
                addToast(`Failed to ${action} robot loop: ${message}`, 'error', 3000);
            }
        } catch (err) {
            console.error(err);
            removeToast(toastId);
            addToast(`Error: Could not ${action} robot loop`, 'error', 3000);
        }
    }

    async function controlRobot(action: string) {
		if ($isScanning) {
            addToast("Camera is currently scanning. Livestream will never work.", "error", 3000);
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
            const response = await fetch(`${currentLink}/${action.toLowerCase()}`, { method: 'POST' });

            removeToast(toastId);

            if (response.ok) {
                if (action === 'Run') {
                    if (robotStatus !== 'Paused') showingCamera = false;
                    videoFeedUrl = `${currentLink}/video_feed`;
                    robotStatus = 'Running';
                } else if (action === 'Stop') {
                    showingCamera = false;
                    capturedFullFrame.set(null);
                    robotStatus = 'Stand By';
                } else {
                    robotStatus = 'Paused';
                }
                addToast(
                    `Robot livestream ${action === 'Run' ? 'started' : action == 'Stop' ? 'stopped' : 'paused'} successfully.`,
                    'success',
                    3000
                );
            } else {
                let errorMessage = 'Unknown error';
                try {
                    const data = await response.json();
                    errorMessage = data?.error || response.statusText;
                } catch (err) {
                    errorMessage = response.statusText || 'Failed to parse error response.';
                }
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
    async function toggleCamera() {
        showingCamera = !showingCamera;
        await fetch(`${currentLink}/toggle_camera`, { method: 'POST' });
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
        class="relative flex min-h-[calc(100vh-95px)] flex-col
    bg-gradient-to-b from-gray-200 to-gray-300
    p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
    >
        <div class="relative z-10 mb-4 flex max-h-[100%] flex-col gap-4 md:max-h-[530px] lg:flex-row">
            <div
                class="relative flex min-h-[250px] w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 shadow-lg lg:w-1/2 dark:bg-gray-900"
            >
                {#if videoFeedUrl}
                    <button
                        class="absolute top-4 right-4 z-10 rounded bg-green-600 px-3 py-1.5 text-sm text-white shadow hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        on:click={toggleCamera}
                    >
                        {#if showingCamera}Turn Off Camera{:else}Show Camera{/if}
                    </button>

                    {#if showingCamera}
                        <img
                            src={videoFeedUrl}
                            alt="📷 Camera Feed"
                            class="h-full w-full max-w-full rounded-md border object-contain dark:border-gray-600"
                        />
                    {/if}
                {:else}
                    <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">📷 Camera Feed</p>
                {/if}

                {#if $capturedFullFrame}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img
                        src={$capturedFullFrame}
                        alt="Last Captured Frame"
                        class="absolute top-4 left-4 h-40 w-40 cursor-pointer rounded border border-gray-400 shadow-lg transition hover:brightness-110 dark:border-gray-600"
                        on:click={() => capturedFullFrameModal.set(true)}
                    />
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
                            <span>{currentLink}</span>
                        </li>
                        <li class="flex justify-between">
                            <span class="font-medium text-gray-500 dark:text-gray-300">Record Day:</span>
                            <span>{currentDay}</span>
                        </li>
                        <li class="flex justify-between">
                            <span class="font-medium text-gray-500 dark:text-gray-300">Status:</span>
                            <span>{robotStatus}</span>
                        </li>
                        <li class="flex justify-between">
                            <span class="font-medium text-gray-500 dark:text-gray-300">Time:</span>
                            <span>{$currentTime}</span>
                        </li>
                    </ul>
                </div>

                <!-- Controls Panel -->
                <details class="relative mt-4 w-full sm:w-auto">
                    <summary
                        class="w-full cursor-pointer rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        🤖 Robot Controls
                    </summary>

                    <div
                        class="absolute z-10 mt-2 flex w-80 flex-col items-stretch gap-4 rounded-md bg-gray-200 p-4 shadow-lg md:w-96 dark:bg-gray-800 border-gray-300 dark:border-gray-700 border"
                    >
                        <div class="flex flex-col gap-2">
                            <p class="text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                Manual Control
                            </p>
                            <button
                                on:click={() => wasdEnabled.update((v) => !v)}
                                class="rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition
                                {$isRobotRunning != 'Stopped'
                                    ? 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                                    : 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'}"
                                disabled={$isRobotRunning == 'Stopped'}
                            >
                                Toggle WASD Control ({$wasdEnabled ? 'On' : 'Off'})
                            </button>
                        </div>

                        <div class="flex flex-col gap-2">
                            <p class="text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                Robot Loop
                            </p>

                            <!-- Run Button: Disabled Style -->
                            <button
                                on:click={() => controlRobotLoop('run')}
                                class="rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition
                                {$isRobotRunning == 'Stopped' || $isRobotRunning == 'Paused'
                                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                                    : 'cursor-not-allowed bg-gray-400 opacity-60 dark:bg-gray-700'}"
                                disabled={$isRobotRunning != 'Stopped' && $isRobotRunning != 'Paused'}
                            >
                                Run Robot Loop
                            </button>

                            <button
                                on:click={() => controlRobotLoop('pause')}
                                class="rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition
                                {$isRobotRunning == 'Stopped' || $isRobotRunning == 'Paused'
                                    ? 'cursor-not-allowed bg-gray-400 opacity-60 dark:bg-gray-700'
                                    : 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'}"
                                disabled={$isRobotRunning == 'Stopped' || $isRobotRunning == 'Paused'}
                            >
                                Pause Robot Loop
                            </button>
                            <button
                                on:click={() => controlRobotLoop('stop')}
                                class="rounded-md px-4 py-2 text-sm font-medium text-white shadow-md transition
                                {$isRobotRunning == 'Stopped'
                                    ? 'cursor-not-allowed bg-gray-400 opacity-60 dark:bg-gray-700'
                                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'}"
                                disabled={$isRobotRunning == 'Stopped'}
                            >
                                Stop Robot Loop
                            </button>
                        </div>

                        <div class="flex flex-col gap-2">
                            <p class="text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                Sprayers
                            </p>
                            <div class="grid grid-cols-2 gap-2">
                                {#each [1, 2, 3, 4] as sprayer}
                                    <button
                                        on:click={() => activateSprayer(sprayer)}
                                        class="rounded-md px-3 py-2 text-sm font-medium text-white shadow-md transition
                                        {$isRobotRunning
                                            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                                            : 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'}"
                                        disabled={$isRobotRunning == 'Stopped'}
                                    >
                                        Spray {sprayer}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                </details>

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
                                    <p
                                        class="mt-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
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
                            class="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
                            on:click={captureImageAndDisplay}
                            disabled={robotStatus === 'Stand By'}
                        >
                            Capture
                        </button>
                        <button
                            class="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                            on:click={() => controlRobot('Run')}
                            disabled={robotStatus === 'Running'}
                        >
                            {robotStatus === 'Paused' ? 'Resume' : 'Run Livestream'}
                        </button>

                        <button
                            class="rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
                            on:click={() => controlRobot('Pause')}
                            disabled={robotStatus === 'Stand By' || robotStatus === 'Paused'}
                        >
                            Pause
                        </button>

                        <button
                            class="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
                            on:click={() => controlRobot('Stop')}
                            disabled={robotStatus === 'Stand By'}
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
