# YÊU CẦU DỰ ÁN: KFC VIỆT NAM LANDING PAGE & HỆ THỐNG ĐẶT MÓN VỚI CƠ SỞ DỮ LIỆU

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Mục tiêu dự án là xây dựng một trang đích (Landing Page) hiện đại, tương tác cao và đầy đủ tính năng cho thương hiệu thức ăn nhanh **KFC (Kentucky Fried Chicken)** tại thị trường Việt Nam. 

Hệ thống kết nối trực tiếp với Cơ sở dữ liệu quan hệ (SQLite) để quản lý thực đơn, danh mục, khuyến mãi, danh sách chi nhánh cửa hàng, quản lý đơn hàng theo thời gian thực và tra cứu trạng thái đơn hàng.

---

## 2. NGÔN NGỮ THIẾT KẾ & BỘ NHẬN DIỆN THƯƠNG HIỆU (BRAND IDENTITY & UI/UX)
- **Màu sắc chủ đạo**:
  - Đỏ KFC đặc trưng: `#E4002B`
  - Trắng tinh khiết: `#FFFFFF`
  - Đen than hiện đại: `#111827` / `#1F2937`
  - Vàng mật ong (Accent / Điểm nhấn): `#F59E0B` / `#D97706`
  - Xám nền nhẹ: `#F9FAFB` / `#F3F4F6`
- **Phong cách thiết kế**:
  - Trẻ trung, năng động, kích thích vị giác và thị giác.
  - Hình ảnh sản phẩm sắc nét, trực quan, có huy hiệu phân loại nổi bật (Bán chạy, Mới, Cay, Tiết kiệm).
  - Hoạt ảnh chuyển động mượt mà, phản hồi tức thì (Micro-interactions, Toast notifications).
  - Tương thích 100% trên các thiết bị: Di động (Mobile), Máy tính bảng (Tablet), Máy tính để bàn (Desktop).

---

## 3. CÁC TÍNH NĂNG CHÍNH (KEY FUNCTIONALITIES)

### 3.1. Phân hệ Khách hàng (Customer Experience)
1. **Header & Thanh điều hướng (Navigation Bar)**:
   - Logo KFC chuẩn nhận diện thương hiệu.
   - Menu liên kết nhanh: Thực đơn (Menu), Khuyến mãi (Deals), Hệ thống nhà hàng (Stores), Tra cứu đơn hàng (Track Order), Đánh giá (Reviews).
   - Ô tìm kiếm món ăn nhanh theo từ khóa theo thời gian thực.
   - Nút giỏ hàng nổi bật kèm số lượng sản phẩm cập nhật theo thời gian thực.
   - Nút mở nhanh bảng Quản trị (Admin Dashboard).

2. **Hero Section (Khu vực mở đầu)**:
   - Slogan huyền thoại: *"Vị ngon trên từng ngón tay - Finger Lickin' Good"*.
   - Khẩu hiệu khuyến mãi hấp dẫn: *"Ưu đãi gà rán giòn rụm chỉ từ 39.000đ"*.
   - Các nút hành động chính (Call To Action - CTA): *"Đặt Hàng Ngay"*, *"Khám Phá Thực Đơn"*.
   - Huy hiệu chứng nhận chất lượng: *"100% Gà Tươi Mỗi Ngày"*, *"Giao Nhanh 30 Phút"*, *"Độc Quyền 11 Loại Gia Vị"*.

3. **Danh mục & Bộ lọc Thực đơn (Interactive Menu & Filters)**:
   - Phân loại danh mục dạng tab trực quan:
     - Gà Rán & Gà Quay
     - Combo 1 Người
     - Combo Nhóm & Gia Đình
     - Burger & Cơm & Mì Ý
     - Thức Ăn Nhẹ & Tráng Miệng
     - Thức Uống
   - Hỗ trợ lọc nhanh: Tất cả món, Món cay 🌶️, Món bán chạy 🔥, Món mới ra mắt ✨.
   - Thanh tìm kiếm món ăn theo tên hoặc mô tả.

4. **Thẻ Món Ăn & Modal Chi tiết (Product Cards & Detail Modal)**:
   - Hiển thị hình ảnh chân thực, tên món, mô tả nguyên liệu, giá niêm yết (kèm giá gạch giảm giá nếu có khuyến mãi).
   - Thẻ huy hiệu (Badges): Cay, Best-Seller, Mới.
   - Nút "Thêm vào giỏ" nhanh hoặc bấm vào để xem Modal chi tiết (Lượng Calo, thành phần dinh dưỡng, thời gian chế biến, tùy chọn số lượng).

5. **Giỏ hàng Thông minh (Interactive Cart Drawer)**:
   - Ngăn kéo giỏ hàng trượt mượt mà từ cạnh màn hình.
   - Tăng/giảm số lượng từng món, xóa món khỏi giỏ hàng.
   - Nhập mã giảm giá (Voucher Coupon) kiểm tra trực tiếp từ Database (VD: `KFCFREESHIP`, `GIAM20K`, `SUPERDEAL50`).
   - Tự động tính toán: Tạm tính, Tiền giảm giá, Phí giao hàng, Tổng cộng thanh toán.

6. **Quy trình Thanh toán & Đặt hàng (Checkout Flow)**:
   - Form thông tin khách hàng: Họ và tên, Số điện thoại, Địa chỉ giao hàng, Ghi chú đơn hàng.
   - Hình thức nhận hàng:
     - Giao hàng tận nơi (Delivery).
     - Đến lấy tại nhà hàng (Take-away/Pickup).
   - Phương thức thanh toán linh hoạt:
     - Thanh toán tiền mặt khi nhận hàng (COD).
     - Ví điện tử MoMo.
     - Ví ZaloPay.
     - Thẻ ATM nội địa / Thẻ quốc tế (Visa / Mastercard).
   - Khi hoàn tất, hệ thống tự động sinh Mã Đơn Hàng duy nhất (VD: `KFC-829145`) và lưu toàn bộ thông tin chi tiết vào Cơ sở dữ liệu.

