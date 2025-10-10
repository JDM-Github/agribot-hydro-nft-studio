<script lang="ts">
	import gsap from "gsap";
	import { onMount, tick } from "svelte";
	import Footer from '$lib/components/Footer.svelte';
	import { deviceID, userData } from '$root/lib/stores/connection';
	import { writable, derived, type Writable } from 'svelte/store';
	import type { Notification } from "$lib/type";
	import { addToast, removeToast } from '$root/lib/stores/toast';
	import { saveToDB } from '$root/lib/utils/indexdb';
	import { goto } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';
	import RequestHandler from '$root/lib/utils/request';

	let notifications: Writable<Notification[]> = writable([]);
	let currentPage = writable(1);
	let lastPage = writable(1);

	userData.subscribe((user) => {
		if (!user) return;
		notifications.set(user.notifications || []);
		currentPage.set($lastPage);
		lastPage.set(1);
	});
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


	onMount(() => {
		animateNotifications();

		const allHeader = document.querySelectorAll('.header');
		if (!allHeader.length) return;
		gsap.fromTo(
			allHeader,
			{ opacity: 0, y: 80 },
			{
				opacity: 1,
				y: 0,
				stagger: 0,
				duration: 0.5,
				ease: "power2.out"
			}
		);
	});

	$: if ($paginatedNotifications.length) {
		animateNotifications(true);
	}

	function animateNotifications(fast: boolean = false) {
		const allNotification = document.querySelectorAll('.notif-item');
		if (!allNotification.length) return;

		gsap.fromTo(
			allNotification,
			{ opacity: 0, y: 80 },
			{
				opacity: 1,
				y: 0,
				stagger: 0.1,
				duration: fast ? 0.3 : 0.8,
				ease: "power2.out"
			}
		);
	}
	$: if (modalVisible) {
		animateModalOpen();
	}
	async function animateModalOpen() {
		await tick();
		const modal = document.querySelector(".modal-open");
		const overlay = document.querySelector(".modal-overlay");

		if (!modal || !overlay) return;
		gsap.set([overlay, modal], { clearProps: "all" });
		gsap.fromTo(
			overlay,
			{ opacity: 0, backdropFilter: "blur(0px)" },
			{
				opacity: 1,
				backdropFilter: "blur(4px)",
				duration: 0.35,
				ease: "power2.out",
			}
		);

		gsap.fromTo(
			modal,
			{ opacity: 0, y: 80, scale: 0.1 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.2,
				delay: 0.05,
				ease: "back.out(1.7)",
			}
		);
	}

</script>

<main
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gradient-to-b from-gray-200 to-gray-300 p-4 ease-out lg:px-16 dark:from-gray-700 dark:to-gray-800 "
>
	<div class="container mx-auto max-w-7xl rounded-2xl bg-gray-100 p-4 dark:bg-gray-900">
		<div
			class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-[#fafffc] p-3 dark:border-gray-700 dark:bg-gray-800 header"
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
			<p class="mt-4 py-6 text-center text-base text-gray-600 dark:text-gray-400">
				No notifications found.
			</p>
		{:else}
			<div class="mt-4 flex flex-col divide-y divide-gray-200 dark:divide-gray-700 ">
				{#each $paginatedNotifications as notif}
					<button
						class="w-full text-left px-4 py-3 transition hover:bg-gray-200 dark:hover:bg-gray-700 notif-item
						{notif.isRead 
							? 'bg-gray-50 dark:bg-gray-800' 
							: 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/30'}"
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
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 modal-overlay"
			on:click={closeModal}
		>
			<div
				class="w-80 max-w-full rounded-lg bg-white p-5 dark:bg-gray-800 modal-open"
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

