/**
 * @file navigation.ts
 * @description Provides a reusable helper function for SvelteKit navigation guards.
 *              Allows confirmation dialogs when leaving a page under specific conditions.
 * 
 * @author      AGRIBOT Team
 * @created     2025-09-21
 * @lastUpdated 2025-09-21
 */

/**
 * Display a confirmation dialog before navigating away.
 * @param condition - Boolean condition to check before showing the dialog
 * @param message - Message to display in the confirmation dialog
 * @param navigation - SvelteKit navigation object from `beforeNavigate`
 * @returns true if a dialog was shown (and possibly cancelled), false otherwise
 */
export function confirmBeforeLeave(
    condition: boolean,
    message: string,
    navigation: any
): boolean {
    if (condition) {
        const leave = confirm(message);
        if (!leave) {
            navigation.cancel();
        }
        return true;
    }
    return false;
}
