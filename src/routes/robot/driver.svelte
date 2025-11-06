<script lang="ts">
	import gsap from "gsap";
	import { addToast, removeToast } from '$lib/stores/toast';
	import RequestHandler from '$lib/utils/request';
	import { onMount, onDestroy } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	export let scanning = false;
	export let enableWASDinControl = false;
	let activeToastId: string | null = null;
	let isMoving = false;
	let speed = 60;
	let tempSpeed = speed;
	let currentMoving: Writable<string> = writable('');
	export let isRobotRunning: boolean;

	function handleKeyDown(e: KeyboardEvent) {
		if (!enableWASDinControl || isMoving) return;

		switch (e.key.toLowerCase()) {
			case 'w':
				startMoving('forward');
				currentMoving.set('forward');
				break;
			case 'a':
				startMoving('left');
				currentMoving.set('left');
				break;
			case 'd':
				startMoving('right');
				currentMoving.set('right');
				break;
			case 's':
				startMoving('backward');
				currentMoving.set('backward');
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
		if ($currentMoving === action) return;
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

		activeToastId = addToast(`${actionLabel} at ${speed}% speed...`, 'loading-non-blocking');
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
		currentMoving.set('');
	}

	function handleSpeedInput(value: number) {
		tempSpeed = value;
	}
	async function handleSpeedCommit() {
		if (speed === tempSpeed) return;
		speed = tempSpeed;
		addToast(`Speed set to ${speed}%`, 'info', 1200);
	}

	onMount(() => {
		const allButtons = document.querySelectorAll('.driver-button');
		if (!allButtons.length) return;

		gsap.fromTo(
			allButtons,
			{ opacity: 0, y: 30, scale: 0 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				stagger: 0.1,
				duration: 0.2,
				delay: 0.3,
				ease: 'power2.out'
			}
		);

		const speedControls = document.querySelectorAll('#speed-slider, input[type="number"]');
		if (speedControls.length) {
			gsap.fromTo(
				speedControls,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
			);
		}
	});
</script>

<div
	class="mt-2 grid w-full grid-cols-2 gap-2 rounded-2xl bg-gray-200 p-4 shadow-lg dark:bg-gray-900"
>
	<button
		class="driver-button col-span-2 w-full rounded-lg bg-green-600 py-3 font-semibold text-white shadow-md transition hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600"
		disabled={scanning || isRobotRunning || $currentMoving === 'forward'}
		on:mousedown={() => startMoving('forward')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('forward')}
		on:touchend={stopMoving}
	>
		FORWARD
	</button>

	<button
		class="driver-button w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500"
		disabled={scanning || isRobotRunning || $currentMoving === 'left'}
		on:mousedown={() => startMoving('left')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('left')}
		on:touchend={stopMoving}
	>
		LEFT
	</button>

	<button
		class="driver-button w-full rounded-lg bg-blue-500 py-3 text-white shadow transition hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500"
		disabled={scanning || isRobotRunning || $currentMoving === 'right'}
		on:mousedown={() => startMoving('right')}
		on:mouseup={stopMoving}
		on:mouseleave={stopMoving}
		on:touchstart={() => startMoving('right')}
		on:touchend={stopMoving}
	>
		RIGHT
	</button>
	<button
		class="driver-button col-span-2 w-full rounded-lg bg-red-600 py-3 font-semibold text-white shadow-md transition hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
		disabled={scanning || isRobotRunning || $currentMoving === 'backward'}
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
		class="flex-1 cursor-pointer accent-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
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
		class="w-16 rounded-md border border-gray-300 bg-white p-1 text-center text-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 dark:border-gray-600 dark:bg-gray-800"
		bind:value={tempSpeed}
		on:change={(e: any) => handleSpeedCommit()}
	/>
</div>
