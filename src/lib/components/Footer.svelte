<script lang="ts">
	import TermsAndCondition from '$lib/modal/TermsAndCondition.svelte';
	import { Connection } from '../class/connection';
	import RequestHandler from '../utils/request';

	$: isConnected = Connection.isConnected();
	let termsOpen = false;

	let tapCount = 0;
	let tapTimer: string | number | NodeJS.Timeout | undefined;
	let version = '1.0.0';

	function handleVersionClick() {
		tapCount++;
		clearTimeout(tapTimer);
		tapTimer = setTimeout(() => (tapCount = 0), 1000);

		if (tapCount >= 5) {
			tapCount = 0;
			openDevModal();
		}
	}

	function openDevModal() {
		const toggle = confirm(
			`Developer Options:\n\nUse Production Live URL?\nCurrently: ${
				RequestHandler.isLiveUrl ? 'ON' : 'OFF'
			}`
		);
		if (toggle) {
			RequestHandler.isLiveUrl = !RequestHandler.isLiveUrl;
			alert(
				`Switched to ${RequestHandler.isLiveUrl ? 'Production Live URL' : 'Temporary Live URL'}`
			);
		}
	}
</script>

<footer class="max-h-[50px] min-h-[50px] bg-gray-900 py-6 text-gray-400">
	<div class="container mx-auto flex flex-col items-center justify-between text-sm md:flex-row">
		<p>&copy; {new Date().getFullYear()} AGRIBOT. All Rights Reserved.</p>
		<button
			class="mt-2 cursor-pointer text-center text-sm text-gray-500"
			on:click={handleVersionClick}
		>
			Version {version}
		</button>
		<div class="flex gap-4">
			{#if $isConnected}
				<a href="/" class="hover:text-green-400">Setup</a>
				<a href="/live" class="hover:text-green-400">Live</a>
				<a href="/records" class="hover:text-green-400">Records</a>
				<a href="/notification" class="hover:text-green-400">Notifications</a>
				<a href="/robot" class="hover:text-green-400">Robot</a>
				<a href="/wifi" class="hover:text-green-400">Manage Wifi</a>
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
