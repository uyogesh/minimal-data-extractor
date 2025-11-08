// indexeddb-utils.ts
// Utility functions for working with IndexedDB for data and page storage

import { PageMetaData } from "@src/pages/background";

const DB_NAME = 'MinimalDataExtractorDB';
const DB_VERSION = 1;
const DATA_STORE = 'data';
const PAGE_STORE = 'page';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE, { keyPath: 'contractId' });
      }
      if (!db.objectStoreNames.contains(PAGE_STORE)) {
        db.createObjectStore(PAGE_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveData(data: any) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readwrite');
    const store = tx.objectStore(DATA_STORE);
    const req = store.put(data);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBulkData(dataArray: any[]) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readwrite');
    const store = tx.objectStore(DATA_STORE);
    for (const data of dataArray) {
      store.put(data);
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveCurrentPage(page: any) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readwrite');
    const store = tx.objectStore(PAGE_STORE);
    const req = store.put(page);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, 'readonly');
    const store = tx.objectStore(DATA_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCurrentPage() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readonly');
    const store = tx.objectStore(PAGE_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
