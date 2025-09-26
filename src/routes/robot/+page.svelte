<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Driver from './driver.svelte';
	import Watersensor from './watersensor.svelte';
	import Ultrasonic from './ultrasonic.svelte';
	import Relay from './relay.svelte';
	import Rgbsensor from './rgbsensor.svelte';
	import Tcrt5000 from './tcrt5000.svelte';
	import Head from './head.svelte';
	import { isConnected, isRobotRunning } from '$lib/stores/connection';
	import { simpleMode } from '$lib/stores/mode';
	import RequestHandler from '$lib/utils/request';
	import { addToast, removeToast } from '$lib/stores/toast';
	import NotConnected from '$lib/components/NotConnected.svelte';

	export let data;
	let enableWASDinControl = false;
	let scanning = false;
	
	async function controlRobot(move: string) {
		if (scanning) return;
		let activeToastId = addToast(`AGRIBOT ${move} command...`, 'loading');
		try {
			const [success, response] = await RequestHandler.authFetch(`${move}_robot_loop`, 'POST');

			if (!success) {
				addToast(`AGRIBOT command failed: ${response?.message || 'Unknown error'}`, 'error', 4000);
			} else {
				addToast(`AGRIBOT command "${move}"" run successfully!`, 'success', 3000);
			}
		} catch (err: any) {
			addToast(`⚠️ Network error: ${err.message}`, 'error', 4000);
			console.error('Error activating scan.', err);
		} finally {
			if (activeToastId) {
				removeToast(activeToastId);
			}
			scanning = false;
		}
	}

	async function doScan() {
		if (scanning) return;
		scanning = true;
		let activeToastId = addToast('Starting plant scan...', 'loading');
		try {
			const [success, response] = await RequestHandler.authFetch(`start_analyze`, 'POST');

			if (!success) {
				addToast(`Scan failed: ${response?.message || 'Unknown error'}`, 'error', 4000);
			} else {
				addToast('Scan started successfully!', 'success', 3000);
			}
		} catch (err: any) {
			addToast(`⚠️ Network error: ${err.message}`, 'error', 4000);
			console.error('Error activating scan.', err);
		} finally {
			if (activeToastId) {
				removeToast(activeToastId);
			}
			scanning = false;
		}
	}
</script>

{#if !$isConnected}
	<NotConnected user={data.user}/>
{:else}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
	>
		<div class="mx-auto w-11/12 rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
			<div
				class="relative mb-3 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-[#fafffc] p-3 dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center justify-between gap-2">
					<div class="flex items-center gap-2">
						<span class="text-xl sm:text-2xl">🌿</span>
						<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
							ROBOT STATUS
						</h2>
					</div>
					{#if !$simpleMode}
						<div class="flex gap-4">
							<div class="flex flex-col items-center">
								<label
									class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 lg:inline-block hidden"
									for="run-robot"
								>
									Run/Resume Robot
								</label>
								<button
									id="run-robot"
									title="Start or resume robot operation"
									class="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-500"
									disabled={scanning || $isRobotRunning === 'Running' || $isRobotRunning === 'Paused'}
									on:click={() => controlRobot('run')}
								>
									{$isRobotRunning === 'Running' ? 'RESUME' : 'RUN'}
								</button>
							</div>

							<div class="flex flex-col items-center">
								<label
									class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 lg:inline-block hidden"
									for="pause-robot"
								>
									Pause Robot
								</label>
								<button
									id="pause-robot"
									title="Temporarily pause robot operation"
									class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-yellow-500"
									disabled={scanning || $isRobotRunning === 'Stopped' || $isRobotRunning === 'Paused'}
									on:click={() => controlRobot('pause')}
								>
									PAUSE
								</button>
							</div>

							<div class="flex flex-col items-center">
								<label
									class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 lg:inline-block hidden"
									for="stop-robot"
								>
									Stop Robot
								</label>
								<button
									id="stop-robot"
									title="Completely stop robot operation immediately"
									class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-500"
									disabled={scanning || $isRobotRunning === 'Stopped'}
									on:click={() => controlRobot('stop')}
								>
									STOP
								</button>
							</div>

							<div class="flex flex-col items-center">
								<label
									class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 lg:inline-block hidden"
									for="enable-wad-bind"
								>
									WASD Keyboard Control
								</label>

								<button
									on:click={() => (enableWASDinControl = !enableWASDinControl)}
									id="enable-wad-bind"
									title="Toggle WASD keyboard control binding"
									class="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-30"
									class:bg-blue-500={!enableWASDinControl}
									class:hover:bg-blue-600={!enableWASDinControl}
									class:focus:ring-blue-400={!enableWASDinControl}
									class:bg-green-600={enableWASDinControl}
									class:hover:bg-green-700={enableWASDinControl}
									class:focus:ring-green-400={enableWASDinControl}
									disabled={scanning || $isRobotRunning !== 'Stopped'}
								>
									{enableWASDinControl ? 'DISABLE' : 'ENABLE'}
								</button>

								<p
									class="mt-1 text-xs font-semibold lg:inline-block hidden"
									class:text-green-500={enableWASDinControl}
									class:text-gray-400={!enableWASDinControl}
								>
									{enableWASDinControl ? 'WASD control is ENABLED' : 'WASD control is DISABLED'}
								</p>
							</div>

							<div class="flex flex-col items-center">
								<label
									class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 lg:inline-block hidden"
									for="execute-scan"
								>
									Perform A Scan
								</label>
								<button
									id="execute-scan"
									title="Enable WAD keyboard control binding"
									class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500"
									disabled={scanning || $isRobotRunning !== 'Stopped'}
									on:click={doScan}
								>
									EXECUTE SCAN
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div
				class="mb-3 rounded-xl border border-gray-300 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
			>
				<div class="grid grid-cols-1 gap-6"
					class:lg:grid-cols-2={!$simpleMode}
				>
					<div
						class="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-200 p-5 shadow-lg transition-all dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900/10"
						class:mx-auto={$simpleMode}
					>
						<div
							class="flex items-center gap-2 rounded-2xl border border-gray-300 p-3 dark:border-gray-700"
						>
							<h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">
								Manual Robot Control
							</h2>
						</div>
						<Driver enableWASDinControl scanning={scanning}/>
						<Head scanning={scanning}/>
					</div>

					{#if !$simpleMode}
						<div
							class="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-100 p-5 shadow-lg transition-all dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
						>
							<div class="mb-4 flex items-center gap-2">
								<span class="text-2xl">📊</span>
								<h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">Sensor Feedback</h2>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<Tcrt5000 />
								<Rgbsensor />
								<Watersensor />
								<Ultrasonic />
							</div>
						</div>
					{/if}
				</div>
			</div>

			<Relay scanning={scanning}/>
		</div>
	</div>
	<Footer />
{/if}
