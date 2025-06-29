import { writable as $store } from 'svelte/store';

// let currentLink = 'http://agribot-pi4.tail13df43.ts.net:5000';
const currentLink = import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000';
let isConnected = $store(true);
const connect = async () => {
	try {
		const res = await fetch(`${currentLink}/ping`, {
			headers: {
				Authorization: 'Bearer agribot-auth-token'
			}
		});
		const data = await res.json();
		if (res.ok && data.status === 'ok') {
			isConnected.set(true);
		} else {	
			isConnected.set(false);
		}
	} catch (e) {
		console.error('Ping failed:', e);
		isConnected.set(false);
	}
};
const disconnect = () => {
	isConnected.set(false);
};
export { currentLink, isConnected, connect, disconnect };
