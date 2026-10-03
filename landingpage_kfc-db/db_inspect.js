import db from './db/database.js';

const customQuery = process.argv[2];

if (customQuery) {
  console.log(`\n🔍 Đang thực thi truy vấn tùy chỉnh:\n> ${customQuery}\n`);
  try {
    const results = db.prepare(customQuery).all();
    if (results.length === 0) {
      console.log('ℹ️ Không có kết quả phù hợp (0 bản ghi).');
    } else {
      console.table(results);
      console.log(`\nTổng số kết quả: ${results.length} bản ghi.`);
    }
  } catch (err) {
    console.error('❌ Lỗi cú pháp SQL:', err.message);
  }
  process.exit(0);
}

console.log('================================================================');
console.log('🍗 TỔNG QUAN DỮ LIỆU MẪU CƠ SỞ DỮ LIỆU KFC (kfc.sqlite)');
console.log('================================================================\n');

// 1. DANH MỤC (CATEGORIES)
console.log('📁 1. BẢNG CATEGORIES (Danh Mục Món Ăn):');
const categories = db.prepare('SELECT id, name, slug, display_order FROM categories ORDER BY display_order').all();
console.table(categories);

// 2. MÓN ĂN TIÊU BIỂU (PRODUCTS)
console.log('\n🍗 2. BẢNG PRODUCTS (Món Ăn Mẫu - 8 món tiêu biểu):');
const products = db.prepare(`
  SELECT p.id, p.name, p.price, p.is_spicy AS cay, p.is_popular AS ban_chay, c.name AS danh_muc
  FROM products p
  JOIN categories c ON p.category_id = c.id
  LIMIT 8
`).all();
console.table(products);

// 3. MÃ KHUYẾN MÃI (PROMOTIONS)
console.log('\n🎟️ 3. BẢNG PROMOTIONS (Mã Giảm Giá Sẵn Sàng Dùng Thử):');
const promos = db.prepare('SELECT id, code, title, discount_type, discount_value, min_order_value FROM promotions').all();
console.table(promos);

// 4. HỆ THỐNG CỬA HÀNG (STORES)
console.log('\n📍 4. BẢNG STORES (Chi Nhánh Cửa Hàng):');
const stores = db.prepare('SELECT id, name, district, city, phone, opening_hours, has_drive_thru FROM stores').all();
console.table(stores);

// 5. ĐƠN HÀNG MẪU (ORDERS)
console.log('\n📦 5. BẢNG ORDERS (Đơn Hàng Gần Nhất Để Test Tra Cứu):');
const orders = db.prepare(`
  SELECT id, order_code, customer_name, customer_phone, total_amount, payment_method, order_status
  FROM orders
  ORDER BY id DESC
  LIMIT 5
`).all();
console.table(orders);

// 6. ĐÁNH GIÁ MẪU (REVIEWS)
console.log('\n⭐ 6. BẢNG REVIEWS (Đánh Giá Từ Thực Khách):');
const reviews = db.prepare('SELECT id, customer_name, rating, comment FROM reviews LIMIT 4').all();
console.table(reviews);

console.log('================================================================');
console.log('💡 HƯỚNG DẪN THỰC THI TRUY VẤN TÙY CHỌN:');
console.log('   node db_inspect.js "SELECT * FROM products WHERE is_spicy = 1"');
console.log('   node db_inspect.js "SELECT * FROM orders WHERE customer_phone = \'0912345678\'"');
console.log('================================================================\n');
