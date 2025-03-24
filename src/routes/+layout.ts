import { get } from 'svelte/store';
import { user, logout } from '$lib/stores/auth';
import { darkMode } from '$lib/stores/theme';

export function load({ url }) {
	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' }
	];

	const isLoggedIn = get(user);
	const currentPath = url.pathname;
	const isLoginPage = currentPath === '/login';

	// if (isLoginPage) {
	// 	logout();
	// }

	// if (!isLoggedIn && !isLoginPage) {
	// 	throw redirect(307, '/login');
	// } 

	
	const isDarkMode = get(darkMode);

	const record = records.find((r) => r.path === currentPath);
	return {
		title: record ? `${record.name} | AGRI-BOT Studio` : 'AGRI-BOT Studio',
		description: 'This is a dynamic description for SEO.',
		isDarkMode
	};
}
