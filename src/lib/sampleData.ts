import { Product } from './OrderManager';

export const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'version'>[] = [
  // Burgers (8 items)
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
    name: 'Bacon Cheeseburger',
    price: 15.99,
    category: 'Burgers',
    description: 'Classic burger topped with crispy bacon and melted cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-bacon', name: 'Extra Bacon', price: 2.50, required: false },
      { id: 'avocado', name: 'Avocado', price: 1.75, required: false },
      { id: 'mushrooms', name: 'Sautéed Mushrooms', price: 1.25, required: false }
    ]
  },
  {
    name: 'Veggie Burger',
    price: 13.99,
    category: 'Burgers',
    description: 'Plant-based patty with fresh vegetables and house-made sauce',
    available: true,
    customizationOptions: [
      { id: 'cheese', name: 'Vegan Cheese', price: 1.50, required: false },
      { id: 'avocado', name: 'Avocado', price: 1.75, required: false },
      { id: 'guacamole', name: 'Guacamole', price: 2.00, required: false }
    ]
  },
  {
    name: 'Mushroom Swiss Burger',
    price: 16.99,
    category: 'Burgers',
    description: 'Beef patty with sautéed mushrooms and Swiss cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-mushrooms', name: 'Extra Mushrooms', price: 1.50, required: false },
      { id: 'bacon', name: 'Bacon', price: 2.00, required: false },
      { id: 'onion-rings', name: 'Onion Rings', price: 2.25, required: false }
    ]
  },
  {
    name: 'Spicy Jalapeño Burger',
    price: 14.99,
    category: 'Burgers',
    description: 'Spicy beef burger with fresh jalapeños and pepper jack cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-jalapeños', name: 'Extra Jalapeños', price: 0.75, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false },
      { id: 'bacon', name: 'Bacon', price: 2.00, required: false }
    ]
  },
  {
    name: 'BBQ Ranch Burger',
    price: 15.99,
    category: 'Burgers',
    description: 'Beef burger with BBQ sauce, ranch dressing, and crispy onions',
    available: true,
    customizationOptions: [
      { id: 'extra-bbq', name: 'Extra BBQ Sauce', price: 0.50, required: false },
      { id: 'cheese', name: 'Cheddar Cheese', price: 1.50, required: false },
      { id: 'bacon', name: 'Bacon', price: 2.00, required: false }
    ]
  },
  {
    name: 'Double Cheeseburger',
    price: 18.99,
    category: 'Burgers',
    description: 'Two beef patties with double cheese and all the fixings',
    available: true,
    customizationOptions: [
      { id: 'extra-patty', name: 'Extra Patty', price: 3.00, required: false },
      { id: 'bacon', name: 'Bacon', price: 2.00, required: false },
      { id: 'avocado', name: 'Avocado', price: 1.75, required: false }
    ]
  },
  {
    name: 'Turkey Burger',
    price: 13.99,
    category: 'Burgers',
    description: 'Lean turkey patty with herbs and spices',
    available: true,
    customizationOptions: [
      { id: 'cheese', name: 'Swiss Cheese', price: 1.50, required: false },
      { id: 'cranberry', name: 'Cranberry Sauce', price: 1.00, required: false },
      { id: 'avocado', name: 'Avocado', price: 1.75, required: false }
    ]
  },

  // Pizza (8 items)
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
    name: 'Pepperoni Pizza',
    price: 18.99,
    category: 'Pizza',
    description: 'Classic pepperoni pizza with melted cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-pepperoni', name: 'Extra Pepperoni', price: 2.50, required: false },
      { id: 'mushrooms', name: 'Mushrooms', price: 1.50, required: false },
      { id: 'extra-cheese', name: 'Extra Cheese', price: 2.00, required: false }
    ]
  },
  {
    name: 'Supreme Pizza',
    price: 22.99,
    category: 'Pizza',
    description: 'Loaded with pepperoni, sausage, mushrooms, peppers, and olives',
    available: true,
    customizationOptions: [
      { id: 'extra-meat', name: 'Extra Meat', price: 3.00, required: false },
      { id: 'extra-veggies', name: 'Extra Vegetables', price: 2.00, required: false },
      { id: 'extra-cheese', name: 'Extra Cheese', price: 2.00, required: false }
    ]
  },
  {
    name: 'BBQ Chicken Pizza',
    price: 20.99,
    category: 'Pizza',
    description: 'BBQ sauce, grilled chicken, red onions, and cilantro',
    available: true,
    customizationOptions: [
      { id: 'extra-chicken', name: 'Extra Chicken', price: 3.00, required: false },
      { id: 'extra-bbq', name: 'Extra BBQ Sauce', price: 1.00, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 2.00, required: false }
    ]
  },
  {
    name: 'Veggie Delight Pizza',
    price: 17.99,
    category: 'Pizza',
    description: 'Fresh vegetables with mozzarella and tomato sauce',
    available: true,
    customizationOptions: [
      { id: 'extra-veggies', name: 'Extra Vegetables', price: 2.00, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 2.00, required: false },
      { id: 'olive-oil', name: 'Olive Oil Drizzle', price: 0.75, required: false }
    ]
  },
  {
    name: 'Hawaiian Pizza',
    price: 19.99,
    category: 'Pizza',
    description: 'Ham, pineapple, and mozzarella cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-ham', name: 'Extra Ham', price: 2.50, required: false },
      { id: 'extra-pineapple', name: 'Extra Pineapple', price: 1.50, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 2.00, required: false }
    ]
  },
  {
    name: 'Meat Lovers Pizza',
    price: 24.99,
    category: 'Pizza',
    description: 'Pepperoni, sausage, bacon, ham, and ground beef',
    available: true,
    customizationOptions: [
      { id: 'extra-meat', name: 'Extra Meat', price: 3.50, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 2.00, required: false },
      { id: 'sauce', name: 'Extra Sauce', price: 1.00, required: false }
    ]
  },
  {
    name: 'Buffalo Chicken Pizza',
    price: 21.99,
    category: 'Pizza',
    description: 'Buffalo sauce, grilled chicken, and blue cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-chicken', name: 'Extra Chicken', price: 3.00, required: false },
      { id: 'extra-buffalo', name: 'Extra Buffalo Sauce', price: 1.00, required: false },
      { id: 'ranch', name: 'Ranch Drizzle', price: 0.75, required: false }
    ]
  },

  // Salads (6 items)
  {
    name: 'Caesar Salad',
    price: 9.99,
    category: 'Salads',
    description: 'Crisp romaine lettuce with Caesar dressing and croutons',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false },
      { id: 'salmon', name: 'Grilled Salmon', price: 5.50, required: false }
    ]
  },
  {
    name: 'Greek Salad',
    price: 11.99,
    category: 'Salads',
    description: 'Mixed greens with feta, olives, tomatoes, and Greek dressing',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'extra-feta', name: 'Extra Feta', price: 1.50, required: false },
      { id: 'olive-oil', name: 'Olive Oil Drizzle', price: 0.75, required: false }
    ]
  },
  {
    name: 'Cobb Salad',
    price: 13.99,
    category: 'Salads',
    description: 'Mixed greens with chicken, bacon, eggs, avocado, and blue cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-chicken', name: 'Extra Chicken', price: 3.00, required: false },
      { id: 'extra-bacon', name: 'Extra Bacon', price: 2.00, required: false },
      { id: 'extra-avocado', name: 'Extra Avocado', price: 1.75, required: false }
    ]
  },
  {
    name: 'Asian Sesame Salad',
    price: 10.99,
    category: 'Salads',
    description: 'Mixed greens with sesame dressing, mandarin oranges, and almonds',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false },
      { id: 'extra-nuts', name: 'Extra Nuts', price: 1.00, required: false }
    ]
  },
  {
    name: 'Southwest Salad',
    price: 12.99,
    category: 'Salads',
    description: 'Mixed greens with black beans, corn, tomatoes, and chipotle ranch',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'guacamole', name: 'Guacamole', price: 2.00, required: false },
      { id: 'sour-cream', name: 'Sour Cream', price: 0.75, required: false }
    ]
  },
  {
    name: 'Mediterranean Salad',
    price: 11.99,
    category: 'Salads',
    description: 'Mixed greens with olives, feta, cucumbers, and balsamic vinaigrette',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'extra-feta', name: 'Extra Feta', price: 1.50, required: false },
      { id: 'olive-oil', name: 'Olive Oil Drizzle', price: 0.75, required: false }
    ]
  },

  // Pasta (6 items)
  {
    name: 'Pasta Carbonara',
    price: 14.99,
    category: 'Pasta',
    description: 'Spaghetti with eggs, cheese, pancetta, and black pepper',
    available: true,
    customizationOptions: [
      { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false },
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'extra-cheese', name: 'Extra Cheese', price: 1.50, required: false }
    ]
  },
  {
    name: 'Fettuccine Alfredo',
    price: 13.99,
    category: 'Pasta',
    description: 'Fettuccine with creamy Alfredo sauce and parmesan cheese',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'shrimp', name: 'Shrimp', price: 4.50, required: false },
      { id: 'broccoli', name: 'Broccoli', price: 1.50, required: false }
    ]
  },
  {
    name: 'Spaghetti Bolognese',
    price: 15.99,
    category: 'Pasta',
    description: 'Spaghetti with rich meat sauce and parmesan cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-meat', name: 'Extra Meat Sauce', price: 2.00, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false },
      { id: 'garlic-bread', name: 'Garlic Bread', price: 2.50, required: false }
    ]
  },
  {
    name: 'Penne Arrabbiata',
    price: 12.99,
    category: 'Pasta',
    description: 'Penne with spicy tomato sauce and red pepper flakes',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'extra-spice', name: 'Extra Spice', price: 0.50, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false }
    ]
  },
  {
    name: 'Linguine Marinara',
    price: 11.99,
    category: 'Pasta',
    description: 'Linguine with classic tomato sauce and fresh basil',
    available: true,
    customizationOptions: [
      { id: 'meatballs', name: 'Meatballs', price: 3.50, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false },
      { id: 'garlic-bread', name: 'Garlic Bread', price: 2.50, required: false }
    ]
  },
  {
    name: 'Ravioli di Ricotta',
    price: 16.99,
    category: 'Pasta',
    description: 'Ricotta-filled ravioli with sage butter sauce',
    available: true,
    customizationOptions: [
      { id: 'chicken', name: 'Grilled Chicken', price: 3.00, required: false },
      { id: 'extra-sauce', name: 'Extra Sauce', price: 1.00, required: false },
      { id: 'cheese', name: 'Extra Cheese', price: 1.50, required: false }
    ]
  },

  // Desserts (6 items)
  {
    name: 'Chocolate Cake',
    price: 7.99,
    category: 'Desserts',
    description: 'Rich chocolate layer cake with chocolate frosting',
    available: true,
    customizationOptions: [
      { id: 'ice-cream', name: 'Vanilla Ice Cream', price: 2.00, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false },
      { id: 'chocolate-sauce', name: 'Chocolate Sauce', price: 0.50, required: false }
    ]
  },
  {
    name: 'New York Cheesecake',
    price: 8.99,
    category: 'Desserts',
    description: 'Creamy cheesecake with graham cracker crust',
    available: true,
    customizationOptions: [
      { id: 'berry-sauce', name: 'Berry Sauce', price: 1.00, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false },
      { id: 'extra-crust', name: 'Extra Crust', price: 0.50, required: false }
    ]
  },
  {
    name: 'Apple Pie',
    price: 6.99,
    category: 'Desserts',
    description: 'Classic apple pie with cinnamon and flaky crust',
    available: true,
    customizationOptions: [
      { id: 'ice-cream', name: 'Vanilla Ice Cream', price: 2.00, required: false },
      { id: 'caramel-sauce', name: 'Caramel Sauce', price: 0.75, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false }
    ]
  },
  {
    name: 'Tiramisu',
    price: 9.99,
    category: 'Desserts',
    description: 'Italian dessert with coffee-soaked ladyfingers and mascarpone',
    available: true,
    customizationOptions: [
      { id: 'extra-coffee', name: 'Extra Coffee Flavor', price: 0.50, required: false },
      { id: 'chocolate-sauce', name: 'Chocolate Sauce', price: 0.50, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false }
    ]
  },
  {
    name: 'Chocolate Lava Cake',
    price: 8.99,
    category: 'Desserts',
    description: 'Warm chocolate cake with molten center',
    available: true,
    customizationOptions: [
      { id: 'ice-cream', name: 'Vanilla Ice Cream', price: 2.00, required: false },
      { id: 'berry-sauce', name: 'Berry Sauce', price: 1.00, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false }
    ]
  },
  {
    name: 'Key Lime Pie',
    price: 7.99,
    category: 'Desserts',
    description: 'Tangy key lime pie with graham cracker crust',
    available: true,
    customizationOptions: [
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.75, required: false },
      { id: 'extra-crust', name: 'Extra Crust', price: 0.50, required: false },
      { id: 'lime-zest', name: 'Extra Lime Zest', price: 0.25, required: false }
    ]
  },

  // Appetizers (6 items)
  {
    name: 'Mozzarella Sticks',
    price: 6.99,
    category: 'Appetizers',
    description: 'Crispy breaded mozzarella sticks with marinara sauce',
    available: true,
    customizationOptions: [
      { id: 'extra-sauce', name: 'Extra Marinara', price: 0.75, required: false },
      { id: 'ranch', name: 'Ranch Dressing', price: 0.75, required: false },
      { id: 'cheese-sauce', name: 'Cheese Sauce', price: 1.00, required: false }
    ]
  },
  {
    name: 'Buffalo Wings',
    price: 8.99,
    category: 'Appetizers',
    description: 'Crispy chicken wings with buffalo sauce and ranch',
    available: true,
    customizationOptions: [
      { id: 'extra-sauce', name: 'Extra Buffalo Sauce', price: 0.75, required: false },
      { id: 'blue-cheese', name: 'Blue Cheese Dressing', price: 0.75, required: false },
      { id: 'extra-wings', name: 'Extra Wings', price: 2.50, required: false }
    ]
  },
  {
    name: 'Spinach Artichoke Dip',
    price: 7.99,
    category: 'Appetizers',
    description: 'Creamy dip with spinach, artichokes, and melted cheese',
    available: true,
    customizationOptions: [
      { id: 'extra-chips', name: 'Extra Chips', price: 1.00, required: false },
      { id: 'extra-dip', name: 'Extra Dip', price: 2.00, required: false },
      { id: 'bread', name: 'Bread Instead of Chips', price: 0.50, required: false }
    ]
  },
  {
    name: 'Onion Rings',
    price: 5.99,
    category: 'Appetizers',
    description: 'Crispy beer-battered onion rings with dipping sauce',
    available: true,
    customizationOptions: [
      { id: 'extra-sauce', name: 'Extra Sauce', price: 0.75, required: false },
      { id: 'ranch', name: 'Ranch Dressing', price: 0.75, required: false },
      { id: 'extra-rings', name: 'Extra Onion Rings', price: 2.00, required: false }
    ]
  },
  {
    name: 'Garlic Bread',
    price: 4.99,
    category: 'Appetizers',
    description: 'Toasted bread with garlic butter and herbs',
    available: true,
    customizationOptions: [
      { id: 'cheese', name: 'Extra Cheese', price: 1.00, required: false },
      { id: 'extra-butter', name: 'Extra Garlic Butter', price: 0.50, required: false },
      { id: 'herbs', name: 'Extra Herbs', price: 0.25, required: false }
    ]
  },
  {
    name: 'Bruschetta',
    price: 6.99,
    category: 'Appetizers',
    description: 'Toasted bread topped with tomatoes, basil, and olive oil',
    available: true,
    customizationOptions: [
      { id: 'extra-toppings', name: 'Extra Toppings', price: 1.00, required: false },
      { id: 'cheese', name: 'Mozzarella Cheese', price: 1.50, required: false },
      { id: 'balsamic', name: 'Balsamic Glaze', price: 0.75, required: false }
    ]
  },

  // Beverages (6 items)
  {
    name: 'Fresh Lemonade',
    price: 3.99,
    category: 'Beverages',
    description: 'Freshly squeezed lemonade with a hint of sweetness',
    available: true,
    customizationOptions: [
      { id: 'extra-lemon', name: 'Extra Lemon', price: 0.25, required: false },
      { id: 'mint', name: 'Fresh Mint', price: 0.50, required: false },
      { id: 'strawberry', name: 'Strawberry Flavor', price: 0.75, required: false }
    ]
  },
  {
    name: 'Iced Tea',
    price: 2.99,
    category: 'Beverages',
    description: 'Refreshing iced tea with lemon',
    available: true,
    customizationOptions: [
      { id: 'extra-lemon', name: 'Extra Lemon', price: 0.25, required: false },
      { id: 'sweet', name: 'Sweet Tea', price: 0.25, required: false },
      { id: 'peach', name: 'Peach Flavor', price: 0.75, required: false }
    ]
  },
  {
    name: 'Smoothie',
    price: 5.99,
    category: 'Beverages',
    description: 'Fresh fruit smoothie with yogurt',
    available: true,
    customizationOptions: [
      { id: 'protein', name: 'Protein Powder', price: 1.50, required: false },
      { id: 'extra-fruit', name: 'Extra Fruit', price: 1.00, required: false },
      { id: 'honey', name: 'Honey', price: 0.50, required: false }
    ]
  },
  {
    name: 'Coffee',
    price: 2.99,
    category: 'Beverages',
    description: 'Freshly brewed coffee',
    available: true,
    customizationOptions: [
      { id: 'cream', name: 'Cream', price: 0.25, required: false },
      { id: 'sugar', name: 'Sugar', price: 0.25, required: false },
      { id: 'flavor', name: 'Flavor Shot', price: 0.50, required: false }
    ]
  },
  {
    name: 'Hot Chocolate',
    price: 3.99,
    category: 'Beverages',
    description: 'Rich hot chocolate with whipped cream',
    available: true,
    customizationOptions: [
      { id: 'whipped-cream', name: 'Extra Whipped Cream', price: 0.50, required: false },
      { id: 'marshmallows', name: 'Marshmallows', price: 0.50, required: false },
      { id: 'chocolate-sauce', name: 'Chocolate Sauce', price: 0.50, required: false }
    ]
  },
  {
    name: 'Milkshake',
    price: 4.99,
    category: 'Beverages',
    description: 'Creamy vanilla milkshake',
    available: true,
    customizationOptions: [
      { id: 'chocolate', name: 'Chocolate Flavor', price: 0.75, required: false },
      { id: 'strawberry', name: 'Strawberry Flavor', price: 0.75, required: false },
      { id: 'whipped-cream', name: 'Whipped Cream', price: 0.50, required: false }
    ]
  }
];
