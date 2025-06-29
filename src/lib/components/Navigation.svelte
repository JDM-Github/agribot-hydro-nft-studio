<script lang="ts">
	import { page } from '$app/state';
	import { darkMode } from '$lib/stores/theme';
	import { user, logout } from '$lib/stores/auth';
	import { isConnected, connect, disconnect, currentLink } from '$lib/stores/connection';
	import { addToast, removeToast } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	let isMenuOpen = false;

	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' }
	];

	function toggleDarkMode() {
		darkMode.set(!$darkMode);
		localStorage.setItem('darkMode', `${$darkMode}`);
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
	function closeMenu() {
		isMenuOpen = false;
	}
	function handleConnection() {
		let toastID = addToast('Connecting to AGRI-BOT...', 'loading');
		if (!$isConnected) {
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
		try {
			await fetch(`${currentLink}/stop_everything`, {
				method: 'POST'
			});
		} catch (e) {
			console.error('Failed to stop everything:', e);
		}
		await goto(path);
	}
</script>

<nav
	class="fixed top-0 left-0 z-50 flex max-h-[50px] min-h-[50px] w-full items-center justify-between bg-white p-4 shadow-md dark:bg-gray-900"
>
	<div class="flex items-center space-x-4">
		<img src="/LOGO.ico" class="h-8 w-8" alt="AGRI-BOT Logo" />
		<span
			class="text-lg font-bold text-gray-500 md:hidden lg:inline lg:text-2xl dark:text-gray-200"
		>
			AGRI-BOT STUDIO
		</span>
		<button
			class={`ml-2 rounded px-3 py-1 text-sm font-medium shadow-md transition-colors ${$isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
			onclick={handleConnection}
		>
			{$isConnected ? 'Connected' : 'Disconnected'}
		</button>
	</div>

	<ul class="hidden items-center space-x-6 md:flex">
		{#each records as item}
			<li>
				<button
					onclick={() => changePath(item.path)}
					class="font-medium hover:text-green-500 {page.url.pathname === item.path
						? 'font-bold text-green-600'
						: 'text-gray-800 dark:text-gray-300'} {$user ? '' : 'hidden'}"
				>
					{item.name}
				</button>
			</li>
		{/each}
		<li>
			{#if $user}
				<a
					href="/login"
					onclick={logout}
					class="block w-full rounded-lg bg-red-600 px-4 py-2 text-center font-medium text-white shadow-md transition hover:bg-red-700"
				>
					Logout
				</a>
			{:else}
				<a
					href="/login"
					onclick={closeMenu}
					class="block w-full rounded-lg bg-green-600 px-4 py-2 text-center font-medium text-white shadow-md transition hover:bg-green-700"
				>
					Login / Register
				</a>
			{/if}
		</li>
		<li>
			<button
				onclick={toggleDarkMode}
				class="rounded bg-gray-200 p-2 text-black dark:bg-gray-700 dark:text-white"
			>
				{$darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
			</button>
		</li>
	</ul>

	<button class="text-2xl text-gray-800 md:hidden dark:text-gray-200" onclick={toggleMenu}>
		{isMenuOpen ? '✖' : '☰'}
	</button>
</nav>

<div
	class={`fixed top-[49px] left-0 w-full transform border-t bg-white shadow-lg transition-transform duration-200 md:hidden dark:border-gray-700 dark:bg-gray-800 ${
		isMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
	} z-40`}
>
	<ul class="flex flex-col space-y-1 p-2 text-sm">
		{#each records as item}
			<li>
				<button
					onclick={() => {
						changePath(item.path);
						closeMenu();
					}}
					class="block w-full rounded-lg px-4 py-2 text-center transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 {page
						.url.pathname === item.path
						? 'font-bold text-green-600'
						: 'text-gray-800 dark:text-gray-300'}"
				>
					{item.name}
				</button>
			</li>
		{/each}

		<li class="mt-2">
			{#if $user}
				<a
					href="/login"
					onclick={logout}
					class="block w-full rounded-lg bg-red-600 px-4 py-2 text-center font-medium text-white shadow-md transition hover:bg-red-700"
				>
					Logout
				</a>
			{:else}
				<a
					href="/login"
					onclick={closeMenu}
					class="block w-full rounded-lg bg-green-600 px-4 py-2 text-center font-medium text-white shadow-md transition hover:bg-green-700"
				>
					Login / Register
				</a>
			{/if}
		</li>

		<li class="mt-2 flex justify-center">
			<button
				onclick={toggleDarkMode}
				class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-black transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
			>
				{$darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
			</button>
		</li>
	</ul>
</div>
