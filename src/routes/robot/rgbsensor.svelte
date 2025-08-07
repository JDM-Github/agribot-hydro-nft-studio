<script lang="ts">
    import { onMount } from "svelte";
    import RequestHandler from "$lib/utils/request";

    let rgb = { r: 0, g: 0, b: 0 };
    let detectedColor = "UNKNOWN";

    async function fetchRGB() {
        try {
            const [success, response] = await RequestHandler.authFetch("/rgb-sensor", "GET");
            if (success && response) {
                rgb = response.normalized || { r: 0, g: 0, b: 0 };
                detectedColor = response.color_name || "UNKNOWN";
            }
        } catch (err) {
            console.error("Failed to fetch RGB sensor data:", err);
        }
    }

    // onMount(() => {
    //     fetchRGB();
    //     const interval = setInterval(fetchRGB, 1000);
    //     return () => clearInterval(interval);
    // });
</script>

<div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
    <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">RGB SENSOR</h4>
    <div
        class="mx-auto h-14 w-14 rounded-full border shadow-inner"
        style="background-color: rgb({rgb.r},{rgb.g},{rgb.b})"
    ></div>
    <p class="mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        R:{rgb.r} &nbsp; G:{rgb.g} &nbsp; B:{rgb.b}
    </p>
    <p class="mt-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
        Detected: {detectedColor}
    </p>
</div>
