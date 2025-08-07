<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Driver from './driver.svelte';
	import Watersensor from './watersensor.svelte';
	import Ultrasonic from './ultrasonic.svelte';
	import Relay from './relay.svelte';
	import Rgbsensor from './rgbsensor.svelte';
	import Tcrt5000 from './tcrt5000.svelte';
	import Head from './head.svelte';
	import { isConnected } from '$lib/stores/connection';
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
		<div class="mx-auto w-11/12 rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
			<!-- Header -->
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

					<div class="flex gap-4">
						<div class="flex flex-col items-center">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Run Robot
							</label>
							<button
								title="Start or resume robot operation"
								class="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
							>
								RUN
							</button>
						</div>

						<div class="flex flex-col items-center">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Pause Robot
							</label>
							<button
								title="Temporarily pause robot operation"
								class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
							>
								PAUSE
							</button>
						</div>

						<!-- Stop Robot -->
						<div class="flex flex-col items-center">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Stop Robot
							</label>
							<button
								title="Completely stop robot operation immediately"
								class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
							>
								STOP
							</button>
						</div>

						<!-- Enable WAD Bind -->
						<div class="flex flex-col items-center">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Enable WAD Bind
							</label>
							<button
								title="Enable WAD keyboard control binding"
								class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
							>
								ENABLE
							</button>
						</div>

						<div class="flex flex-col items-center">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Perform A Scan
							</label>
							<button
								title="Enable WAD keyboard control binding"
								class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
							>
								EXECUTE SCAN
							</button>
						</div>
					</div>
				</div>
			</div>

			<div
				class="mb-3 rounded-xl border border-gray-300 bg-gray-50 p-5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
			>
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div
						class="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-200 p-5 shadow-lg transition-all dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900/10"
					>
						<div
							class="flex items-center gap-2 rounded-2xl border border-gray-300 p-3 dark:border-gray-700"
						>
							<h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">
								Manual Robot Control
							</h2>
						</div>
						<Driver />
						<Head />
					</div>

					<!-- Sensor Feedback Panel -->
					<div
						class="flex flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-100 p-5 shadow-lg transition-all dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
					>
						<!-- Header -->
						<div class="mb-4 flex items-center gap-2">
							<span class="text-2xl">📊</span>
							<h2 class="text-lg font-bold text-gray-700 dark:text-gray-200">Sensor Feedback</h2>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<!-- TCRT5000 -->
							<Tcrt5000 />
							<Rgbsensor />
							<Watersensor />
							<Ultrasonic />
						</div>
					</div>
				</div>
			</div>

			<Relay />
		</div>
	</div>
	<Footer />
{/if}
