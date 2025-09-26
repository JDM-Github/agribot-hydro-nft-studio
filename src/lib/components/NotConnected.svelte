<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { writable } from 'svelte/store';
	import { addToast, removeToast } from '$lib/stores/toast';
	import RequestHandler from '../utils/request';
	import { onMount } from 'svelte';

	export let user: any;
	let deviceName = '';
	let showModal = false;
	let showKeyModal = false;
	let generatedKey: any = null;
	let tsLoading = writable(false);
	let tsDevices = writable<any[]>([]);

	let registerModal = false;
	let selectedDevice: any = null;
	let inputIp = '';
	let hostName = '';

	let showModalTutorial = false;
	let tutorialType: null | string = null;

	async function fetchDevices() {
		const toastId = addToast('Fetching devices...', 'loading');
		try {
			const response = await RequestHandler.fetchData('GET', `tailscale/auth-key/${user.id}`);
			removeToast(toastId);

			if (response.success) {
				tsDevices.set(response.devices);
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
				generatedKey = response.device; // store for modal
				showKeyModal = true; // open modal to display
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

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		addToast('Copied to clipboard!', 'success', 2000);
	}

	onMount(() => {
		fetchDevices();
	});
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col items-center justify-center bg-gray-200 p-4 dark:bg-gray-800"
>
	<div
		class="flex flex-col items-center justify-center text-center text-lg font-semibold text-gray-600 dark:text-gray-400"
	>
		<p>The device is not connected to AGRI-BOT.</p>
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
								</div>
								<p class="text-xs text-gray-500 dark:text-gray-400">IP: {device.ip}</p>
								<button
									on:click={() => {
										selectedDevice = device;
										registerModal = true;
									}}
									class="w-full rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
								>
									SET REGISTER
								</button>
							</div>
						{:else}
							<p class="text-xs text-gray-500 dark:text-gray-400">IP: {device.ip}</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-5 flex flex-col items-center gap-3">
			<button
				on:click={() => (showModal = true)}
				class="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
				disabled={$tsLoading || $tsDevices.length >= 5}
			>
				{$tsLoading ? 'Requesting...' : 'Request Auth Key'}
			</button>

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

			<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
				Enter the host device and IPv4 assigned to <b>{selectedDevice?.['device-name']}</b> in your Tailscale
				app:
			</p>

			<input
				bind:value={hostName}
				type="text"
				placeholder="e.g. vivo-1906"
				class="mb-4 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
			/>
			<div class="flex justify-end gap-2">
				<button
					on:click={() => {
						registerModal = false;
						selectedDevice = null;
						inputIp = '';
						hostName = '';
					}}
					class="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					on:click={() => setRegister(selectedDevice, inputIp, hostName)}
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
				placeholder="Enter device name"
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
