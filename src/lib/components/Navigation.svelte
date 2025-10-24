<script lang="ts">
    import { page } from '$app/state';
    import { darkMode } from '$lib/stores/theme';
    import {
        needSync,
        syncNeededItems,
        deviceID,
        userData
    } from '$lib/stores/connection';
    import { addToast, confirmToast, removeToast } from '$lib/stores/toast';
    import { simpleMode } from '$lib/stores/mode';
    import { goto } from '$app/navigation';
    import RequestHandler from '$lib/utils/request';
    import { RefreshCw } from 'lucide-svelte';
    import { saveToDB } from '../utils/indexdb';
    import { writable } from 'svelte/store';
    import { Connection } from '$class/connection';
    import { SocketService } from '../socket';
	import { all_pages } from '../all_page';
	import { onDestroy } from 'svelte';

    export let user: any = null;
    let isMenuOpen = false;
    const records = [
        { name: 'HOME', path: '/tailscale' },
        { name: 'SETUP', path: '/' },
        { name: 'LIVE', path: '/live' },
        { name: 'RECORDS', path: '/record' },
        { name: 'LOGS', path: '/logs' },
        { name: 'NOTIFICATIONS', path: '/notification' },
        { name: 'ROBOT', path: '/robot' },
        { name: 'MANAGE WIFI', path: '/wifi' }
    ];

    $: conn = Connection.isConnected();
    $: isConnected = $conn;
	$: if (isConnected) {
		const pageKey = all_pages[page.url.pathname];
		if (pageKey) {
			SocketService.emit("page_enter", {id: SocketService.id(), page: pageKey});
		}
	}

    let numberOfUnread = writable(0);
    userData.subscribe((user) => {
		if (!user) return;
		numberOfUnread.set((user.notifications || []).filter((d: any) => {
            return !d.isRead
        }).length);
	});

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

        if (!isConnected) {
            Connection.init();
            Connection.connect();

            const unsubscribe = conn.subscribe((connected) => {
                if (connected) {
                    removeToast(toastID);
                    addToast('Successfully connected to AGRI-BOT.', 'success', 3000);
                    unsubscribe();
                }
            });

            setTimeout(() => {
                if (!isConnected) {
                    removeToast(toastID);
                    addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
                    unsubscribe();
                }
            }, 5000);
        } else {
            Connection.disconnect();
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
            Connection.disconnect();
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

    let pressTimer: any;
    let isPressLong = writable(false);
    function handleMouseDown() {
        isPressLong.set(false);
        pressTimer = setTimeout(() => {
            isPressLong.set(true);
            pressTimer = null;
        }, 800);
    }

    function handleMouseUp() {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
        if ($isPressLong) { syncData(true); } else { syncData(false); }
        isPressLong.set(false);
    }

    const syncData = async (force = false) => {
        const toastId = addToast(force ? 'Force syncing data...' : 'Syncing data...', 'loading');
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    force: force,
                    deviceID: $deviceID,
                    userData: $userData
                }),
                credentials: 'same-origin'
            });
            const response = await res.json();
            removeToast(toastId);
            if (res.ok && response.success) {
                await saveToDB('userData', response.data);
                addToast('Sync successful!', 'success', 3000);
                await goto('/', { invalidateAll: true });
            } else {
                addToast('Syncing error.', 'error', 3000);
            }
        } catch (error) {
            removeToast(toastId);
            console.error('Sync error:', error);
            addToast(`An unexpected error occurred. ${error}`, 'error', 3000);
        }
        try {
            const response = await RequestHandler.fetchData('POST', 'user/check-update-flags', {
                id: $userData?.user.id,
                deviceID: $deviceID
            });
            if (response.success && response.needsSync) {
                needSync.set(true);
                syncNeededItems.set(response.updateNeeded || []);
            } else {
                needSync.set(false);
                syncNeededItems.set([]);
            }
        } catch (err) {
            console.error('Failed to check sync flags:', err);
        }
    };
</script>

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
                class={`ml-2 rounded px-3 py-1 text-sm font-medium shadow-md transition-colors ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                on:click={handleConnection}
            >
                {isConnected ? 'Connected' : 'Disconnected'}
            </button>

            {#if isConnected}
                <button
                    class="ml-2 rounded bg-yellow-500 px-3 py-1 text-sm font-medium text-white shadow-md transition-colors hover:bg-yellow-600"
                    on:click={safeShutdown}
                >
                    Safe Shutdown
                </button>
            {/if}
        {/if}
    </div>

    <ul class="hidden items-center space-x-5 md:flex">
        <li class="group relative">
            <button
                aria-label="Refetch"
                on:mousedown={handleMouseDown}
                on:mouseup={handleMouseUp}
                class="flex cursor-pointer items-center gap-1 font-medium text-gray-800 hover:text-green-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300"
            >
                <RefreshCw class="h-5 w-5" />
                {#if $needSync}
                    <span class="animate-pulse text-sm">Sync required</span>
                {/if}

                {#if $isPressLong}
                    <span class="ml-2 animate-pulse text-xs font-semibold text-green-500"> Force Sync… </span>
                {/if}

                {#if !$needSync && !$isPressLong}
                    <span class="text-sm">Sync</span>
                {/if}
            </button>

            {#if $needSync}
                <div
                    class="pointer-events-none invisible absolute left-1/2 mt-2 w-max max-w-xs -translate-x-1/2 rounded-md bg-gray-800 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
                >
                    <p class="mb-1 font-semibold">Needs Update:</p>
                    <ul class="list-inside list-disc space-y-0.5">
                        {#each $syncNeededItems as item}
                            <li>{item}</li>
                        {/each}
                    </ul>
                    <p class="mt-2 text-gray-400 italic">💡 Hold button for force sync</p>
                </div>
            {/if}
        </li>

        {#if user}
            {#if isConnected}
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
                        on:click={() => changePath('/tailscale')}
                        class="cursor-pointer font-medium hover:text-green-500 {page.url.pathname ===
                        '/tailscale'
                            ? 'font-bold text-green-600'
                            : 'text-gray-800 dark:text-gray-300'}"
                    >
                        HOME
                    </button>
                </li>
                <li>
                    <button
                        on:click={() => changePath('/')}
                        class="cursor-pointer font-medium hover:text-green-500 {page.url.pathname === '/'
                            ? 'font-bold text-green-600'
                            : 'text-gray-800 dark:text-gray-300'}"
                    >
                        SETUP
                    </button>
                </li>
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
                <li class="relative">
                    <button
                        on:click={() => changePath('/notification')}
                        class="relative cursor-pointer font-medium hover:text-green-500
                            {page.url.pathname === '/notification'
                                ? 'font-bold text-green-600'
                                : 'text-gray-800 dark:text-gray-300'}"
                    >
                        <span>NOTIFICATIONS</span>

                        {#if $numberOfUnread > 0}
                            <span
                                class="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                            >
                                {$numberOfUnread}
                            </span>
                        {/if}
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
        {#if user && isConnected}
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
