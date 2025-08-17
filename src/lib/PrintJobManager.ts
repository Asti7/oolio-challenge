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

export class PrintJobManager {
    private dataStore: OfflineDataStore = new OfflineDataStore();
    private printers: Map<string, Printer> = new Map();
    private templates: Map<string, PrintTemplate> = new Map();
    private isProcessing = false;


    constructor(dataStore: OfflineDataStore) {
        this.dataStore = dataStore;
        this.initializeDefaultTemplates();
    }

    private initializeDefaultTemplates(): void {
        const receiptTemplate: PrintTemplate = {
            id: 'default-receipt',
            name: 'Default Receipt',
            type: 'receipt',
            content: `
            ========================================
                        RECEIPT
            ========================================
            Order #: {{orderId}}
            Date: {{date}}
            Time: {{time}}
            Customer: {{customerName}}
            Table: {{tableNumber}}
            ========================================
            {{#items}}
            {{name}} x{{quantity}}     ${{ totalPrice }}
            {{#customizations}}
              + {{.}}
            {{/customizations}}
            {{/items}}
            ========================================
            Subtotal: ${{ subtotal }}
            Tax: ${{ tax }}
            Total: ${{ total }}
            ========================================
            Thank you for your order!
            ========================================
          `,
            variables: ['orderId', 'date', 'time', 'customerName', 'tableNumber', 'items', 'subtotal', 'tax', 'total']
        };

        const kitchenTemplate: PrintTemplate = {
            id: 'default-kitchen',
            name: 'Kitchen Order',
            type: 'kitchen',
            content: `
            ========================================
                      KITCHEN ORDER
            ========================================
            Order #: {{orderId}}
            Time: {{time}}
            Table: {{tableNumber}}
            ========================================
            {{#items}}
            {{quantity}}x {{name}}
            {{#customizations}}
              + {{.}}
            {{/customizations}}
            {{#specialRequests}}
              Note: {{.}}
            {{/specialRequests}}
            ========================================
            {{/items}}
            ========================================
          `,
            variables: ['orderId', 'time', 'tableNumber', 'items']
        };

        this.templates.set(receiptTemplate.id, receiptTemplate);
        this.templates.set(kitchenTemplate.id, kitchenTemplate);
    }




}