<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/toast';

	let tsLoading = writable(false);
	let tsDevices = writable<any[]>([]);
	async function fetchDevices() {
		try {
			const res = await fetch('/api/tailscale/devices');
			const data = await res.json();
			if (data.devices) {
				tsDevices.set(data.devices);
			} else {
				addToast('Failed to fetch Tailscale devices', 'error', 3000);
			}
		} catch (err) {
			console.error(err);
			addToast('Error fetching Tailscale devices', 'error', 3000);
		}
	}

	async function connectTailscale() {
		try {
			const res = await fetch('/api/connect');
			const data = await res.json();
			if (data.success) {
				addToast('Device successfully connected to Tailscale!', 'success', 3000);
				fetchDevices();
			} else {
				addToast(data.error || 'Failed to connect', 'error', 3000);
			}
		} catch (err) {
			console.error(err);
			addToast('Error connecting to Tailscale', 'error', 3000);
		}
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
		<p>The device is not connected to AGRI-BOT. Please connect first.</p>
	</div>

	<div
		class="mt-6 w-full max-w-xl rounded-xl bg-gradient-to-b from-white to-gray-300 p-5 shadow-lg dark:from-gray-900/50 dark:to-gray-950/70"
	>
		<h3 class="mb-3 text-base font-bold text-gray-800 dark:text-gray-100">
			🌐 Connected Tailscale Devices
		</h3>

		{#if $tsDevices.length === 0}
			<p class="text-sm text-gray-600 dark:text-gray-400">No devices connected yet.</p>
		{:else}
			<ul class="space-y-2">
				{#each $tsDevices as device}
					<li
						class="flex items-center justify-between rounded-lg border-gray-200 bg-white/70 p-3 text-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70"
					>
						<span class="font-medium text-gray-700 dark:text-gray-200">
							{device.hostname}
						</span>
						<span class="text-xs font-semibold {device.online ? 'text-green-500' : 'text-red-500'}">
							{device.online ? 'Online' : 'Offline'}
						</span>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-5 flex justify-end">
			<button
				on:click={connectTailscale}
				class="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-600 disabled:opacity-50"
				disabled={$tsLoading}
			>
				{$tsLoading ? 'Connecting...' : 'Connect this Device'}
			</button>
		</div>
	</div>
</div>

<Footer />
