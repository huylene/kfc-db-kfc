import db, { execute, queryOne } from './database.js';

console.log('🚀 Bắt đầu nạp dữ liệu mẫu (Seeding) cho CSDL KFC...');

// Bật khóa ngoại
db.exec('PRAGMA foreign_keys = ON;');

// Xóa dữ liệu cũ để tránh trùng lặp
db.exec(`
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM reviews;
  DELETE FROM products;
  DELETE FROM promotions;
  DELETE FROM stores;
  DELETE FROM categories;
`);

// 1. CHÈN DANH MỤC (CATEGORIES)
const categories = [
  { name: 'Gà Rán & Gà Quay', slug: 'ga-ran-ga-quay', description: 'Gà tươi 100% tẩm ướp 11 loại gia vị bí truyền', icon: 'drumstick', order: 1 },
  { name: 'Combo 1 Người', slug: 'combo-1-nguoi', description: 'Khẩu phần hoàn hảo vừa vặn cho một người', icon: 'user', order: 2 },
  { name: 'Combo Nhóm & Gia Đình', slug: 'combo-nhom', description: 'Tiết kiệm hơn, sum vầy trọn niềm vui', icon: 'users', order: 3 },
  { name: 'Burger & Cơm & Mì Ý', slug: 'burger-com', description: 'Bữa chính no bụng, đa dạng hương vị', icon: 'sandwich', order: 4 },
  { name: 'Thức Ăn Nhẹ & Tráng Miệng', slug: 'thuc-an-nhe', description: 'Bánh trứng, khoai tây giòn tan khó cưỡng', icon: 'cookie', order: 5 },
  { name: 'Thức Uống', slug: 'thuc-uong', description: 'Nước ngọt có gas và đồ uống giải nhiệt mát lạnh', icon: 'cup-soda', order: 6 },
];

const insertCategory = db.prepare(`
  INSERT INTO categories (name, slug, description, icon, display_order)
  VALUES (?, ?, ?, ?, ?)
`);

for (const cat of categories) {
  insertCategory.run(cat.name, cat.slug, cat.description, cat.icon, cat.order);
}
console.log('✅ Đã nạp thành công 6 danh mục.');

