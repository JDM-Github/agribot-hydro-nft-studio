import type { Handle } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
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
			const decoded = jwt.verify(token, JWT_SECRET);
			event.locals.user = decoded;
		} catch (err: any) {
			console.error('Unexpected token error.');
			event.cookies.delete('session', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}
	return resolve(event);
};
