<script lang="ts">
/**
 * @file +layout.svelte
 * @description Root layout component for the AGRIBOT application.
 *              Handles global navigation, toast notifications, and robot connection
 *              status monitoring. Provides context for child routes.
 * 
 * @props
 *   - data: Layout data object (title, description, user info, dark mode, etc.).
 *   - children: Render function for nested routes.
 * 
 * @imports
 *   - app.css: Global stylesheet for the application.
 *   - Navigation: Top navigation component.
 *   - Toast: Global toast notification container.
 *   - addToast: Store action for displaying toast messages.
 *   - isConnected, isRobotRunning, isLivestreaming, isScanning, resetVariable:
 *       Connection state stores and reset function.
 *   - RequestHandler: Utility for authenticated API requests.
 *   - onMount, onDestroy: Svelte lifecycle functions.
 * 
 * @localState
 *   - statusInterval: Interval handler for polling robot status.
 * 
 * @functions
 *   - fetchRobotStatus: Periodically checks robot status via API and updates stores.
 * 
 * @lifecycle
 *   - onMount: Starts polling for robot status every 3s.
 *   - onDestroy: Clears polling interval on component teardown.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-22
 * @lastUpdated 2025-09-22
 */

// ----------------------------
// Imports
// ----------------------------
import '$root/app.css';

// Svelte lifecycle
import { onMount, onDestroy } from 'svelte';

// Components
import Navigation from '$components/Navigation.svelte';
import Toast from '$components/ToastContainer.svelte';

// Stores
import { addToast } from '$stores/toast';
import {
	isConnected,
	isRobotRunning,
	isLivestreaming,
	isScanning,
	resetVariable
} from '$stores/connection';

// Utils
import RequestHandler from '$utils/request';

// ----------------------------
// Props
// ----------------------------
let { data, children } = $props();

// ----------------------------
// Local State
// ----------------------------
let statusInterval: any;

// ----------------------------
// Methods
// ----------------------------
/**
 * Fetch the latest robot status from backend and update stores.
 */
const fetchRobotStatus = async () => {
	try {
		if (data.isInLogin) {
			resetVariable();
		} else if ($isConnected) {
			const [ok, status] = await RequestHandler.authFetch('check-status', 'GET');
			if (!ok) throw new Error('Failed to reach robot');

			isLivestreaming.set(status.is_livestreaming);
			isScanning.set(status.is_scanning);
			isRobotRunning.set(status.robot_loop_state);
		}
	} catch (error) {
		console.error('Connection issue detected, trying to reconnect...', error);
		addToast('Connection lost, attempting to reconnect...', 'error', 3000);
		resetVariable();
	}
};

// ----------------------------
// Lifecycle
// ----------------------------
onMount(() => {
	statusInterval = setInterval(fetchRobotStatus, 3000);
});

onDestroy(() => {
	clearInterval(statusInterval);
});
</script>


<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>

<svelte:body class:dark={data.isDarkMode} />

<Toast />

<main class="bg-white pt-16 dark:bg-gray-800">
	<Navigation user={data.user} />
	{@render children()}
</main>
