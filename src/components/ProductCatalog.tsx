import { useState, useMemo, useCallback, useRef, useEffect } from 'preact/hooks';
import { Product } from '../lib/OrderManager';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number, customizations: string[], specialRequests?: string) => void;
}

export function ProductCatalog({ products, onAddToCart }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const productListRef = useRef<HTMLDivElement>(null);

  // Memoized filtered and sorted products for performance
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
    
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  // Debounced search for performance
  const debouncedSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => setSearchQuery(query), 150);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle search input
  const handleSearchChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    debouncedSearch(target.value);
  }, [debouncedSearch]);

  // Add to cart with optimistic update
  const handleAddToCart = useCallback(() => {
    if (!selectedProduct) return;
    
    onAddToCart(selectedProduct, quantity, selectedCustomizations, specialRequests);
    
    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedCustomizations([]);
    setSpecialRequests('');
  }, [selectedProduct, quantity, selectedCustomizations, specialRequests, onAddToCart]);

  // Toggle customization selection
  const toggleCustomization = useCallback((customizationId: string) => {
    setSelectedCustomizations(prev => 
      prev.includes(customizationId)
        ? prev.filter(id => id !== customizationId)
        : [...prev, customizationId]
    );
  }, []);

  // Calculate total price including customizations
  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    
    const basePrice = selectedProduct.price;
    const customizationPrice = selectedCustomizations.reduce((sum, custId) => {
      const option = selectedProduct.customizationOptions?.find(opt => opt.id === custId);
      return sum + (option?.price || 0);
    }, 0);
    
    return (basePrice + customizationPrice) * quantity;
  }, [selectedProduct, selectedCustomizations, quantity]);

  // Focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div class="product-catalog">
      {/* Search and Filters */}
      <div class="catalog-controls">
        <div class="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            class="search-input"
            onInput={handleSearchChange}
          />
        </div>
        
        <div class="filters">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
            class="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as any)}
            class="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
          
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            class="sort-button"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div class="product-grid" ref={productListRef}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            class="product-card"
            onClick={() => setSelectedProduct(product)}
          >
            <div class="product-image">
              <div class="product-placeholder">{product.name.charAt(0)}</div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{product.name}</h3>
              <p class="product-category">{product.category}</p>
              <p class="product-price">${product.price.toFixed(2)}</p>
              {product.description && (
                <p class="product-description">{product.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div class="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{selectedProduct.name}</h2>
              <button 
                class="close-button"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>
            
            <div class="modal-body">
              <div class="modal-image">
                <div class="product-placeholder large">{selectedProduct.name.charAt(0)}</div>
              </div>
              
              <p class="modal-description">{selectedProduct.description}</p>
              <p class="modal-price">${selectedProduct.price.toFixed(2)}</p>
              
              {selectedProduct.customizationOptions && selectedProduct.customizationOptions.length > 0 && (
                <div class="customizations">
                  <h3>Customizations</h3>
                  {selectedProduct.customizationOptions.map(option => (
                    <label key={option.id} class="customization-option">
                      <input
                        type="checkbox"
                        checked={selectedCustomizations.includes(option.id)}
                        onChange={() => toggleCustomization(option.id)}
                      />
                      <span class="customization-name">
                        {option.name} {option.required && '(Required)'}
                      </span>
                      <span class="customization-price">+${option.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}
              
              <div class="quantity-selector">
                <label>Quantity:</label>
                <div class="quantity-controls">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
                </div>
              </div>
              
              <div class="special-requests">
                <label>Special Requests:</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests((e.target as HTMLTextAreaElement).value)}
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>
              
              <div class="total-price">
                <strong>Total: ${totalPrice.toFixed(2)}</strong>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                class="add-to-cart-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
