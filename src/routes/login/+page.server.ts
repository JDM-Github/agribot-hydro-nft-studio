import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({locals}) => {
	const isLoggedIn = locals.user;
	if (isLoggedIn) {
		throw redirect(307, '/');
	}
};
