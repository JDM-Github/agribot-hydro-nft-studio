<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { deviceID, userData } from '$root/lib/stores/connection';
	import { writable, derived, type Writable } from 'svelte/store';
	import type { Notification } from "$lib/type";
	import { addToast, removeToast } from '$root/lib/stores/toast';
	import { saveToDB } from '$root/lib/utils/indexdb';
	import { goto } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';

	let notifications: Writable<Notification[]> = writable([]);
	userData.subscribe((user) => {
		if (!user) return;
		notifications.set(user.notifications || []);
	});

	let searchQuery = writable('');
	let sortOrder = writable<'asc' | 'desc'>('desc');
	let currentPage = writable(1);
	const itemsPerPage = 12;

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
			await fetch(`/api/notification/mark-read/${notif.id}`, { method: 'PUT' });
			notifications.update((recs: any) =>
				recs.map((n: any) => (n.id === notif.id ? { ...n, isRead: true } : n))
			);
		} catch (e) {
			console.error('Failed to mark as read', e);
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

	function getTypeColor(type: string) {
		switch (type) {
			case 'success':
				return 'green';
			case 'warning':
				return 'orange';
			case 'error':
				return 'red';
			case 'system':
				return 'gray';
			default:
				return 'blue';
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
	<div class="container mx-auto rounded-2xl bg-gray-200 p-4 dark:bg-gray-900">
		<div
			class="flex flex-col gap-2 rounded-xl border border-gray-200 bg-[#fafffc] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center gap-2">
				<span class="text-xl sm:text-2xl">🔔</span>
				<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
					NOTIFICATIONS
				</h2>
			</div>

			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search notifications..."
					class="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-48 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				/>
				<select
					bind:value={$sortOrder}
					class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:w-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				>
					<option value="desc">Sort: Newest First</option>
					<option value="asc">Sort: Oldest First</option>
				</select>

				<button
					on:click={forceNotifSync}
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
					disabled={notifSyncing}
				>
					{#if notifSyncing}
						<RefreshCw class="h-4 w-4 animate-spin" />
						<span>Syncing...</span>
					{:else}
						<RefreshCw class="h-4 w-4" />
						<span>Force Sync</span>
					{/if}
				</button>
			</div>
		</div>

		{#if $paginatedNotifications.length === 0}
			<p class="mt-3 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
				No notifications found.
			</p>
		{:else}
			<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each $paginatedNotifications as notif, index}
					<button
						class="flex cursor-pointer flex-col justify-between gap-2 rounded-xl border-l-4 p-4 shadow-sm hover:shadow-md
						{notif.isRead ? 'border-gray-200 dark:border-gray-700' : 'border-blue-500 dark:border-blue-400'}
					bg-gray-50 dark:bg-gray-800"
						on:click={() => showModal(notif)}
					>
						<div class="flex items-start gap-2">
							<div
								class="mt-1 h-3 w-3 rounded-full"
								style="background-color: {getTypeColor(notif.type)}"
							></div>
							<div class="flex-1">
								<div class="font-semibold {notif.isRead ? 'text-gray-500 dark:text-gray-300' : 'text-blue-600 dark:text-blue-400'}">
									{notif.title}
								</div>
								<div class="truncate text-sm text-gray-500 dark:text-gray-400">{notif.message}</div>
							</div>
						</div>
						<div class="mt-2 text-xs text-gray-400">{formatTime(notif.createdAt)}</div>
					</button>
				{/each}
			</div>
		{/if}

		{#if $filteredNotifications.length > itemsPerPage}
			<div class="mt-4 flex items-center justify-center gap-2">
				<button
					class="rounded-md bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
					on:click={() => goToPage($currentPage - 1)}
					disabled={$currentPage === 1}
				>
					← Prev
				</button>
				<span class="text-sm text-gray-700 dark:text-gray-300"
					>Page {$currentPage} of {$totalPages}</span
				>
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
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			on:click={closeModal}
		>
			<div
				class="w-96 max-w-full rounded-xl bg-white p-6 dark:bg-gray-800"
				on:click|stopPropagation
			>
				<div class="mb-3 flex items-center gap-2">
					<div
						class="h-3 w-3 rounded-full"
						style="background-color: {getTypeColor(modalNotification.type)}"
					></div>
					<h3 class="font-semibold text-gray-900 dark:text-gray-200">{modalNotification.title}</h3>
				</div>
				<p class="mb-2 text-gray-700 dark:text-gray-300">{modalNotification.message}</p>
				<div class="text-xs text-gray-400">{formatTime(modalNotification.createdAt)}</div>
				<button
					class="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
					on:click={closeModal}
				>
					Close
				</button>
			</div>
		</div>
	{/if}
</main>

<Footer />
