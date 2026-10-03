# KFC VIỆT NAM - TÀI LIỆU ĐẶC TẢ SẢN PHẨM (PRD.MD)

Tài liệu này xác định lộ trình phát triển và phân rã hệ thống thành các module độc lập, tự đóng gói (self-contained), có thể phát triển và kiểm thử tuần tự.

---

## 1. TỔNG QUAN PHÂN RÃ MODULE (MODULAR ROADMAP)

1. **Module 1: GIỎ HÀNG (CART MODULE)** *(Đang thực hiện)*:
   - Quản lý trạng thái món ăn trong giỏ, bộ đếm số lượng, lưu trữ bền vững (LocalStorage), kiểm tra và tính toán mã giảm giá, tính tổng tiền, ngăn kéo trượt Slide-over Cart Drawer, phát sự kiện checkout.
2. **Module 2: THỰC ĐƠN & DANH MỤC (MENU & CATALOG MODULE)**:
   - Danh sách danh mục, lọc món ăn, tìm kiếm realtime, thẻ món ăn, modal xem chi tiết dinh dưỡng.
3. **Module 3: ĐẶT HÀNG & THANH TOÁN (CHECKOUT & PAYMENTS MODULE)**:
   - Form thông tin khách hàng, hình thức giao hàng, tích hợp phương thức thanh toán, lưu đơn hàng vào CSDL.
4. **Module 4: TRA CỨU ĐƠN HÀNG (ORDER TRACKING MODULE)**:
   - Tra cứu đơn hàng theo mã hoặc số điện thoại, thanh tiến trình thời gian thực 4 bước.
5. **Module 5: HỆ THỐNG CỬA HÀNG (STORE LOCATOR MODULE)**:
   - Tra cứu chi nhánh KFC theo tỉnh/thành phố, bản đồ, hotline, dịch vụ Drive-thru.
6. **Module 6: QUẢN TRỊ VIÊN (ADMIN DASHBOARD MODULE)**:
   - Bảng điều khiển thống kê doanh thu, quản lý danh sách đơn hàng và chuyển trạng thái đơn.
7. **Module 7: ĐÁNH GIÁ & PHẢN HỒI (REVIEWS & FEEDBACK MODULE)**:
   - Đánh giá chất lượng món ăn và dịch vụ từ khách hàng.

---

## 2. CHI TIẾT MODULE 1: GIỎ HÀNG (CART MODULE)

### 2.1. Mục Tiêu Nghiệp Vụ
- Cho phép khách hàng quản lý danh sách các món ăn dự định mua một cách mượt mà và trực quan.
- Đảm bảo dữ liệu giỏ hàng không bị mất khi người dùng tải lại trang hoặc điều hướng.
- Cho phép áp dụng các mã voucher giảm giá hợp lệ từ cơ sở dữ liệu (`promotions`), tự động cập nhật số tiền chiết khấu và phí giao hàng.

### 2.2. Yêu Cầu Chức Năng (Functional Requirements)
- **FR-1.1**: Thêm món ăn vào giỏ (nếu món đã có trong giỏ thì tăng số lượng tương ứng).
- **FR-1.2**: Tăng/giảm số lượng từng món với bước nhảy là 1. Nếu giảm về 0 thì tự động xóa món khỏi giỏ hàng.
- **FR-1.3**: Xóa thủ công bất kỳ món nào khỏi giỏ hàng.
- **FR-1.4**: Xóa toàn bộ giỏ hàng (Clear Cart).
- **FR-1.5**: Lưu trữ giỏ hàng vào `localStorage` (khóa `kfc_cart`).
- **FR-1.6**: Nhập mã khuyến mãi, gọi API `/api/promotions?code=...` để xác thực mã:
  - Nếu mã hợp lệ và đủ điều kiện giá trị đơn tối thiểu (`min_order_value`), áp dụng mức giảm.
  - Hỗ trợ 2 hình thức giảm: Tiền mặt cố định (`fixed`) và Phần trăm (`percent`) có chặn trần `max_discount`.
  - Nếu giỏ hàng thay đổi khiến subtotal nhỏ hơn `min_order_value`, tự động gỡ mã và thông báo cho người dùng.
- **FR-1.7**: Tính toán tự động và chính xác 4 chỉ số tài chính:
  - `subtotal`: Tổng giá trị các món ăn.
  - `discount_amount`: Số tiền được giảm giá.
  - `delivery_fee`: Phí giao hàng (mặc định 15.000đ, hoặc 0đ nếu áp voucher freeship hoặc lấy tại quầy).
  - `total_amount`: `max(0, subtotal - discount_amount + delivery_fee)`.
- **FR-1.8**: Giao diện Ngăn kéo (Drawer) đóng/mở mượt mà theo đúng quy chuẩn [DESIGN.md](file:///Users/macbookprom1/Documents/landingpage_kfc-db/DESIGN.md).
- **FR-1.9**: Cơ chế Event Emitter phát các sự kiện:
  - `kfc:cart:updated`: Báo hiệu thay đổi dữ liệu giỏ hàng.
  - `kfc:cart:checkout`: Báo hiệu người dùng bấm "Tiến hành Đặt hàng" để module Checkout tiếp nhận.

### 2.3. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)
- **Hiệu năng**: Mọi thao tác thêm/sửa/xóa giỏ hàng phản hồi trong dưới 16ms (60 FPS).
- **Độc lập (Loose Coupling)**: Cart Module không phụ thuộc trực tiếp vào các module khác. Có thể hoạt động độc lập và nhúng vào bất kỳ trang nào.
