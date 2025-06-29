<script lang="ts">
	export let schedule: { frequency: string; time: string; days: string[] };
	export let oldSchedule: any = {};
	export let showScheduleModal = false;
	export let onClose;
	export let onSave;

	let selectedDays: string[] = [...(schedule.days || [])];

	const toggleDay = (day: string) => {
		if (selectedDays.includes(day)) {
			selectedDays = selectedDays.filter((d) => d !== day);
		} else {
			selectedDays = [...selectedDays, day];
		}
		schedule.days = selectedDays;
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
					schedule = { ...oldSchedule };
					onClose();
				}}
			>
				✕
			</button>

			<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Set Schedule</h2>
			<form class="space-y-4">
				<!-- Day Selection -->
				<div class="mt-4">
					<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Select Days</h3>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
							<button
								type="button"
								on:click={() => toggleDay(day)}
								class="relative flex items-center gap-2 rounded-md px-3 py-1 text-sm text-white lg:text-base
									{selectedDays.includes(day)
									? 'bg-green-700 hover:bg-green-800'
									: 'bg-green-500 hover:bg-green-600'}"
							>
								{day}
							</button>
						{/each}
					</div>
				</div>

				<!-- Frequency -->
				<div class="flex flex-col space-y-2">
					<label for="frequency" class="text-sm font-semibold text-gray-800 dark:text-white"
						>Frequency</label
					>
					<select
						id="frequency"
						bind:value={schedule.frequency}
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
					<label for="time" class="text-sm font-semibold text-gray-800 dark:text-white"
						>Time of Day</label
					>
					<input
						type="time"
						id="time"
						bind:value={schedule.time}
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
					/>
				</div>

				<!-- Save -->
				<button
					type="button"
					on:click={onSave}
					class="w-full rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-green-800"
				>
					Save Schedule
				</button>
			</form>
		</div>
	</div>
{/if}
