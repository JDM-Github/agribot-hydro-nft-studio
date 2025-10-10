<script>
import { Connection } from '$root/lib/class/connection.js';
	import Footer from '$root/lib/components/Footer.svelte';
import NotConnected from '$root/lib/components/NotConnected.svelte';
	import Stoprobot from './spray/stoprobot.svelte';
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
</script>

{#if $isConnected}
	<NotConnected user={data.user}/>
{:else if $robotState}
    <Stoprobot whatRunning="robot"/>
	<Footer />
{:else if $liveState}
    <Stoprobot whatRunning="livestream"/>
	<Footer />
{:else if $scanState}
    <Stoprobot whatRunning="scanner" />
	<Footer />
{:else if $robotScanState}
    <Stoprobot whatRunning="robot scanner" />
	<Footer />
{:else if $performing}
	<Stoprobot whatRunning="perform scan" />
	<Footer />
{:else if $robotLive}
	<Stoprobot whatRunning="robot live" />
	<Footer />
{:else if $stopCapture}
	<Stoprobot whatRunning="capture" />
	<Footer />
{:else}
	<NotConnected user={data.user}/>
{/if}
