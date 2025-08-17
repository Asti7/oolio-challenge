import { EventEmitter } from './EventEmitter';

export interface DataRecord {
    id: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    deleted?: boolean;

}

export interface SyncStatus {
    lastSync: number;
    pendingChanges: number;
    isOnline: boolean;
    syncErrors: string[];
}

export interface Operation {
    type: 'create' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: any;
    previousData?: any;
}

export interface Transaction {
    id: string;
    operations: Operation[];
    timestamp: number;
    status: 'pending' | 'committed' | 'rolledback';
}

export class OfflineDataStore extends EventEmitter {
    private db: IDBDatabase | null = null;
    private syncQueue: Transaction[] = [];
    private isOnline = navigator.onLine;
    private syncStatus: SyncStatus = {
      lastSync: 0,
      pendingChanges: 0,
      isOnline: this.isOnline,
      syncErrors: []
    };
  
    constructor(private dbName: string = 'oolio-offline-store') {
      super();
      this.initializeDB();
      this.setupNetworkListeners();
    }

    // Initialize the database.
    private async initializeDB(): Promise<void> {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, 1);
          
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            this.db = request.result;
            this.emit('dbReady');
            resolve();
          };
    
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Collections for the app.
            if (!db.objectStoreNames.contains('products')) {
              db.createObjectStore('products', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('orders')) {
              db.createObjectStore('orders', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('transactions')) {
              db.createObjectStore('transactions', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
              db.createObjectStore('syncQueue', { keyPath: 'id' });
            }
          };
        });
      }

      // Setup network listeners.
      private setupNetworkListeners(): void {
        window.addEventListener('online', () => {
          this.isOnline = true;
          this.syncStatus.isOnline = true;
          this.emit('online');

          //TODO: process sync queue here.


        });
    
        window.addEventListener('offline', () => {
          this.isOnline = false;
          this.syncStatus.isOnline = false;
          this.emit('offline');
        });
      }



}
