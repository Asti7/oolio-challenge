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

export class OrderManager {
    private dataStore: OfflineDataStore;
    private cart: Cart = { items: [], totalAmount: 0, itemCount: 0 };
  
    constructor(dataStore: OfflineDataStore) {
      this.dataStore = dataStore;
      this.loadCart();
    }
  
  
    ///////////////////////
    // Public methods.
    ///////////////////////
  
    // Add a product.
    async addProduct(product: Omit<Product, keyof DataRecord>): Promise<Product> {
      const newProduct: Product = {
        ...product,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
  
      await this.dataStore.transaction([{
        type: 'create',
        collection: 'products',
        id: newProduct.id,
        data: newProduct
      }]);
  
      return newProduct;
    }
  
    // Get products.
    async getProducts(category?: string): Promise<Product[]> {
      const products = await this.dataStore.getAll<Product>('products');
      
      if (category) {
        return products.filter(p => p.category === category && p.available);
      }
      
      return products.filter(p => p.available);
    }
  
    // Search products.
    async searchProducts(query: string): Promise<Product[]> {
      const products = await this.dataStore.getAll<Product>('products');
      const searchTerm = query.toLowerCase();
      
      return products.filter(p => 
        p.available && (
          p.name.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm)
        )
      );
    }
  
    // Add to cart.
    addToCart(product: Product, quantity: number = 1, customizations: string[] = [], specialRequests?: string): void {
      const existingItemIndex = this.cart.items.findIndex(item => 
        item.productId === product.id && 
        JSON.stringify(item.customizations.sort()) === JSON.stringify(customizations.sort())
      );
  
      if (existingItemIndex > -1) {
        this.cart.items[existingItemIndex].quantity += quantity;
        this.cart.items[existingItemIndex].totalPrice = 
          this.cart.items[existingItemIndex].quantity * this.cart.items[existingItemIndex].unitPrice;
      } else {
        const unitPrice = product.price + 
          customizations.reduce((sum, custId) => {
            const option = product.customizationOptions?.find(opt => opt.id === custId);
            return sum + (option?.price || 0);
          }, 0);
  
        this.cart.items.push({
          productId: product.id,
          quantity,
          customizations,
          specialRequests,
          unitPrice,
          totalPrice: unitPrice * quantity
        });
      }
  
      this.updateCartTotals();
      this.saveCart();
    }
  
    // Remove from cart.
    removeFromCart(index: number): void {
      this.cart.items.splice(index, 1);
      this.updateCartTotals();
      this.saveCart();
    }
  
    // Update item quantity.
    updateItemQuantity(index: number, quantity: number): void {
      if (quantity <= 0) {
        this.removeFromCart(index);
        return;
      }
  
      this.cart.items[index].quantity = quantity;
      this.cart.items[index].totalPrice = this.cart.items[index].unitPrice * quantity;
      this.updateCartTotals();
      this.saveCart();
    }
  
    // Clear cart.
    clearCart(): void {
      this.cart.items = [];
      this.updateCartTotals();
      this.saveCart();
    }
  
    // Get cart.
    getCart(): Cart {
      return { ...this.cart };
    }
  
    // Create an order.
    async createOrder(customerName?: string, tableNumber?: number, notes?: string): Promise<Order> {
      if (this.cart.items.length === 0) {
        throw new Error('Cannot create order with empty cart');
      }
  
      const order: Order = {
        id: this.generateId(),
        items: [...this.cart.items],
        status: 'pending',
        totalAmount: this.cart.totalAmount,
        customerName,
        tableNumber,
        notes,
        estimatedCompletion: Date.now() + (30 * 60 * 1000), // 30 minutes default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
  
      await this.dataStore.transaction([{
        type: 'create',
        collection: 'orders',
        id: order.id,
        data: order
      }]);
  
      this.clearCart();
      return order;
    }
  
    // Update order status.
    async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
      const order = await this.dataStore.get<Order>('orders', orderId);
      if (!order) throw new Error('Order not found');
  
      const updatedOrder: Order = {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
        version: order.version + 1
      };
  
      await this.dataStore.transaction([{
        type: 'update',
        collection: 'orders',
        id: orderId,
        data: updatedOrder,
        previousData: order
      }]);
    }
  
    // Get orders.
    async getOrders(status?: Order['status']): Promise<Order[]> {
      const orders = await this.dataStore.getAll<Order>('orders');
      
      if (status) {
        return orders.filter(o => o.status === status);
      }
      
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  
    async getOrder(orderId: string): Promise<Order | null> {
      return this.dataStore.get<Order>('orders', orderId);
    }
  
    ///////////////////////
    // Private methods.
    ///////////////////////
  
    private generateId(): string {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  
    private updateCartTotals(): void {
      this.cart.totalAmount = this.cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  
    private saveCart(): void {
      localStorage.setItem('oolio-cart', JSON.stringify(this.cart));
    }
  
    private loadCart(): void {
      const saved = localStorage.getItem('oolio-cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      }
    }
  }
  