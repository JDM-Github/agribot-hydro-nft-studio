import { persisted } from 'svelte-persisted-store';

export const user = persisted('user', null);

export function login(userData: any) {
	user.set(userData);
}

export function logout() {
	user.set(null);
}