7. **Tra cứu Trạng thái Đơn hàng (Order Tracking)**:
   - Khách hàng nhập mã đơn hàng hoặc số điện thoại để tra cứu.
   - Thanh tiến trình trực quan theo dõi 4 bước:
     1. `Chờ xác nhận` (Pending)
     2. `Đang chế biến` (Preparing)
     3. `Đang giao hàng` (Delivering)
     4. `Đã giao thành công` (Completed)
   - Xem lại chi tiết từng món đã đặt và tổng tiền.

8. **Hệ thống Tìm kiếm Nhà hàng (Store Locator)**:
   - Lọc chi nhánh KFC theo khu vực: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Cần Thơ, Hải Phòng.
   - Xem thông tin chi tiết từng cửa hàng: Tên chi nhánh, Địa chỉ đầy đủ, Số điện thoại liên hệ, Giờ mở cửa, Tiện ích Drive-Thru.

9. **Đánh giá & Phản hồi Khách hàng (Customer Reviews)**:
   - Hiển thị các phản hồi thực tế từ khách hàng.
   - Form cho phép khách hàng gửi đánh giá mới (Họ tên, Đánh giá số sao, Nhận xét).

---

### 3.2. Phân hệ Quản trị (Admin Management Dashboard)
- Nút truy cập bảng điều khiển Admin tiện lợi.
- **Thống kê tổng quan (Analytics Overview)**:
  - Tổng doanh thu (VND).
  - Tổng số lượng đơn hàng đã nhận.
  - Tổng số món ăn đang phục vụ.
- **Quản lý Đơn hàng theo thời gian thực (Order Management)**:
  - Bảng danh sách đơn hàng chi tiết: Mã đơn, Khách hàng, Số điện thoại, Địa chỉ, Tổng tiền, Phương thức thanh toán, Trạng thái.
  - Cập nhật trạng thái đơn hàng ngay lập tức (Chờ xác nhận -> Đang chuẩn bị -> Đang giao -> Hoàn tất -> Đã hủy) đồng bộ trực tiếp vào Database.

---

## 4. ĐẶC TẢ KỸ THUẬT (TECHNICAL SPECIFICATIONS)

### 4.1. Công nghệ Sử dụng
- **Runtime & Ngôn ngữ**: Node.js (v22+) & JavaScript (ES Modules).
- **Cơ sở dữ liệu**: SQLite chạy trực tiếp thông qua module native `node:sqlite` (tích hợp sẵn trong Node.js, không yêu cầu phụ thuộc bên thứ 3 phức tạp).
- **Giao diện Người dùng (Frontend)**:
  - HTML5 Semantics, Tailwind CSS (qua CDN), Lucide Icons, Google Fonts (Inter & Oswald).
  - Custom CSS cho bộ nhận diện màu đỏ KFC, hiệu ứng đổ bóng, animation và toast notification.
  - Vanilla JS hiện đại dạng module, quản lý trạng thái Reactive mượt mà.
- **Backend API**: Node.js HTTP Server với RESTful API chuẩn JSON.

### 4.2. Danh sách RESTful API Endpoints

| Phương thức | Đường dẫn API | Mô tả chức năng |
|---|---|---|
| `GET` | `/api/categories` | Lấy danh sách các danh mục món ăn |
| `GET` | `/api/products` | Lấy danh sách món ăn (hỗ trợ query `category_id`, `search`, `spicy`, `popular`) |
| `GET` | `/api/products/:id` | Lấy thông tin chi tiết một món ăn kèm đánh giá |
| `GET` | `/api/promotions` | Lấy danh sách khuyến mãi hoặc kiểm tra mã giảm giá (`?code=...`) |
| `GET` | `/api/stores` | Lấy danh sách chi nhánh cửa hàng (hỗ trợ lọc theo `city`) |
| `POST` | `/api/orders` | Tạo mới một đơn hàng (Lưu vào bảng `orders` & `order_items`) |
| `GET` | `/api/orders/:identifier` | Tra cứu đơn hàng theo mã đơn hàng hoặc số điện thoại |
| `GET` | `/api/admin/orders` | Lấy toàn bộ danh sách đơn hàng cho trang quản trị |
| `PATCH` | `/api/admin/orders/:id` | Cập nhật trạng thái đơn hàng (`order_status`) |
| `GET` | `/api/admin/stats` | Lấy dữ liệu thống kê tổng doanh thu, đơn hàng, mặt hàng |
| `GET` | `/api/reviews` | Lấy danh sách đánh giá từ khách hàng |
| `POST` | `/api/reviews` | Gửi đánh giá phản hồi mới |

---

## 5. MÔ HÌNH DỮ LIỆU CỐT LÕI (CORE ENTITIES)
- `categories`: Danh mục thực đơn (Gà rán, Burger, Cơm, Combo, Nước uống, v.v.).
- `products`: Món ăn chi tiết, giá tiền, hình ảnh, mô tả, mức độ cay, calo.
- `promotions`: Mã voucher giảm giá, mức giảm, đơn hàng tối thiểu, hạn sử dụng.
- `stores`: Chi nhánh nhà hàng KFC trên toàn quốc.
- `orders`: Đơn hàng khách đặt, thông tin giao nhận, tiền thanh toán, trạng thái.
- `order_items`: Chi tiết từng món ăn trong một đơn hàng.
- `reviews`: Đánh giá, xếp hạng sao và nhận xét của khách hàng.
