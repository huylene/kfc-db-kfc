# KFC VIỆT NAM - DESIGN SYSTEM SPECIFICATION (DESIGN.MD)

Tài liệu này quy chuẩn toàn bộ hệ thống thiết kế giao diện (UI/UX Design System) cho ứng dụng KFC Việt Nam, bao gồm bảng màu thương hiệu, typography, khoảng cách, hiệu ứng chuyển động và đặc tả chi tiết cho từng component (đặc biệt là Module Giỏ Hàng - Cart Module).

---

## 1. BẢNG MÀU CHUẨN THƯƠNG HIỆU (COLOR PALETTE)

| Tên Token | Mã Hex | RGB | Mô Tả & Sử Dụng |
|---|---|---|---|
| `color-kfc-red` | `#E4002B` | `rgb(228, 0, 43)` | **Màu đỏ biểu tượng KFC**. Sử dụng cho nút CTA chính, tiêu đề nhấn mạnh, icon chính, đường kẻ viền thương hiệu. |
| `color-kfc-red-hover` | `#C40024` | `rgb(196, 0, 36)` | Trạng thái hover của các nút bấm màu đỏ. |
| `color-kfc-red-dark` | `#99001C` | `rgb(153, 0, 28)` | Màu đỏ thẫm dùng cho gradient nền hoặc trạng thái active. |
| `color-kfc-black` | `#111827` | `rgb(17, 24, 39)` | Màu đen than cao cấp. Sử dụng cho top banner, footer, tiêu đề chính. |
| `color-kfc-gold` | `#F59E0B` | `rgb(245, 158, 11)` | Vàng mật ong điểm nhấn. Sử dụng cho huy hiệu sao đánh giá, tag giảm giá hot, khuyến mãi đặc biệt. |
| `color-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Trắng tinh khiết. Sử dụng cho nền thẻ sản phẩm, nền drawer, chữ trên nền đỏ/đen. |
| `color-gray-bg` | `#F9FAFB` | `rgb(249, 250, 251)` | Xám nhẹ dịu mắt cho nền tổng thể toàn trang. |
| `color-gray-border` | `#E5E7EB` | `rgb(229, 231, 235)` | Màu viền phân tách các khối nội dung. |
| `color-success` | `#10B981` | `rgb(16, 185, 129)` | Xanh lục biểu thị đơn hàng thành công, voucher hợp lệ. |

---

## 2. HỆ THỐNG TYPOGRAPHY (TYPOGRAPHY SYSTEM)

- **Headings Font**: `'Oswald', sans-serif`
  - Trọng số: `600` (Semi-Bold), `700` (Bold)
  - Đặc tính: Chữ in hoa (Uppercase), nén dọc (Condensed), phong cách mạnh mẽ, đậm chất ẩm thực nhanh Mỹ.
  - Sử dụng cho: Tiêu đề Hero, Tên danh mục, Tên Drawer, Giá tiền định dạng lớn.
- **Body & Interface Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Trọng số: `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold)
  - Đặc tính: Dễ đọc trên mọi độ phân giải màn hình di động và desktop.
  - Sử dụng cho: Tên món ăn, mô tả nguyên liệu, giá niêm yết, thông số dinh dưỡng, nhãn form.

---

## 3. THIẾT KẾ MODULE GIỎ HÀNG (CART MODULE SPECIFICATION)

### 3.1. Bố Cục Ngăn Kéo Giỏ Hàng (Slide-over Cart Drawer)
- **Vị trí**: Cố định (Fixed) bám sát cạnh phải màn hình.
- **Kích thước**:
  - Desktop / Tablet (`width >= 640px`): `width: 440px`, `height: 100vh`.
  - Mobile (`width < 640px`): `width: 100vw`, `height: 100vh` (Toàn màn hình để thao tác ngón tay thuận tiện nhất).
- **Lớp phủ nền (Backdrop Overlay)**:
  - Màu nền: `rgba(0, 0, 0, 0.6)`.
  - Hiệu ứng: `backdrop-filter: blur(4px)`.
  - Tương tác: Bấm vào backdrop sẽ tự động đóng ngăn kéo giỏ hàng.
- **Cấu trúc chia 3 vùng (Header - Body - Footer)**:
  1. **Cart Header**:
     - Tiêu đề: "GIỎ HÀNG CỦA BẠN" (Font Oswald, in hoa).
     - Badge số lượng món: Nền đỏ `#E4002B` hoặc chữ đỏ nổi bật `(X món)`.
     - Nút đóng: Hình tròn `32x32px`, icon `✕` đơn giản, hover đổi màu nền xám.
  2. **Cart Body (Vùng cuộn độc lập)**:
     - Khi giỏ hàng trống: Hiển thị icon giỏ hàng lớn, dòng text gợi ý "Giỏ hàng đang trống", nút CTA "Khám phá món ăn".
     - Khi có món: Danh sách thẻ item món ăn xếp dọc với khoảng cách `gap: 12px`.
  3. **Cart Footer (Cố định ở đáy)**:
     - Ô nhập mã khuyến mãi (Coupon input) kèm nút "Áp Dụng".
     - Khối tóm tắt tài chính (Financial Breakdown):
       - Tạm tính (Subtotal)
       - Giảm giá khuyến mãi (Discount - hiển thị màu xanh lục `-XX.000đ`)
       - Phí giao hàng (Delivery Fee)
       - **Tổng thanh toán (Grand Total)**: Giá trị lớn, màu đỏ `#E4002B`, font Oswald.
     - Nút CTA chính: "TIẾN HÀNH ĐẶT HÀNG" (Nền đỏ `#E4002B`, bo góc `12px`, chữ in hoa font bold).

### 3.2. Thiết Kế Thẻ Món Ăn Trong Giỏ (Cart Item Card)
- **Bố cục hàng ngang (Horizontal Flex)**:
  - **Ảnh thumbnail**: Kích thước cố định `64x64px`, bo góc `10px`, `object-fit: cover`.
  - **Thông tin món**: Tên món in đậm, giá đơn vị màu đỏ `#E4002B`.
  - **Bộ điều khiển số lượng (Quantity Stepper)**:
    - Nút trừ `-`: Vuông `24x24px`, nền trắng bo tròn nhẹ, viền xám mỏng.
    - Ô số lượng: `w-6`, căn giữa, font bold.
    - Nút cộng `+`: Vuông `24x24px`, nền trắng bo tròn nhẹ, viền xám mỏng.
  - **Thành tiền**: Tính toán `unit_price * quantity` hiển thị góc phải.
  - **Nút xóa**: Icon thùng rác hoặc nút "✕ Xóa" màu xám nhạt, hover chuyển đỏ rực.

### 3.3. Hiệu Ứng Chuyển Động & Phản Hồi (Micro-interactions)
- **Hiệu ứng trượt Drawer**:
  - Trục `X`: từ `translateX(100%)` sang `translateX(0)`.
  - Thời gian: `300ms` với đường cong `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Hiệu ứng Badge giỏ hàng trên Header**:
  - Khi thêm món, badge số lượng co giãn nhẹ (Scale `1.2` -> `1.0`) trong `200ms` để thu hút sự chú ý.
- **Toast thông báo**:
  - Xuất hiện ở góc dưới bên phải màn hình khi thêm món thành công hoặc khi mã giảm giá không hợp lệ.
