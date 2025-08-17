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

export interface Transaction extends DataRecord {
    id: string;
    operations: Operation[];
    timestamp: number;
    status: 'pending' | 'committed' | 'rolledback';
    createdAt: string;
    updatedAt: string;
    version: number;
}

export class OfflineDataStore extends EventEmitter {
    private db: IDBDatabase | null = null;
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

    ///////////////////////
    // Public methods.
    ///////////////////////

    // Transaction method.
    async transaction<T>(operations: Operation[]): Promise<T> {
        const transaction: Transaction = {
          id: this.generateId(),
          operations,
          timestamp: Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        };
    
        try {
          // Apply operations locally first
          await this.applyOperations(operations);
          
          // Queue for sync if offline.
          if (!this.isOnline) {
            await this.queueTransaction(transaction);
            transaction.status = 'committed';
            this.emit('transactionCommitted', transaction);
            return transaction as T;
          }
    
          // Try to sync immediately if online.
          await this.syncTransaction(transaction);
          transaction.status = 'committed';
          this.emit('transactionCommitted', transaction);
          return transaction as T;
    
        } catch (error) {
          // Rollback on error
          await this.rollbackOperations(operations);
          transaction.status = 'rolledback';
          this.emit('transactionRolledBack', transaction, error);
          throw error;
        }
      }


      // Process sync queue.
      async processSyncQueue(): Promise<void> {
        if (!this.db || !this.isOnline) return;
    
        const queue = await this.getQueuedTransactions();
        
        for (const transaction of queue) {
          try {
            await this.syncTransaction(transaction);
            await this.removeFromSyncQueue(transaction.id);
            this.syncStatus.pendingChanges--;
          } catch (error: unknown) {
            if (error instanceof Error) {
              this.syncStatus.syncErrors.push(error.message);
              this.emit('syncError', error, transaction);
            } else {
              const errorMessage = String(error);
              this.syncStatus.syncErrors.push(errorMessage);
              this.emit('syncError', new Error(errorMessage), transaction);
            }
          }
        }
  
        this.syncStatus.lastSync = Date.now();
        this.emit('syncStatusChanged', this.syncStatus);
      }


       // Get a single item.
       async get<T extends DataRecord>(collection: string, id: string): Promise<T | null> {
        if (!this.db) return null;
    
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([collection], 'readonly');
          const store = transaction.objectStore(collection);
          const request = store.get(id);
    
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      }
    
      // Get all items.
      async getAll<T extends DataRecord>(collection: string): Promise<T[]> {
        if (!this.db) return [];
    
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([collection], 'readonly');
          const store = transaction.objectStore(collection);
          const request = store.getAll();
    
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    
      // Query.
      async query<T extends DataRecord>(
        collection: string, 
        predicate: (item: T) => boolean
      ): Promise<T[]> {
        const all = await this.getAll<T>(collection);
        return all.filter(predicate);
      }
    
      // Get sync status.
      getSyncStatus(): SyncStatus {
        return { ...this.syncStatus };
      }


    ///////////////////////
    // Private methods.
    ///////////////////////

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
            if (!db.objectStoreNames.contains('failedTransactions')) {
              db.createObjectStore('failedTransactions', { keyPath: 'id' });
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
          this.processSyncQueue();
        });
    
        window.addEventListener('offline', () => {
          this.isOnline = false;
          this.syncStatus.isOnline = false;
          this.emit('offline');
        });
      }

      // Apply operations to the database.
      private async applyOperations(operations: Operation[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
    
        return new Promise((resolve, reject) => {
          const collections = ['products', 'orders', 'syncQueue', 'failedTransactions'];
          const transaction = this.db!.transaction(collections, 'readwrite');
          
          operations.forEach(op => {
            const store = transaction.objectStore(op.collection);
            
            switch (op.type) {
              case 'create':
              case 'update':
                store.put(op.data);
                break;
              case 'delete':
                store.delete(op.id);
                break;
            }
          });
    
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }

      // Rollback operations.
      private async rollbackOperations(operations: Operation[]): Promise<void> {
        if (!this.db) return;
    
        const collections = ['products', 'orders', 'syncQueue', 'failedTransactions'];
        const transaction = this.db.transaction(collections, 'readwrite');
        
        operations.forEach(op => {
          const store = transaction.objectStore(op.collection);
          
          if (op.type === 'delete' && op.previousData) {
            store.put(op.previousData);
          } else if (op.type === 'create') {
            store.delete(op.id);
          } else if (op.type === 'update' && op.previousData) {
            store.put(op.previousData);
          }
        });
      }
    
      // Queue transaction.
      private async queueTransaction(transaction: Transaction): Promise<void> {
        if (!this.db) return;
    
        return new Promise((resolve, reject) => {
          const dbTransaction = this.db!.transaction(['syncQueue'], 'readwrite');
          const store = dbTransaction.objectStore('syncQueue');
          
          store.put(transaction);
          
          dbTransaction.oncomplete = () => {
            this.syncStatus.pendingChanges++;
            this.emit('syncStatusChanged', this.syncStatus);
            resolve();
          };
          dbTransaction.onerror = () => reject(dbTransaction.error);
        });
      }
    
      // Sync transaction.
      private async syncTransaction(_transaction: Transaction): Promise<void> {
        // Some sort of REST API
        // For demo, simulate the sync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (Math.random() < 0.1) { // 10% failure rate for testing
          throw new Error('Sync failed');
        }
      }
    
      
      // Get queued transactions.
      private async getQueuedTransactions(): Promise<Transaction[]> {
        if (!this.db) return [];
    
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['syncQueue'], 'readonly');
          const store = transaction.objectStore('syncQueue');
          const request = store.getAll();
    
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    
      // Remove from sync queue.
      private async removeFromSyncQueue(id: string): Promise<void> {
        if (!this.db) return;
    
        return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
          const store = transaction.objectStore('syncQueue');
          
          store.delete(id);
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }

      // Generate an ID.
      private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

}
