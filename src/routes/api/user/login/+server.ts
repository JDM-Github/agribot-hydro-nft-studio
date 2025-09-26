import { json } from '@sveltejs/kit';
import RequestHandler from '$lib/utils/request';
import { MODE } from "$env/static/private";

export const POST = async ({ request, cookies }) => {
	const body = await request.json();
	const result = await RequestHandler.fetchData('post', 'user/login', body);
	if (result.success) {
		cookies.set('session', result.token, {
			httpOnly: true,
			secure: MODE === "production",
			sameSite: "strict",
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
	}
	return json(result);
};
