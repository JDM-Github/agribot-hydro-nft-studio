<script lang="ts">
	import TermsAndCondition from '$lib/modal/TermsAndCondition.svelte';
	import { Connection } from '../class/connection';
	import RequestHandler from '../utils/request';

	$: isConnected = Connection.isConnected();
	let termsOpen = false;
	let devModalOpen = false;

	let tapCount = 0;
	let tapTimer: string | number | NodeJS.Timeout | undefined;
	let version = '1.0.0';

	function handleVersionClick() {
		tapCount++;
		clearTimeout(tapTimer);
		tapTimer = setTimeout(() => (tapCount = 0), 1000);

		if (tapCount >= 5) {
			tapCount = 0;
			devModalOpen = true;
		}
	}

	function toggleLiveProduction() {
		RequestHandler.isLiveUrl = !RequestHandler.isLiveUrl;
		alert(`Switched to ${RequestHandler.isLiveUrl ? 'Production Live URL' : 'Temporary Live URL'}`);
	}

	async function clearDB() {
		return new Promise<void>((resolve, reject) => {
			const deleteRequest = indexedDB.deleteDatabase('myAppDB');
			deleteRequest.onsuccess = () => resolve();
			deleteRequest.onerror = (e) => reject(e);
			deleteRequest.onblocked = () => console.warn('DB deletion blocked');
		});
	}

	function logout() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/api/user/logout';
		document.body.appendChild(form);
		form.submit();
	}

	async function resetDBAndLogout() {
		const confirmReset = confirm('This will clear all local data and log you out. Continue?');
		if (!confirmReset) return;

		try {
			await clearDB();
			logout();
		} catch (err) {
			console.error('Failed to clear DB:', err);
			alert('DB clear failed');
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

{#if devModalOpen}
	<div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
		<div class="bg-gray-800 text-white p-6 rounded-lg w-80 flex flex-col gap-4">
			<h2 class="text-lg font-bold">Developer Options</h2>
			<p>Current URL: {RequestHandler.isLiveUrl ? 'Production Live' : 'Temporary Live'}</p>
			<button
				on:click={toggleLiveProduction}
				class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
			>
				Toggle Live/Production
			</button>
			<button
				on:click={resetDBAndLogout}
				class="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
			>
				Reset DB & Logout
			</button>
			<button
				on:click={() => (devModalOpen = false)}
				class="mt-2 text-gray-300 hover:text-white"
			>
				Close
			</button>
		</div>
	</div>
{/if}