// 2. CHÈN MÓN ĂN (PRODUCTS)
const products = [
  // Gà Rán & Gà Quay (Category 1)
  {
    cat_id: 1,
    name: 'Gà Giòn Cay (2 Miếng)',
    slug: 'ga-gion-cay-2-mieng',
    desc: '2 miếng gà tươi rán giòn rụm với vị cay đậm đà đặc trưng KFC.',
    price: 79000,
    orig_price: 89000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 540,
    prep: 10
  },
  {
    cat_id: 1,
    name: 'Gà Truyền Thống (3 Miếng)',
    slug: 'ga-truyen-thong-3-mieng',
    desc: '3 miếng gà công thức nguyên bản 11 loại thảo mộc và gia vị của Đại tá Sanders.',
    price: 115000,
    orig_price: 129000,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 0,
    cal: 680,
    prep: 12
  },
  {
    cat_id: 1,
    name: 'Cánh Gà Giòn Cay (4 Miếng)',
    slug: 'canh-ga-gion-cay-4-mieng',
    desc: '4 cánh gà giòn tan vàng ươm, thơm lừng vị tiêu đen và ớt cay tê lưỡi.',
    price: 89000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1527477321005-4d45d3c4bc05?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 0,
    is_new: 0,
    cal: 490,
    prep: 10
  },
  {
    cat_id: 1,
    name: 'Gà Que Phô Mai (4 Que)',
    slug: 'ga-que-pho-mai-4-que',
    desc: 'Thịt ức gà cuộn phô mai béo ngậy kéo sợi hấp dẫn.',
    price: 49000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 1,
    cal: 320,
    prep: 8
  },

  // Combo 1 Người (Category 2)
  {
    cat_id: 2,
    name: 'Combo Gà Rán 1 Người',
    slug: 'combo-ga-ran-1-nguoi',
    desc: '1 miếng gà rán giòn + 1 khoai tây chiên vừa + 1 ly Pepsi mát lạnh.',
    price: 69000,
    orig_price: 85000,
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 0,
    cal: 620,
    prep: 10
  },
  {
    cat_id: 2,
    name: 'Combo Burger Zinger 1 Người',
    slug: 'combo-burger-zinger-1-nguoi',
    desc: '1 Burger Zinger phi-lê gà cay giòn + 1 khoai chiên + 1 Pepsi lon.',
    price: 89000,
    orig_price: 105000,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 710,
    prep: 12
  },
  {
    cat_id: 2,
    name: 'Combo Cơm Gà Teriyaki 1 Người',
    slug: 'combo-com-ga-teriyaki-1-nguoi',
    desc: '1 Cơm phi lê gà sốt Teriyaki + 1 súp rong biển nóng + 1 ly trà đào.',
    price: 72000,
    orig_price: 85000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 1,
    cal: 580,
    prep: 10
  },

  // Combo Nhóm & Gia Đình (Category 3)
  {
    cat_id: 3,
    name: 'Combo Sum Vầy (3 - 4 Người)',
    slug: 'combo-sum-vay-3-4-nguoi',
    desc: '5 miếng Gà Rán + 1 Burger Zinger + 1 Hộp Khoai tây cỡ lớn + 3 Ly Pepsi.',
    price: 259000,
    orig_price: 310000,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 1650,
    prep: 15
  },
  {
    cat_id: 3,
    name: 'Combo Tiệc Nhóm Thịnh Soạn (5 - 6 Người)',
    slug: 'combo-tiec-nhom-thinh-soan',
    desc: '8 miếng Gà Rán + 4 Bánh trứng Tart + 2 Hộp Khoai cỡ lớn + 4 Nước ngọt lon.',
    price: 389000,
    orig_price: 450000,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 2400,
    prep: 18
  },

  // Burger & Cơm & Mì Ý (Category 4)
  {
    cat_id: 4,
    name: 'Burger Zinger Cay Thượng Hạng',
    slug: 'burger-zinger-cay-thuong-hang',
    desc: 'Phi-lê ức gà ướp sốt cay chiên giòn, rau xà lách tươi và sốt mayonnaise béo thơm.',
    price: 65000,
    orig_price: 75000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 480,
    prep: 8
  },
  {
    cat_id: 4,
    name: 'Burger Tôm Giòn Rụm',
    slug: 'burger-tom-gion-rum',
    desc: 'Nhân tôm biển tươi ngọt bọc bột giòn tan, kèm xốt tartar chua ngọt.',
    price: 55000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 0,
    cal: 410,
    prep: 8
  },
  {
    cat_id: 4,
    name: 'Cơm Gà Giòn Cay Xốt Teriyaki',
    slug: 'com-ga-gion-cay-xot-teriyaki',
    desc: 'Cơm dẻo thơm ăn kèm phi lê gà chiên giòn rưới nước sốt Teriyaki Nhật Bản đậm vị.',
    price: 52000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    spicy: 1,
    popular: 1,
    is_new: 0,
    cal: 560,
    prep: 10
  },
  {
    cat_id: 4,
    name: 'Mì Ý Xốt Cà Gà Viên Phô Mai',
    slug: 'mi-y-xot-ca-ga-vien-pho-mai',
    desc: 'Sợi mì Ý dai ngon thấm đẫm xốt cà chua đậm đà kèm thịt gà viên và phô mai rắc.',
    price: 49000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 1,
    cal: 490,
    prep: 10
  },

  // Thức Ăn Nhẹ & Tráng Miệng (Category 5)
  {
    cat_id: 5,
    name: 'Bánh Trứng Egg Tart (Hộp 4 Cái)',
    slug: 'banh-trung-egg-tart-hop-4-cai',
    desc: 'Vỏ ngàn lớp giòn tan bọc lớp kem trứng béo ngậy nướng xém cạnh, thơm lừng.',
    price: 65000,
    orig_price: 72000,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 0,
    cal: 420,
    prep: 5
  },
  {
    cat_id: 5,
    name: 'Bánh Trứng Egg Tart (1 Cái)',
    slug: 'banh-trung-egg-tart-1-cai',
    desc: 'Bánh trứng nướng nóng hổi ăn kèm sau bữa gà rán giòn rụm.',
    price: 18000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 0,
    cal: 105,
    prep: 2
  },
  {
    cat_id: 5,
    name: 'Khoai Tây Chiên Cỡ Lớn',
    slug: 'khoai-tay-chien-co-lon',
    desc: 'Khoai tây cắt lát giòn ngoài mềm trong, rắc muối tiêu vừa vị.',
    price: 38000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 0,
    cal: 380,
    prep: 5
  },
  {
    cat_id: 5,
    name: 'Bắp Cải Trộn Coleslaw',
    slug: 'bap-cai-tron-coleslaw',
    desc: 'Bắp cải tươi giòn hòa quyện xốt salad chua béo, chống ngấy tuyệt đối.',
    price: 22000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 0,
    cal: 95,
    prep: 3
  },

  // Thức Uống (Category 6)
  {
    cat_id: 6,
    name: 'Pepsi Vị Chanh Không Calo',
    slug: 'pepsi-vi-chanh-khong-calo',
    desc: 'Sảng khoái mát lạnh cực đã không lo tăng cân.',
    price: 19000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 1,
    cal: 0,
    prep: 2
  },
  {
    cat_id: 6,
    name: 'Pepsi Ly Lớn Mát Lạnh',
    slug: 'pepsi-ly-lon-mat-lanh',
    desc: 'Đầy ắp đá lạnh xua tan cơn khát ngày hè.',
    price: 19000,
    orig_price: null,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 0,
    is_new: 0,
    cal: 150,
    prep: 2
  },
  {
    cat_id: 6,
    name: 'Trà Đào Hạt Chia Thanh Mát',
    slug: 'tra-dao-hat-chia-thanh-mat',
    desc: 'Vị trà đào thơm ngát quyện cùng miếng đào ngâm giòn và hạt chia bổ dưỡng.',
    price: 29000,
    orig_price: 35000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    spicy: 0,
    popular: 1,
    is_new: 0,
    cal: 90,
    prep: 3
  }
];

