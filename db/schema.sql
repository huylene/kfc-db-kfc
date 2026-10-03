-- ========================================================
-- KFC VIETNAM DATABASE SCHEMA (SQLITE)
-- ========================================================

PRAGMA foreign_keys = ON;

-- 1. BẢNG CATEGORIES (DANH MỤC MÓN ĂN)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 2. BẢNG PRODUCTS (DANH SÁCH MÓN ĂN & COMBO)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price INTEGER NOT NULL,
    original_price INTEGER,
    image_url TEXT NOT NULL,
    is_spicy INTEGER DEFAULT 0,
    is_popular INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    is_available INTEGER DEFAULT 1,
    calories INTEGER,
    prep_time_minutes INTEGER DEFAULT 15,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
);

-- 3. BẢNG PROMOTIONS (MÃ GIẢM GIÁ & ƯU ĐÃI)
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value INTEGER NOT NULL,
    min_order_value INTEGER DEFAULT 0,
    max_discount INTEGER,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 4. BẢNG STORES (HỆ THỐNG CHI NHÁNH CỬA HÀNG)
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    opening_hours TEXT DEFAULT '08:00 - 22:00',
    latitude REAL,
    longitude REAL,
    has_drive_thru INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 5. BẢNG ORDERS (ĐƠN ĐẶT HÀNG)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_address TEXT,
    note TEXT,
    promo_code TEXT,
    subtotal INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    delivery_fee INTEGER DEFAULT 15000,
    total_amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'MOMO', 'ZALOPAY', 'BANKING', 'ATM')),
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    order_status TEXT DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 6. BẢNG ORDER_ITEMS (CHI TIẾT MÓN ĂN TRONG ĐƠN)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal INTEGER NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
);

-- 7. BẢNG REVIEWS (ĐÁNH GIÁ CỦA KHÁCH HÀNG)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
);

-- CHỈ MỤC TĂNG TỐC ĐỘ TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available_popular ON products(is_available, is_popular);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
