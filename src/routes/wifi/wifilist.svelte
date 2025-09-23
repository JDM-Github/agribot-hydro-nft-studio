<script lang="ts">
	import type { WifiManager } from "$root/lib/class/wifi";
	import { get } from "svelte/store";

    export let wifi: WifiManager;
</script>

{#if get(wifi.wifiList).length === 0}
	<p class="mt-6 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
		No WiFi networks found.
		<span class="block text-gray-500 dark:text-gray-500">Click "Scan Networks" to refresh.</span>
	</p>
{:else}
	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each get(wifi.wifiList) as network}
			<button
				class="relative flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
				on:click={() => {
					wifi.selectedSSID.set(network.ssid);
					if (network.known) {
						wifi.priority = network.priority;
					}
				}}
			>
				<div class="flex w-full items-center justify-between">
					<span class="truncate text-base font-bold text-gray-800 dark:text-gray-100">
						{network.ssid || 'Hidden Network'}
					</span>
					{#if get(wifi.connectedSSID) !== network.ssid && get(wifi.selectedSSID) !== network.ssid}
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
				{#if get(wifi.connectedSSID) === network.ssid}
					<div
						class="absolute top-3 right-3 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white shadow"
					>
						Connected
					</div>
				{:else if get(wifi.selectedSSID) === network.ssid}
					<div
						class="bot-3 absolute right-3 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow"
					>
						Selected
					</div>
				{/if}
			</button>
		{/each}
	</div>
{/if}
