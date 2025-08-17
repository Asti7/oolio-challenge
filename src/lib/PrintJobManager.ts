import { OfflineDataStore, DataRecord } from "./OfflineDataStore";

export interface PrintJob extends DataRecord {
    type: 'receipt' | 'kitchen' | 'bar';
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'queued' | 'printing' | 'completed' | 'failed';
    retryCount: number;
    maxRetries: number;
    errorMessage?: string;
    printerId?: string;
    template: string;
    data: any;
}

export interface Printer {
    id: string;
    name: string;
    type: 'thermal' | 'inkjet' | 'laser';
    status: 'online' | 'offline' | 'error';
    supportedFormats: string[];
    location: string;
  }
  
  export interface PrintTemplate {
    id: string;
    name: string;
    type: 'receipt' | 'kitchen' | 'bar';
    content: string;
    variables: string[];
  }

export class PrintJobManager {}