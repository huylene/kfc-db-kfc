# KFC VIỆT NAM - LANDING PAGE & ONLINE ORDERING SYSTEM WITH SQLITE DATABASE

Dự án phát triển trang đích (Landing Page) kết hợp hệ thống đặt hàng trực tuyến hoàn chỉnh cho thương hiệu **KFC (Kentucky Fried Chicken)** tại Việt Nam. Dự án được tích hợp sẵn Cơ sở dữ liệu quan hệ **SQLite**, hỗ trợ đầy đủ luồng duyệt thực đơn, giỏ hàng, áp mã giảm giá, đặt món, tra cứu đơn hàng theo thời gian thực và Bảng điều khiển quản trị (Admin Dashboard).

---

## 🌟 TÍNH NĂNG NỔI BẬT

- **Bộ nhận diện chuẩn KFC**: Sử dụng gam màu đỏ `#E4002B`, typography hiện đại, phong cách thương hiệu gà rán danh tiếng.
- **Thực đơn tương tác & Bộ lọc đa năng**:
  - Phân loại theo danh mục: Gà Rán, Combo 1 Người, Combo Nhóm, Burger & Cơm, Tráng miệng, Thức uống.
  - Tìm kiếm thời gian thực theo tên hoặc mô tả món ăn.
  - Lọc món cay 🌶️, món bán chạy (Best Seller) 🔥, món mới ra mắt ✨.
  - Modal xem chi tiết món ăn (thành phần, mức calo, thời gian chế biến).
- **Giỏ hàng & Đặt hàng Trực tiếp (Live Cart & Checkout)**:
  - Giỏ hàng trượt thông minh (Slide-over drawer).
  - Áp dụng mã giảm giá (voucher) kiểm tra trực tiếp từ Cơ sở dữ liệu:
    - `KFCFREESHIP`: Miễn phí giao hàng (15.000đ).
    - `GIAM20K`: Giảm ngay 20.000đ cho đơn từ 100.000đ.
    - `SUPERDEAL50`: Giảm 20% tối đa 50.000đ cho đơn từ 150.000đ.
  - Hỗ trợ 2 hình thức: Giao hàng tận nơi & Đến lấy tại nhà hàng.
  - Hỗ trợ thanh toán: COD, MoMo, ZaloPay, Thẻ ngân hàng.
- **Tra cứu Trạng thái Đơn hàng (Order Tracking)**:
  - Khách hàng tra cứu nhanh theo mã đơn (VD: `KFC-839201`) hoặc số điện thoại.
  - Hiển thị thanh tiến trình 4 bước trực quan: Chờ xác nhận ➔ Đang chế biến ➔ Đang giao ➔ Hoàn tất.
- **Hệ thống Nhà hàng (Store Locator)**:
  - Lọc và tìm kiếm danh sách chi nhánh KFC tại các thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ...).
- **Đánh giá Khách hàng (Reviews)**:
  - Khách hàng gửi phản hồi và chấm điểm chất lượng món ăn được lưu vào database.
- **Bảng Quản trị Admin (Admin Dashboard)**:
  - Thống kê doanh thu theo thời gian thực, tổng số lượng đơn hàng, số món phục vụ.
  - Danh sách đơn hàng với khả năng cập nhật trạng thái đơn (Xác nhận, Giao hàng, Hoàn tất, Hủy).
- **Kiến trúc Zero-Dependency độc đáo**:
  - Tận dụng module native `node:sqlite` tích hợp sẵn trong **Node.js v22+**.
  - Không cần cài đặt `node_modules` nặng nề, khởi chạy tức thì chỉ trong **50 mili-giây**!

---

## 📁 CẤU TRÚC DỰ ÁN

