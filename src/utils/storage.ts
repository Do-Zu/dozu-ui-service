export function storeSessionData<T>(key: string, data: T): void {
    try {
        const serializedData = JSON.stringify(data);
        sessionStorage.setItem(key, serializedData);
    } catch (error) {
        console.error(`Error storing data in sessionStorage for key "${key}":`, error);
    }
}

export function getSessionData<T>(key: string): T | null {
    try {
        const serializedData = sessionStorage.getItem(key);
        if (serializedData === null) {
            return null;
        }
        return JSON.parse(serializedData) as T;
    } catch (error) {
        console.error(`Error retrieving data from sessionStorage for key "${key}":`, error);
        return null;
    }
}
