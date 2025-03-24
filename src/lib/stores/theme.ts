import { writable } from 'svelte/store';

const storedDarkMode = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';

export const darkMode = writable<boolean>(storedDarkMode);
darkMode.subscribe((value) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('darkMode', String(value));
		document.body.classList.toggle('dark', value);
	}
});
