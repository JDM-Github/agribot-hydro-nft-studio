/**
 * @file hooks.server.ts
 * @description Global request/response lifecycle hook for SvelteKit.
 *              Handles session-based authentication using JWT stored in cookies.
 * 
 * @author      AGRIBOT Team
 * @created     2025-04-21
 * @lastUpdated 2025-09-21
 */

import type { Handle } from "@sveltejs/kit";
import { JWT_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";

/**
 * Global handle function
 * 
 * - Runs on every request.
 * - Verifies the JWT stored in the "session" cookie.
 * - Attaches decoded user data to `event.locals.user`.
 * - Deletes the cookie if the token is invalid or expired.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	const robotToken = event.cookies.get("robot_session");

	if (token) {
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			event.locals.user = decoded;
		} catch (err: unknown) {
			console.error("Invalid session token:", err);
			event.cookies.delete("session", { path: "/" });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	if (robotToken) {
		try {
			const decoded = jwt.verify(robotToken, JWT_SECRET);
			event.locals.auth = decoded;
		} catch (err) {
			console.error("Invalid robot session:", err);
			event.cookies.delete("robot_session", { path: "/" });
			event.locals.auth = null;
		}
	} else {
		event.locals.auth = null;
	}

	return resolve(event);
};
