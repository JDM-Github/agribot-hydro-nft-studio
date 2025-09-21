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

	if (token) {
		try {
			// Verify and decode JWT
			const decoded = jwt.verify(token, JWT_SECRET);
			event.locals.user = decoded;
		} catch (err: unknown) {
			// Invalid or expired token
			console.error("Invalid session token:", err);
			event.cookies.delete("session", { path: "/" });
			event.locals.user = null;
		}
	} else {
		// No token found
		event.locals.user = null;
	}

	// Continue request lifecycle
	return resolve(event);
};
