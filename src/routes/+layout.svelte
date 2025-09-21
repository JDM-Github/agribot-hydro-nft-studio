<script lang="ts">
/**
 * @file +layout.svelte
 * @description Main layout component for AGRI-BOT Studio.
 * 				Handles navigation, toast notifications, and live robot connection/status updates.
 * 
 * @author  AGRIBOT Team
 * @created 2025-09-21
 * @lastUpdated 2025-09-21
*/

// ----------------------------
// Global Styles
// ----------------------------
import '$root/app.css';

// ----------------------------
// Svelte core
// ----------------------------
import { onMount, onDestroy } from 'svelte';

// ----------------------------
// UI Components
// ----------------------------
import Navigation from '$components/Navigation.svelte';
import Toast from '$components/ToastContainer.svelte';

// ----------------------------
// Svelte Stores
// ----------------------------
import { addToast } from '$stores/toast';
import {
	isConnected,
	isRobotRunning,
	isLivestreaming,
	isScanning,
	resetVariable

} from '$stores/connection';

// ----------------------------
// Utilities
// ----------------------------
import RequestHandler from '$utils/request';

// ----------------------------
// Props & state
// ----------------------------
let { data, children } = $props();
let statusInterval: any;

// ----------------------------
// Functions
// ----------------------------

/**
 * Fetch current robot status periodically
 */
const fetchRobotStatus = async () => {
	try {
		if (data.isInLogin) {
			resetVariable();
		}
		else if ($isConnected) {
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
// Lifecycle hooks
// ----------------------------
onMount(() => {
	statusInterval = setInterval(fetchRobotStatus, 3000);
});

onDestroy(() => {
	clearInterval(statusInterval);
});
</script>

<!-- ----------------------------
Head for SEO
---------------------------- -->
<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
</svelte:head>

<svelte:body class:dark={data.isDarkMode} />

<!-- ----------------------------
Layout Content
---------------------------- -->
<Toast />

<main class="bg-white pt-16 dark:bg-gray-800">
	<Navigation user={data.user} />
	{@render children()}
</main>
