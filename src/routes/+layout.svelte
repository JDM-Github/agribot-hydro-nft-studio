<script lang="ts">
	import '../app.css';
	let { data, children } = $props();
	import Navigation from '$lib/components/Navigation.svelte';
	import Toast from '$lib/components/ToastContainer.svelte';
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>
<svelte:body class:dark={data.isDarkMode} />

<Toast />
<main class="bg-white pt-16 dark:bg-gray-800">
	<Navigation user={data.user} />
	{@render children()}
</main>
