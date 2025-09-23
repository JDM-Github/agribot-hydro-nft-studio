<script lang="ts">
	import type { WifiManager } from "$root/lib/class/wifi";
	import type { WritableString } from "$root/lib/type";
	import { get } from "svelte/store";

    export let wifi: WifiManager;
    export let showPassword: boolean;
    export let bindWifiPassword: WritableString;
</script>

{#if get(wifi.selectedSSID)}
				<div
					class="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800"
				>
					<h3
						class="mb-3 flex items-center justify-between text-lg font-semibold text-gray-700 dark:text-gray-200"
					>
						<span>Connect to <span class="text-blue-500">{get(wifi.selectedSSID)}</span></span>
					</h3>

					{#if get(wifi.wifiList).find((n) => n.ssid === get(wifi.selectedSSID))?.known}
						<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
							This network is known. You can connect without entering a password.
						</p>
						<div class="mb-4 flex items-center gap-2">
							<input
								type="number"
								min="0"
								max="10"
								bind:value={wifi.priority}
								placeholder="Priority (higher = preferred)"
								class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                                focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
							/>
							<button
								on:click={wifi.setPriority}
								class="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-yellow-600 disabled:opacity-50"
							>
								Set Priority
							</button>
						</div>
					{:else}
						<div class="mb-4 flex rounded-md border border-gray-300 dark:border-gray-600">
							<input
								type={showPassword ? 'text' : 'password'}
								bind:value={$bindWifiPassword}
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
							on:click={wifi.connectNetwork}
							class="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md
                            transition hover:bg-blue-600 disabled:opacity-50"
							disabled={get(wifi.loading)}
						>
							{get(wifi.loading) ? 'Connecting...' : 'Connect'}
						</button>
				</div>
			{/if}