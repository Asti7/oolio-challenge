import { useState, useCallback } from 'preact/hooks';
import { Cart } from '../lib/OrderManager';

interface ShoppingCartProps {
  cart: Cart;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCreateOrder: (customerName: string, tableNumber: number, notes: string) => void;
}

export function ShoppingCart({ 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onCreateOrder 
}: ShoppingCartProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState(1);
  const [notes, setNotes] = useState('');

  // Handle quantity update with optimistic UI
  const handleQuantityUpdate = useCallback((index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(index);
    } else {
      onUpdateQuantity(index, newQuantity);
    }
  }, [onUpdateQuantity, onRemoveItem]);

  // Handle order creation
  const handleCreateOrder = useCallback(() => {
    if (!customerName.trim()) return;
    
    onCreateOrder(customerName.trim(), tableNumber, notes.trim());
    
    // Reset form
    setCustomerName('');
    setTableNumber(1);
    setNotes('');
    setShowOrderForm(false);
  }, [customerName, tableNumber, notes, onCreateOrder]);

  // Format price consistently
  const formatPrice = useCallback((price: number) => {
    return `$${price.toFixed(2)}`;
  }, []);

  if (cart.items.length === 0) {
    return (
      <div class="shopping-cart empty">
        <div class="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div class="shopping-cart">
      <div class="cart-header">
        <h3>Shopping Cart</h3>
        <span class="item-count">{cart.itemCount} items</span>
      </div>

      {/* Cart Items */}
      <div class="cart-items">
        {cart.items.map((item, index) => (
          <div key={`${item.productId}-${index}`} class="cart-item">
            <div class="item-info">
              <h4 class="item-name">
                {item.productId} {/* We'll need to get product name from products list */}
              </h4>
              
              {item.customizations.length > 0 && (
                <div class="item-customizations">
                  {item.customizations.map(custId => (
                    <span key={custId} class="customization-tag">
                      + {custId}
                    </span>
                  ))}
                </div>
              )}
              
              {item.specialRequests && (
                <p class="special-requests">
                  <em>Note: {item.specialRequests}</em>
                </p>
              )}
            </div>

            <div class="item-controls">
              <div class="quantity-controls">
                <button 
                  onClick={() => handleQuantityUpdate(index, item.quantity - 1)}
                  class="quantity-btn"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span class="quantity">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityUpdate(index, item.quantity + 1)}
                  class="quantity-btn"
                >
                  +
                </button>
              </div>
              
              <div class="item-pricing">
                <span class="unit-price">
                  {formatPrice(item.unitPrice)} each
                </span>
                <span class="total-price">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
              
              <button 
                onClick={() => onRemoveItem(index)}
                class="remove-btn"
                title="Remove item"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>{formatPrice(cart.totalAmount)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (8.5%):</span>
          <span>{formatPrice(cart.totalAmount * 0.085)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>{formatPrice(cart.totalAmount * 1.085)}</span>
        </div>
      </div>

      {/* Cart Actions */}
      <div class="cart-actions">
        <button 
          onClick={onClearCart}
          class="clear-cart-btn"
        >
          Clear Cart
        </button>
        
        <button 
          onClick={() => setShowOrderForm(true)}
          class="checkout-btn"
          disabled={cart.items.length === 0}
        >
          Checkout
        </button>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div class="modal-overlay" onClick={() => setShowOrderForm(false)}>
          <div class="modal-content order-form" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Complete Your Order</h3>
              <button 
                class="close-button"
                onClick={() => setShowOrderForm(false)}
              >
                ×
              </button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label for="customer-name">Customer Name *</label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName((e.target as HTMLInputElement).value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="table-number">Table Number</label>
                <input
                  id="table-number"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(Number((e.target as HTMLInputElement).value))}
                  min="1"
                  max="50"
                />
              </div>
              
              <div class="form-group">
                <label for="notes">Special Instructions</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>
              
              <div class="order-summary">
                <h4>Order Summary</h4>
                <div class="summary-row">
                  <span>Items:</span>
                  <span>{cart.itemCount}</span>
                </div>
                <div class="summary-row">
                  <span>Total:</span>
                  <span>{formatPrice(cart.totalAmount * 1.085)}</span>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                onClick={() => setShowOrderForm(false)}
                class="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateOrder}
                class="place-order-btn"
                disabled={!customerName.trim()}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
