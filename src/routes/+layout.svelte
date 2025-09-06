<script lang="ts">
	import '../app.css';
	let { data, children } = $props();
	import Navigation from '$lib/components/Navigation.svelte';
	import Toast from '$lib/components/ToastContainer.svelte';
	import { onMount, onDestroy } from 'svelte';

	import { addToast, removeToast } from '$lib/stores/toast';
	import {
		connect,
		isConnected,
		isRobotRunning,
		isLivestreaming,
		isScanning,
		currentLink,
		robotName
	} from '$lib/stores/connection';
	import RequestHandler from '$lib/utils/request';

	let statusInterval: any;
	function connectToRobot() {
		if (!data.user) {
			return;
		}

		robotName.set(data.user.prototypeID);
		currentLink.set(
			import.meta.env.VITE_ENV === 'production'
				? 'https://' + data.user.prototypeID + '.tail13df43.ts.net:8000'
				: import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000'
		);
		if (!$isConnected) {
			let toastID = addToast(`Connecting to AGRI-BOT...`, 'loading');
			connect()
				.then(() => {
					removeToast(toastID);
					if ($isConnected) {
						addToast('Successfully connected to AGRI-BOT.', 'success', 3000);
					} else {
						addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
					}
				})
				.catch(() => {
					addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
				});
		} else {
			connect().then(() => {
				if (!$isConnected) {
					addToast('Failed to connect to AGRI-BOT.', 'error', 3000);
				}
			});
		}

	}

	const fetchRobotStatus = async () => {
		try {
			if ($isConnected && !data.isInLogin) {
				const [ok, data] = await RequestHandler.authFetch('check-status', 'GET');
				if (!ok) throw new Error('Failed to reach robot');

				isLivestreaming.set(data.is_livestreaming);
				isScanning.set(data.is_scanning);
				isRobotRunning.set(data.robot_loop_state);
			}
		} catch (error) {
			console.error('Connection issue detected, trying to reconnect...');
			addToast('Connection lost, attempting to reconnect...', 'error', 3000);
			connectToRobot();
		}
	};

	onMount(() => {
		// connectToRobot();
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
