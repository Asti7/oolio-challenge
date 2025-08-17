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

export class OfflineDataStore {

    
}
