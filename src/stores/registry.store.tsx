import { AppStore } from './store';

let storeInstance: AppStore | null = null;

export const setStore = (store: AppStore) => {
    storeInstance = store;
};

export const getStore = () => storeInstance;
