# Oolio Order System - Prototype Demo Guide



## **Architecture & System Design**

### **1. Offline First Architecture** 

**a**. **Data sync strategy** - approach storing everything locally in IndexedDB as its good for structured data. Each write would go to a local outbox queue, when the device is online, the app will push queued changes to the server and then pull the latest updates. So for,

 **Orders** - treated as append-only events (have created, paid, cancelled etc) to mitigate conflicts.

**Inventory** - utilise deltas instead of overwriting totally, this will make merging easier. 

**Menu items** - assuming read-only for cashier devices, they sync from the server whenever updates are available.
Leveraging events and deltas as they minimise write conflicts and keep an audit of sorts. This leads to more read side complexity but we can rely on snapshots. An offline outbox would provide durability at the cost of syncing complexity so idempotent operations are crucial. 

**b**. I’ll approach this with some conflict resolution strategies eg; for Orders, last valid event wins, say if one device cancels the order and another already marked as paid, payment wins. For menu items, can use “last write wins”, for example, if price and name both change, the latest update is applied. From a frontend perspective, show user-facing conflict UI i.e., if conflicts can’t be resolved automatically, show them in a manager dashboard of sorts for a manual fix.

**c**. I’ll approach this by having each operation (change) have a version number or timestamp. Devices will accept only new changes if the version is higher, every operations has a unique ID so replays don’t duplicate data. Can use web sockets for real time pushes when online. For double checking I can periodically fetch server snapshots so that everything matches. Idempotent operations would be crucial here. Following optimistic UI updates ie., showing local changes immediately would be a good measure.



### **2. Performance Constraints** 

**a**. Since, the devices are memory conscious, I’ll reduce memory pressure by storing large data (orders, catalogs) in IndexedDB, not in JS memory. I can leverage web workers for background sync so the main thread stays light. Will periodically prune caches and old orders e.g, keep only for 30 days.

**b**. Leverage a light weight framework like Preact or Svelte, use minification so unused code drops out, I’ll try to avoid heavy dependencies, can caches assets with a service worker so that they are not re-downloaded, on the runtime side I can minimise re-renders by memoizing components and keeping state updates small and granular.

**c**. For low ram tablets, can use virtualised long lists to keep the DOM small. Reuse DOM nodes where possible instead of recreating them, I’ll clean up event listeners and timers when components unmount, can use debouncing like using requestIdleCallback for background work.

### **3. Multi Device Coordination** 

**a**. I’d leverage event driven UI using a publisher/subscriber model over web sockets so that both chair and kitchen devices subscribe to the same orders channel. So for eg, if one device changes an order, it publishes an event and other receive the event instantly. Obviously, each event would have an ID + version to avoid duplicates. On reconnect, devices can fetch missed updates with a since=cursor query. They can be cases where multiple tabs on the same devices are open, in that we can fan out updates using BroadcastChannel API.

**b**. I think approaching this with setting up a central print queue would be reasonable. So, devices will submit jobs with some metadata (the data could be decided based on business context), the queue processes jobs in FIFO priority, ensuring important tickets related to kitchen print first. Will have to persist jobs so that they survive restarts and they can be marked queued > printing -> done/failed so something of that sort. If a print job fails, retry with exponential backoff. I can also use a dedupe key to prevent orders being printed twice.


**c**. Browsers have difficulty to auto discover, in that cases a print agent or another device on LAN exposes a service, it shows a QR code with its address + token, other devices can to connect. Connection will be over a secure web socket with short lived token for auth. The above is for when devices discovery is flaky in auto discovery is possible, devices can pick it up without QR, the fallback would be manual entry.

### **4. Data Storage Strategy**

**a**. IndexedDB is optimal for our use case, its async, supports binary/blobs, perfect for structured data (orders, menu), optimal choice for offline first and large catalogs. WebSQL is deprecated across modern browsers, localStorage is synchronous, blocks main thread, key-value only, it provides no indexes/transactions. Good for small flags like feature toggles but not for large data.

**b**. I would store products in IndexedDB with sensible indexes, sku (primary key), category, availability, price etc. This would allow me to query quickly without scanning the whole dataset. For searching a text like typing “bur”, I’d build a simple lookup index of keywords so that productIDs are searchable instantly, assuming filter search is there, I can query directly on the IndexedDB indexes instead of filtering in memory. On the UI side, show only what the user sees by virtualising lists, can use a web worker of sort so that heavy tasks like building a search index can be delegated and not UI is stays smooth.


**c**. Following the requirement of memory conscious tablets, I’d keep only the relevant and recent data locally and get rid of the older data in the background. E.g., for:

**Orders** - can keep just the last month of orders, for older ones, keep only lightweight summaries (ID, totals, status) instead of all details.

**Inventory and menu** - keep the latest snapshot and discard old versions.

**Outbox** - once the server confirms a change, remove it from local storage. Assets can be evicted using least used method by maintaining a limited cache size.

For pruning, I would like to run a background/idle compaction job which will clean up old events and conflicts, will gradually free spaces if the device is close to quota. 


## **Brief Code Structure**

### **App Architecture**
- **Frontend**: React/Preact-based SPA with TypeScript
- **State Management**: Event-driven architecture using custom EventEmitter
- **Storage**: IndexedDB for local data persistence
- **Offline Support**: Queue-based sync system with background processing

