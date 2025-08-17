<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let schedule: Writable<{
		frequency: string;
		runs: { time: string; upto: string }[];
		days: string[];
	}>;

	export let showScheduleModal = false;
	export let onClose;
	export let onSave;

	$: selectedDays = [...($schedule.days || [])];

	let errors: string[] = [];

	const toMinutes = (t: string) => {
		if (!t) return NaN;
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};

	const validateSchedule = () => {
		errors = [];
		const runs = [...($schedule.runs || [])];

		if (!runs.length) errors.push('Add at least one run.');

		runs.forEach((r, i) => {
			const s = toMinutes(r.time);
			const e = toMinutes(r.upto);

			if (isNaN(s) || isNaN(e)) {
				errors.push(`Run ${i + 1}: invalid time.`);
				return;
			}

			// Check 3AM–10PM limits
			if (s < toMinutes('03:00') || s > toMinutes('22:00')) {
				errors.push(`Run ${i + 1}: Start time must be between 03:00 and 22:00.`);
			}
			if (e < toMinutes('03:00') || e > toMinutes('22:00')) {
				errors.push(`Run ${i + 1}: Latest Start time must be between 03:00 and 22:00.`);
			}

			// End must be after start
			if (e <= s) {
				errors.push(`Run ${i + 1}: Latest Start must be AFTER Start.`);
			}
		});

		// Overlaps / duplicate starts
		const sorted = runs
			.map((r, i) => ({ i, start: toMinutes(r.time), end: toMinutes(r.upto) }))
			.sort((a, b) => a.start - b.start);

		for (let i = 1; i < sorted.length; i++) {
			const prev = sorted[i - 1];
			const curr = sorted[i];

			// same start time
			if (curr.start === prev.start) {
				errors.push(
					`Runs ${prev.i + 1} and ${curr.i + 1} have the same start time (${runs[prev.i].time}).`
				);
			}
			// overlap (curr starts before prev ends)
			if (curr.start < prev.end) {
				errors.push(
					`Runs ${prev.i + 1} (${runs[prev.i].time}–${runs[prev.i].upto}) and ${curr.i + 1} (${runs[curr.i].time}–${runs[curr.i].upto}) overlap.`
				);
			}
		}
		if (errors.length) return;
		onSave();
	};


	const toggleDay = (day: string) => {
		if (selectedDays.includes(day)) {
			selectedDays = selectedDays.filter((d) => d !== day);
		} else {
			selectedDays = [...selectedDays, day];
		}
		$schedule.days = selectedDays;
	};

	const validateUpto = (index: number) => {
		const run = $schedule.runs[index];
		if (run.upto <= run.time) {
			const [hour, minute] = run.time.split(':').map(Number);
			const newTime = new Date();
			newTime.setHours(hour + 1, minute);
			$schedule.runs[index].upto = newTime.toTimeString().slice(0, 5);
		}
	};

	const removeRun = (index: number) => {
		$schedule.runs = $schedule.runs.filter((_, i) => i !== index);
	};
</script>

{#if showScheduleModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div
			class="absolute w-[90vw] max-w-150 rounded-xl border border-gray-300 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<button
				class="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-300"
				on:click={() => onClose()}>✕</button
			>

			<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Set Schedule</h2>

			<form class="space-y-5 text-sm">
				<!-- Days -->
				<div>
					<h3 class="font-semibold text-gray-700 dark:text-gray-300">Select Days</h3>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
							<button
								type="button"
								on:click={() => toggleDay(day)}
								class="rounded-md px-3 py-1 text-sm text-white transition
									{selectedDays.includes(day)
									? 'bg-green-700 hover:bg-green-800'
									: 'bg-green-500 hover:bg-green-600'}">{day}</button
							>
						{/each}
					</div>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="font-semibold text-gray-800 dark:text-white">How Often</label>
					<select
						bind:value={$schedule.frequency}
						class="mt-1 w-full rounded-md border border-gray-500 p-2 text-gray-800 dark:bg-gray-800 dark:text-white"
					>
						<option value="weekly">Every Week</option>
						<option value="bi-weekly">Every 2 Weeks</option>
						<option value="tri-weekly">Every 3 Weeks</option>
						<option value="monthly">Every Month</option>
						<option value="bi-monthly">Every 2 Months</option>
						<option value="tri-monthly">Every 3 Months</option>
						<option value="semi-annual">Every 6 Months</option>
						<option value="yearly">Every Year</option>
					</select>
				</div>

				{#if errors.length}
					<div
						class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-200"
					>
						<ul class="list-disc space-y-1 pl-5">
							{#each errors as e}<li>{e}</li>{/each}
						</ul>
					</div>
				{/if}
				<div>
					<h3 class="font-semibold text-gray-700 dark:text-gray-300">Run Times</h3>
					<p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
						Add multiple runs for morning, afternoon, night.
					</p>

					<div class="mt-2 max-h-40 overflow-y-auto pr-1">
						{#each $schedule.runs as run, i}
							<div class="mb-2 flex items-center gap-2">
								<input
									type="time"
									bind:value={run.time}
									min="03:00"
									max="22:00"
									class="rounded-md border border-gray-500 p-2 text-gray-800 dark:bg-gray-800 dark:text-white"
								/>
								<input
									type="time"
									bind:value={run.upto}
									min="03:00"
									max="22:00"
									on:change={() => validateUpto(i)}
									class="rounded-md border border-gray-500 p-2 text-gray-800 dark:bg-gray-800 dark:text-white"
								/>
								<button
									type="button"
									on:click={() => removeRun(i)}
									class="px-2 py-1 text-red-600 hover:text-red-800"
								>
									✕
								</button>
							</div>
						{/each}
					</div>

					<button
						type="button"
						on:click={() => {
							$schedule = {
								...$schedule,
								runs: [...($schedule.runs || []), { time: '00:00', upto: '01:00' }]
							};
						}}
						class="mt-2 rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
					>
						+ Add Run
					</button>
				</div>

				<!-- Save -->
				<button
					type="button"
					on:click={validateSchedule}
					class="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white shadow-md transition hover:bg-green-700"
				>
					Save Schedule
				</button>
			</form>
		</div>
	</div>
{/if}
