import { writable } from 'svelte/store';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(message: string, type: 'success' | 'error' | 'info', duration = 3000) {
	const id = Date.now().toString();
	toasts.update((state) => [...state, { id, message, type, duration }]);
	setTimeout(() => {
		removeToast(id);
	}, duration);
}

export function removeToast(id: string) {
	toasts.update((state) => state.filter((toast) => toast.id !== id));
}
