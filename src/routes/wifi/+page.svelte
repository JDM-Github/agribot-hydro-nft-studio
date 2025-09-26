<script lang="ts">
	import Footer from "$components/Footer.svelte";
	import NotConnected from "$components/NotConnected.svelte";
	import { isConnected } from "$stores/connection";
	import { WifiManager } from "$class/wifi";
	import Wifilist from "./wifilist.svelte";
	import Selectedssid from "./selectedssid.svelte";
	import Wifiheader from "./wifiheader.svelte";

	export let data;
	let showPassword: boolean = false;
	const wifi = new WifiManager();
	$: if (wifi.priority > 10) wifi.priority = 10;
	$: if (wifi.priority < 0) wifi.priority = 0;
</script>

{#if !$isConnected}
	<NotConnected user={data.user}/>
{:else}
	<main
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 dark:from-gray-700 dark:to-gray-800"
	>
		<div
			class="container mx-auto rounded-2xl bg-white p-4 lg:mx-auto lg:w-10/12 lg:flex-row dark:bg-gray-900"
		>
			<Wifiheader wifi={wifi}/>
			<Wifilist wifi={wifi}/>
			<Selectedssid wifi={wifi} showPassword={showPassword} bindWifiPassword={wifi.password}/>
		</div>
	</main>
	<Footer />
{/if}
