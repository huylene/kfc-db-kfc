import { queryAll, queryOne, execute } from './db/database.js';

console.log('🧪 Bắt đầu chạy bộ kiểm thử tự động KFC Backend & SQLite Database...\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

// 1. Kiểm tra bảng Categories
const categories = queryAll('SELECT * FROM categories');
assert(categories.length >= 6, `Số lượng danh mục phải >= 6 (thực tế: ${categories.length})`);

// 2. Kiểm tra bảng Products
const products = queryAll('SELECT * FROM products');
assert(products.length >= 15, `Số lượng món ăn phải >= 15 (thực tế: ${products.length})`);

const spicyProducts = queryAll('SELECT * FROM products WHERE is_spicy = 1');
assert(spicyProducts.length > 0, `Phải có ít nhất 1 món cay (thực tế: ${spicyProducts.length})`);

// 3. Kiểm tra Khuyến mãi (Promotions)
const promoFreeship = queryOne('SELECT * FROM promotions WHERE code = ?', ['KFCFREESHIP']);
assert(promoFreeship !== undefined && promoFreeship.discount_value === 15000, 'Mã KFCFREESHIP phải tồn tại và có giá trị giảm 15.000đ');

// 4. Kiểm tra Cửa hàng (Stores)
const storesHCM = queryAll('SELECT * FROM stores WHERE city LIKE ?', ['%Hồ Chí Minh%']);
assert(storesHCM.length >= 2, `Cửa hàng tại TP.HCM phải >= 2 (thực tế: ${storesHCM.length})`);

// 5. Kiểm tra Tạo đơn hàng và Tính toán tiền
const testOrderCode = `KFC-TEST-${Date.now().toString().slice(-4)}`;
const orderInsert = execute(`
  INSERT INTO orders (
    order_code, customer_name, customer_phone, customer_email,
    delivery_type, delivery_address, note, promo_code,
    subtotal, discount_amount, delivery_fee, total_amount,
    payment_method, payment_status, order_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING')
`, [
  testOrderCode, 'Nguyễn Kiểm Thử', '0988776655', 'test@kfc.vn',
  'delivery', '123 Đường Test, Quận 1', 'Test note', 'GIAM20K',
  150000, 20000, 15000, 145000, 'COD'
]);

assert(orderInsert.lastInsertRowid > 0, 'Tạo đơn hàng thử nghiệm thành công');

// Kiểm tra tra cứu đơn vừa tạo
const fetchedOrder = queryOne('SELECT * FROM orders WHERE order_code = ?', [testOrderCode]);
assert(fetchedOrder && fetchedOrder.total_amount === 145000, 'Tra cứu đơn hàng kiểm tra khớp tổng tiền 145.000đ');

// Cập nhật trạng thái đơn
execute("UPDATE orders SET order_status = 'PREPARING' WHERE order_code = ?", [testOrderCode]);
const updatedOrder = queryOne('SELECT order_status FROM orders WHERE order_code = ?', [testOrderCode]);
assert(updatedOrder.order_status === 'PREPARING', 'Cập nhật trạng thái đơn thành công sang PREPARING');

// Dọn dẹp đơn test
execute('DELETE FROM orders WHERE order_code = ?', [testOrderCode]);

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${testsPassed} ĐẠT, ${testsFailed} THẤT BẠI`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Toàn bộ bài kiểm thử CSDL đã thành công xuất sắc!');
}
