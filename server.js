import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { queryAll, queryOne, execute } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

// Bảng MIME types hỗ trợ phục vụ static files
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

// Helper đọc body JSON từ request
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2e6) { // 2MB max
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Helper gửi phản hồi JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Bộ xử lý request chính (Exported để dễ dàng unit/integration test)
export async function handleRequest(req, res) {
  // Xử lý CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const host = req.headers.host || 'localhost:3000';
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  try {
    // ==========================================
    // 1. CÁC ĐƯỜNG DẪN REST API (/api/...)
    // ==========================================

    // GET /api/categories
    if (req.method === 'GET' && pathname === '/api/categories') {
      const categories = queryAll(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC'
      );
      return sendJSON(res, 200, { success: true, data: categories });
    }

    // GET /api/products
    if (req.method === 'GET' && pathname === '/api/products') {
      const categoryId = searchParams.get('category_id');
      const search = searchParams.get('search');
      const spicy = searchParams.get('spicy');
      const popular = searchParams.get('popular');

      let sql = `
        SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_available = 1
      `;
      const params = [];

      if (categoryId) {
        sql += ' AND p.category_id = ?';
        params.push(categoryId);
      }
      if (search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      if (spicy === '1') {
        sql += ' AND p.is_spicy = 1';
      }
      if (popular === '1') {
        sql += ' AND p.is_popular = 1';
      }

      sql += ' ORDER BY p.is_popular DESC, p.id ASC';
      const products = queryAll(sql, params);
      return sendJSON(res, 200, { success: true, data: products });
    }

    // GET /api/products/:id
    if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
      const id = pathname.split('/')[3];
      const product = queryOne(`
        SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [id]);

      if (!product) {
        return sendJSON(res, 404, { success: false, message: 'Không tìm thấy món ăn' });
      }
      return sendJSON(res, 200, { success: true, data: product });
    }

    // GET /api/promotions
    if (req.method === 'GET' && pathname === '/api/promotions') {
      const code = searchParams.get('code');
      if (code) {
        const promo = queryOne(
          'SELECT * FROM promotions WHERE code = ? AND is_active = 1',
          [code.trim().toUpperCase()]
        );
        if (!promo) {
          return sendJSON(res, 404, { success: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' });
        }
        return sendJSON(res, 200, { success: true, data: promo });
      }

      const promos = queryAll('SELECT * FROM promotions WHERE is_active = 1 ORDER BY id DESC');
      return sendJSON(res, 200, { success: true, data: promos });
    }

    // GET /api/stores
    if (req.method === 'GET' && pathname === '/api/stores') {
      const city = searchParams.get('city');
      let sql = 'SELECT * FROM stores WHERE is_active = 1';
      const params = [];
      if (city) {
        sql += ' AND city LIKE ?';
        params.push(`%${city}%`);
      }
      sql += ' ORDER BY city ASC, id ASC';
      const stores = queryAll(sql, params);
      return sendJSON(res, 200, { success: true, data: stores });
    }

    // POST /api/orders (Tạo đơn hàng mới)
    if (req.method === 'POST' && pathname === '/api/orders') {
      const body = await parseRequestBody(req);
      const {
        customer_name,
        customer_phone,
        customer_email,
        delivery_type = 'delivery',
        delivery_address,
        note,
        promo_code,
        payment_method = 'COD',
        items = []
      } = body;

      if (!customer_name || !customer_phone) {
        return sendJSON(res, 400, { success: false, message: 'Vui lòng cung cấp họ tên và số điện thoại nhận hàng' });
      }
      if (delivery_type === 'delivery' && !delivery_address) {
        return sendJSON(res, 400, { success: false, message: 'Vui lòng cung cấp địa chỉ giao hàng' });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 400, { success: false, message: 'Giỏ hàng của bạn đang trống' });
      }

      // Tính toán lại subtotal từ database để bảo vệ tính toàn vẹn
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const prod = queryOne('SELECT id, name, price FROM products WHERE id = ? AND is_available = 1', [item.product_id]);
        if (!prod) {
          return sendJSON(res, 400, { success: false, message: `Món ăn mã #${item.product_id} hiện không còn phục vụ` });
        }
        const qty = parseInt(item.quantity, 10) || 1;
        const lineTotal = prod.price * qty;
        subtotal += lineTotal;
        verifiedItems.push({
          product_id: prod.id,
          product_name: prod.name,
          unit_price: prod.price,
          quantity: qty,
          subtotal: lineTotal,
          special_instructions: item.special_instructions || ''
        });
      }

      // Xử lý giảm giá từ promo_code
      let discountAmount = 0;
      let appliedPromoCode = null;
      if (promo_code) {
        const promo = queryOne('SELECT * FROM promotions WHERE code = ? AND is_active = 1', [promo_code.trim().toUpperCase()]);
        if (promo && subtotal >= promo.min_order_value) {
          appliedPromoCode = promo.code;
          if (promo.discount_type === 'fixed') {
            discountAmount = promo.discount_value;
          } else if (promo.discount_type === 'percent') {
            discountAmount = Math.round((subtotal * promo.discount_value) / 100);
            if (promo.max_discount && discountAmount > promo.max_discount) {
              discountAmount = promo.max_discount;
            }
          }
        }
      }

      const deliveryFee = delivery_type === 'pickup' ? 0 : 15000;
      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

      // Tạo mã đơn ngẫu nhiên độc nhất
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const orderCode = `KFC-${randomSuffix}`;

      // Lưu đơn vào SQLite
      const orderInsert = execute(`
        INSERT INTO orders (
          order_code, customer_name, customer_phone, customer_email,
          delivery_type, delivery_address, note, promo_code,
          subtotal, discount_amount, delivery_fee, total_amount,
          payment_method, payment_status, order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING')
      `, [
        orderCode, customer_name, customer_phone, customer_email || null,
        delivery_type, delivery_address || null, note || null, appliedPromoCode,
        subtotal, discountAmount, deliveryFee, totalAmount, payment_method
      ]);

      const orderId = orderInsert.lastInsertRowid;

      // Lưu chi tiết từng món ăn
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal, special_instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const it of verifiedItems) {
        insertItemStmt.run(orderId, it.product_id, it.product_name, it.unit_price, it.quantity, it.subtotal, it.special_instructions);
      }

      return sendJSON(res, 201, {
        success: true,
        message: 'Đặt hàng thành công!',
        data: {
          order_id: Number(orderId),
          order_code: orderCode,
          subtotal,
          discount_amount: discountAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          customer_name,
          customer_phone,
          delivery_address
        }
      });
    }

    // POST /api/payments/verify (Xác nhận thanh toán MoMo / ATM)
    if (req.method === 'POST' && pathname === '/api/payments/verify') {
      const body = await parseRequestBody(req);
      const { order_code, transaction_id, payment_method } = body;

      if (!order_code) {
        return sendJSON(res, 400, { success: false, message: 'Thiếu mã đơn hàng cần thanh toán' });
      }

      const order = queryOne('SELECT * FROM orders WHERE order_code = ?', [order_code]);
      if (!order) {
        return sendJSON(res, 404, { success: false, message: `Không tìm thấy đơn hàng: ${order_code}` });
      }

      // Cập nhật trạng thái thanh toán sang PAID và order_status sang PREPARING
      execute(`
        UPDATE orders 
        SET payment_status = 'PAID', 
            order_status = 'PREPARING',
            payment_method = COALESCE(?, payment_method),
            updated_at = datetime('now', 'localtime')
        WHERE order_code = ?
      `, [payment_method || null, order_code]);

      return sendJSON(res, 200, {
        success: true,
        message: 'Xác nhận thanh toán thành công!',
        data: {
          order_code: order.order_code,
          transaction_id: transaction_id || `TXN-${Date.now()}`,
          payment_status: 'PAID',
          order_status: 'PREPARING',
          payment_method: payment_method || order.payment_method,
          total_amount: order.total_amount
        }
      });
    }

    // POST /api/payments/momo-qr (Tạo thông tin mã QR MoMo cho đơn hàng)
    if (req.method === 'POST' && pathname === '/api/payments/momo-qr') {
      const body = await parseRequestBody(req);
      const order_code = body.order_code;
      const total_amount = body.total_amount || body.amount;

      if (!order_code || !total_amount) {
        return sendJSON(res, 400, { success: false, message: 'Thiếu mã đơn hàng hoặc số tiền thanh toán' });
      }

      const qrData = {
        receiver_name: 'KFC VIETNAM OFFICIAL',
        wallet_phone: '0901234567',
        amount: Number(total_amount),
        order_code: order_code,
        description: `Thanh toan don hang ${order_code} KFC`,
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`2|99|0901234567|KFC VIETNAM||0|0|${total_amount}|Thanh toan don hang ${order_code}|transfer_myqr`)}`
      };

      return sendJSON(res, 200, { success: true, data: qrData });
    }

    // GET /api/orders/:identifier (Tra cứu theo order_code hoặc customer_phone)
    if (req.method === 'GET' && pathname.startsWith('/api/orders/')) {
      const identifier = decodeURIComponent(pathname.split('/')[3] || '').trim();
      if (!identifier) {
        return sendJSON(res, 400, { success: false, message: 'Vui lòng cung cấp mã đơn hoặc số điện thoại' });
      }

      // Tìm theo order_code trước
      let order = queryOne('SELECT * FROM orders WHERE order_code = ?', [identifier]);
      
      // Nếu không thấy, tìm theo số điện thoại (lấy đơn gần nhất)
      if (!order) {
        order = queryOne('SELECT * FROM orders WHERE customer_phone = ? ORDER BY id DESC LIMIT 1', [identifier]);
      }

      if (!order) {
        return sendJSON(res, 404, { success: false, message: `Không tìm thấy đơn hàng với thông tin: ${identifier}` });
      }

      const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return sendJSON(res, 200, {
        success: true,
        data: {
          ...order,
          items
        }
      });
    }

    // GET /api/admin/orders (Danh sách đơn cho Admin)
    if (req.method === 'GET' && pathname === '/api/admin/orders') {
      const orders = queryAll(`
        SELECT o.*, COUNT(oi.id) AS item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.id DESC
      `);
      return sendJSON(res, 200, { success: true, data: orders });
    }

    // PATCH /api/admin/orders/:id (Cập nhật trạng thái đơn)
    if (req.method === 'PATCH' && pathname.startsWith('/api/admin/orders/')) {
      const id = pathname.split('/')[4];
      const body = await parseRequestBody(req);
      const { order_status } = body;

      const allowedStatuses = ['PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
      if (!allowedStatuses.includes(order_status)) {
        return sendJSON(res, 400, { success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
      }

      const resUpdate = execute(
        "UPDATE orders SET order_status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
        [order_status, id]
      );

      if (resUpdate.changes === 0) {
        return sendJSON(res, 404, { success: false, message: 'Không tìm thấy đơn hàng' });
      }

      return sendJSON(res, 200, { success: true, message: 'Cập nhật trạng thái thành công' });
    }

    // GET /api/admin/stats (Thống kê Admin)
    if (req.method === 'GET' && pathname === '/api/admin/stats') {
      const totalRevenueRow = queryOne(
        "SELECT SUM(total_amount) AS revenue FROM orders WHERE order_status != 'CANCELLED'"
      );
      const totalOrdersRow = queryOne('SELECT COUNT(id) AS total_orders FROM orders');
      const totalProductsRow = queryOne('SELECT COUNT(id) AS total_products FROM products');
      const recentOrders = queryAll('SELECT * FROM orders ORDER BY id DESC LIMIT 5');

      return sendJSON(res, 200, {
        success: true,
        data: {
          total_revenue: totalRevenueRow.revenue || 0,
          total_orders: totalOrdersRow.total_orders || 0,
          total_products: totalProductsRow.total_products || 0,
          recent_orders: recentOrders
        }
      });
    }

    // GET /api/reviews & POST /api/reviews
    if (pathname === '/api/reviews') {
      if (req.method === 'GET') {
        const reviews = queryAll(`
          SELECT r.*, p.name AS product_name
          FROM reviews r
          LEFT JOIN products p ON r.product_id = p.id
          ORDER BY r.id DESC LIMIT 10
        `);
        return sendJSON(res, 200, { success: true, data: reviews });
      }
      if (req.method === 'POST') {
        const body = await parseRequestBody(req);
        const { customer_name, rating, comment, product_id } = body;
        if (!customer_name || !rating || !comment) {
          return sendJSON(res, 400, { success: false, message: 'Vui lòng điền đủ họ tên, số sao và nhận xét' });
        }
        execute(
          'INSERT INTO reviews (customer_name, rating, comment, product_id) VALUES (?, ?, ?, ?)',
          [customer_name, rating, comment, product_id || null]
        );
        return sendJSON(res, 201, { success: true, message: 'Cảm ơn bạn đã gửi đánh giá!' });
      }
    }

    // ==========================================
    // 2. PHỤC VỤ STATIC FILES (PUBLIC DIRECTORY)
    // ==========================================
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Kiểm tra an toàn bảo mật chống directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('403 Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    }

    // Nếu không khớp file tĩnh hoặc API
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    return res.end('404 Not Found');

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { success: false, message: 'Đã xảy ra lỗi máy chủ nội bộ', error: error.message });
  }
}

// Khởi tạo HTTP Server
export const server = http.createServer(handleRequest);

// Khởi động server nếu chạy trực tiếp (không phải import từ test)
const scriptPath = process.argv[1] || '';
const isDirectRun = scriptPath.endsWith('/server.js') || 
                    scriptPath.endsWith('\\server.js') || 
                    scriptPath === 'server.js';

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🍗 KFC Server đang hoạt động tại: http://localhost:${PORT}`);
    console.log(`📦 Kết nối CSDL SQLite: kfc.sqlite sẵn sàng!`);
  });
}

export default server;
