<script lang="ts">
	export let schedule: {frequency: string, time: string, runsPerDay: number};
	export let oldSchedule;
	export let showScheduleModal = false;
	export let onClose;
	const submitSchedule = () => {
		alert(
			`Schedule set for: ${schedule.frequency} at ${schedule.time} with ${schedule.runsPerDay} runs per day.`
		);
		onClose();
	};
</script>

{#if showScheduleModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
		<div class="absolute w-[90vw] max-w-150 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
			<button
				class="absolute top-4 right-4 text-gray-600 hover:text-red-600 dark:text-gray-300"
				on:click={() => {
					schedule = { ...oldSchedule }
					onClose();
				}}
			>
				✕
			</button>
			<h2 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Set Schedule</h2>
			<form class="space-y-4">
				<div class="flex flex-col space-y-2">
					<label for="frequency" class="text-sm font-semibold text-gray-800 dark:text-white"
						>Frequency</label
					>
					<select
						id="frequency"
						bind:value={schedule.frequency}
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-white"
					>
						<option value="daily">Everyday</option>
						<option value="weekly">Every Week</option>
						<option value="bi-weekly">Every 2 Weeks</option>
						<option value="monthly">Every Month</option>
						<option value="yearly">Every Year</option>
					</select>
				</div>

				<div class="flex flex-col space-y-2">
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

				<div class="flex flex-col space-y-2">
					<label for="runs-per-day" class="text-sm font-semibold text-gray-800 dark:text-white"
						>Runs Per Day</label
					>
					<input
						type="number"
						id="runs-per-day"
						bind:value={schedule.runsPerDay}
						min="1"
						class="rounded-md border border-gray-500 p-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-white"
					/>
				</div>

				<button
					type="button"
					on:click={submitSchedule}
					class="w-full rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-green-800"
				>
					Save Schedule
				</button>
			</form>
		</div>
	</div>
{/if}
