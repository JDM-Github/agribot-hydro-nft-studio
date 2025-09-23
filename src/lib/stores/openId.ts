import { writable } from 'svelte/store';

export const openId = writable<string | null>(null);

export function handleToggle(id: string, event: Event) {
    const detail = event.currentTarget as HTMLDetailsElement;

    openId.update(current => {
        if (detail.open) {
            return id;
        } else if (current === id) {
            return null;
        }
        return current;
    });
}
