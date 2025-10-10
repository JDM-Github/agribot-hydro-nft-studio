<script lang="ts">
import Footer from '$components/Footer.svelte';
import NotConnected from '$components/NotConnected.svelte';
import { WifiManager } from '$class/wifi';
import Wifilist from './wifilist.svelte';
import Selectedssid from './selectedssid.svelte';
import Wifiheader from './wifiheader.svelte';
import Stoprobot from '../spray/stoprobot.svelte';
import { Connection } from '$root/lib/class/connection';

export let data;
$: allState = Connection.getAllState({ conn: true, robot: true, live: true, scan: true, rscan: true, performing: true, robotLive: true, stopCapture: true });
$: isConnected = allState.connection;
$: robotState = allState.robotrunning;
$: liveState = allState.livestreamstate;
$: scanState = allState.scanningstate;
$: robotScanState = allState.robotscanningstate;
$: performing = allState.performingscan;
$: robotLive = allState.robotlivestream;
$: stopCapture = allState.stopcapturingimage;

let showPassword: boolean = false;
const wifi = new WifiManager();
$: if (wifi.priority > 10) wifi.priority = 10;
$: if (wifi.priority < 0) wifi.priority = 0;
$: loading = wifi.loading;
$: wifiList = wifi.wifiList;
$: connectedSSID = wifi.connectedSSID;
$: selectedSSID = wifi.selectedSSID;
</script>

{#if !$isConnected}
	<NotConnected user={data.user} />
{:else if $robotState}
	<Stoprobot whatRunning="robot" />
{:else if $liveState}
	<Stoprobot whatRunning="livestream" />
{:else if $scanState}
	<Stoprobot whatRunning="scanner" />
{:else if $robotScanState}
	<Stoprobot whatRunning="robot scanner" />
{:else if $performing}
	<Stoprobot whatRunning="perform scan" />
{:else if $robotLive}
	<Stoprobot whatRunning="robot live" />
{:else if $stopCapture}
	<Stoprobot whatRunning="capture" />
{:else}
	<main
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 dark:from-gray-700 dark:to-gray-800"
	>
		<div
			class="container mx-auto rounded-2xl bg-white p-4 lg:mx-auto lg:w-10/12 lg:flex-row dark:bg-gray-900"
		>
			<Wifiheader {wifi} loading={$loading} />
			<Wifilist {wifi} wifiList={$wifiList} connectedSSID={$connectedSSID} selectedSSID={$selectedSSID}/>
			<Selectedssid {wifi} selectedSSID={$selectedSSID} wifiList={$wifiList} {showPassword}  loading={$loading} bindWifiPassword={wifi.password} />
		</div>
	</main>
{/if}
<Footer />
