<script lang="ts">
	import { page } from '$app/state';
	import { darkMode } from '$lib/stores/theme';
	import { isConnected, connect, disconnect, currentLink, robotName } from '$lib/stores/connection';
	import { addToast, confirmToast, removeToast } from '$lib/stores/toast';
	import { simpleMode } from '$lib/stores/mode';
	import { goto } from '$app/navigation';
	import RequestHandler from '$lib/utils/request';

	export let user: any = null;
	let isMenuOpen = false;
	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' },
		{ name: 'LOGS', path: '/logs' },
		{ name: 'ROBOT', path: '/robot' },
		{ name: 'MANAGE WIFI', path: '/wifi' }
	];

	function toggleDarkMode() {
		darkMode.set(!$darkMode);
		localStorage.setItem('darkMode', `${$darkMode}`);
	}
	function toggleSimpleMode() {
		simpleMode.set(!$simpleMode);
		localStorage.setItem('simpleMode', `${$simpleMode}`);
	}
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
	function closeMenu(goto_start = false) {
		isMenuOpen = false;
		if (goto_start) {
			goto('/');
		}
	}
	function handleConnection() {
		let toastID = addToast('Connecting to AGRI-BOT...', 'loading');
		if (!$isConnected) {
			robotName.set(user.prototypeID);
			currentLink.set(
				import.meta.env.VITE_ENV === 'production'
					? 'https://' + user.prototypeID + '.tail13df43.ts.net:8000'
					: import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000'
			);
			connect()
				.then(() => {
					removeToast(toastID);
					if ($isConnected) {
						addToast('Successfully connected to AGRI-BOT.', 'success', 3000);
					} else {
						addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
					}
				})
				.catch(() => {
					addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
				});
		} else {
			disconnect();
			removeToast(toastID);
			addToast('Disconnected from AGRI-BOT.', 'info', 3000);
		}
	}

	async function changePath(path: string) {
		await goto(path);
		closeMenu();
	}

	async function safeShutdown() {
		try {
			const confirmed = await confirmToast('Are you sure you want to safely shut down AGRI-BOT?');
			if (!confirmed) {
				addToast('Shutdown cancelled.', 'info', 3000);
				return;
			}

			disconnect();
			addToast('Disconnected from AGRI-BOT.', 'info', 3000);

			const toastID = addToast('Shutting down AGRI-BOT safely...', 'loading');
			const [success, _] = await RequestHandler.authFetch('shutdown', 'POST');
			removeToast(toastID);

			if (success) {
				addToast('AGRI-BOT is shutting down safely.', 'success', 4000);
			} else {
				addToast('Failed to shut down AGRI-BOT.', 'error', 4000);
			}
		} catch (err) {
			console.error(err);
			addToast('Shutdown request failed!', 'error', 4000);
		}
	}
</script>

<!-- ✅ NAVBAR -->
<nav
	class="fixed top-0 left-0 z-50 flex h-[50px] w-full items-center justify-between bg-white px-4 shadow-md dark:bg-gray-900"
