import { useState, useEffect, useCallback } from 'preact/hooks';
import { OfflineDataStore } from './lib/OfflineDataStore';
import { OrderManager, Product, Order } from './lib/OrderManager';
import { PrintJobManager } from './lib/PrintJobManager';
import { SyncEngine } from './lib/SyncEngine';
import { ProductCatalog } from './components/ProductCatalog';
import { ShoppingCart } from './components/ShoppingCart';
import { OrderTracking } from './components/OrderTracking';
import './app.css';

export function App() {
  const [dataStore] = useState(() => new OfflineDataStore());
  const [orderManager] = useState(() => new OrderManager(dataStore));
  const [printManager] = useState(() => new PrintJobManager(dataStore));
  const [syncEngine] = useState(() => new SyncEngine(dataStore, {
    apiBaseUrl: 'https://api.oolio.com',
    syncInterval: 30000, // 30 seconds
    batchSize: 50
  }));

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState(orderManager.getCart());
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'tracking'>('catalog');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(dataStore.getSyncStatus());
  const [printJobs, setPrintJobs] = useState<any[]>([]);

  // Initialize data and setup event listeners
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Wait for database to be ready
        await new Promise<void>((resolve) => {
          if (dataStore.getSyncStatus().isOnline) {
            resolve();
          } else {
            dataStore.on('dbReady', resolve);
          }
        });

        // Load initial data
        await loadInitialData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start background sync
        syncEngine.startSync();
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      syncEngine.stop();
      printManager.stopProcessing();
    };
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        orderManager.getProducts(),
        orderManager.getOrders()
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [orderManager]);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Listen for sync status changes
    dataStore.on('syncStatusChanged', (status: any) => {
      setSyncStatus(status);
    });

    // Listen for new orders
    dataStore.on('transactionCommitted', (transaction: any) => {
      if (transaction.operations.some((op: any) => op.collection === 'orders')) {
        loadInitialData();
      }
    });

    // Listen for network changes
    dataStore.on('online', () => {
      syncEngine.startSync();
    });

    dataStore.on('offline', () => {
      console.log('App went offline');
    });
  }, [dataStore, syncEngine, loadInitialData]);

  // Add to cart with optimistic update
  const handleAddToCart = useCallback((product: Product, quantity: number, customizations: string[], specialRequests?: string) => {
    // Optimistic update
    setCart(prevCart => {
      const newCart = { ...prevCart };
      
      // Check if item already exists with same customizations
      const existingIndex = newCart.items.findIndex(item => 
        item.productId === product.id && 
        JSON.stringify(item.customizations.sort()) === JSON.stringify(customizations.sort())
      );

      if (existingIndex > -1) {
        // Update existing item
        newCart.items[existingIndex].quantity += quantity;
        newCart.items[existingIndex].totalPrice = 
          newCart.items[existingIndex].quantity * newCart.items[existingIndex].unitPrice;
      } else {
        // Add new item
        const unitPrice = product.price + 
          customizations.reduce((sum, custId) => {
            const option = product.customizationOptions?.find(opt => opt.id === custId);
            return sum + (option?.price || 0);
          }, 0);

        newCart.items.push({
          productId: product.id,
          quantity,
          customizations,
          specialRequests,
          unitPrice,
          totalPrice: unitPrice * quantity
        });
      }

      // Update totals
      newCart.totalAmount = newCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      newCart.itemCount = newCart.items.reduce((sum, item) => sum + item.quantity, 0);

      return newCart;
    });

    // Update cart in OrderManager
    orderManager.addToCart(product, quantity, customizations, specialRequests);
    
    // Update local cart state
    setCart(orderManager.getCart());
  }, [orderManager]);

  // Update cart item quantity
  const handleUpdateQuantity = useCallback((index: number, quantity: number) => {
    // Optimistic update
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (quantity <= 0) {
        newCart.items.splice(index, 1);
      } else {
        newCart.items[index].quantity = quantity;
        newCart.items[index].totalPrice = newCart.items[index].unitPrice * quantity;
      }
      
      // Update totals
      newCart.totalAmount = newCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      newCart.itemCount = newCart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return newCart;
    });

    // Update in OrderManager
    orderManager.updateItemQuantity(index, quantity);
    
    // Update local cart state
    setCart(orderManager.getCart());
  }, [orderManager]);

  // Remove item from cart
  const handleRemoveItem = useCallback((index: number) => {
    // Optimistic update
    setCart(prevCart => {
      const newCart = { ...prevCart };
      newCart.items.splice(index, 1);
      
      // Update totals
      newCart.totalAmount = newCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      newCart.itemCount = newCart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return newCart;
    });

    // Update in OrderManager
    orderManager.removeFromCart(index);
    
    // Update local cart state
    setCart(orderManager.getCart());
  }, [orderManager]);

  // Clear cart
  const handleClearCart = useCallback(() => {
    // Optimistic update
    setCart({ items: [], totalAmount: 0, itemCount: 0 });

    // Update in OrderManager
    orderManager.clearCart();
  }, [orderManager]);

  // Create order
  const handleCreateOrder = useCallback(async (customerName: string, tableNumber: number, notes: string) => {
    try {
      // Create order with optimistic update
      const order = await orderManager.createOrder(customerName, tableNumber, notes);
      
      // Add to orders list
      setOrders(prevOrders => [order, ...prevOrders]);
      
      // Clear cart
      setCart({ items: [], totalAmount: 0, itemCount: 0 });
      
      // Queue print jobs
      await printManager.queuePrintJob('kitchen', 'default-kitchen', order, 'high');
      await printManager.queuePrintJob('receipt', 'default-receipt', order, 'normal');
      
      // Switch to tracking tab
      setActiveTab('tracking');
      
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    }
  }, [orderManager, printManager]);

  // Update order status
  const handleUpdateStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      // Optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );

      // Update in OrderManager
      await orderManager.updateOrderStatus(orderId, status);
      
      // Reload orders to get fresh data
      const updatedOrders = await orderManager.getOrders();
      setOrders(updatedOrders);
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
      
      // Revert optimistic update
      loadInitialData();
    }
  }, [orderManager, loadInitialData]);

  // Generate sample products for demo
  const generateSampleProducts = useCallback(async () => {
    if (products.length > 0) return;

    const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'version'>[] = [
      {
        name: 'Classic Burger',
        price: 12.99,
        category: 'Burgers',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        available: true,
        customizationOptions: [
          { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false },
          { id: 'bacon', name: 'Bacon', price: 2.00, required: false },
          { id: 'avocado', name: 'Avocado', price: 1.75, required: false }
        ]
      },
      {
        name: 'Margherita Pizza',
        price: 16.99,
        category: 'Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        available: true,
        customizationOptions: [
          { id: 'pepperoni', name: 'Pepperoni', price: 2.50, required: false },
          { id: 'mushrooms', name: 'Mushrooms', price: 1.50, required: false },
          { id: 'olives', name: 'Black Olives', price: 1.25, required: false }
        ]
      },
      {
        name: 'Caesar Salad',
        price: 9.99,
        category: 'Salads',
        description: 'Crisp romaine lettuce with Caesar dressing and croutons',
        available: true,
        customizationOptions: [
          { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
          { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false }
        ]
      },
      {
        name: 'Pasta Carbonara',
        price: 14.99,
        category: 'Pasta',
        description: 'Spaghetti with eggs, cheese, pancetta, and black pepper',
        available: true,
        customizationOptions: [
          { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false }
        ]
      },
      {
        name: 'Chocolate Cake',
        price: 7.99,
        category: 'Desserts',
        description: 'Rich chocolate layer cake with chocolate frosting',
        available: true,
        customizationOptions: [
          { id: 'ice-cream', name: 'Vanilla Ice Cream', price: 2.00, required: false }
        ]
      }
    ];

    try {
      for (const productData of sampleProducts) {
        await orderManager.addProduct(productData);
      }
      
      // Reload products
      const updatedProducts = await orderManager.getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Failed to generate sample products:', error);
    }
  }, [products.length, orderManager]);

  // Generate sample products on mount
  useEffect(() => {
    if (!loading && products.length === 0) {
      generateSampleProducts();
    }
  }, [loading, products.length, generateSampleProducts]);

  // Load print jobs for demo
  useEffect(() => {
    const loadPrintJobs = async () => {
      try {
        const jobs = await printManager.getPrintJobs();
        setPrintJobs(jobs);
      } catch (error) {
        console.error('Failed to load print jobs:', error);
      }
    };

    if (!loading) {
      loadPrintJobs();
      // Refresh print jobs every 5 seconds for demo
      const interval = setInterval(loadPrintJobs, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, printManager]);

  if (loading) {
    return (
      <div class="app loading">
        <div class="loading-spinner"></div>
        <p>Initializing Oolio Order System...</p>
      </div>
    );
  }

  return (
    <div class="app">
      {/* Header */}
      <header class="app-header">
        <h1>Oolio Order System</h1>
        <div class="sync-status">
          <span class={`status-indicator ${syncStatus.isOnline ? 'online' : 'offline'}`}>
            {syncStatus.isOnline ? '●' : '○'}
          </span>
          <span class="status-text">
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </span>
          {syncStatus.pendingChanges > 0 && (
            <span class="pending-changes">
              {syncStatus.pendingChanges} pending
            </span>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav class="app-nav">
        <button 
          class={`nav-tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Product Catalog
        </button>
        <button 
          class={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Cart ({cart.itemCount})
        </button>
        <button 
          class={`nav-tab ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          Order Tracking
        </button>
      </nav>

      {/* Main Content */}
      <main class="app-main">
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onAddToCart={handleAddToCart}
          />
        )}
        
        {activeTab === 'cart' && (
          <ShoppingCart
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCreateOrder={handleCreateOrder}
          />
        )}
        
        {activeTab === 'tracking' && (
          <OrderTracking
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Demo Status Bar */}
      <div class="demo-status">
        <div class="status-item">
          <strong>Offline Queue:</strong> {syncStatus.pendingChanges} transactions
        </div>
        <div class="status-item">
          <strong>Print Jobs:</strong> {printJobs.filter(j => j.status === 'queued').length} queued
        </div>
        <div class="status-item">
          <strong>Local Storage:</strong> {orders.length} orders, {products.length} products
        </div>
      </div>

      {/* Footer */}
      <footer class="app-footer">
        <p>Oolio Order System - Working Prototype with Offline Capabilities</p>
      </footer>
    </div>
  );
}
