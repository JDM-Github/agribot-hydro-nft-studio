<script>
    import { onMount } from "svelte";
    import RequestHandler from "$lib/utils/request";

    let tcrtLeft = false;
    let tcrtRight = false;

    async function fetchTCRT() {
        try {
            const [success, response] = await RequestHandler.authFetch("tcrt", "POST");
            if (success && response) {
                tcrtLeft = response.left;
                tcrtRight = response.right;
            }
        } catch (err) {
            console.error("Failed to fetch TCRT sensor data:", err);
        }
    }

    onMount(() => {
        fetchTCRT();
        const interval = setInterval(fetchTCRT, 500);
        return () => clearInterval(interval);
    });
</script>


<div
	class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
	<h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">TCRT5000</h4>
	<div class="flex justify-between gap-3">
		<!-- Left Sensor -->
		<div class="flex flex-1 flex-col items-center">
			<span class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Left</span>
			<div
				class="h-10 w-full rounded-lg border transition-all"
				style="background-color: {!tcrtLeft ? '#000000' : '#ffffff'};
                                            border-color: {!tcrtLeft ? '#aaa' : '#666'};"
			></div>
		</div>

		<!-- Right Sensor -->
		<div class="flex flex-1 flex-col items-center">
			<span class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Right</span>
			<div
				class="h-10 w-full rounded-lg border transition-all"
				style="background-color: {!tcrtRight ? '#000000' : '#ffffff'};
                                        border-color: {!tcrtRight ? '#333333' : '#cccccc'};"
			></div>
		</div>
	</div>
</div>
