<script lang="ts">
	import { goto } from "$app/navigation";
	import { LiveStreamState, RobotState } from "$root/lib/enum";
	export let controlLivestream: (action: string) => void;
	export let connected: boolean;
	export let scanState: boolean;
	export let robotState: number;
	export let robotScanState: boolean;
	export let liveState: number;
	export let performing: boolean;
	export let robotLive: boolean;
	export let stopCapture: boolean;
</script>

<button
	class="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
	on:click={() => controlLivestream('Run')}
	disabled={!connected || scanState || robotState !== RobotState.STOPPED || robotScanState || liveState === LiveStreamState.RUNNING || robotLive || performing || stopCapture}
>
	{liveState === LiveStreamState.PAUSED ? "Resume Livestream" : "Run Livestream"}
</button>

<button
	class="rounded-lg bg-gray-600 px-5 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
	on:click={() => controlLivestream('Pause')}
	disabled={!connected || scanState || robotState !== RobotState.STOPPED || robotScanState || liveState !== LiveStreamState.RUNNING || robotLive || performing || stopCapture}
>
	Pause
</button>

<button
	class="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
	on:click={() => controlLivestream('Stop')}
	disabled={!connected || scanState || robotState !== RobotState.STOPPED || robotScanState || liveState === LiveStreamState.STOPPED || robotLive || performing || stopCapture}
>
	Stop
</button>
<button
	on:click={() => {
		const today = new Date();
		const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${today.getFullYear()}`;
		goto(`/folder/${todayDate}`);
	}}
	disabled={!connected || scanState || robotState !== RobotState.STOPPED || robotScanState || robotLive || performing || stopCapture}
	class="rounded-lg bg-green-500 px-5 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
>
	View Today Records
</button>
