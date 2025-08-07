<script lang="ts">
    import { onMount } from "svelte";
    import RequestHandler from "$lib/utils/request";

    let ultrasonicDistance: number = 0;

    async function fetchUltrasonicDistance() {
        try {
            const [success, response] = await RequestHandler.authFetch("/ultrasonic", "GET");
            if (success && response) {
                ultrasonicDistance = response.quick_distance ?? response.last_distance ?? 0;
            }
        } catch (error) {
            console.error("Failed to fetch ultrasonic data:", error);
        }
    }

    // onMount(() => {
    //     fetchUltrasonicDistance();
    //     const interval = setInterval(fetchUltrasonicDistance, 3000);
    //     return () => clearInterval(interval);
    // });
</script>

<div
    class="col-span-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        ULTRASONIC DISTANCE
    </h4>
    <p class="text-lg font-bold text-gray-800 dark:text-gray-100">
        {ultrasonicDistance} cm
    </p>
    <div
        class="mt-2 h-3 rounded-full bg-green-500 transition-all duration-300"
        style="width:{Math.min(ultrasonicDistance, 100)}%"
    ></div>
</div>
