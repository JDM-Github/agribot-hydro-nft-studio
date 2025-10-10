<script lang="ts">
	export let connected: boolean;
	export let scanState: boolean;
	export let robotState: number;
	export let robotScanState: boolean;
	export let liveState: number;
	export let performing: boolean;
	export let robotLive: boolean;
	export let stopCapture: boolean;

	export let liveFrameURL: string;
	export let simpleMode: boolean = false;
</script>

<div class="relative w-full flex flex-col items-center">
	<div class="relative flex h-max min-h-[400px] w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
		{#if connected && !scanState && !robotState && !robotScanState && liveState && !robotLive}
			{#if !liveFrameURL}
				{#if simpleMode}
					<span class="text-base font-medium text-gray-700 dark:text-gray-300">
						📷 RUNNING
					</span>
				{:else}
					<p class="text-lg font-semibold text-gray-700 dark:text-gray-300">📷 RUNNING</p>
				{/if}
			{:else}
				<img
					src={liveFrameURL}
					alt="Scanning Feed"
					class={simpleMode
						? 'max-h-[400px] w-full object-contain sm:max-h-[400px] rounded-md dark:border dark:border-gray-600'
						: 'h-full max-h-[400px] max-w-[400px] rounded-md object-contain dark:border dark:border-gray-600'}
				/>
			{/if}

			{#if stopCapture}
				<div class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md z-10">
					<span class="text-white text-lg font-semibold animate-pulse">⏳ Loading...</span>
				</div>
			{/if}
		{:else if simpleMode}
			<div class="flex h-max w-full flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
				<p class="text-base font-semibold text-gray-700 sm:text-lg dark:text-gray-300">
					📷 Camera Feed
				</p>
			</div>
		{:else}
			<p class="text-lg font-semibold text-gray-700 dark:text-gray-300">📷 Camera Feed</p>
		{/if}
	</div>

	{#if performing}
		<div class="mt-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
			⚡ Performing scan...
		</div>
	{/if}
</div>
