<script lang="ts">
	import { addToast } from '$lib/stores/toast';
	import RequestHandler from '$lib/utils/request';

	export let scanning = false;
	export let isRobotRunning: boolean;
	let servoHorizontal = 90;
	let servoVertical = 165;

	async function adjustServo(axis: string, angle: number) {
		if (axis === 'horizontal') {
			servoHorizontal = angle;
		} else {
			servoVertical = angle;
		}

		const target = axis === 'horizontal' ? 'lr' : 'td';
		try {
			const [success, response] = await RequestHandler.authFetch(
				`servo/${target}/${angle}`,
				'POST'
			);

			if (!success) {
				addToast(`Failed to adjust servo: ${response?.message || 'Unknown error'}`, 'error', 4000);
			}
		} catch (err: any) {
			console.error('Servo request error:', err);
			addToast(`Network error: ${err.message}`, 'error', 4000);
		}
	}
</script>

<div class="mt-6 flex flex-col gap-4">
	<div class="flex items-center gap-3">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-400">
			Servo Horizontal
		</label>
		<input
			disabled={scanning || isRobotRunning}
			type="range"
			min="0"
			max="180"
			class="flex-1 accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			bind:value={servoHorizontal}
			on:change={(e: any) => adjustServo('horizontal', e.target.value)}
		/>
		<input
			disabled={scanning || isRobotRunning}
			type="number"
			min="0"
			max="180"
			class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			bind:value={servoHorizontal}
			on:keydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					adjustServo('horizontal', servoHorizontal);
				}
			}}
		/>
	</div>

	<div class="flex items-center gap-3">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-400">
			Servo Vertical
		</label>
		<input
			disabled={scanning || isRobotRunning}
			type="range"
			min="100"
			max="180"
			class="flex-1 accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			bind:value={servoVertical}
			on:change={(e: any) => adjustServo('vertical', e.target.value)}
		/>
		<input
			disabled={scanning || isRobotRunning}
			type="number"
			min="100"
			max="180"
			class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			bind:value={servoVertical}
			on:keydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					adjustServo('vertical', servoVertical);
				}
			}}
		/>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		<button
			disabled={scanning || isRobotRunning}
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			on:click={() => adjustServo('vertical', 180)}
		>
			LOOK UP
		</button>

		<button
			disabled={scanning || isRobotRunning}
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			on:click={() => adjustServo('vertical', 100)}
		>
			LOOK DOWN
		</button>

		<button
			disabled={scanning || isRobotRunning}
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			on:click={() => adjustServo('horizontal', 45)}
		>
			LOOK LEFT
		</button>

		<button
			disabled={scanning || isRobotRunning}
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			on:click={() => adjustServo('horizontal', 135)}
		>
			LOOK RIGHT
		</button>

		<button
			disabled={scanning || isRobotRunning}
			class="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-30"
			on:click={() => {
				adjustServo('horizontal', 90);
				adjustServo('vertical', 165);
			}}
		>
			CENTER
		</button>
	</div>
</div>
