<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import Footer from '$lib/components/Footer.svelte';
	import RequestHandler from '$lib/utils/request';

	let logs: string[] = [];
	let filteredLogs: string[] = [];
	let intervalId: any;
	let logContainer: HTMLDivElement;

	let selectedDate: string = new Date().toISOString().split('T')[0];
	let selectedLevel: string = 'ALL';
	let searchQuery: string = '';
	let liveUpdates: boolean = true;
	let startTime: string = '00:00';
	let endTime: string = '23:59';
	let isAlreadyLoaded = false;

	onMount(() => {
		selectedDate =
			localStorage.getItem('logs_selectedDate') || new Date().toISOString().split('T')[0];
		selectedLevel = localStorage.getItem('logs_selectedLevel') || 'ALL';
		searchQuery = localStorage.getItem('logs_searchQuery') || '';
		liveUpdates = localStorage.getItem('logs_liveUpdates') !== 'false';
		startTime = localStorage.getItem('logs_startTime') || '00:00';
		endTime = localStorage.getItem('logs_endTime') || '23:59';
		isAlreadyLoaded = true;
		filterLogs();
	});
	let collapsedGroups: Record<string, boolean> = {};

	let stats = { INFO: 0, WARNING: 0, DEBUG: 0, ERROR: 0, TOTAL: 0 };
	let showErrorAlert = false;
	let lastErrorCount = 0;

	function isUserNearBottom(): boolean {
		if (!logContainer) return false;
		const threshold = 50;
		return (
			logContainer.scrollHeight - logContainer.scrollTop - logContainer.clientHeight <= threshold
		);
	}

	function scrollToBottom() {
		if (logContainer) {
			logContainer.scrollTo({
				top: logContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	async function fetchLogs() {
		try {
			const [success, data] = await RequestHandler.authFetch(
				`get-logs?date=${selectedDate}`,
				'GET'
			);
			if (success) {
				const oldLength = logs.length;
				const newLogs = data.logs;

				if (newLogs.length !== oldLength) {
					logs = newLogs;
					filterLogs();
					updateStats();
					checkNewErrors();
					await tick();

					if (isUserNearBottom()) {
						scrollToBottom();
					}
				}
			}
		} catch (error) {
			console.error('Failed to fetch logs:', error);
		}
	}

	function saveSettings() {
		if (isAlreadyLoaded && typeof window !== 'undefined' && window.localStorage) {
			localStorage.setItem('logs_selectedDate', selectedDate);
			localStorage.setItem('logs_selectedLevel', selectedLevel);
			localStorage.setItem('logs_searchQuery', searchQuery);
			localStorage.setItem('logs_startTime', startTime);
			localStorage.setItem('logs_endTime', endTime);
			localStorage.setItem('logs_liveUpdates', String(liveUpdates));
		}
	}

	function getLogClass(line: string): string {
		if (line.includes('[ERROR]')) return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30';
		if (line.includes('[WARNING]'))
			return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30';
		if (line.includes('[DEBUG]'))
			return 'border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-900/30';
		if (line.includes('[INFO]')) return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30';
		return 'bg-white dark:bg-gray-800';
	}

	function groupLogs() {
		const groups: Record<string, string[]> = {};
		filteredLogs.forEach((line) => {
			const match = line.match(/(\d{4}-\d{2}-\d{2}\s\d{2})/);
			const key = match ? match[1] : 'Other';
			if (!groups[key]) groups[key] = [];
			groups[key].push(line);
		});
		return groups;
	}

	function toggleGroup(key: string) {
		collapsedGroups[key] = !collapsedGroups[key];
	}

	function filterLogs() {
		filteredLogs = logs.filter((line) => {
			const matchesLevel = selectedLevel === 'ALL' || line.includes(`[${selectedLevel}]`);
			const matchesSearch =
				searchQuery.trim() === '' || line.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesTime = (() => {
				const match = line.match(/\b(\d{2}:\d{2}):\d{2}\b/);
				if (!match) return true;

				const logTime = match[1];
				return logTime >= startTime && logTime <= endTime;
			})();

			return matchesLevel && matchesSearch && matchesTime;
		});
		updateStats();
		saveSettings();
	}

	function updateStats() {
		stats = { INFO: 0, WARNING: 0, DEBUG: 0, ERROR: 0, TOTAL: 0 };
		filteredLogs.forEach((line) => {
			if (line.includes('[INFO]')) stats.INFO++;
			if (line.includes('[WARNING]')) stats.WARNING++;
			if (line.includes('[DEBUG]')) stats.DEBUG++;
			if (line.includes('[ERROR]')) stats.ERROR++;
			stats.TOTAL++;
		});
	}

	function checkNewErrors() {
		const currentErrorCount = filteredLogs.filter((l) => l.includes('[ERROR]')).length;
		if (currentErrorCount > lastErrorCount) {
			showErrorAlert = true;
			setTimeout(() => (showErrorAlert = false), 4000);
		}
		lastErrorCount = currentErrorCount;
	}

	function downloadLogs() {
		const plainTextLogs = filteredLogs.map((line) => line.replace(/<[^>]*>/g, ''));
		const content = plainTextLogs.join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `logs_${selectedDate}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	$: fetchLogs();
	$: logs, searchQuery, selectedLevel, startTime, endTime, filterLogs();

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey && e.key === 'f') {
			e.preventDefault();
			const searchInput = document.querySelector<HTMLInputElement>(
				'input[placeholder="Search logs..."]'
			);
			searchInput?.focus();
		}
		if (e.ctrlKey && e.key === 'ArrowDown') {
			e.preventDefault();
			scrollToBottom();
		}
		if (e.ctrlKey && e.key === 'p') {
			e.preventDefault();
			toggleLiveUpdates();
		}
	}

	function toggleLiveUpdates() {
		liveUpdates = !liveUpdates;
		if (liveUpdates) {
			intervalId = setInterval(fetchLogs, 1000);
		} else {
			clearInterval(intervalId);
		}
	}

	onMount(async () => {
		if (typeof document !== 'undefined') {
			document.addEventListener('keydown', handleKeydown);
		}
		fetchLogs();
		if (liveUpdates) {
			intervalId = setInterval(fetchLogs, 1000);
		}
	});

	onDestroy(() => {
		clearInterval(intervalId);
		if (typeof document !== 'undefined') {
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<div
	class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
>
	<div class="mx-auto w-11/12 rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">
		<!-- 🔴 Error Alert Banner -->
		{#if showErrorAlert}
			<div class="mb-3 animate-pulse rounded-lg bg-red-500 p-3 font-semibold text-white shadow-md">
				🚨 New ERROR logs detected!
			</div>
		{/if}

		<!-- Header -->
		<div
			class="relative mb-3 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-[#fafffc] p-3 dark:border-gray-700 dark:bg-gray-900"
		>
			<div class="flex items-center justify-between gap-2">
				<!-- Left: Title -->
				<div class="flex items-center gap-2">
					<span class="text-xl sm:text-2xl">🌿</span>
					<h2 class="text-base font-bold text-gray-400 sm:text-lg dark:text-gray-300">
						LOG VIEWER
					</h2>
				</div>

				<!-- Right: Action Buttons -->
				<div class="flex gap-4">
					<!-- Live Updates -->
					<div class="flex flex-col items-center">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
							Live Updates
						</label>
						<button
							on:click={toggleLiveUpdates}
							title="Toggle live updates"
							class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
						>
							{liveUpdates ? 'Pause' : 'Live'}
						</button>
					</div>

					<!-- Download Logs -->
					<div class="flex flex-col items-center">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
							Download
						</label>
						<button
							on:click={downloadLogs}
							title="Download all displayed logs as a file"
							class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 focus:ring-2 focus:ring-purple-400 focus:outline-none"
						>
							Download Logs
						</button>
					</div>

					<!-- Scroll to Latest -->
					<div class="flex flex-col items-center">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
							Scroll
						</label>
						<button
							on:click={scrollToBottom}
							title="Scroll down to the most recent logs"
							class="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
						>
							Latest Logs
						</button>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<div class="flex flex-col">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400"> Date </label>
					<input
						type="date"
						bind:value={selectedDate}
						title="Select a specific date"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
					/>
				</div>

				<!-- Time range: Start -->
				<div class="flex flex-col">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
						Start Time
					</label>
					<input
						type="time"
						bind:value={startTime}
						title="Start time filter"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
					/>
				</div>

				<!-- Time range: End -->
				<div class="flex flex-col">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
						End Time
					</label>
					<input
						type="time"
						bind:value={endTime}
						title="End time filter"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
					/>
				</div>

				<!-- Log level filter -->
				<div class="flex flex-col">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
						Log Level
					</label>
					<select
						bind:value={selectedLevel}
						title="Filter by log severity level"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
					>
						<option value="ALL">All</option>
						<option value="INFO">INFO</option>
						<option value="WARNING">WARNING</option>
						<option value="DEBUG">DEBUG</option>
						<option value="ERROR">ERROR</option>
					</select>
				</div>

				<!-- Search filter -->
				<div class="flex flex-col">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400"> Search </label>
					<input
						type="text"
						bind:value={searchQuery}
						title="Search logs by keywords"
						placeholder="Search logs..."
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
					/>
				</div>
			</div>
		</div>

		<!-- Stats Panel -->
		<div
			class="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
		>
			<strong>Log Stats:</strong>
			<span class="ml-2">Total: {stats.TOTAL}</span> |
			<span class="ml-2 text-blue-500">INFO: {stats.INFO}</span> |
			<span class="ml-2 text-yellow-500">WARNING: {stats.WARNING}</span> |
			<span class="ml-2 text-gray-500">DEBUG: {stats.DEBUG}</span> |
			<span class="ml-2 text-red-500">ERROR: {stats.ERROR}</span>
		</div>

		<!-- Log list -->
		<div
			bind:this={logContainer}
			class="mx-2 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 lg:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
		>
			<ul class="min-h-[350px] space-y-3">
				{#if filteredLogs.length > 0}
					{#each Object.entries(groupLogs()) as [group, lines]}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<li
							class="rounded-md border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
						>
							<div
								class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								on:click={() => toggleGroup(group)}
							>
								<span>{group}: ({lines.length} logs)</span>
								<span>{collapsedGroups[group] ? '>' : '▼'}</span>
							</div>

							{#if !collapsedGroups[group]}
								<ul class="space-y-1 px-2 pb-2">
									{#each lines as line, index}
										<li
											class={`rounded-md p-2 text-sm text-gray-800 shadow-sm transition-all duration-300 ease-in-out dark:text-gray-200 ${getLogClass(line)}`}
										>
											<span class="w-12 text-xs text-gray-400 select-none">#{index + 1}</span>
											{@html line}
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				{:else}
					<li class="text-gray-500 dark:text-gray-400">No logs available...</li>
				{/if}
			</ul>
		</div>
	</div>
</div>
<Footer />
