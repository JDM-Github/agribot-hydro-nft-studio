import type { PageServerLoad } from './$types';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const isLoggedIn = get(user);
	if (isLoggedIn) {
		throw redirect(307, '/');
	}
};
