import { OfflineDataStore, DataRecord } from './OfflineDataStore';

export interface Product extends DataRecord {
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  customizationOptions?: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  required: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  customizations: string[];
  specialRequests?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order extends DataRecord {
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  customerName?: string;
  tableNumber?: number;
  notes?: string;
  estimatedCompletion?: number;
}

export interface Cart {
  items: OrderItem[];
  totalAmount: number;
  itemCount: number;
}

export class OrderManager {}