import { json } from '@sveltejs/kit';
import RequestHandler from '$lib/utils/request';

export const POST = async ({ request, cookies }) => {
	const body = await request.json();
	const result = await RequestHandler.fetchData('post', 'user/login', body);
	if (result.success) {
		cookies.set('session', result.token, {
			httpOnly: true,
			secure: false,
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
	}
	return json(result);
};
