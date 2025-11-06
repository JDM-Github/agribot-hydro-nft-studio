import { writable } from 'svelte/store';

interface ToastAction {
	label: string;
	handler: () => void;
}

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'loading' | 'loading-non-blocking' | 'confirm';
	duration?: number;
	actions?: ToastAction[];
	blocking?: boolean;
}

function generateId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const toasts = writable<Toast[]>([]);

export function addToast(
	message: string,
	type: Toast['type'],
	duration?: number,
	actions?: ToastAction[]
) {
	const id = generateId();

	// If it's a loading type, let it persist until manually removed
	if (type === 'loading' || type === 'loading-non-blocking') {
		duration = duration ?? undefined;
	} else {
		duration = duration ?? 2000;
	}

	toasts.update((state) => [...state, { id, message, type, duration, actions }]);

	if (duration) {
		setTimeout(() => removeToast(id), duration);
	}

	return id;
}

export function removeToast(id: string) {
	toasts.update((state) => state.filter((toast) => toast.id !== id));
}

export function confirmToast(message: string, blocking = true): Promise<boolean> {
	return new Promise((resolve) => {
		const id = Date.now().toString();

		const actions: ToastAction[] = [
			{
				label: 'OK',
				handler: () => {
					resolve(true);
					removeToast(id);
				}
			},
			{
				label: 'CANCEL',
				handler: () => {
					resolve(false);
					removeToast(id);
				}
			}
		];

		toasts.update((state) => [
			...state,
			{
				id,
				message,
				type: 'confirm',
				actions,
				blocking
			}
		]);
	});
}
