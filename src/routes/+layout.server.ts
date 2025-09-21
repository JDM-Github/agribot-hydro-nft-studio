/**
 * @file +layout.server.ts
 * @description Server-side load function for layout.
 *              Provides the logged-in user data from locals to the layout.
 * 
 * @author  AGRIBOT Team
 * @created 2025-09-21
 * @lastUpdated 2025-09-21
 */

import type { ServerLoad } from '@sveltejs/kit';

/**
 * Server load function
 * @param locals - SvelteKit locals containing user session info
 * @returns user object to be available in the layout
 */
export const load: ServerLoad = async ({ locals }) => {
	return {
		user: locals.user
	};
};