### **Core Components**
- **ProductCatalog**: Product browsing, search, and cart management
- **ShoppingCart**: Order customization and checkout flow
- **OrderTracking**: Order status management and history
- **PrintJobManager**: Print queue handling and job processing

### **Key Classes**
- **EventEmitter**: Central event bus for component communication
- **OfflineDataStore**: IndexedDB wrapper for local storage
- **OrderManager**: Order lifecycle and status management
- **SyncEngine**: Background synchronization and conflict resolution
- **PrintJobManager**: Print job queuing and processing

### **Data Flow**
1. User interactions trigger events
2. Events update local IndexedDB storage
3. Changes queued for sync when offline
4. Background sync processes pending changes
5. Print jobs automatically generated and processed
## **What This Prototype Demonstrates**

This is a **working prototype** that showcases all the required features for a POS order management system:

### **Required Features Implemented:**

1. **Order Entry Interface** ✅
   - Product selection with search/filter
   - Customization options (add-ons, special requests)
   - Cart management with real-time totals

2. **Offline Queue Management** ✅
   - Local IndexedDB storage
   - Transaction queuing when offline
   - Automatic sync when connectivity returns

3. **Print Job Handler** ✅
   - Kitchen order printing
   - Receipt printing
   - Print job queuing and processing

4. **Local Data Management** ✅
   - Efficient storage and retrieval
   - Product catalog management
   - Order history and status tracking

##  **Test the Prototype**

### **1. Start the Application**
```bash
npm run dev
```
Visit: http://localhost:5173

### **2. Test Product Catalog**
- **Browse Products**: See sample products (burgers, pizza, salads, etc.)
- **Search & Filter**: Use search bar and category filters
- **Product Details**: Click on products to see customization options
- **Add to Cart**: Customize items and add to cart

### **3. Test Cart Management**
- **Add Items**: Add multiple products with customizations
- **Modify Quantities**: Use +/- buttons to change quantities
- **Real-time Totals**: Watch cart totals update instantly
- **Special Requests**: Add notes for kitchen staff

### **4. Test Order Creation**
- **Checkout Process**: Fill out customer details form
- **Order Submission**: Create orders and see them in tracking
- **Print Jobs**: Watch print jobs get queued automatically

### **5. Test Order Tracking**
- **Status Updates**: Click orders to see details
- **Progress Tracking**: Update order status (pending → preparing → ready → completed)
- **Order History**: View all orders with timestamps

### **6. Test Offline Capabilities**
- **Go Offline**: Disconnect internet or use DevTools → Network → Offline
- **Create Orders**: Orders will be stored locally
- **Go Online**: Reconnect to see sync happen automatically
- **Check Status Bar**: Monitor offline queue and sync status

### **7. Test Print System**
- **Print Jobs**: Watch print jobs get created for each order
- **Job Status**: See jobs move from queued → printing → completed
- **Auto-processing**: Print jobs process automatically every few seconds

## **Areas I have considered**

### **Performance Indicators:**
- **Fast Response**: Cart updates in <100ms
- **Smooth UI**: No lag when browsing products
- **Efficient Storage**: Data persists across page refreshes

### **Offline Features:**
- **Network Status**: Header shows online/offline indicator
- **Pending Changes**: Shows queued transactions
- **Auto-sync**: Background synchronization

### **Print Integration:**
- **Job Creation**: Print jobs created for kitchen and receipts
- **Job Processing**: Jobs automatically move through statuses
- **Error Handling**: Failed jobs get retried

### **Data Management:**
- **Local Storage**: All data stored in IndexedDB
- **Real-time Updates**: UI updates immediately
- **Conflict Resolution**: Smart data merging

##  **Demo Scenarios**

### **Scenario 1: Complete Order Flow**
1. Browse products → Add to cart → Checkout → Track order
2. **Expected**: Smooth flow, print jobs created, data persisted

### **Scenario 2: Offline Operation**
1. Go offline → Create orders → Go online
2. **Expected**: Orders queued offline, sync when online

### **Scenario 3: High Volume**
1. Add many items to cart → Modify quantities rapidly
2. **Expected**: Fast response, no lag, accurate totals

### **Scenario 4: Print System**
1. Create multiple orders → Watch print queue
2. **Expected**: Jobs processed automatically, status updates

## **Some UI consideration**

- **Monochrome Design**: Clean black and white theme for demo
- **Responsive Layout**: Works on all screen sizes
- **Status Indicators**: Visual feedback for all operations
- **Modal System**: Consistent overlay patterns
- **Loading States**: Smooth transitions and feedback

## **Technical Features**

- **IndexedDB**: Local database storage
- **Event System**: Component communication
- **Sync Engine**: Background data synchronization
- **Print Manager**: Job queuing and processing
- **Optimistic UI**: Immediate user feedback

## **Demo Metrics**

- **Bundle Size**: ~48.75 kB (gzipped: 15.40 kB)
- **Response Time**: <100ms for cart operations
- **Storage**: Local IndexedDB with offline queue
- **Sync**: Automatic background synchronization
- **Print**: Real-time job processing

## **Known Limitations (Prototype)**

- **Mock API**: Sync engine uses simulated endpoints
- **Print Simulation**: Print jobs are simulated (no actual printing)
- **Sample Data**: Limited to demo products
- **Basic UI**: Focused on functionality over polish


**This is the foundation that can be extended with real APIs, actual printing, and enhanced UI features. For demo purposes I have focused on implementation specfics to keep things lean.**
