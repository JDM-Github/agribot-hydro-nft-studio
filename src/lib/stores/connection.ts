import { writable as $store, get } from 'svelte/store';

const robotName = $store<string | null>(null);
const currentLink = $store<string | null>(null);
const isConnected = $store(false);
const isLivestreaming = $store("Stopped");
const isScanning = $store(false);
const isRobotRunning = $store("Stopped");

const resetVariable = () => {
	isConnected.set(false);
	isLivestreaming.set("Stopped");
	isScanning.set(false);
	isRobotRunning.set('Stopped');
}

const connect = async (url: string | null = null, robot_name: string | null = null) => {
	let link = get(currentLink);
	if (link === null) {
		console.error('❌ No base link. Aborting connection.');
		resetVariable();
		return;
	}
	if (url) link = url;

	const token = robot_name || get(robotName);
	if (!token) {
		console.error('❌ No robot_name provided in production. Aborting connection.');
		resetVariable();
		return;
	}
	try {
		const res = await fetch(`${link}/ping`, {
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
			resetVariable();
		}
	} catch (e) {
		console.error('Ping failed:', e);
		isConnected.set(false);
	}
};

const disconnect = () => {
	resetVariable();
};

export {
	currentLink,
	isConnected,
	isRobotRunning,
	isScanning,
	isLivestreaming,
	robotName,
	connect,
	disconnect
};
