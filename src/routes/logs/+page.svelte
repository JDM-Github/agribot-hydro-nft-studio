<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import Footer from '$lib/components/Footer.svelte';
import { simpleMode } from '$lib/stores/mode';
import NotConnected from '$lib/components/NotConnected.svelte';
import { Connection, } from '$root/lib/class/connection.js';
import { writable, type Writable } from 'svelte/store';
	import { SocketService } from '$root/lib/socket';
export let data;

$: isConnected = Connection.isConnected();
$: nlogs = Connection.getAllLogs();
let filteredLogs: Writable<string[]> = writable([]);
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
	selectedLevel = localStorage.getItem('logs_selectedLevel') || 'ALL';
	searchQuery = localStorage.getItem('logs_searchQuery') || '';
	liveUpdates = localStorage.getItem('logs_liveUpdates') !== 'false';
	startTime = localStorage.getItem('logs_startTime') || '00:00';
	endTime = localStorage.getItem('logs_endTime') || '23:59';
	isAlreadyLoaded = true;
	filterLogs();
});
$: if ($simpleMode) {
	selectedLevel = 'ALL';
	scrollToBottom();
}

function onDateChange(newDate: string) {
	selectedDate = newDate;
	nlogs.set([]);
	if (SocketService.isConnected())
		SocketService.emit("set_log_date", { date: selectedDate });
}

let collapsedGroups: Record<string, boolean> = {};
const logLevels = [
	'ALL',
	'INFO',
	'SUCCESS',
	'WARNING',
	'ERROR',
	'DEBUG',
	'ROUTE',
	'INITIALIZE',
	'EVENT'
];
let stats = {
	INFO: 0,
	SUCCESS: 0,
	WARNING: 0,
	ERROR: 0,
	DEBUG: 0,
	ROUTE: 0,
	INITIALIZE: 0,
	EVENT: 0,
	TOTAL: 0
};
function scrollToBottom() {
	if (logContainer) {
		logContainer.scrollTo({
			top: logContainer.scrollHeight,
			behavior: 'smooth'
		});
	}
}

function saveSettings() {
	if (isAlreadyLoaded && typeof window !== 'undefined' && window.localStorage) {
		localStorage.setItem('logs_selectedLevel', selectedLevel);
		localStorage.setItem('logs_searchQuery', searchQuery);
		localStorage.setItem('logs_startTime', startTime);
		localStorage.setItem('logs_endTime', endTime);
		localStorage.setItem('logs_liveUpdates', String(liveUpdates));
	}
}

function getLogClass(line: string): string {
	if (line.includes('ERROR')) return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30';
	if (line.includes('WARNING')) return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30';
	if (line.includes('SUCCESS')) return 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30';
	if (line.includes('INFO')) return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30';
	if (line.includes('DEBUG')) return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30';
	if (line.includes('ROUTE')) return 'border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30';
	if (line.includes('INITIALIZE')) return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/30';
	if (line.includes('EVENT')) return 'border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30';
	return 'bg-white dark:bg-gray-800';
}

