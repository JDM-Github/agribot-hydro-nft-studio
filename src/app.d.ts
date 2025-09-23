/**
 * @file app.d.ts
 * @description Global TypeScript declarations for the SvelteKit project.
 *              Includes type augmentation for SvelteKit `App` namespace and external modules.
 * 
 * @author      AGRIBOT Team
 * @created     2025-04-01
 * @lastUpdated 2025-09-21
 */

/**
 * Declare external modules that TypeScript may not have typings for.
 */
declare module "nodemailer";

/**
 * Global type augmentation for SvelteKit's `App` namespace.
 * 
 * - `Locals` is extended to include `user`, which holds
 *   the JWT payload for authenticated users or `null`.
 */
declare global {
	namespace App {

		interface Locals {
			user: any | null;
			auth: string | null;
		}
		// Future extensions can include:
		// interface PageData { ... }
		// interface Error { ... }
	}
}

// Ensure this file is treated as a module
export { };
