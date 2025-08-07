<script lang="ts">
	import { addToast, removeToast } from "$lib/stores/toast";
	import RequestHandler from "$lib/utils/request";

	let activeToastId: string | null = null;
	let isMoving = false;
	let speed = 60; // Default speed
	let tempSpeed = speed; // Temporary speed value while sliding

	async function sendCommand(action: string, value: number | null = null) {
		let endpoint = value !== null ? `/drive/${action}?speed=${value}` : `/drive/${action}`;
		try {
			const [success, response] = await RequestHandler.authFetch(endpoint, 'POST');

			if (!success) {
				let errorMessage = response?.message || 'Unknown error';
				addToast(`Failed to ${action} robot: ${errorMessage}`, 'error', 4000);
				console.error(`Failed to ${action} robot:`, errorMessage);
			}
		} catch (err: any) {
			addToast(`Network error: ${err.message}`, 'error', 4000);
			console.error('Network error while controlling robot:', err);
		}
	}

	async function startMoving(action: string) {
		if (isMoving) return;
		isMoving = true;

		const actionLabel =
			action === 'forward' ? 'Moving Forward' :
			action === 'left' ? 'Turning Left' :
			action === 'right' ? 'Turning Right' : 'Moving';

		activeToastId = addToast(`${actionLabel} at ${speed}% speed...`, 'loading');

		await sendCommand(action, speed);
	}

	async function stopMoving() {
		if (!isMoving) return;
		isMoving = false;

		if (activeToastId) {
			removeToast(activeToastId);
			activeToastId = null;
		}

		await sendCommand('stop');
	}

	// Update speed without toast
	function handleSpeedInput(value: number) {
		tempSpeed = value;
	}

	// Commit speed on release with toast
	async function handleSpeedCommit() {
		speed = tempSpeed;
		addToast(`Speed set to ${speed}%`, 'info', 1200);
	}
</script>

<div class="mt-2 grid w-full grid-cols-2 gap-2 rounded-2xl bg-gray-200 p-4 dark:bg-gray-900 shadow-lg">
	<button
		class="col-span-2 w-full rounded-lg bg-green-600 py-3 font-semibold text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
		on:mousedown={() => startMoving('forward')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('forward')}
		on:touchend={stopMoving}
	>
		FORWARD
	</button>

	<button
		class="w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
		on:mousedown={() => startMoving('left')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('left')}
		on:touchend={stopMoving}
	>
		LEFT
	</button>

	<button
		class="w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
		on:mousedown={() => startMoving('right')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('right')}
		on:touchend={stopMoving}
	>
		RIGHT
	</button>
</div>

<div class="flex items-center gap-4 mt-4 bg-gray-200 dark:bg-gray-900 p-3 rounded-2xl shadow-md">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-300">
		Speed Control
	</label>

	<input
		type="range"
		min="0"
		max="100"
		class="flex-1 accent-green-600 cursor-pointer"
		bind:value={tempSpeed}
		on:input={(e: any) => handleSpeedInput(+e.target.value)}
		on:change={handleSpeedCommit}
		on:mouseup={handleSpeedCommit}
		on:touchend={handleSpeedCommit}
	/>

	<input
		type="number"
		min="0"
		max="100"
		class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800"
		bind:value={tempSpeed}
		on:change={(e: any) => handleSpeedCommit()}
	/>
</div>
