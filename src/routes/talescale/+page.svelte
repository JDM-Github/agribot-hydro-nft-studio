<script>
	import NotConnected from '$root/lib/components/NotConnected.svelte';
	import { isConnected } from '$root/lib/stores/connection';
	export let data;
</script>

{#if $isConnected}
	<main
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
	></main>
{:else}
	<NotConnected user={data.user}/>
{/if}
