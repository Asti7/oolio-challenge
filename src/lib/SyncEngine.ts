import { OfflineDataStore, DataRecord, Transaction } from './OfflineDataStore';

export interface SyncConfig {
    apiBaseUrl: string;
    syncInterval: number;
    batchSize: number;
}

export interface SyncResult {
    success: boolean;
    syncedItems: number;
    errors: string[];
    timestamp: number;
}

export interface SyncConflict {
    localItem: DataRecord;
    remoteItem: DataRecord;
    resolution: 'local' | 'remote' | 'merge';
}

export class SyncEngine {
    private dataStore: OfflineDataStore;
    private config: SyncConfig;
    private syncInProgress = false;
    private lastSyncTime = 0;
    private syncIntervalId?: NodeJS.Timeout;

    constructor(dataStore: OfflineDataStore, config: SyncConfig) {
        this.dataStore = dataStore;
        this.config = config;
        this.setupSyncInterval();
    }

    ///////////////////////
    // Public methods.
    ///////////////////////

    // Resolve a conflict.
    async resolveConflict(conflict: SyncConflict): Promise<void> {
        let resolvedData: any;

        switch (conflict.resolution) {
            case 'local':
                resolvedData = conflict.localItem;
                break;
            case 'remote':
                resolvedData = conflict.remoteItem;
                break;
            case 'merge':
                resolvedData = this.mergeData(conflict.localItem, conflict.remoteItem);
                break;
        }

        if (resolvedData) {
            await this.dataStore.transaction([{
                type: 'update',
                collection: this.getCollectionFromItem(resolvedData),
                id: resolvedData.id,
                data: resolvedData
            }]);
        }
    }

    // Get the sync status.
    async getSyncStatus(): Promise<{
        lastSync: number;
        pendingChanges: number;
        isOnline: boolean;
        syncInProgress: boolean;
    }> {
        const pendingTransactions = await this.getPendingTransactions();

        return {
            lastSync: this.lastSyncTime,
            pendingChanges: pendingTransactions.length,
            isOnline: navigator.onLine,
            syncInProgress: this.syncInProgress
        };
    }

    // Start the sync.
    async startSync(): Promise<SyncResult> {
        if (this.syncInProgress) {
            throw new Error('Sync already in progress');
        }

        this.syncInProgress = true;
        const result: SyncResult = {
            success: false,
            syncedItems: 0,
            errors: [],
            timestamp: Date.now()
        };

        try {
            if (!navigator.onLine) {
                throw new Error('No network connectivity');
            }

            // Get pending changes
            const pendingTransactions = await this.getPendingTransactions();

            if (pendingTransactions.length === 0) {
                result.success = true;
                return result;
            }

            // Process in batches
            const batches = this.chunkArray(pendingTransactions, this.config.batchSize);

            for (const batch of batches) {
                try {
                    const batchResult = await this.syncBatch(batch);
                    result.syncedItems += batchResult.syncedItems;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    result.errors.push(`Batch sync failed: ${errorMessage}`);
                }
            }

            result.success = result.errors.length === 0;
            this.lastSyncTime = Date.now();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Sync failed: ${errorMessage}`);
        } finally {
            this.syncInProgress = false;
        }

        return result;
    }

    ///////////////////////
    // Private methods.
    ///////////////////////

    // Setup the sync interval.
    private setupSyncInterval(): void {
        if (this.config.syncInterval > 0) {
            this.syncIntervalId = setInterval(() => {
                this.syncIfNeeded();
            }, this.config.syncInterval);
        }
    }

    // Sync a batch of transactions.
    private async syncBatch(transactions: Transaction[]): Promise<{ syncedItems: number }> {
        let syncedItems = 0;

        for (const transaction of transactions) {
            try {
                await this.syncTransaction(transaction);
                await this.markTransactionSynced(transaction.id);
                syncedItems += transaction.operations.length;
            } catch (error: unknown) {
                console.error('Transaction sync failed:', error);
                throw error;
            }
        }

        return { syncedItems };
    }

    // Sync a transaction.
    private async syncTransaction(transaction: Transaction): Promise<void> {
        const response = await fetch(`${this.config.apiBaseUrl}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Sync failed');
        }
    }

    // Mark a transaction as synced.
    private async markTransactionSynced(transactionId: string): Promise<void> {
        await this.dataStore.transaction([{
            type: 'delete',
            collection: 'syncQueue',
            id: transactionId
        }]);
    }

    // Merge data.
    private mergeData(local: DataRecord, remote: DataRecord): any {
        // merge, takes the most recent version
        if (local.updatedAt > remote.updatedAt) {
            return { ...local, version: Math.max(local.version, remote.version) + 1 };
        } else {
            return { ...remote, version: Math.max(local.version, remote.version) + 1 };
        }
    }

    // Get the collection from an item.
    private getCollectionFromItem(item: any): string {
        if (item.items && item.status) return 'orders';
        if (item.price !== undefined) return 'products';
        return 'unknown';
    }


    // Get the pending transactions.
    private async getPendingTransactions(): Promise<Transaction[]> {
        return this.dataStore.getAll<Transaction>('syncQueue');
    }

    // Sync if needed.
    private async syncIfNeeded(): Promise<void> {
        if (!this.syncInProgress && navigator.onLine) {
            try {
                await this.startSync();
            } catch (error) {
                console.error('Background sync failed:', error);
            }
        }
    }

    // Chunk an array.
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Stop the sync.
    stop(): void {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = undefined;
        }
    }
}