```
landingpage_kfc-db/
├── PROMPT.md                  # Bản đặc tả chi tiết yêu cầu dự án & tài liệu phân tích nghiệp vụ
├── database_schema.md         # Tài liệu thiết kế CSDL SQLite: ERD Mermaid, DDL, Data Dictionary, Indexing
├── README.md                  # Tài liệu hướng dẫn sử dụng và triển khai dự án (file này)
├── package.json               # Cấu hình dự án & scripts thực thi
├── server.js                  # HTTP Server & REST API Router (thuần Node.js)
├── db/
│   ├── database.js            # Module kết nối và truy vấn SQLite (Native Node.js)
│   ├── schema.sql             # Script khởi tạo cấu trúc các bảng và chỉ mục
│   └── seed.js                # Dữ liệu hạt giống (thực đơn KFC thực tế, combo, voucher, chi nhánh)
└── public/                    # Mã nguồn Giao diện Người dùng (Frontend Client)
    ├── index.html             # Trang đơn chứa toàn bộ giao diện Landing Page KFC
    ├── css/
    │   └── custom.css         # Phong cách CSS tùy biến nhận diện thương hiệu KFC
    └── js/
        └── app.js             # Xử lý tương tác Frontend (Giỏ hàng, lọc, checkout, tra cứu, admin)
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### 1. Yêu cầu Hệ thống
- **Node.js**: Phiên bản `>= 22.0.0` (đã có sẵn `node:sqlite` tích hợp sẵn).
- Không yêu cầu cài thêm bất kỳ thư viện bên ngoài nào!

### 2. Khởi tạo Cơ sở Dữ liệu & Nạp Dữ liệu Mẫu (Seeding)
Chạy lệnh sau để tự động tạo file database SQLite và nạp toàn bộ danh mục, món ăn, khuyến mãi và cửa hàng:

```bash
npm run seed
# hoặc chạy trực tiếp:
node db/seed.js
```

Sau khi chạy xong, file cơ sở dữ liệu `kfc.sqlite` sẽ được tạo ngay trong thư mục gốc.

### 3. Khởi động Ứng dụng
Chạy lệnh khởi động máy chủ:

```bash
npm start
# hoặc:
node server.js
```

### 4. Truy cập Ứng dụng
Mở trình duyệt web bất kỳ và truy cập vào địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 TÀI LIỆU RESTFUL API

### 1. Sản phẩm & Thực đơn
- `GET /api/categories`: Lấy toàn bộ danh mục món ăn.
- `GET /api/products`: Lấy danh sách sản phẩm.
  - Query params hỗ trợ:
    - `category_id`: Lọc theo ID danh mục (VD: `?category_id=1`).
    - `search`: Tìm kiếm từ khóa theo tên (VD: `?search=cay`).
    - `spicy`: Lọc món cay (`?spicy=1`).
    - `popular`: Lọc món bán chạy (`?popular=1`).
- `GET /api/products/:id`: Lấy chi tiết món ăn theo ID.

### 2. Khuyến mãi & Voucher
- `GET /api/promotions`: Lấy danh sách ưu đãi đang kích hoạt.
- `GET /api/promotions?code=KFCFREESHIP`: Kiểm tra và xác thực mã voucher cụ thể.

### 3. Cửa hàng & Chi nhánh
- `GET /api/stores`: Lấy danh sách nhà hàng KFC.
  - Query param: `?city=Hồ Chí Minh` hoặc `?city=Hà Nội`.

### 4. Đơn hàng (Orders)
- `POST /api/orders`: Tạo đơn hàng mới.
  - Body (JSON):
    ```json
    {
      "customer_name": "Nguyễn Văn A",
      "customer_phone": "0901234567",
      "customer_email": "nguyenvana@gmail.com",
      "delivery_type": "delivery",
      "delivery_address": "Số 123 Nguyễn Huệ, Quận 1, TP.HCM",
      "note": "Xin thêm nhiều tương ớt",
      "promo_code": "GIAM20K",
      "payment_method": "COD",
      "items": [
        {
          "product_id": 1,
          "product_name": "Gà Giòn Cay (2 Miếng)",
          "unit_price": 79000,
          "quantity": 2
        }
      ]
    }
    ```
- `GET /api/orders/:identifier`: Tra cứu chi tiết đơn hàng bằng **Mã đơn hàng** (VD: `KFC-829104`) hoặc **Số điện thoại** khách hàng.

### 5. Quản trị viên (Admin)
- `GET /api/admin/orders`: Lấy toàn bộ danh sách đơn hàng đã đặt.
- `PATCH /api/admin/orders/:id`: Cập nhật trạng thái đơn hàng (`PENDING`, `PREPARING`, `DELIVERING`, `COMPLETED`, `CANCELLED`).
  - Body: `{"order_status": "PREPARING"}`
- `GET /api/admin/stats`: Lấy thống kê tổng doanh thu, số đơn hàng và tổng sản phẩm.

### 6. Đánh giá (Reviews)
- `GET /api/reviews`: Lấy danh sách đánh giá từ thực khách.
- `POST /api/reviews`: Gửi đánh giá mới (`customer_name`, `rating`, `comment`).

---

## 🛠️ KIỂM THỬ HỆ THỐNG (TESTING)

Chạy script kiểm tra tự động toàn bộ API và Cơ sở dữ liệu:

```bash
npm test
```

Script sẽ tự động:
1. Xác minh kết nối SQLite.
2. Kiểm tra truy vấn bảng `categories` và `products`.
3. Giả lập tạo đơn hàng và kiểm tra tính toán tiền, áp mã voucher.
4. Tra cứu đơn hàng vừa tạo để xác nhận tính toàn vẹn dữ liệu.

---

## 📜 GIẤY PHÉP & THÔNG TIN THƯƠNG HIỆU
Dự án được xây dựng với mục đích học tập, thực hành kỹ thuật phần mềm và minh họa giải pháp Full-stack Landing Page + Database. Mọi hình ảnh và nhận diện thuộc quyền sở hữu của tập đoàn KFC / Yum! Brands.
