<script>
	import TermsAndCondition from '$lib/modal/TermsAndCondition.svelte';
	import { isConnected } from '$lib/stores/connection';
	let termsOpen = false;
</script>

<footer class="max-h-[50px] min-h-[50px] bg-gray-900 py-6 text-gray-400">
	<div class="container mx-auto flex flex-col items-center justify-between text-sm md:flex-row">
		<p>&copy; {2025} AGRIBOT. All Rights Reserved.</p>
		<div class="flex gap-4">
			{#if $isConnected}
				<a href="/" class="hover:text-green-400">Setup</a>
				<a href="/live" class="hover:text-green-400">Live</a>
				<a href="/records" class="hover:text-green-400">Records</a>
			{/if}
			<button on:click={() => (termsOpen = true)} class="hover:text-green-400">
				Terms & Conditions
			</button>
		</div>
	</div>
</footer>

{#if termsOpen}
	<TermsAndCondition closeTerms={() => (termsOpen = false)} />
{/if}
