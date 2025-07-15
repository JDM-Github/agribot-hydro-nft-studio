import { writable } from 'svelte/store';

interface ToastAction {
	label: string;
	handler: () => void;
}

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'loading' | 'confirm';
	duration?: number;
	actions?: ToastAction[];
	blocking?: boolean;
}

export const toasts = writable<Toast[]>([]);

export function addToast(
	message: string,
	type: Toast['type'],
	duration?: number,
	actions?: ToastAction[]
) {
	const id = Date.now().toString();
	toasts.update((state) => [...state, { id, message, type, duration, actions }]);
	if (type !== 'loading' && type !== 'confirm' && duration) {
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
