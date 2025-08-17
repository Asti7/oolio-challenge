import { DataRecord } from "./OfflineDataStore";

export interface SyncConfig {
    apiBaseUrl: string;
    syncInterval: number;
    maxRetries: number;
    retryDelay: number;
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
    mergedData?: any;
  }

  export class SyncEngine {}