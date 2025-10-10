import { userData } from "../stores/connection";

export function openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('myAppDB', 1);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
        request.onsuccess = (event: any) => resolve(event.target.result);
        request.onerror = (event: any) => reject(event.target.error);
    });
}

export async function saveToDB(key: string, value: any, willSave: boolean = true) {
    if (willSave && key === 'userData') {
        userData.set(value);
    }
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('settings', 'readwrite');
        const store = transaction.objectStore('settings');

        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => {
            const putRequest = store.put({ key, value });
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = (e) => reject(e);
        };

        deleteRequest.onerror = (e) => reject(e);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e);
    });
}

export async function getFromDB(slug: string) {
    const db = await openDB();
    return new Promise<any>((resolve, reject) => {
        const transaction = db.transaction('settings', 'readonly');
        const store = transaction.objectStore('settings');

        const getRequest = store.get(slug);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = (e) => reject(e);
    });
}
