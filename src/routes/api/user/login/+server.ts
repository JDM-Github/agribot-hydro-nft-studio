import { json } from '@sveltejs/kit';
import jwt from "jsonwebtoken";
import RequestHandler from '$lib/utils/request';
import { JWT_SECRET, AGRIBOT_AUTH, MODE } from "$env/static/private";

function createAuthToken() {
	return jwt.sign(
		{ role: "robot", auth: AGRIBOT_AUTH },
		JWT_SECRET,
		{ expiresIn: "1h" }
	);
}

export const POST = async ({ request, cookies }) => {
	const body = await request.json();
	const result = await RequestHandler.fetchData('post', 'user/login', body);
	if (result.success) {
		cookies.set('session', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		const robotToken = createAuthToken();
		cookies.set("robot_session", robotToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7
		});
	}
	return json(result);
};
