<script lang="ts">
	import { addToast, removeToast } from '$lib/stores/toast';
	import RequestHandler from '$lib/utils/request';
	import { onMount, onDestroy } from 'svelte';

	export let scanning = false;
	export let enableWASDinControl = false;
	let activeToastId: string | null = null;
	let isMoving = false;
	let speed = 60;
	let tempSpeed = speed;

	export let isRobotRunning: boolean;

	function handleKeyDown(e: KeyboardEvent) {
		if (!enableWASDinControl || isMoving) return;

		switch (e.key.toLowerCase()) {
			case 'w':
				startMoving('forward');
				break;
			case 'a':
				startMoving('left');
				break;
			case 'd':
				startMoving('right');
				break;
			case 's':
				startMoving('backward');
				break;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (!enableWASDinControl) return;

		if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
			stopMoving();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
	});

	async function sendCommand(action: string, value: number | null = null) {
		let endpoint = value !== null ? `drive/${action}?speed=${value}` : `/drive/${action}`;
		try {
			const [success, response, status] = await RequestHandler.authFetch(endpoint, 'POST');

			if (!success) {
				let errorMessage = response?.message || 'Unknown error';

				if (status === 409 && action === 'forward') {
					addToast(`⛔ Movement blocked: ${errorMessage}`, 'error', 4000);
					isMoving = false;
					if (activeToastId) {
						removeToast(activeToastId);
						activeToastId = null;
					}
					return;
				}

				addToast(`Failed to ${action} robot: ${errorMessage}`, 'error', 4000);
				console.error(`Failed to ${action} robot:`, errorMessage);
			}
		} catch (err: any) {
			addToast(`Network error: ${err.message}`, 'error', 4000);
			console.error('Network error while controlling robot:', err);
		}
	}

	async function startMoving(action: string) {
		if (isMoving && isRobotRunning) return;
		isMoving = true;

		const actionLabel =
			action === 'forward'
				? 'Moving Forward'
				: action === 'left'
					? 'Turning Left'
					: action === 'right'
						? 'Turning Right'
						: 'Moving';

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

	function handleSpeedInput(value: number) {
		tempSpeed = value;
	}
	async function handleSpeedCommit() {
		if (speed === tempSpeed) return;
		speed = tempSpeed;
		addToast(`Speed set to ${speed}%`, 'info', 1200);
	}
</script>

<div
	class="mt-2 grid w-full grid-cols-2 gap-2 rounded-2xl bg-gray-200 p-4 shadow-lg dark:bg-gray-900"
>
	<button
		class="col-span-2 w-full rounded-lg bg-green-600 py-3 font-semibold text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
		disabled={scanning || isRobotRunning}
		on:mousedown={() => startMoving('forward')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('forward')}
		on:touchend={stopMoving}
	>
		FORWARD
	</button>

	<button
		class="w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
		disabled={scanning || isRobotRunning}
		on:mousedown={() => startMoving('left')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('left')}
		on:touchend={stopMoving}
	>
		LEFT
	</button>

	<button
		class="w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
		disabled={scanning || isRobotRunning}
		on:mousedown={() => startMoving('right')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('right')}
		on:touchend={stopMoving}
	>
		RIGHT
	</button>
	<button
		class="col-span-2 w-full rounded-lg bg-red-600 py-3 font-semibold text-white shadow-md transition hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
		disabled={scanning || isRobotRunning}
		on:mousedown={() => startMoving('backward')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('backward')}
		on:touchend={stopMoving}
	>
		BACKWARD
	</button>
</div>

<div class="mt-4 flex items-center gap-4 rounded-2xl bg-gray-200 p-3 shadow-md dark:bg-gray-900">
	<label class="w-32 text-sm font-semibold text-gray-600 dark:text-gray-300" for="speed-slider">
		Speed Control
	</label>

	<input
		disabled={scanning || isRobotRunning}
		id="speed-slider"
		type="range"
		min="0"
		max="100"
		class="flex-1 cursor-pointer accent-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
		bind:value={tempSpeed}
		on:input={(e: any) => handleSpeedInput(+e.target.value)}
		on:change={handleSpeedCommit}
		on:mouseup={handleSpeedCommit}
		on:touchend={handleSpeedCommit}
	/>

	<input
		disabled={scanning || isRobotRunning}
		type="number"
		min="0"
		max="100"
		class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
		bind:value={tempSpeed}
		on:change={(e: any) => handleSpeedCommit()}
	/>
</div>
