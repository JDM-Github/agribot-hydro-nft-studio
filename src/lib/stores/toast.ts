import { writable } from 'svelte/store';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'loading';
	duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(
	message: string,
	type: 'success' | 'error' | 'info' | 'loading',
	duration?: number
) {
	const id = Date.now().toString();
	toasts.update((state) => [...state, { id, message, type, duration }]);
	if (type !== 'loading' && duration) {
		setTimeout(() => removeToast(id), duration);
	}
	return id;
}

export function removeToast(id: string) {
	toasts.update((state) => state.filter((toast) => toast.id !== id));
}
