/**
 * KFC VIETNAM - CART SERVICE (MODULE #1)
 * State Management & Business Logic cho Giỏ hàng
 * Hỗ trợ chạy trên cả Browser (LocalStorage) và Node.js Test Environment
 */

export class CartService {
  constructor(storage = null) {
    this.storageKey = 'kfc_cart';
    this.storage = storage || (typeof window !== 'undefined' && window.localStorage ? window.localStorage : this._createMemoryStorage());
    this.items = this._loadFromStorage();
    this.appliedPromo = null;
    this.deliveryFee = 15000;
    this.subscribers = new Set();
  }

  // Bộ nhớ đệm fallback khi chạy môi trường test không có window
  _createMemoryStorage() {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  }

  _loadFromStorage() {
    try {
      const data = this.storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Lỗi khi đọc giỏ hàng từ storage:', e);
      return [];
    }
  }

  _saveToStorage() {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Lỗi khi lưu giỏ hàng:', e);
    }
    this._checkPromoEligibility();
    this._notifySubscribers('updated');
  }

  // Kiểm tra điều kiện áp dụng mã giảm giá khi số lượng món thay đổi
  _checkPromoEligibility() {
    if (!this.appliedPromo) return;
    const subtotal = this.getSubtotal();
    if (subtotal < (this.appliedPromo.min_order_value || 0)) {
      const oldCode = this.appliedPromo.code;
      this.appliedPromo = null;
      this._notifySubscribers('promo_invalidated', { code: oldCode, subtotal });
    }
  }

  _notifySubscribers(eventType, detail = {}) {
    const state = this.getState();
    for (const listener of this.subscribers) {
      try {
        listener(eventType, state, detail);
      } catch (err) {
        console.error('Lỗi trong subscriber giỏ hàng:', err);
      }
    }

    // Bắn CustomEvent trên browser nếu có window
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent(`kfc:cart:${eventType}`, {
        bubbles: true,
        detail: { ...state, ...detail }
      });
      window.dispatchEvent(event);
      // Sự kiện tổng quát
      window.dispatchEvent(new CustomEvent('kfc:cart:change', { bubbles: true, detail: state }));
    }
  }

  /**
   * Đăng ký lắng nghe thay đổi giỏ hàng
   */
  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  /**
   * Lấy danh sách món ăn trong giỏ
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Thêm món vào giỏ hàng
   */
  addItem(product, quantity = 1, options = {}) {
    if (!product || !product.id) {
      throw new Error('Sản phẩm không hợp lệ');
    }
    const qty = parseInt(quantity, 10) || 1;
    if (qty <= 0) return;

    const existingIndex = this.items.findIndex(i => i.product_id === product.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price),
        quantity: qty,
        image_url: product.image_url || '',
        special_instructions: options.special_instructions || ''
      });
    }

    this._saveToStorage();
    this._notifySubscribers('item_added', { product, quantity: qty });
    return this.getState();
  }

  /**
   * Cập nhật số lượng món
   */
  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.product_id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this._saveToStorage();
    }
    return this.getState();
  }

  /**
   * Xóa một món khỏi giỏ
   */
  removeItem(productId) {
    const removedItem = this.items.find(i => i.product_id === productId);
    this.items = this.items.filter(i => i.product_id !== productId);
    this._saveToStorage();
    if (removedItem) {
      this._notifySubscribers('item_removed', { item: removedItem });
    }
    return this.getState();
  }

  /**
   * Xóa sạch giỏ hàng
   */
  clear() {
    this.items = [];
    this.appliedPromo = null;
    this._saveToStorage();
    this._notifySubscribers('cleared');
    return this.getState();
  }

  /**
   * Tổng số lượng món (tính tổng quantity)
   */
  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Tạm tính (Subtotal)
   */
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  }

  /**
   * Áp dụng mã khuyến mãi trực tiếp từ đối tượng promo
   */
  applyPromo(promo) {
    if (!promo || !promo.code) {
      throw new Error('Dữ liệu voucher không hợp lệ');
    }
    const subtotal = this.getSubtotal();
    const minOrder = promo.min_order_value || 0;

    if (subtotal < minOrder) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minOrder)} để áp dụng mã này`
      };
    }

    this.appliedPromo = promo;
    this._saveToStorage();
    this._notifySubscribers('promo_applied', { promo });
    return {
      success: true,
      message: `Đã áp dụng mã "${promo.code}": ${promo.title || ''}`,
      promo
    };
  }

  /**
   * Xác thực và áp dụng mã khuyến mãi qua API
   */
  async validateAndApplyPromoCode(code, fetcher = null) {
    if (!code || !code.trim()) {
      return { success: false, message: 'Vui lòng nhập mã khuyến mãi' };
    }

    const cleanCode = code.trim().toUpperCase();
    const fetchFunc = fetcher || (typeof fetch !== 'undefined' ? fetch : null);

    if (!fetchFunc) {
      throw new Error('Không tìm thấy HTTP fetch function');
    }

    try {
      const res = await fetchFunc(`/api/promotions?code=${encodeURIComponent(cleanCode)}`);
      const result = await res.json();

      if (!result.success || !result.data) {
        return { success: false, message: result.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
      }

      return this.applyPromo(result.data);
    } catch (err) {
      return { success: false, message: 'Không thể kết nối để kiểm tra mã giảm giá' };
    }
  }

  /**
   * Gỡ bỏ mã khuyến mãi
   */
  removePromo() {
    this.appliedPromo = null;
    this._saveToStorage();
    this._notifySubscribers('promo_removed');
  }

  /**
   * Lấy mã giảm giá đang áp dụng
   */
  getAppliedPromo() {
    return this.appliedPromo ? { ...this.appliedPromo } : null;
  }

  /**
   * Tính số tiền giảm giá
   */
  getDiscountAmount() {
    if (!this.appliedPromo) return 0;
    const subtotal = this.getSubtotal();
    const promo = this.appliedPromo;

    if (subtotal < (promo.min_order_value || 0)) return 0;

    let discount = 0;
    if (promo.discount_type === 'fixed') {
      discount = promo.discount_value;
    } else if (promo.discount_type === 'percent') {
      discount = Math.round((subtotal * promo.discount_value) / 100);
      if (promo.max_discount && discount > promo.max_discount) {
        discount = promo.max_discount;
      }
    }

    return Math.min(discount, subtotal);
  }

  /**
   * Tính phí giao hàng
   */
  getDeliveryFee(deliveryType = 'delivery') {
    if (deliveryType === 'pickup') return 0;
    if (this.appliedPromo && this.appliedPromo.code === 'KFCFREESHIP') {
      return 0;
    }
    return this.items.length > 0 ? this.deliveryFee : 0;
  }

  /**
   * Tổng thanh toán cuối cùng
   */
  getTotalAmount(deliveryType = 'delivery') {
    if (this.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const fee = this.getDeliveryFee(deliveryType);
    return Math.max(0, subtotal - discount + fee);
  }

  /**
   * Xuất toàn bộ trạng thái hiện tại của giỏ hàng
   */
  getState(deliveryType = 'delivery') {
    return {
      items: this.getItems(),
      itemCount: this.getTotalCount(),
      subtotal: this.getSubtotal(),
      discountAmount: this.getDiscountAmount(),
      deliveryFee: this.getDeliveryFee(deliveryType),
      totalAmount: this.getTotalAmount(deliveryType),
      appliedPromo: this.getAppliedPromo()
    };
  }
}

// Singleton export dùng cho ứng dụng
export const cartService = new CartService();
export default cartService;
