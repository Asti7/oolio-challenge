import { useState, useMemo, useCallback } from 'preact/hooks';
import { Order, Product } from '../lib/OrderManager';

interface OrderTrackingProps {
  orders: Order[];
  products: Product[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export function OrderTracking({ orders, products, onUpdateStatus }: OrderTrackingProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | ''>('');

  // Memoized filtered orders for performance
  const filteredOrders = useMemo(() => {
    if (!filterStatus) return orders;
    return orders.filter(order => order.status === filterStatus);
  }, [orders, filterStatus]);

  // Group orders by status for better organization
  const ordersByStatus = useMemo(() => {
    const grouped: Record<Order['status'], Order[]> = {
      pending: [],
      preparing: [],
      ready: [],
      completed: [],
      cancelled: []
    };

    filteredOrders.forEach(order => {
      grouped[order.status].push(order);
    });

    return grouped;
  }, [filteredOrders]);

  // Format timestamp
  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: Order['status']) => {
    switch (status) {
      case 'pending': return '#666';
      case 'preparing': return '#f39c12';
      case 'ready': return '#27ae60';
      case 'completed': return '#2ecc71';
      default: return '#666';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: Order['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'completed': return '🎉';
      default: return '❓';
    }
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback((orderId: string, newStatus: Order['status']) => {
    onUpdateStatus(orderId, newStatus);
    
    // Optimistically update the local state
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder({ ...order, status: newStatus });
    }
  }, [onUpdateStatus, orders]);

  // Get product name by ID
  const getProductName = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || `Product ${productId}`;
  }, [products]);

  // Get next status for an order
  const getNextStatus = useCallback((currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  }, []);

  return (
    <div class="order-tracking">
      <div class="tracking-header">
        <h3>Order Tracking</h3>
        <div class="status-filter">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value as Order['status'] | '')}
            class="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders by Status */}
      <div class="orders-container">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          if (statusOrders.length === 0) return null;
          
          return (
            <div key={status} class="status-section">
              <div class="status-header" style={{ borderLeftColor: getStatusColor(status as Order['status']) }}>
                <span class="status-icon">{getStatusIcon(status as Order['status'])}</span>
                <h4 class="status-title">{status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                <span class="order-count">{statusOrders.length}</span>
              </div>
              
              <div class="orders-list">
                {statusOrders.map(order => (
                  <div 
                    key={order.id} 
                    class="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div class="order-header">
                      <span class="order-id">#{order.id.slice(-6)}</span>
                      <span class="order-time">{formatTime(order.createdAt)}</span>
                    </div>
                    
                    <div class="order-items">
                      {order.items.slice(0, 2).map((item, index) => (
                        <span key={index} class="order-item">
                          {item.quantity}x {getProductName(item.productId)}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span class="more-items">+{order.items.length - 2} more</span>
                      )}
                    </div>
                    
                    <div class="order-footer">
                      <span class="order-total">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div class="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div class="modal-content order-detail" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Order #{selectedOrder.id.slice(-6)}</h3>
              <button 
                class="close-button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            
            <div class="modal-body">
              <div class="order-info">
                <div class="info-row">
                  <span class="label">Status:</span>
                  <span class="value status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                
                <div class="info-row">
                  <span class="label">Customer:</span>
                  <span class="value">{selectedOrder.customerName || 'Walk-in'}</span>
                </div>
                
                {selectedOrder.tableNumber && (
                  <div class="info-row">
                    <span class="label">Table:</span>
                    <span class="value">{selectedOrder.tableNumber}</span>
                  </div>
                )}
                
                <div class="info-row">
                  <span class="label">Created:</span>
                  <span class="value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                
                {selectedOrder.notes && (
                  <div class="info-row">
                    <span class="label">Notes:</span>
                    <span class="value">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>
              
              <div class="order-items-detail">
                <h4>Order Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} class="detail-item">
                    <div class="item-main">
                      <span class="item-quantity">{item.quantity}x</span>
                      <span class="item-name">{getProductName(item.productId)}</span>
                      <span class="item-price">${item.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    {item.customizations.length > 0 && (
                      <div class="item-customizations">
                        {item.customizations.map(custId => (
                          <span key={custId} class="customization">+ {custId}</span>
                        ))}
                      </div>
                    )}
                    
                    {item.specialRequests && (
                      <div class="special-requests">
                        <em>Note: {item.specialRequests}</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div class="order-total-detail">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Tax (8.5%):</span>
                  <span>${(selectedOrder.totalAmount * 0.085).toFixed(2)}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>${(selectedOrder.totalAmount * 1.085).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              {getNextStatus(selectedOrder.status) && (
                <button 
                  onClick={() => handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                  class="update-status-btn"
                >
                  Mark as {getNextStatus(selectedOrder.status) ? getNextStatus(selectedOrder.status)!.charAt(0).toUpperCase() + getNextStatus(selectedOrder.status)!.slice(1) : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
