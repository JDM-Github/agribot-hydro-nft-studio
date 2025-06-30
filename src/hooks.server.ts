import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
declare global {
	namespace App {
		interface Locals {
			user: any | null;
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	if (token) {
		try {
			const decoded = jwt.verify(token, "jwt_secret");
			event.locals.user = decoded;
		} catch (err) {
			console.error('Invalid session token:', err);
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}
	return resolve(event);
};
