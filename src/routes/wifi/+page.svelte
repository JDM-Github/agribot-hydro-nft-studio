<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { isConnected } from '$lib/stores/connection';
	import { writable } from 'svelte/store';
	import RequestHandler from '$lib/utils/request';
	import { addToast } from '$lib/stores/toast';
	import NotConnected from '$lib/components/NotConnected.svelte';

	let showPassword = false;
	let wifiList = writable<{ ssid: string; signal: number; known: boolean; priority: number }[]>([]);
	let selectedSSID = writable('');
	let connectedSSID = writable('');
	let password = writable('');
	let loading = writable(false);

	let priority = 0;

	async function setPriority() {
		if (!$selectedSSID) return;
		loading.set(true);
		try {
			const [success, _] = await RequestHandler.authFetch('wifi/set-priority', 'POST', {
				ssid: $selectedSSID,
				priority: +priority
			});
			if (success) {
				addToast(`Priority set to ${priority} for ${$selectedSSID}`, 'success', 4000);
			} else {
				addToast('Failed to set priority', 'error', 4000);
			}
		} catch (err) {
			console.error(err);
			addToast('Error setting priority', 'error', 4000);
		}
		loading.set(false);
	}

	async function scanNetworks() {
		loading.set(true);
		try {
			const [success, data] = await RequestHandler.authFetch('wifi/scan', 'GET');
			if (success && data.networks) {
				wifiList.set(data.networks);
				connectedSSID.set(data.connected_ssid || '');
			} else {
				addToast('Failed to scan WiFi networks.', 'error', 3000);
			}
		} catch (err) {
			console.error(err);
			addToast('Error scanning WiFi.', 'error', 3000);
		}
		loading.set(false);
	}

	async function connectNetwork() {
		if (!$selectedSSID) {
			addToast('Please select a network.', 'error', 3000);
			return;
		}
		loading.set(true);
		try {
			const [success, _] = await RequestHandler.authFetch('wifi/connect', 'POST', {
				ssid: $selectedSSID,
				password: $password
			});
			if (success) {
				addToast(`Connected to ${$selectedSSID}`, 'success', 4000);
				connectedSSID.set($selectedSSID);
				selectedSSID.set('');
				password.set('');
			} else {
				addToast('Failed to connect to WiFi.', 'error', 4000);
			}
		} catch (err) {
			console.error(err);
			addToast('Connection request failed.', 'error', 4000);
		}
		loading.set(false);
	}

	$: if (priority > 10) priority = 10;
	$: if (priority < 0) priority = 0;
</script>

{#if !$isConnected}
	<NotConnected />
{:else}
	<main
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 dark:from-gray-700 dark:to-gray-800"
	>
		<div
			class="container mx-auto rounded-2xl bg-white p-4 lg:mx-auto lg:w-10/12 lg:flex-row dark:bg-gray-900"
		>
			<div
				class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="flex items-center gap-2">
					<span class="text-xl sm:text-2xl">📶</span>
					<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
						MANAGE WIFI
					</h2>
				</div>
				<div class="flex gap-2">
					<button
						on:click={scanNetworks}
						class="rounded-lg bg-green-500 px-4 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-green-600 disabled:opacity-50"
						disabled={$loading}
					>
						{$loading ? 'Scanning...' : 'Scan Networks'}
					</button>
				</div>
			</div>

			{#if $wifiList.length === 0}
				<p class="mt-6 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
					No WiFi networks found.
					<span class="block text-gray-500 dark:text-gray-500"
						>Click "Scan Networks" to refresh.</span
					>
				</p>
			{:else}
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each $wifiList as network}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="relative flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
							on:click={() => {
								selectedSSID.set(network.ssid);
								if (network.known) {
									priority = network.priority;
								}
							}}
						>
							<div class="flex w-full items-center justify-between">
								<span class="truncate text-base font-bold text-gray-800 dark:text-gray-100">
									{network.ssid || 'Hidden Network'}
								</span>
								{#if $connectedSSID !== network.ssid && $selectedSSID !== network.ssid}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 24 24"
										class="h-5 w-5 {+network.signal >= 70
											? 'text-green-500'
											: network.signal >= 40
												? 'text-yellow-500'
												: 'text-red-500'}"
									>
										<path
											d="M12 20c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm6.07-2.93c.39-.39.39-1.02 0-1.41a9.969 9.969 0 0 0-14.14 0c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0a7.975 7.975 0 0 1 11.32 0c.39.39 1.02.39 1.41 0zM12 4c-3.86 0-7.36 1.57-9.9 4.1-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0A11.962 11.962 0 0 1 12 6c3.31 0 6.31 1.34 8.49 3.51.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41C19.36 5.57 15.86 4 12 4z"
										/>
									</svg>
								{/if}
							</div>

							<div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
								Signal strength: {network.signal}%
								{#if network.known}
									• Priority: {network.priority}
								{/if}
							</div>
							{#if $connectedSSID === network.ssid}
								<div
									class="absolute top-3 right-3 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white shadow"
								>
									Connected
								</div>
							{:else if $selectedSSID === network.ssid}
								<div
									class="bot-3 absolute right-3 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow"
								>
									Selected
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if $selectedSSID}
				<div
					class="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800"
				>
					<h3
						class="mb-3 flex items-center justify-between text-lg font-semibold text-gray-700 dark:text-gray-200"
					>
						<span>Connect to <span class="text-blue-500">{$selectedSSID}</span></span>
					</h3>

					{#if $wifiList.find((n) => n.ssid === $selectedSSID)?.known}
						<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
							This network is known. You can connect without entering a password.
						</p>
						<div class="mb-4 flex items-center gap-2">
							<input
								type="number"
								min="0"
								max="10"
								bind:value={priority}
								placeholder="Priority (higher = preferred)"
								class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
							/>
							<button
								on:click={setPriority}
								class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-yellow-600 disabled:opacity-50"
							>
								Set Priority
							</button>
						</div>
					{:else}
						<div class="mb-4 flex rounded-md border border-gray-300 dark:border-gray-600">
							<input
								type={showPassword ? 'text' : 'password'}
								bind:value={$password}
								placeholder="Enter WiFi Password"
								class="flex-1 rounded-l-md border-0 px-3 py-2 text-sm text-gray-900
                                focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                dark:bg-gray-700 dark:text-gray-200"
							/>
							<button
								type="button"
								class="flex items-center justify-center rounded-r-md bg-gray-100 px-3
                                text-gray-500 hover:text-gray-700 dark:bg-gray-600 dark:text-gray-300
                                dark:hover:text-gray-100"
								on:click={() => (showPassword = !showPassword)}
							>
								{#if showPassword}
									<!-- Eye-off -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 
                                                0-1.31.252-2.563.708-3.708M6.343 6.343A9.959 9.959 0 012 9c0 5.523 
                                                4.477 10 10 10 2.03 0 3.91-.607 5.464-1.657M15 12a3 3 0 11-6 0 
                                                3 3 0 016 0z"
										/>
									</svg>
								{:else}
									<!-- Eye -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 
                                                9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						
					{/if}
					<button
							on:click={connectNetwork}
							class="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md
                            transition hover:bg-blue-600 disabled:opacity-50"
							disabled={$loading}
						>
							{$loading ? 'Connecting...' : 'Connect'}
						</button>
				</div>
			{/if}
		</div>
	</main>
	<Footer />
{/if}
