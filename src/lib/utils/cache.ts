import { openDB } from 'idb';

const dbPromise = openDB('model-cache', 1, {
	upgrade(db) {
		db.createObjectStore('models');
	}
});

export async function cacheModel(modelPath: string, blob: Blob) {
	const db = await dbPromise;
	await db.put('models', blob, modelPath);
}

export async function getCachedModel(modelPath: string): Promise<Blob | undefined> {
	const db = await dbPromise;
	return db.get('models', modelPath);
}
