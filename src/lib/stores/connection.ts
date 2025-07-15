import { getBaseApiUrl } from '$lib/helpers/utility';
import { writable as $store } from 'svelte/store';

let currentLink = getBaseApiUrl();
let isConnected = $store(true);
const connect = async (url: string | null = null) => {
	if (url) currentLink = url;
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
			console.error('Ping failed:', data.message || 'Unknown error');
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