const insertProduct = db.prepare(`
  INSERT INTO products (
    category_id, name, slug, description, price, original_price,
    image_url, is_spicy, is_popular, is_new, calories, prep_time_minutes
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of products) {
  insertProduct.run(
    p.cat_id, p.name, p.slug, p.desc, p.price, p.orig_price,
    p.image, p.spicy, p.popular, p.is_new, p.cal, p.prep
  );
}
console.log(`✅ Đã nạp thành công ${products.length} món ăn vào thực đơn.`);

// 3. CHÈN MÃ KHUYẾN MÃI (PROMOTIONS)
const promotions = [
  {
    code: 'KFCFREESHIP',
    title: 'Miễn Phí Giao Hàng',
    desc: 'Giảm 15.000đ phí giao hàng cho đơn từ 100.000đ',
    type: 'fixed',
    val: 15000,
    min: 100000,
    max: 15000
  },
  {
    code: 'GIAM20K',
    title: 'Giảm Ngay 20.000đ',
    desc: 'Áp dụng cho đơn hàng thức ăn từ 120.000đ trở lên',
    type: 'fixed',
    val: 20000,
    min: 120000,
    max: 20000
  },
  {
    code: 'SUPERDEAL50',
    title: 'Siêu Deal Giảm 20%',
    desc: 'Giảm 20% tối đa 50.000đ cho đơn từ 200.000đ',
    type: 'percent',
    val: 20,
    min: 200000,
    max: 50000
  },
  {
    code: 'WELCOMEKFC',
    title: 'Quà Chào Bạn Mới',
    desc: 'Giảm 10.000đ trực tiếp cho đơn hàng bất kỳ từ 50.000đ',
    type: 'fixed',
    val: 10000,
    min: 50000,
    max: 10000
  }
];

const insertPromo = db.prepare(`
  INSERT INTO promotions (code, title, description, discount_type, discount_value, min_order_value, max_discount)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const promo of promotions) {
  insertPromo.run(promo.code, promo.title, promo.desc, promo.type, promo.val, promo.min, promo.max);
}
console.log('✅ Đã nạp thành công các mã khuyến mãi.');

// 4. CHÈN HỆ THỐNG NHÀ HÀNG (STORES)
const stores = [
  {
    name: 'KFC Hai Bà Trưng',
    address: 'Số 330 Hai Bà Trưng, Phường Tân Định',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3820 5001',
    hours: '08:00 - 22:30',
    drive_thru: 0
  },
  {
    name: 'KFC Nguyễn Thị Minh Khai',
    address: 'Số 14 Nguyễn Thị Minh Khai, Phường Đa Kao',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3824 1002',
    hours: '08:00 - 23:00',
    drive_thru: 1
  },
  {
    name: 'KFC Crescent Mall',
    address: 'Tầng 5 Crescent Mall, 101 Tôn Dật Tiên, Tân Phú',
    district: 'Quận 7',
    city: 'Hồ Chí Minh',
    phone: '028 5413 7378',
    hours: '09:00 - 22:00',
    drive_thru: 0
  },
  {
    name: 'KFC Bà Triệu',
    address: 'Số 292 Bà Triệu, Phường Lê Đại Hành',
    district: 'Quận Hai Bà Trưng',
    city: 'Hà Nội',
    phone: '024 3974 8123',
    hours: '08:30 - 22:00',
    drive_thru: 0
  },
  {
    name: 'KFC Cầu Giấy',
    address: 'Số 372 Cầu Giấy, Phường Dịch Vọng',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    phone: '024 3767 9234',
    hours: '08:00 - 22:30',
    drive_thru: 1
  },
  {
    name: 'KFC Nguyễn Văn Linh Đà Nẵng',
    address: 'Số 116 Nguyễn Văn Linh, Phường Nam Dương',
    district: 'Quận Hải Châu',
    city: 'Đà Nẵng',
    phone: '0236 365 4123',
    hours: '08:30 - 22:00',
    drive_thru: 0
  },
  {
    name: 'KFC Vincom Xuân Khánh Cần Thơ',
    address: 'Tầng 4 Vincom Plaza, 209 Đường 30 Tháng 4',
    district: 'Quận Ninh Kiều',
    city: 'Cần Thơ',
    phone: '0292 376 9988',
    hours: '09:00 - 22:00',
    drive_thru: 0
  }
];

