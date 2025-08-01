import { getBaseApiUrl } from '$lib/helpers/utility';
import { writable as $store } from 'svelte/store';

let currentLink = getBaseApiUrl();
let isConnected = $store(false);
let isLivestreaming = $store(false);
let isScanning = $store(false);
let isRobotRunning = $store("Stopped");

const connect = async (url: string | null = null, robot_id: string | null = null) => {
	if (url) currentLink = url;

	const token = robot_id || (import.meta.env.VITE_ENV === 'development' ? "agribot-pi4" : '');
	if (!token) {
		console.error('❌ No robot_id provided in production. Aborting connection.');
		isConnected.set(false);
		isRobotRunning.set('Stopped');
		return;
	}
	try {
		const res = await fetch(`${currentLink}/ping`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		const data = await res.json();
		if (res.ok && data.status === 'ok') {
			isConnected.set(true);
			isLivestreaming.set(data.is_livestreaming);
			isScanning.set(data.is_scanning);
			isRobotRunning.set(data.robot_loop_state);
		} else {
			console.error('Ping failed:', data.message || 'Unknown error');
			isConnected.set(false);
			isLivestreaming.set(false);
			isScanning.set(false);
			isRobotRunning.set('Stopped');
		}
	} catch (e) {
		console.error('Ping failed:', e);
		isConnected.set(false);
	}
};

const disconnect = () => {
	isConnected.set(false);
};

export { currentLink, isConnected, isRobotRunning, isScanning, isLivestreaming, connect, disconnect };