function groupLogs() {
	const groups: Record<string, string[]> = {};
	$filteredLogs.forEach((line) => {
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
	filteredLogs.set(
		$nlogs.filter((line) => {
			const matchesLevel = selectedLevel === 'ALL' || line.includes(`${selectedLevel}`);
			const matchesSearch =
				searchQuery.trim() === '' || line.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesTime = (() => {
				const match = line.match(/\b(\d{2}:\d{2}):\d{2}\b/);
				if (!match) return true;
				const logTime = match[1];
				return logTime >= startTime && logTime <= endTime;
			})();

			return matchesLevel && matchesSearch && matchesTime;
		})
	);
	saveSettings();
	setTimeout(() => {
		scrollToBottom();
	}, 100);
}

$: if($filteredLogs) {
	stats = {
		INFO: 0,
		SUCCESS: 0,
		WARNING: 0,
		ERROR: 0,
		DEBUG: 0,
		ROUTE: 0,
		INITIALIZE: 0,
		EVENT: 0,
		TOTAL: 0
	};

	$filteredLogs.forEach((line) => {
		if (line.includes('INFO')) stats.INFO++;
		if (line.includes('SUCCESS')) stats.SUCCESS++;
		if (line.includes('WARNING')) stats.WARNING++;
		if (line.includes('ERROR')) stats.ERROR++;
		if (line.includes('DEBUG')) stats.DEBUG++;
		if (line.includes('ROUTE')) stats.ROUTE++;
		if (line.includes('INITIALIZE')) stats.INITIALIZE++;
		if (line.includes('EVENT')) stats.EVENT++;
		stats.TOTAL++;
	});
}

function downloadLogs() {
	const plainTextLogs = $filteredLogs.map((line) => line.replace(/<[^>]*>/g, ''));
	const content = plainTextLogs.join('\n');
	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `logs_${selectedDate}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}

$: searchQuery, selectedLevel, startTime, endTime, filterLogs();
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
}

onMount(async () => {
	if (typeof document !== 'undefined') {
		document.addEventListener('keydown', handleKeydown);
	}
	nlogs.subscribe((logs) => {
		if (logs) {
			filterLogs();
			scrollToBottom();
		}
	})
});

onDestroy(() => {
	clearInterval(intervalId);
	if (typeof document !== 'undefined') {
		document.removeEventListener('keydown', handleKeydown);
	}
});
</script>

{#if !$isConnected}
	<NotConnected user={data.user}/>
{:else}
	<div
		class="relative flex min-h-[calc(100vh-95px)] flex-col bg-gray-200 p-4 ease-out lg:px-16 dark:bg-gray-700"
	>
		<div class="mx-auto w-11/12 rounded-xl bg-white p-4 shadow-lg md:flex-1 dark:bg-gray-900">

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

				{#if !$simpleMode}
					<div class="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-6">
						<div class="flex flex-col">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Date
							</label>
							<input
								type="date"
								on:change={(e: any) => onDateChange(e.target.value)}
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
								{#each logLevels as level}
									<option value={level}>{level}</option>
								{/each}
							</select>
						</div>

						<!-- Search filter -->
						<div class="flex flex-col">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
								Search
							</label>
							<input
								type="text"
								bind:value={searchQuery}
								title="Search logs by keywords"
								placeholder="Search logs..."
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Stats Panel -->
			{#if !$simpleMode}
				<div
					class="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
				>
					<strong>Log Stats:</strong>
					<span class="ml-2">Total: {stats.TOTAL}</span> |
					<span class="ml-2 text-green-500">INFO: {stats.INFO}</span> |
					<span class="ml-2 text-emerald-500">SUCCESS: {stats.SUCCESS}</span> |
					<span class="ml-2 text-yellow-500">WARNING: {stats.WARNING}</span> |
					<span class="ml-2 text-red-500">ERROR: {stats.ERROR}</span> |
					<span class="ml-2 text-blue-500">DEBUG: {stats.DEBUG}</span> |
					<span class="ml-2 text-cyan-500">ROUTE: {stats.ROUTE}</span> |
					<span class="ml-2 text-amber-500">INITIALIZE: {stats.INITIALIZE}</span> |
					<span class="ml-2 text-indigo-500">EVENT: {stats.EVENT}</span>
				</div>
			{/if}

			<!-- Log list -->
			<div
				bind:this={logContainer}
				class="mx-2 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-100 p-2 lg:max-h-[400px] dark:border-gray-700 dark:bg-gray-800"
			>
				<ul class="min-h-[350px] space-y-3">
					{#if $filteredLogs.length > 0}
						{#if $simpleMode}
							{#each $filteredLogs as line, index}
								<li
									class={`rounded-md p-2 text-sm text-gray-800 shadow-sm transition-all duration-300 ease-in-out dark:text-gray-200 ${getLogClass(line)}`}
								>
									<span class="w-12 text-xs text-gray-400 select-none">#{index + 1}</span>
									{@html line}
								</li>
							{/each}
						{:else}
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
													class={`log-line whitespace-pre-wrap rounded-md p-2 text-sm text-gray-800 shadow-sm transition-all duration-300 ease-in-out dark:text-gray-200 ${getLogClass(line)}`}
												>
													<span class="w-12 text-xs text-gray-400 select-none log-line">
														#{String(index + 1).padStart(3, "0")}
													</span>
													{@html line}
												</li>
											{/each}
										</ul>
									{/if}
								</li>
							{/each}
						{/if}
					{:else}
						<li class="text-gray-500 dark:text-gray-400">No logs available...</li>
					{/if}
				</ul>
			</div>
		</div>
	</div>
	<Footer />
{/if}
