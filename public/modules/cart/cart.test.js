import { CartService } from './cart.service.js';

console.log('🧪 Bắt đầu kiểm thử độc lập cho MODULE 1: GIỎ HÀNG (CART MODULE)...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Khởi tạo CartService với in-memory storage
const cart = new CartService();
assert(cart.getItems().length === 0, 'Giỏ hàng mới khởi tạo phải rỗng');
assert(cart.getTotalCount() === 0, 'Tổng số lượng món ban đầu bằng 0');
assert(cart.getSubtotal() === 0, 'Tạm tính ban đầu bằng 0đ');

// 2. Thêm món ăn mới (Item 1)
const prod1 = { id: 1, name: 'Gà Giòn Cay (2 Miếng)', price: 79000, image_url: 'ga-cay.jpg' };
cart.addItem(prod1, 1);
assert(cart.getItems().length === 1, 'Thêm 1 món: danh sách có 1 phần tử');
assert(cart.getTotalCount() === 1, 'Tổng số lượng là 1');
assert(cart.getSubtotal() === 79000, 'Tạm tính là 79.000đ');

// 3. Thêm tiếp chính món đó (Item 1 tăng quantity)
cart.addItem(prod1, 2);
assert(cart.getItems().length === 1, 'Thêm tiếp món cũ: không bị trùng lặp dòng, vẫn là 1 phần tử');
assert(cart.getTotalCount() === 3, 'Số lượng được cộng dồn thành 3');
assert(cart.getSubtotal() === 79000 * 3, `Tạm tính đúng 237.000đ (thực tế: ${cart.getSubtotal()}đ)`);

// 4. Thêm món thứ 2
const prod2 = { id: 4, name: 'Burger Zinger Cay', price: 65000, image_url: 'burger.jpg' };
cart.addItem(prod2, 1);
assert(cart.getItems().length === 2, 'Thêm món thứ 2: danh sách có 2 phần tử');
assert(cart.getTotalCount() === 4, 'Tổng số lượng là 4');
assert(cart.getSubtotal() === (79000 * 3) + 65000, `Tạm tính chính xác 302.000đ (thực tế: ${cart.getSubtotal()}đ)`);

// 5. Cập nhật số lượng qua updateQuantity
cart.updateQuantity(prod1.id, -1); // Giảm từ 3 xuống 2
assert(cart.getTotalCount() === 3, 'Giảm 1 miếng gà: tổng số lượng còn 3');
assert(cart.getSubtotal() === (79000 * 2) + 65000, 'Tạm tính cập nhật thành 223.000đ');

// 6. Áp dụng mã giảm giá cố định (GIAM20K: giảm 20.000đ cho đơn từ 120.000đ)
const promoGiam20k = {
  code: 'GIAM20K',
  title: 'Giảm 20K',
  discount_type: 'fixed',
  discount_value: 20000,
  min_order_value: 120000
};
const resPromo = cart.applyPromo(promoGiam20k);
assert(resPromo.success === true, 'Áp dụng mã GIAM20K thành công khi đủ điều kiện');
assert(cart.getDiscountAmount() === 20000, 'Tiền giảm giá đúng 20.000đ');
assert(cart.getDeliveryFee() === 15000, 'Phí ship mặc định 15.000đ');
assert(cart.getTotalAmount() === (223000 - 20000 + 15000), `Tổng thanh toán chuẩn 218.000đ (thực tế: ${cart.getTotalAmount()}đ)`);

// 7. Áp dụng mã FREESHIP (KFCFREESHIP: phí ship về 0đ)
const promoFreeship = {
  code: 'KFCFREESHIP',
  title: 'Miễn Phí Giao Hàng',
  discount_type: 'fixed',
  discount_value: 15000,
  min_order_value: 100000
};
cart.applyPromo(promoFreeship);
assert(cart.getDeliveryFee() === 0, 'Phí ship chuyển về 0đ khi áp mã KFCFREESHIP');

// 8. Áp dụng mã phần trăm có chặn trần (SUPERDEAL50: giảm 20% tối đa 50k)
const promoPercent = {
  code: 'SUPERDEAL50',
  title: 'Giảm 20% max 50k',
  discount_type: 'percent',
  discount_value: 20,
  min_order_value: 200000,
  max_discount: 50000
};
cart.applyPromo(promoPercent);
// 20% của 223.000đ là 44.600đ (< 50.000đ)
assert(cart.getDiscountAmount() === 44600, `Giảm 20% của 223.000đ đúng 44.600đ (thực tế: ${cart.getDiscountAmount()}đ)`);

// 9. Kiểm tra tự động hủy voucher khi giảm số lượng dưới min_order_value
// Xóa burger (65.000đ) -> subtotal còn 158.000đ (< min_order_value 200.000đ của SUPERDEAL50)
cart.removeItem(prod2.id);
assert(cart.getSubtotal() === 158000, 'Sau khi xóa Burger: subtotal còn 158.000đ');
assert(cart.getAppliedPromo() === null, 'Tự động gỡ voucher SUPERDEAL50 khi subtotal dưới 200.000đ');
assert(cart.getDiscountAmount() === 0, 'Tiền giảm giá tự động về 0đ');

// 10. Giảm số lượng về 0 tự động xóa món
cart.updateQuantity(prod1.id, -2);
assert(cart.getItems().length === 0, 'Giảm hết số lượng: giỏ hàng tự động rỗng');
assert(cart.getTotalCount() === 0, 'Số lượng về 0');
assert(cart.getTotalAmount() === 0, 'Tổng tiền về 0đ');

// 11. Xóa sạch giỏ hàng (Clear)
cart.addItem(prod1, 5);
cart.clear();
assert(cart.getItems().length === 0, 'Hàm clear() dọn sạch giỏ hàng thành công');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ CART MODULE: ${passed} ĐẠT, ${failed} THẤT BẠI`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 MODULE 1 (GIỎ HÀNG) HOẠT ĐỘNG CHUẨN XÁC 100%!');
}
