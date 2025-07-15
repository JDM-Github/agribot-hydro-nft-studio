import { darkMode } from '$lib/stores/theme';
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ url, data }) => {
	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' },
		{ name: 'LOGS', path: '/logs' }
	];
	const isLoggedIn = (data as any)?.user || false;
	const currentPath = url.pathname;
	const isLoginPage = currentPath === '/login';
	if (!isLoggedIn && !isLoginPage) {
		throw redirect(307, '/login');
	}
	const record = records.find((r) => r.path === currentPath);
	return {
		user: (data as any)?.user || null,
		title: record ? `${record.name} | AGRI-BOT Studio` : 'AGRI-BOT Studio',
		description: 'This is a dynamic description for SEO.',
		isDarkMode: darkMode
	};
};