>
	<div class="flex items-center space-x-3">
		<button class="flex items-center" on:click={() => closeMenu(true)}>
			<img src="/LOGO.ico" class="h-8 w-8" alt="AGRI-BOT Logo" />
			<span
				class="ml-2 text-lg font-bold text-gray-500 md:hidden lg:inline lg:text-2xl dark:text-gray-200"
			>
				AGRI-BOT STUDIO
			</span>
		</button>

		{#if user}
			<button
				class={`ml-2 rounded px-3 py-1 text-sm font-medium shadow-md transition-colors ${$isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
				on:click={handleConnection}
			>
				{$isConnected ? 'Connected' : 'Disconnected'}
			</button>

			{#if $isConnected}
				<button
					class="ml-2 rounded bg-yellow-500 px-3 py-1 text-sm font-medium text-white shadow-md transition-colors hover:bg-yellow-600"
					on:click={safeShutdown}
				>
					Safe Shutdown
				</button>
			{/if}
		{/if}
	</div>

	<!-- DESKTOP NAV -->
	<ul class="hidden items-center space-x-5 md:flex">
		{#if user}
			{#if $isConnected}
				{#each records as item}
					<li>
						<button
							on:click={() => changePath(item.path)}
							class="cursor-pointer font-medium hover:text-green-500 {page.url.pathname ===
							item.path
								? 'font-bold text-green-600'
								: 'text-gray-800 dark:text-gray-300'}"
						>
							{item.name}
						</button>
					</li>
				{/each}
			{:else}
				<li>
					<button
						on:click={() => changePath('/record')}
						class="cursor-pointer font-medium hover:text-green-500 {page.url.pathname === '/record'
							? 'font-bold text-green-600'
							: 'text-gray-800 dark:text-gray-300'}"
					>
						RECORDS
					</button>
				</li>
			{/if}
		{/if}

		<li>
			{#if user}
				<form method="POST" action="/api/user/logout">
					<button
						type="submit"
						class="rounded-lg bg-red-600 px-4 py-2 text-white shadow-md transition hover:bg-red-700"
					>
						Logout
					</button>
				</form>
			{:else}
				<a
					href="/login"
					class="rounded-lg bg-green-600 px-4 py-2 text-white shadow-md transition hover:bg-green-700"
				>
					Login / Register
				</a>
			{/if}
		</li>

		<li>
			<button
				on:click={toggleDarkMode}
				class="rounded bg-gray-200 p-2 dark:bg-gray-700 dark:text-white"
			>
				{$darkMode ? '☀️ Light' : '🌙 Dark'}
			</button>
		</li>

		<li>
			<button
				on:click={toggleSimpleMode}
				class="rounded bg-blue-200 p-2 dark:bg-blue-700 dark:text-white"
			>
				{$simpleMode ? '🪶 Simple' : '⚙ Full'}
			</button>
		</li>
	</ul>

	<!-- MOBILE MENU BUTTON -->
	<button class="text-2xl text-gray-800 md:hidden dark:text-gray-200" on:click={toggleMenu}>
		{isMenuOpen ? '✖' : '☰'}
	</button>
</nav>

<!-- ✅ MOBILE MENU -->
<div
	class={`fixed top-[50px] left-0 max-h-[calc(100vh-50px)] w-full overflow-y-auto border-t bg-white shadow-lg transition-transform duration-200 md:hidden dark:border-gray-700 dark:bg-gray-800 ${
		isMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
	} z-40`}
>
	<ul class="flex flex-col space-y-2 p-3 text-sm">
		{#if user && $isConnected}
			{#each records as item}
				<li>
					<button
						on:click={() => changePath(item.path)}
						class="block w-full rounded-lg px-4 py-2 text-center transition hover:bg-gray-100 dark:hover:bg-gray-700 {page
							.url.pathname === item.path
							? 'font-bold text-green-600'
							: 'text-gray-800 dark:text-gray-300'}"
					>
						{item.name}
					</button>
				</li>
			{/each}
		{/if}

		<li class="mt-2">
			{#if user}
				<form method="POST" action="/api/user/logout">
					<button
						type="submit"
						class="w-full rounded-lg bg-red-600 px-4 py-2 text-white shadow-md transition hover:bg-red-700"
					>
						Logout
					</button>
				</form>
			{:else}
				<a
					href="/login"
					class="w-full rounded-lg bg-green-600 px-4 py-2 text-white shadow-md transition hover:bg-green-700"
				>
					Login / Register
				</a>
			{/if}
		</li>

		<li class="mt-2 flex flex-col gap-2">
			<button
				on:click={toggleDarkMode}
				class="rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700 dark:text-white"
			>
				{$darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
			</button>
			<button
				on:click={toggleSimpleMode}
				class="rounded-lg bg-blue-200 px-4 py-2 dark:bg-blue-700 dark:text-white"
			>
				{$simpleMode ? '🪶 Simple Mode On' : '⚙ Full Mode'}
			</button>
		</li>
	</ul>
</div>
