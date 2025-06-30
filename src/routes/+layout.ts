// +layout.ts
import { darkMode } from '$lib/stores/theme';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url, data }) => {
	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' }
	];

	const isLoggedIn = (data as any)?.user || false;
	const currentPath = url.pathname;
	const isLoginPage = currentPath === '/login';
	if (!isLoggedIn && !isLoginPage) {
		throw redirect(307, '/login');
	}

	const record = records.find((r) => r.path === currentPath);

	return {
		user: data?.user || null,
		title: record ? `${record.name} | AGRI-BOT Studio` : 'AGRI-BOT Studio',
		description: 'This is a dynamic description for SEO.',
		isDarkMode: darkMode,
	};
};
