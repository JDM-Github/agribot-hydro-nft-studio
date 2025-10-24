<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { deviceID, userData } from '$root/lib/stores/connection';
	import { writable, derived, type Writable } from 'svelte/store';
	import type { Notification } from '$lib/type';
	import { addToast, removeToast } from '$root/lib/stores/toast';
	import { saveToDB } from '$root/lib/utils/indexdb';
	import { goto } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';
	import RequestHandler from '$root/lib/utils/request';
	import { fade, fly } from 'svelte/transition';

	let notifications: Writable<Notification[]> = writable([]);
	let currentPage = writable(1);
	let lastPage = writable(1);

	const unsubscribe = userData.subscribe((user) => {
		if (!user) return;
		notifications.set(user.notifications || []);
		currentPage.set($lastPage);
		lastPage.set(1);
	});
	onDestroy(unsubscribe);

	let searchQuery = writable('');
	let sortOrder = writable<'asc' | 'desc'>('desc');
	const itemsPerPage = 6;

	const filteredNotifications = derived(
		[notifications, searchQuery],
		([$notifications, $searchQuery]: [any, any]) => {
			const query = $searchQuery.toLowerCase();
			return $notifications.filter(
				(n: any) =>
					(n.title ?? '').toLowerCase().includes(query) ||
					(n.message ?? '').toLowerCase().includes(query)
			);
		}
	);

	const sortedNotifications = derived(
		[filteredNotifications, sortOrder],
		([$filteredNotifications, $sortOrder]) => {
			currentPage.set(1);
			return [...$filteredNotifications].sort((a, b) => {
				if ($sortOrder === 'asc')
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				else return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});
		}
	);

	const paginatedNotifications = derived(
		[sortedNotifications, currentPage],
		([$sortedNotifications, $currentPage]) => {
			const start = ($currentPage - 1) * itemsPerPage;
			const end = start + itemsPerPage;
			return $sortedNotifications.slice(start, end);
		}
	);

	const totalPages = derived(sortedNotifications, ($sortedNotifications) =>
		Math.ceil($sortedNotifications.length / itemsPerPage)
	);

	function goToPage(page: number) {
		currentPage.set(page);
	}

	let modalVisible = false;
	let modalNotification: any = null;

	function showModal(notif: any) {
		modalNotification = notif;
		modalVisible = true;
		if (!notif.isRead) markAsRead(notif);
	}

	function closeModal() {
		modalVisible = false;
		modalNotification = null;
	}

	async function markAsRead(notif: any) {
		if (notif.isRead) return;
		try {
			const response = await RequestHandler.fetchData('post', 'notification/mark-read', {
				id: $userData.user.id,
				notifId: notif.id,
				deviceID: deviceID
			});
			if (response.success) {
				lastPage.set($currentPage);
				$userData.notifications = $userData.notifications.map((n: any) =>
					n.id === notif.id ? { ...n, isRead: true } : n
				);
				await saveToDB('userData', $userData, false);
			} else {
				addToast(response.message || 'Failed to mark notification as read.', 'error', 3000);
			}
		} catch (err) {
			addToast('An unexpected error occurred.', 'error', 3000);
			console.error('saveConfig error:', err);
		}
	}

	function formatTime(timestamp: string) {
		try {
			const dt = new Date(timestamp);
			return dt.toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return timestamp;
		}
	}

	let notifSyncing = false;
	async function forceNotifSync() {
		notifSyncing = true;
		const toastId = addToast('Force syncing notifications folder...', 'loading');
		try {
			const res = await fetch('/api/custom-sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userData: $userData,
					deviceID: $deviceID,
					willUpdateNotifications: true
				})
			});
			const response = await res.json();
			removeToast(toastId);
			if (res.ok && response.success) {
				await saveToDB('userData', response.data);
				addToast('Force sync of notifications folder is successful!', 'success', 3000);
				await goto('/notification', { invalidateAll: true });
			} else {
				addToast('Force sync of notifications folder failed..', 'error', 3000);
			}
		} catch (error) {
			removeToast(toastId);
			addToast(`An unexpected error occurred. ${error}`, 'error', 3000);
		}

		notifSyncing = false;
	}
