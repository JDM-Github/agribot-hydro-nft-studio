import { openDB } from 'idb';

export const db = await openDB('my-cache', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images');
        }
    }
});
