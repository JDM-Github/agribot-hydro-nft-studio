<script lang="ts">
	let servoHorizontal = 0;
	let servoVertical = 0;

	function adjustServo(axis: string, angle: number) {
		// Placeholder function for adjusting servo
		console.log(`Adjusting ${axis} servo to ${angle}°`);
		if (axis === 'horizontal') {
			servoHorizontal = angle;
		} else {
			servoVertical = angle;
		}
	}
</script>

<div class="mt-6 flex flex-col gap-4">
	<!-- Servo Horizontal -->
	<div class="flex items-center gap-3">
		<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-400">
			Servo Horizontal
		</label>
		<input
			type="range"
			min="0"
			max="180"
			class="flex-1 accent-blue-500"
			bind:value={servoHorizontal}
			on:input={(e: any) => adjustServo('horizontal', e.target.value)}
		/>
		<input
			type="number"
			min="0"
			max="180"
			class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800"
			bind:value={servoHorizontal}
		/>
	</div>

	<!-- Servo Vertical -->
	<div class="flex items-center gap-3">
		<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-400">
			Servo Vertical
		</label>
		<input
			type="range"
			min="0"
			max="180"
			class="flex-1 accent-blue-500"
			bind:value={servoVertical}
			on:input={(e: any) => adjustServo('vertical', e.target.value)}
		/>
		<input
			type="number"
			min="0"
			max="180"
			class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800"
			bind:value={servoVertical}
		/>
	</div>

	<!-- Quick Control Buttons -->
	<div class="mt-4 flex flex-wrap gap-2">
		<button
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
			on:click={() => adjustServo('vertical', 180)}
		>
			LOOK UP
		</button>

		<button
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
			on:click={() => adjustServo('vertical', 0)}
		>
			LOOK DOWN
		</button>

		<button
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
			on:click={() => adjustServo('horizontal', 0)}
		>
			LOOK LEFT
		</button>

		<button
			class="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
			on:click={() => adjustServo('horizontal', 180)}
		>
			LOOK RIGHT
		</button>

		<button
			class="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300"
			on:click={() => {
				adjustServo('horizontal', 90);
				adjustServo('vertical', 90);
			}}
		>
			CENTER
		</button>
	</div>
</div>
