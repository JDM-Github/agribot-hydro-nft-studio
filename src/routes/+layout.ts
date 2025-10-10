/**
 * @file +layout.ts
 * @description Loads layout data for the AGRI-BOT Studio app, including page title, SEO description, dark mode state, 
 *              and authentication check. Redirects to login if user is not authenticated.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

import { darkMode } from '$stores/theme';
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

/**
 * Load function for the layout.
 * Sets page title, description, dark mode, and performs authentication checks.
 *
 * @param {object} param0 - Load function parameters
 * @param {URL} param0.url - Current page URL
 * @param {any} param0.data - Page data passed from server load
 * @returns {Promise<object>} Layout data including user, title, description, and dark mode state
 */
export const load: LayoutLoad = async ({ url, data }) => {
	// Define all navigable records/pages
	const records = [
		{ name: 'SETUP', path: '/' },
		{ name: 'LIVE', path: '/live' },
		{ name: 'RECORDS', path: '/record' },
		{ name: 'LOGS', path: '/logs' },
		{ name: 'ROBOT', path: '/robot' },
		{ name: 'NOTIFICATIONS', path: '/notification' },
		{ name: 'MANAGE WIFI', path: '/wifi' }
	];

	// Determine if user is logged in
	const isLoggedIn = (data as any)?.user || false;
	const currentPath = url.pathname;
	const isLoginPage = currentPath === '/login';

	// Redirect unauthenticated users to login
	if (!isLoggedIn && !isLoginPage) {
		throw redirect(307, '/login');
	}

	// Determine page title based on current path
	const record = records.find((r) => r.path === currentPath);

	return {
		user: (data as any)?.user || null,
		isInLogin: isLoginPage,
		title: record ? `${record.name} | AGRI-BOT Studio` : 'AGRI-BOT Studio',
		description: 'This is a dynamic description for SEO.',
		isDarkMode: darkMode
	};
};
