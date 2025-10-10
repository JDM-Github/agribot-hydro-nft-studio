<script lang="ts">
	import { Connection } from "$root/lib/class/connection";

    export let isActive: boolean;
    $: rgbSensor = Connection.getTCS34725();
</script>

<div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
>
    <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">RGB SENSOR</h4>
    {#if isActive}
    <div
        class="mx-auto h-14 w-14 rounded-full border shadow-inner"
        style="background-color: rgb({$rgbSensor.normalized.r},{$rgbSensor.normalized.g},{$rgbSensor.normalized.b})"
    ></div>
    {:else}
    <div
        class="mx-auto h-14 w-14 rounded-full border shadow-inner bg-gray-500"
    ></div>
    {/if}
    <p class="mt-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        R:{$rgbSensor.normalized.r} &nbsp; G:{$rgbSensor.normalized.g} &nbsp; B:{$rgbSensor.normalized.b}
    </p>
    <p class="mt-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
        Detected: {$rgbSensor.color_name}
    </p>
</div>
