/*
  # E-commerce Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key) - Unique product identifier
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (numeric) - Product price
      - `image_url` (text) - Product image URL
      - `stock` (integer) - Available quantity
      - `category` (text) - Product category
      - `created_at` (timestamptz) - Creation timestamp
    
    - `orders`
      - `id` (uuid, primary key) - Unique order identifier
      - `customer_name` (text) - Customer full name
      - `customer_email` (text) - Customer email address
      - `customer_phone` (text) - Customer phone number
      - `total_amount` (numeric) - Total order amount
      - `status` (text) - Order status (pending, completed, cancelled)
      - `created_at` (timestamptz) - Order creation timestamp
    
    - `order_items`
      - `id` (uuid, primary key) - Unique order item identifier
      - `order_id` (uuid, foreign key) - Reference to orders table
      - `product_id` (uuid, foreign key) - Reference to products table
      - `quantity` (integer) - Quantity ordered
      - `price` (numeric) - Price at time of order
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Products table: Public read access, no write access for anonymous users
    - Orders and order_items: Public insert access only (for checkout)
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text DEFAULT '',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies: Anyone can read, no one can write (admin would handle this separately)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Orders policies: Anyone can insert orders (for checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Order items policies: Anyone can insert order items (for checkout)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, stock, category) VALUES
('Smartphone Premium', 'Smartphone de última geração com câmera de 108MP e 5G', 2499.90, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800', 50, 'eletrônicos'),
('Notebook Profissional', 'Notebook com processador Intel i7, 16GB RAM, SSD 512GB', 4299.00, 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', 30, 'eletrônicos'),
('Fone Bluetooth', 'Fone de ouvido wireless com cancelamento de ruído', 299.90, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', 100, 'acessórios'),
('Smartwatch Fitness', 'Relógio inteligente com monitoramento de saúde 24/7', 899.00, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', 75, 'eletrônicos'),
('Câmera DSLR', 'Câmera profissional 24MP com lente 18-55mm', 3599.00, 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800', 20, 'eletrônicos'),
('Tablet 10 polegadas', 'Tablet com tela HD, 64GB de armazenamento', 1299.00, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800', 60, 'eletrônicos'),
('Teclado Mecânico', 'Teclado gamer RGB com switches mecânicos', 449.90, 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800', 80, 'acessórios'),
('Mouse Gamer', 'Mouse óptico 16000 DPI com iluminação RGB', 199.90, 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800', 120, 'acessórios')
ON CONFLICT DO NOTHING;
