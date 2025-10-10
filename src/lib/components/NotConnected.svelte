<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { addToast, removeToast } from '$lib/stores/toast';
	import RequestHandler from '../utils/request';
	import { userData, deviceID } from '../stores/connection';
	import { saveToDB } from '../utils/indexdb';
	import { RefreshCw } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { Connection } from '../class/connection';

	$: isConnected = Connection.isConnected();
	export let user: any;
	let deviceName = '';
	let showModal = false;
	let showKeyModal = false;
	let generatedKey: any = null;
	let tsLoading = writable(false);

	let registerModal = false;
	let selectedDevice: any = null;
	let inputIp = '';
	let hostName = '';

	let showModalTutorial = false;
	let tutorialType: null | string = null;

	let currentUser: Writable<any> = writable({});
	let tsDevices: Writable<any[]> = writable<any[]>([]);
	userData.subscribe((user) => {
		if (!user) return;
		currentUser.set(user.user);
		tsDevices.set(user.tailscale_devices || []);
	});

	async function fetchDevices() {
		const toastId = addToast('Fetching devices...', 'loading');
		if (!$currentUser || !$currentUser.user?.id) {
			removeToast(toastId);
			addToast('Current user does not found.', 'success', 2000);
		}
		try {
			const response = await RequestHandler.fetchData('POST', `tailscale/get-all`, {
				id: $currentUser.id,
				deviceID: $deviceID
			});
			removeToast(toastId);
			if (response.success) {
				$userData.tailscale_devices = response.devices;
				await saveToDB('userData', $userData);
				addToast('Devices updated.', 'success', 2000);
			} else {
				addToast(response.message || 'Failed to fetch devices', 'error', 3000);
			}
		} catch (err) {
			removeToast(toastId);
			console.error('fetchDevices error:', err);
			addToast('Error fetching devices', 'error', 3000);
		}
	}

	async function requestAuthKey() {
		if (!deviceName.trim()) {
			addToast('Device name is required.', 'error', 2000);
			return;
		}

		const toastId = addToast('Requesting auth key...', 'loading');
		tsLoading.set(true);

		try {
			const response = await RequestHandler.fetchData('POST', 'tailscale/auth-key', {
				id: user.id,
				deviceName: deviceName.trim()
			});
			removeToast(toastId);

			if (response.success) {
				addToast('Auth key created!', 'success', 3000);
				console.log('Generated Auth Key:', response.authKey);
				await fetchDevices();
				showModal = false;
				deviceName = '';
				generatedKey = response.device;
				showKeyModal = true;
			} else {
				addToast(response.message || 'Failed to create auth key', 'error', 3000);
			}
		} catch (err) {
			removeToast(toastId);
			console.error('requestAuthKey error:', err);
			addToast('Error creating auth key', 'error', 3000);
		} finally {
			tsLoading.set(false);
		}
	}

	async function setRegister(device: any, ip: string, hostName: string) {
		const toastId = addToast(`Registering ${device['device-name']}...`, 'loading');
		try {
			const response = await RequestHandler.fetchData('POST', 'tailscale/register', {
				id: user.id,
				deviceName: device['device-name'],
				ip: ip.trim(),
				hostName: hostName,
				authkey: device.authkey
			});
			removeToast(toastId);
			if (response.success) {
				addToast('Device registered successfully!', 'success', 3000);
				await fetchDevices();
				registerModal = false;
				selectedDevice = null;
				inputIp = '';
				hostName = '';
			} else {
				addToast(response.message || 'Failed to register device', 'error', 3000);
			}
		} catch (err) {
			removeToast(toastId);
			console.error('setRegister error:', err);
			addToast('Error registering device', 'error', 3000);
		}
	}
	async function manualRegister(ip: string, hostName: string, deviceN: string) {
		const toastId = addToast(`Manual registration...`, 'loading');
		try {
			const response = await RequestHandler.fetchData('POST', 'tailscale/manual-register', {
				id: user.id,
				deviceName: deviceN,
				ip: ip.trim(),
				hostName: hostName
			});
			removeToast(toastId);
			if (response.success) {
				addToast('Device registered successfully!', 'success', 3000);
				await fetchDevices();
				registerModal = false;
				selectedDevice = null;
				inputIp = '';
				hostName = '';
			} else {
				addToast(response.message || 'Failed to register device', 'error', 3000);
			}
		} catch (err) {
			removeToast(toastId);
			console.error('manualRegister error:', err);
			addToast('Error registering device', 'error', 3000);
		}
	}
	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		addToast('Copied to clipboard!', 'success', 2000);
	}

	let tsSyncing = false;
	async function forceTailscaleSync() {
		tsSyncing = true;
		const toastId = addToast('Force syncing tailscale devices...', 'loading');
		try {
			const res = await fetch('/api/custom-sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userData: $userData,
					deviceID: $deviceID,
					willUpdateTailscale: true
				})
			});
			const response = await res.json();
			removeToast(toastId);
			if (res.ok && response.success) {
				await saveToDB('userData', response.data);
				addToast('Force sync of tailscale devices is successful!', 'success', 3000);
				await goto('/talescale', { invalidateAll: true });
			} else {
				addToast('Force sync of tailscale devices failed..', 'error', 3000);
			}
		} catch (error) {
			removeToast(toastId);
			addToast(`An unexpected error occurred. ${error}`, 'error', 3000);
		}

		tsSyncing = false;
	}
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col items-center justify-center bg-gray-200 p-4 dark:bg-gray-800"
>
	<div
		class="flex flex-col items-center justify-center text-center text-lg font-semibold text-gray-600 dark:text-gray-400"
	>
		{#if $isConnected}
			<p>The device is connected to AGRI-BOT.</p>
		{:else}
			<p>The device is not connected to AGRI-BOT.</p>
		{/if}
	</div>

	<div
		class="mt-6 w-full max-w-xl rounded-xl bg-gradient-to-b from-white to-gray-300 p-5 shadow-lg dark:from-gray-900/50 dark:to-gray-950/70"
	>
		<h3
			class="mb-3 flex flex-row justify-between text-base font-bold text-gray-800 dark:text-gray-100"
		>
			<p>🌐 Connected Tailscale Devices</p>
			<a
				href="https://tailscale.com/download"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
			>
				Download Tailscale
			</a>
		</h3>

		<p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
			{$tsDevices.length}/5 unregistered devices in use
		</p>

		{#if $tsDevices.length === 0}
			<p class="text-sm text-gray-600 dark:text-gray-400">No devices connected yet.</p>
		{:else}
			<ul class="space-y-2">
				{#each $tsDevices as device}
					<li
						class="flex flex-col gap-1 rounded-lg border-gray-200 bg-white/70 p-3 text-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70"
					>
						<div class="flex items-center justify-between">
							<span class="font-medium text-gray-700 dark:text-gray-200">
								{device['device-name']}
							</span>
							<span
								class="text-xs font-semibold {device.isRegistered
									? 'text-green-500'
									: 'text-yellow-500'}"
							>
								{device.isRegistered ? 'Registered' : 'Pending'}
							</span>
						</div>
						{#if !device.isRegistered}
							<div class="flex flex-col gap-2">
								<div
									class="flex items-center justify-between rounded bg-gray-100 p-2 text-sm dark:bg-gray-700"
								>
									<span class="truncate text-gray-800 dark:text-gray-200">{device.authkey}</span>
									<button
										on:click={() => copyToClipboard(device.authkey)}
										class="ml-2 rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
									>
										Copy
									</button>
									<button
										on:click={() => {
											selectedDevice = device;
											registerModal = true;
										}}
										class="ml-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-green-600"
									>
										REGISTER
									</button>
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-5 flex flex-col items-center gap-3">
			<div class="flex gap-3">
				<button
					on:click={() => (showModal = true)}
					class="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
					disabled={$tsLoading || $tsDevices.length >= 5}
				>
					{$tsLoading ? 'Requesting...' : 'Request Auth Key'}
				</button>

				<button
					on:click={() => {
						selectedDevice = null;
						registerModal = true;
					}}
					class="rounded-lg bg-purple-500 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-purple-600 disabled:opacity-50"
					disabled={$tsLoading || $tsDevices.length >= 5}
				>
					Register Manually
				</button>
			</div>

			<div class="flex gap-3">
				<button
					on:click={() => {
						tutorialType = 'pc';
						showModalTutorial = true;
					}}
					class="rounded-lg bg-gray-700 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-gray-800"
				>
					PC Tutorial
				</button>
				<button
					on:click={() => {
						tutorialType = 'android';
						showModalTutorial = true;
					}}
					class="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-green-700"
				>
					Android Tutorial
				</button>

				<button
					on:click={forceTailscaleSync}
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
					disabled={tsSyncing}
				>
					{#if tsSyncing}
						<RefreshCw class="h-4 w-4 animate-spin" />
						<span>Syncing...</span>
					{:else}
						<RefreshCw class="h-4 w-4" />
						<span>Force Sync</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

{#if showModalTutorial && tutorialType !== null}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-2xl rounded-lg bg-white p-5 shadow-lg dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">
					{tutorialType === 'pc' ? 'PC Setup Tutorial' : 'Android Setup Tutorial'}
				</h2>
				<button
					on:click={() => {
						showModalTutorial = false;
						tutorialType = null;
					}}
				>
					❌
				</button>
			</div>

			{#if tutorialType === 'pc'}
				<!-- svelte-ignore a11y_missing_attribute -->
				<iframe
					class="aspect-video w-full rounded"
					src="https://www.youtube.com/embed/YOUR_PC_VIDEO_ID"
					frameborder="0"
					allowfullscreen
				></iframe>
			{:else if tutorialType === 'android'}
				<!-- svelte-ignore a11y_missing_attribute -->
				<iframe
					class="aspect-video w-full rounded"
					src="https://www.youtube.com/embed/YOUR_ANDROID_VIDEO_ID"
					frameborder="0"
					allowfullscreen
				></iframe>
			{/if}
		</div>
	</div>
{/if}

{#if registerModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Verify Device IP</h2>

			{#if selectedDevice}
				<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
					Enter the host device and IPv4 assigned to <b>{selectedDevice?.['device-name']}</b> in your
					Tailscale app:
				</p>
			{:else}
				<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
					Enter the host device, IPv4 and Device Name in your Tailscale app:
				</p>
				<input
					bind:value={deviceName}
					type="text"
					placeholder="Enter device name. (Can be anything.)"
					class="mb-4 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
				/>
			{/if}
			<input
				bind:value={hostName}
				type="text"
				placeholder="e.g. vivo-1906"
				class="mb-4 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
			/>
			<input
				bind:value={inputIp}
				type="text"
				placeholder="e.g. 100.61.169.48"
				class="mb-4 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
			/>
			<div class="flex justify-end gap-2">
				<button
					on:click={() => {
						registerModal = false;
						selectedDevice = null;
						deviceName = '';
						inputIp = '';
						hostName = '';
					}}
					class="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					on:click={() =>
						selectedDevice
							? setRegister(selectedDevice, inputIp, hostName)
							: manualRegister(inputIp, hostName, deviceName)}
					class="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-green-600"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
				Request Tailscale Auth Key
			</h2>
			<input
				bind:value={deviceName}
				type="text"
				placeholder="Enter device name. (Can be anything.)"
				class="mb-4 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
			/>
			<div class="flex justify-end gap-2">
				<button
					on:click={() => {
						showModal = false;
						deviceName = '';
					}}
					class="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					on:click={requestAuthKey}
					class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-600"
				>
					Request
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showKeyModal && generatedKey}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Auth Key Created</h2>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">
				Device: <strong>{generatedKey['device-name']}</strong>
			</p>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">
				IP: {generatedKey.ip}
			</p>
			<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">
				Expires: {generatedKey.expiryOfAuth
					? new Date(generatedKey.expiryOfAuth).toLocaleString()
					: 'N/A'}
			</p>
			<div
				class="flex items-center justify-between rounded bg-gray-100 p-2 text-sm dark:bg-gray-700"
			>
				<span class="truncate text-gray-800 dark:text-gray-200">{generatedKey.authkey}</span>
				<button
					on:click={() => copyToClipboard(generatedKey.authkey)}
					class="ml-2 rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
				>
					Copy
				</button>
			</div>
			<div class="mt-4 flex justify-end">
				<button
					on:click={() => {
						showKeyModal = false;
						generatedKey = null;
					}}
					class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<Footer />