</script>

<main
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800"
>
	<div class="container mx-auto max-w-7xl rounded-2xl bg-gray-100 p-4 dark:bg-gray-900">
		<div
			class="header flex flex-col gap-3 rounded-lg border border-gray-200 bg-[#fafffc] p-3 dark:border-gray-700 dark:bg-gray-800"
			in:fly={{ y: -10, duration: 250, opacity: 0 }}
		>
			<div class="flex items-center gap-2">
				<span class="text-xl">🔔</span>
				<h2 class="text-base font-bold text-gray-500 dark:text-gray-300">NOTIFICATIONS</h2>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search notifications..."
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				/>
				<select
					bind:value={$sortOrder}
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>

				<button
					on:click={forceNotifSync}
					class="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
					disabled={notifSyncing}
				>
					{#if notifSyncing}
						<RefreshCw class="h-4 w-4 animate-spin" />
						<span>Syncing</span>
					{:else}
						<RefreshCw class="h-4 w-4" />
						<span>Sync</span>
					{/if}
				</button>
			</div>
		</div>

		{#if $paginatedNotifications.length === 0}
			<p
				class="mt-4 py-6 text-center text-base text-gray-600 dark:text-gray-400"
				out:fly={{ duration: 250, opacity: 0 }}
			>
				No notifications found.
			</p>
		{:else}
			<div
				class="mt-4 flex h-[400px] max-h-[400px] flex-col divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700"
			>
				{#each $paginatedNotifications as notif, i (notif.id)}
					<button
						class="notif-item w-full px-4 py-3 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700
						{notif.isRead
							? 'bg-gray-50 dark:bg-gray-800'
							: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30'}"
						in:fly={{ y: 10, duration: 250, delay: i * 100, opacity: 0 }}
						on:click={() => showModal(notif)}
					>
						<div class="flex items-center justify-between">
							<h3
								class="truncate text-[15px] font-semibold
								{notif.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-blue-700 dark:text-blue-300'}"
							>
								{notif.title}
							</h3>
							<span class="text-[12px] text-gray-400">{formatTime(notif.createdAt)}</span>
						</div>
						<p
							class="truncate text-[13px] leading-snug
							{notif.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}"
						>
							{notif.message}
						</p>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if $filteredNotifications.length > itemsPerPage}
			<div
				class="sticky bottom-0 mt-4 flex items-center justify-center gap-3 border-t border-gray-300 bg-gray-100 py-2 dark:border-gray-700 dark:bg-gray-900"
			>
				<button
					class="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					on:click={() => goToPage($currentPage - 1)}
					disabled={$currentPage === 1}
				>
					← Prev
				</button>
				<span class="text-sm text-gray-700 dark:text-gray-300">
					Page {$currentPage} of {$totalPages}
				</span>
				<button
					class="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					on:click={() => goToPage($currentPage + 1)}
					disabled={$currentPage === $totalPages}
				>
					Next →
				</button>
			</div>
		{/if}
	</div>

	{#if modalVisible && modalNotification}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			transition:fade={{ duration: 200 }}
			on:click={closeModal}
		>
			<div
				class="modal-open w-80 max-w-full rounded-lg bg-white p-5 dark:bg-gray-800"
				transition:fly={{ y: 30, duration: 250, opacity: 0 }}
				on:click|stopPropagation
			>
				<div class="mb-2 flex items-center justify-between">
					<h3 class="text-[15px] font-semibold text-gray-900 dark:text-gray-200">
						{modalNotification.title}
					</h3>
					<span class="text-xs text-gray-400">{formatTime(modalNotification.createdAt)}</span>
				</div>
				<p class="mb-3 text-[13px] text-gray-700 dark:text-gray-300">{modalNotification.message}</p>
				<button
					class="w-full rounded-md bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600"
					on:click={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</main>

<Footer />
