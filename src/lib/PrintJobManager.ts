import { OfflineDataStore, DataRecord } from "./OfflineDataStore";
import { EventEmitter } from "./EventEmitter";

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

export class PrintJobManager extends EventEmitter {
    private dataStore: OfflineDataStore;
    private printers: Map<string, Printer> = new Map();
    private templates: Map<string, PrintTemplate> = new Map();
    private isProcessing = false;


    constructor(dataStore: OfflineDataStore) {
        super(); // Initialize EventEmitter
        this.dataStore = dataStore;
        this.initializeDefaultTemplates();
        this.startProcessing();
    }


    ///////////////////////
    // Printer Management //
    ///////////////////////

    // Add a printer
    async addPrinter(printer: Omit<Printer, 'id'>): Promise<Printer> {
        const newPrinter: Printer = {
            ...printer,
            id: this.generateId()
        };

        this.printers.set(newPrinter.id, newPrinter);
        return newPrinter;
    }

    // Add a template
    async addTemplate(template: Omit<PrintTemplate, 'id'>): Promise<PrintTemplate> {
        const newTemplate: PrintTemplate = {
            ...template,
            id: this.generateId()
        };

        this.templates.set(newTemplate.id, newTemplate);
        return newTemplate;
    }

    // Queue a print job
    async queuePrintJob(
        type: PrintJob['type'],
        templateId: string,
        data: any,
        priority: PrintJob['priority'] = 'normal',
        printerId?: string
    ): Promise<PrintJob> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }

        const content = this.renderTemplate(template, data);

        const printJob: PrintJob = {
            id: this.generateId(),
            type,
            content,
            priority,
            status: 'queued',
            retryCount: 0,
            maxRetries: 3,
            template: templateId,
            data,
            printerId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
        };

        await this.dataStore.transaction([{
            type: 'create',
            collection: 'printJobs',
            id: printJob.id,
            data: printJob
        }]);

        this.emit('printJobQueued', printJob);
        return printJob;
    }


    // Get all print jobs
    async getPrintJobs(status?: PrintJob['status']): Promise<PrintJob[]> {
        const jobs = await this.dataStore.getAll<PrintJob>('printJobs');

        if (status) {
            return jobs.filter(j => j.status === status);
        }

        return jobs.sort((a, b) => {
            const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            // Convert timestamps to numbers for comparison
            return Number(a.createdAt) - Number(b.createdAt);
        });
    }

    // Retry a failed print job
    async retryFailedJob(jobId: string): Promise<void> {
        const job = await this.dataStore.get<PrintJob>('printJobs', jobId);
        if (!job) throw new Error('Print job not found');

        if (job.status !== 'failed') {
            throw new Error('Can only retry failed jobs');
        }

        const updatedJob: PrintJob = {
            ...job,
            status: 'queued',
            retryCount: 0,
            errorMessage: undefined,
            updatedAt: new Date().toISOString(),
            version: job.version + 1
        };

        await this.dataStore.transaction([{
            type: 'update',
            collection: 'printJobs',
            id: jobId,
            data: updatedJob,
            previousData: job
        }]);
    }

    // Stop the processing loop
    stopProcessing(): void {
        this.isProcessing = false;
    }

    // Get all printers
    getPrinters(): Printer[] {
        return Array.from(this.printers.values());
    }

    // Get all templates
    getTemplates(): PrintTemplate[] {
        return Array.from(this.templates.values());
    }


    ///////////////////////
    // Template Management //
    ///////////////////////


    // Initialize default templates
    private initializeDefaultTemplates(): void {
        const receiptTemplate: PrintTemplate = {
            id: 'default-receipt',
            name: 'Default Receipt',
            type: 'receipt',
            content:
                "========================================\n" +
                "                RECEIPT\n" +
                "========================================\n" +
                "Order #: {{orderId}}\n" +
                "Date: {{date}}\n" +
                "Time: {{time}}\n" +
                "Customer: {{customerName}}\n" +
                "Table: {{tableNumber}}\n" +
                "========================================\n" +
                "{{#items}}\n" +
                "{{name}} x{{quantity}}     ${{totalPrice}}\n" +
                "{{#customizations}}\n" +
                "  + {{.}}\n" +
                "{{/customizations}}\n" +
                "{{/items}}\n" +
                "========================================\n" +
                "Subtotal: ${{subtotal}}\n" +
                "Tax: ${{tax}}\n" +
                "Total: ${{total}}\n" +
                "========================================\n" +
                "Thank you for your order!\n" +
                "========================================\n",
            variables: ['orderId', 'date', 'time', 'customerName', 'tableNumber', 'items', 'subtotal', 'tax', 'total']
        };

        const kitchenTemplate: PrintTemplate = {
            id: 'default-kitchen',
            name: 'Kitchen Order',
            type: 'kitchen',
            content:
                "========================================\n" +
                "              KITCHEN ORDER\n" +
                "========================================\n" +
                "Order #: {{orderId}}\n" +
                "Time: {{time}}\n" +
                "Table: {{tableNumber}}\n" +
                "========================================\n" +
                "{{#items}}\n" +
                "{{quantity}}x {{name}}\n" +
                "{{#customizations}}\n" +
                "  + {{.}}\n" +
                "{{/customizations}}\n" +
                "{{#specialRequests}}\n" +
                "  Note: {{.}}\n" +
                "{{/specialRequests}}\n" +
                "========================================\n" +
                "{{/items}}\n" +
                "========================================\n",
            variables: ['orderId', 'time', 'tableNumber', 'items']
        };

        this.templates.set(receiptTemplate.id, receiptTemplate);
        this.templates.set(kitchenTemplate.id, kitchenTemplate);
    }


    // Render a template
    private renderTemplate(template: PrintTemplate, data: any): string {
        let content = template.content;

        // Simple template rendering - in production you'd use a proper template engine
        template.variables.forEach(variable => {
            const regex = new RegExp(`{{${variable}}}`, 'g');

            if (variable === 'items') {
                // Handle items array specially
                const itemsContent = data.items?.map((item: any) => {
                    let itemText = `${item.quantity}x ${item.name}`;
                    if (item.customizations?.length > 0) {
                        itemText += `\n  + ${item.customizations.join(', ')}`;
                    }
                    if (item.specialRequests) {
                        itemText += `\n  Note: ${item.specialRequests}`;
                    }
                    return itemText;
                }).join('\n') || '';

                content = content.replace(regex, itemsContent);
            } else if (variable === 'date') {
                content = content.replace(regex, new Date().toLocaleDateString());
            } else if (variable === 'time') {
                content = content.replace(regex, new Date().toLocaleTimeString());
            } else {
                content = content.replace(regex, data[variable] || '');
            }
        });

        return content;
    }


    ///////////////////////
    // Processing //
    ///////////////////////


    // Start the processing loop
    private async startProcessing(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.isProcessing) {
            try {
                await this.processNextJob();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
            } catch (error) {
                console.error('Error processing print jobs:', error);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
            }
        }
    }

    // Process the next print job
    private async processNextJob(): Promise<void> {
        const queuedJobs = await this.getPrintJobs('queued');
        if (queuedJobs.length === 0) return;

        const job = queuedJobs[0];

        try {
            await this.updateJobStatus(job.id, 'printing');
            await this.printJob(job);
            await this.updateJobStatus(job.id, 'completed');
        } catch (error) {
            await this.handlePrintError(job, error instanceof Error ? error : new Error(String(error)));
        }
    }

    // Print a job
    private async printJob(_job: PrintJob): Promise<void> {
        // Simulate printing - in production this would send ESC/POS commands
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        // Simulate occasional failures
        if (Math.random() < 0.1) {
            throw new Error('Printer error');
        }
    }

    // Handle a print error
    private async handlePrintError(job: PrintJob, error: Error): Promise<void> {
        const updatedJob: PrintJob = {
            ...job,
            retryCount: job.retryCount + 1,
            errorMessage: error.message,
            updatedAt: new Date().toISOString(),
            version: job.version + 1
        };

        if (job.retryCount >= job.maxRetries) {
            updatedJob.status = 'failed';
        } else {
            updatedJob.status = 'queued';
            // Exponential backoff
            await new Promise(resolve =>
                setTimeout(resolve, Math.pow(2, job.retryCount) * 1000)
            );
        }

        await this.dataStore.transaction([{
            type: 'update',
            collection: 'printJobs',
            id: job.id,
            data: updatedJob,
            previousData: job
        }]);
    }

    // Update the status of a print job
    private async updateJobStatus(jobId: string, status: PrintJob['status']): Promise<void> {
        const job = await this.dataStore.get<PrintJob>('printJobs', jobId);
        if (!job) return;

        const updatedJob: PrintJob = {
            ...job,
            status,
            updatedAt: new Date().toISOString(),
            version: job.version + 1
        };

        await this.dataStore.transaction([{
            type: 'update',
            collection: 'printJobs',
            id: jobId,
            data: updatedJob,
            previousData: job
        }]);
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}