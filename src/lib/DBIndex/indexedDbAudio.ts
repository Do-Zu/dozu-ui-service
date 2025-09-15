// Utility for storing and retrieving audio files in IndexedDB
// Provides simple put/get/delete/clear operations plus size threshold logic.
// We namespace the DB per application and keep a single object store `audio_files`.
// Keys are string IDs (sound ids). Values are { blob: Blob, createdAt: number, name: string }.

const DB_NAME = 'pomodoro_audio_db';
const STORE_NAME = 'audio_files';
const DB_VERSION = 1;

export interface IndexedDBAudioRecord {
    id: string;
    name: string;
    blob: Blob;
    createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function idbPutAudio(id: string, name: string, blob: Blob) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(STORE_NAME);
        const record: IndexedDBAudioRecord = { id, name, blob, createdAt: Date.now() };
        store.put(record);
    });
}

export async function idbGetAudio(id: string): Promise<IndexedDBAudioRecord | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result as IndexedDBAudioRecord | undefined);
        req.onerror = () => reject(req.error);
    });
}

export async function idbDeleteAudio(id: string) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
    });
}

export async function idbClearAll() {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(STORE_NAME);
        store.clear();
    });
}

export async function idbListIds(): Promise<string[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result as string[]);
        req.onerror = () => reject(req.error);
    });
}

// Convenience that returns an object URL (caller should revoke when done)
export async function idbGetObjectUrl(id: string): Promise<string | undefined> {
    const rec = await idbGetAudio(id);
    if (!rec) return undefined;
    return URL.createObjectURL(rec.blob);
}
