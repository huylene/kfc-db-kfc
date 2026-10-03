process.env.NODE_ENV = 'test';
import { handleRequest } from './server.js';
import { EventEmitter } from 'node:events';

console.log('🧪 Bắt đầu kiểm thử toàn diện HTTP Server & REST API...\n');

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

// Mock Request & Response
function makeMockRequest({ method = 'GET', url = '/', body = null, headers = {} }) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { host: 'localhost:3000', ...headers };

  return new Promise((resolve) => {
    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = {
      writeHead(code, headers = {}) {
        statusCode = code;
        Object.assign(responseHeaders, headers);
      },
      end(chunk) {
        if (chunk) {
          responseBody += chunk.toString();
        }
        resolve({
          statusCode,
          headers: responseHeaders,
          body: responseBody,
          json: () => {
            try {
              return JSON.parse(responseBody);
            } catch (e) {
              return null;
            }
          }
        });
      }
    };

    // Gọi handleRequest
    handleRequest(req, res);

    // Phát dữ liệu body
    if (body) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });
}

async function runTests() {
  // Test 1: Static file GET /
  const resHome = await makeMockRequest({ method: 'GET', url: '/' });
  assert(resHome.statusCode === 200, 'GET / trả về status 200');
  assert(resHome.body.includes('KFC Việt Nam'), 'GET / trả về HTML chứa tiêu đề KFC Việt Nam');

  // Test 2: GET /api/categories
  const resCat = await makeMockRequest({ method: 'GET', url: '/api/categories' });
  assert(resCat.statusCode === 200, 'GET /api/categories trả về 200');
  const catData = resCat.json();
  assert(catData.success && catData.data.length >= 6, 'Danh mục có ít nhất 6 nhóm món');

  // Test 3: GET /api/products?popular=1
  const resProd = await makeMockRequest({ method: 'GET', url: '/api/products?popular=1' });
  assert(resProd.statusCode === 200, 'GET /api/products?popular=1 trả về 200');
  const prodData = resProd.json();
  assert(prodData.data.every(p => p.is_popular === 1), 'Tất cả sản phẩm trả về đều có cờ is_popular = 1');

  // Test 4: GET /api/promotions?code=KFCFREESHIP
  const resPromo = await makeMockRequest({ method: 'GET', url: '/api/promotions?code=KFCFREESHIP' });
  assert(resPromo.statusCode === 200, 'Kiểm tra voucher KFCFREESHIP thành công');
  const promoData = resPromo.json();
  assert(promoData.data.discount_value === 15000, 'Mã giảm đúng 15.000đ');

  // Test 5: GET /api/stores?city=Hà Nội
  const resStore = await makeMockRequest({ method: 'GET', url: '/api/stores?city=' + encodeURIComponent('Hà Nội') });
  assert(resStore.statusCode === 200, 'Lọc cửa hàng theo thành phố Hà Nội thành công');
  const storeData = resStore.json();
  assert(storeData.data.length >= 2, 'Tìm thấy ít nhất 2 chi nhánh tại Hà Nội');

  // Test 6: POST /api/orders (Tạo đơn hàng mới)
  const orderPayload = {
    customer_name: 'Trần Văn Hoàng',
    customer_phone: '0977889900',
    customer_email: 'hoang@gmail.com',
    delivery_type: 'delivery',
    delivery_address: '12 Nguyễn Trãi, Quận 1, TP.HCM',
    note: 'Giao lầu 3',
    promo_code: 'GIAM20K',
    payment_method: 'COD',
    items: [
      { product_id: 1, quantity: 2 }, // Gà giòn cay 79k * 2 = 158k
      { product_id: 5, quantity: 1 }  // Combo gà rán 1 người 69k
    ] // Subtotal = 227k. Giảm 20k -> 207k. Phí ship 15k -> Total = 222k
  };

  const resOrder = await makeMockRequest({
    method: 'POST',
    url: '/api/orders',
    body: orderPayload
  });

  assert(resOrder.statusCode === 201, 'POST /api/orders tạo đơn hàng mới trả về 201');
  const createdOrder = resOrder.json();
  assert(createdOrder.data.total_amount === 222000, `Tính toán tổng tiền chính xác 222.000đ (thực tế: ${createdOrder.data.total_amount}đ)`);
  assert(createdOrder.data.order_code.startsWith('KFC-'), 'Mã đơn sinh chuẩn tiền tố KFC-');

  // Test 7: GET /api/orders/:code (Tra cứu đơn vừa tạo)
  const resTrack = await makeMockRequest({
    method: 'GET',
    url: `/api/orders/${createdOrder.data.order_code}`
  });
  assert(resTrack.statusCode === 200, 'Tra cứu đơn hàng vừa tạo thành công');
  const trackData = resTrack.json();
  assert(trackData.data.items.length === 2, 'Đơn hàng lưu đầy đủ 2 loại món ăn');

  // Test 8: GET /api/admin/stats
  const resStats = await makeMockRequest({ method: 'GET', url: '/api/admin/stats' });
  assert(resStats.statusCode === 200, 'GET /api/admin/stats trả về 200');
  const statsData = resStats.json();
  assert(statsData.data.total_orders > 0 && statsData.data.total_revenue > 0, 'Thống kê Admin ghi nhận doanh thu và số đơn');

  // Test 9: PATCH /api/admin/orders/:id
  const resUpdate = await makeMockRequest({
    method: 'PATCH',
    url: `/api/admin/orders/${createdOrder.data.order_id}`,
    body: { order_status: 'DELIVERING' }
  });
  assert(resUpdate.statusCode === 200, 'PATCH cập nhật trạng thái đơn sang DELIVERING thành công');

  // Test 10: POST /api/payments/momo-qr
  const resMoMoQr = await makeMockRequest({
    method: 'POST',
    url: '/api/payments/momo-qr',
    body: {
      order_code: createdOrder.data.order_code,
      amount: createdOrder.data.total_amount
    }
  });
  assert(resMoMoQr.statusCode === 200, 'POST /api/payments/momo-qr trả về 200');
  const momoData = resMoMoQr.json();
  assert(momoData.data.qr_url.includes('qrserver.com'), 'Mã QR MoMo chứa URL hợp lệ');

  // Test 11: POST /api/payments/verify (Xác nhận MoMo)
  const resVerifyMoMo = await makeMockRequest({
    method: 'POST',
    url: '/api/payments/verify',
    body: {
      order_code: createdOrder.data.order_code,
      payment_method: 'MOMO',
      transaction_id: 'TEST-TXN-MOMO'
    }
  });
  assert(resVerifyMoMo.statusCode === 200, 'POST /api/payments/verify (MoMo) trả về 200');
  const verifyData = resVerifyMoMo.json();
  assert(verifyData.data.payment_status === 'PAID' && verifyData.data.order_status === 'PREPARING', 'Đơn hàng cập nhật sang PAID và PREPARING sau khi thanh toán');

  // Test 12: POST /api/payments/verify (Xác nhận Thẻ ATM)
  const resVerifyATM = await makeMockRequest({
    method: 'POST',
    url: '/api/payments/verify',
    body: {
      order_code: createdOrder.data.order_code,
      payment_method: 'ATM',
      transaction_id: 'TEST-TXN-ATM'
    }
  });
  assert(resVerifyATM.statusCode === 200, 'POST /api/payments/verify (ATM) trả về 200');
  assert(resVerifyATM.json().data.payment_method === 'ATM', 'Phương thức thanh toán ghi nhận là ATM');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ SERVER: ${passed} ĐẠT, ${failed} THẤT BẠI`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
  else console.log('🎉 TẤT CẢ CÁC API VÀ TÍNH NĂNG MÁY CHỦ ĐỀU HOẠT ĐỘNG HOÀN HẢO!');
}

runTests().catch(err => {
  console.error('Unhandled Test Error:', err);
  process.exit(1);
});
