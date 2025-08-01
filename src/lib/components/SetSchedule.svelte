<script lang="ts">
	import type { Writable } from 'svelte/store';
	export let schedule: Writable<{ frequency: string; time: string; upto: string; days: string[] }>;
	export let showScheduleModal = false;
	export let onClose;
	export let onSave;

	$: selectedDays = [...($schedule.days || [])];

	const toggleDay = (day: string) => {
		if (selectedDays.includes(day)) {
			selectedDays = selectedDays.filter((d) => d !== day);
		} else {
			selectedDays = [...selectedDays, day];
		}
		$schedule.days = selectedDays;
	};

	// Ensure 'upto' is in the future
	const validateUpto = () => {
		if ($schedule.upto <= $schedule.time) {
			const [hour, minute] = $schedule.time.split(':').map(Number);
			const newTime = new Date();
			newTime.setHours(hour + 1, minute); // set at least 1 hour later
			$schedule.upto = newTime.toTimeString().slice(0, 5);
		}
	};
</script>

{#if showScheduleModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div
			class="absolute w-[90vw] max-w-150 rounded-xl border border-gray-300 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
		>
			<button
				class="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-300"
				on:click={() => {
					onClose();
				}}
			>
				✕
			</button>

			<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Set Schedule</h2>
			<form class="space-y-4">
				<!-- Days Selection -->
				<div class="mt-4">
					<h3
						class="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300"
					>
						Select Days
						<span
							class="cursor-help text-gray-500 dark:text-gray-300"
							title="Choose the days when the robot should be allowed to run. You can select multiple days."
							>ℹ️</span
						>
					</h3>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
							<button
								type="button"
								on:click={() => toggleDay(day)}
								class="relative flex items-center gap-2 rounded-md px-3 py-1 text-sm text-white lg:text-base
								{selectedDays.includes(day)
									? 'bg-green-900 hover:bg-green-900'
									: 'bg-green-500 hover:bg-green-700'}"
							>
								{day}
							</button>
						{/each}
					</div>
				</div>

				<!-- Frequency -->
				<div class="flex flex-col space-y-2">
					<label
						for="frequency"
						class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white"
					>
						Frequency
						<span
							class="cursor-help text-gray-500 dark:text-gray-300"
							title="How often the robot should repeat this schedule.
- Weekly: Every week
- Bi-Weekly: Every 2 weeks
- Tri-Weekly: Every 3 weeks
- Monthly: Every month
- Bi-Monthly: Every 2 months
- Tri-Monthly: Every 3 months
- Semi-Annual: Every 6 months
- Yearly: Once every year">ℹ️</span
						>
					</label>
					<select
						id="frequency"
						bind:value={$schedule.frequency}
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-white"
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

				<!-- Time -->
				<div class="mt-4 flex flex-col space-y-2">
					<label
						for="time"
						class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white"
					>
						Start Time
						<span
							class="cursor-help text-gray-500 dark:text-gray-300"
							title="The preferred time of day for the robot to start operating.">ℹ️</span
						>
					</label>
					<input
						type="time"
						id="time"
						bind:value={$schedule.time}
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
					/>
				</div>

				<!-- Upto Time -->
				<div class="mt-4 flex flex-col space-y-2">
					<label
						for="upto"
						class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white"
					>
						Upto Time
						<span
							class="cursor-help text-gray-500 dark:text-gray-300"
							title="This is the latest time the robot is allowed to start.
If the robot missed the exact start time (e.g., due to charging), it can still start anytime before this cutoff window."
							>ℹ️</span
						>
					</label>
					<input
						type="time"
						id="upto"
						bind:value={$schedule.upto}
						on:change={validateUpto}
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
					/>
				</div>

				<!-- Save -->
				<button
					type="button"
					on:click={onSave}
					class="w-full rounded-md bg-green-500 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-green-700"
				>
					Save Schedule
				</button>
			</form>
		</div>
	</div>
{/if}