const insertStore = db.prepare(`
  INSERT INTO stores (name, address, district, city, phone, opening_hours, has_drive_thru)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const s of stores) {
  insertStore.run(s.name, s.address, s.district, s.city, s.phone, s.hours, s.drive_thru);
}
console.log('✅ Đã nạp thành công danh sách chi nhánh cửa hàng.');

// 5. CHÈN ĐÁNH GIÁ MẪU (REVIEWS)
const reviews = [
  {
    prod_id: 1,
    name: 'Nguyễn Hoàng Nam',
    rating: 5,
    comment: 'Gà rán giòn cay nóng hổi giao nhanh đúng 20 phút. Vỏ gà giòn rụm bên trong thịt mọng nước chuẩn vị KFC!'
  },
  {
    prod_id: 6,
    name: 'Trần Thị Thu Trang',
    rating: 5,
    comment: 'Bánh trứng egg tart tuyệt đỉnh! Cả nhà mình ai cũng thích, thơm béo bùi ngậy.'
  },
  {
    prod_id: 4,
    name: 'Lê Minh Khoa',
    rating: 5,
    comment: 'Burger Zinger phi lê cay đỉnh chóp, sốt mayonnaise hòa quyện ăn rất cuốn miệng.'
  },
  {
    prod_id: 7,
    name: 'Vũ Hải Đăng',
    rating: 4,
    comment: 'Combo sum vầy rất nhiều món, 4 người ăn no nê. Giá hợp lý và đóng gói sạch sẽ.'
  }
];

const insertReview = db.prepare(`
  INSERT INTO reviews (product_id, customer_name, rating, comment)
  VALUES (?, ?, ?, ?)
`);

for (const r of reviews) {
  insertReview.run(r.prod_id, r.name, r.rating, r.comment);
}
console.log('✅ Đã nạp thành công đánh giá của khách hàng.');

// 6. CHÈN MẪU ĐƠN HÀNG (SAMPLE ORDERS)
const sampleOrder1 = {
  code: 'KFC-829104',
  name: 'Đặng Thanh Tùng',
  phone: '0912345678',
  email: 'thanhtung@gmail.com',
  type: 'delivery',
  address: 'Số 45 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
  note: 'Giao giờ nghỉ trưa giúp mình nhé',
  promo: 'GIAM20K',
  subtotal: 148000,
  discount: 20000,
  fee: 15000,
  total: 143000,
  method: 'COD',
  pay_status: 'PENDING',
  order_status: 'DELIVERING'
};

const insertOrder = db.prepare(`
  INSERT INTO orders (
    order_code, customer_name, customer_phone, customer_email, delivery_type,
    delivery_address, note, promo_code, subtotal, discount_amount, delivery_fee,
    total_amount, payment_method, payment_status, order_status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const resOrder1 = insertOrder.run(
  sampleOrder1.code, sampleOrder1.name, sampleOrder1.phone, sampleOrder1.email, sampleOrder1.type,
  sampleOrder1.address, sampleOrder1.note, sampleOrder1.promo, sampleOrder1.subtotal, sampleOrder1.discount,
  sampleOrder1.fee, sampleOrder1.total, sampleOrder1.method, sampleOrder1.pay_status, sampleOrder1.order_status
);

const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertItem.run(resOrder1.lastInsertRowid, 1, 'Gà Giòn Cay (2 Miếng)', 79000, 1, 79000);
insertItem.run(resOrder1.lastInsertRowid, 5, 'Combo Gà Rán 1 Người', 69000, 1, 69000);

console.log('✅ Đã tạo đơn hàng mẫu KFC-829104.');
console.log('🎉 Hoàn tất nạp dữ liệu SQLite cho KFC thành công 100%!');
