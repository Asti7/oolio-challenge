# Oolio Order System - Prototype Demo Guide

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


**This is foundation that can be extended with real APIs, actual printing, and enhanced UI features. For demo purposes I have focused on implemneation specfics to keep things lean.**
