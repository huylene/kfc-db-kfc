/**
 * KFC VIETNAM - CART UI COMPONENT (MODULE #1)
 * Render & Điều khiển giao diện Giỏ hàng tuân thủ DESIGN.MD
 */

import { cartService } from './cart.service.js';

export class CartUI {
  constructor(service = cartService, options = {}) {
    this.service = service;
    this.options = {
      containerId: 'kfc-cart-module-root',
      badgeSelector: '#nav-cart-badge',
      onCheckout: null,
      ...options
    };

    this.isOpen = false;
    this.dom = {};
    this._init();
  }

  _formatVND(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  }

  _init() {
    this._injectStyles();
    this._createDOM();
    this._bindEvents();
    this.render();
  }

  _injectStyles() {
    if (document.getElementById('kfc-cart-css')) return;
    const link = document.createElement('link');
    link.id = 'kfc-cart-css';
    link.rel = 'stylesheet';
    link.href = '/modules/cart/cart.css';
    document.head.appendChild(link);
  }

  _createDOM() {
    // Tìm hoặc tạo root container
    let root = document.getElementById(this.options.containerId);
    if (!root) {
      root = document.createElement('div');
      root.id = this.options.containerId;
      document.body.appendChild(root);
    }

    root.innerHTML = `
      <!-- Backdrop -->
      <div class="kfc-cart-backdrop" id="kfc-cart-backdrop"></div>

      <!-- Slide-over Drawer -->
      <aside class="kfc-cart-drawer" id="kfc-cart-drawer" aria-label="Giỏ hàng KFC">
        <!-- Header -->
        <div class="kfc-cart-header">
          <div class="kfc-cart-title">
            <span>🍗</span>
            <span>Giỏ Hàng Của Bạn</span>
            <span class="kfc-cart-count-badge" id="kfc-cart-header-count">(0 món)</span>
          </div>
          <button class="kfc-cart-close-btn" id="kfc-cart-close-btn" title="Đóng giỏ hàng">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="kfc-cart-body" id="kfc-cart-body">
          <!-- Item list / Empty state rendered dynamically -->
        </div>

        <!-- Footer -->
        <div class="kfc-cart-footer" id="kfc-cart-footer">
          <!-- Coupon Box -->
          <div id="kfc-coupon-container">
            <div class="kfc-coupon-box" id="kfc-coupon-input-box">
              <input type="text" class="kfc-coupon-input" id="kfc-cart-promo-input" placeholder="Mã giảm giá (KFCFREESHIP...)" maxlength="20">
              <button class="kfc-coupon-btn" id="kfc-cart-apply-promo-btn">ÁP DỤNG</button>
            </div>
            <div id="kfc-applied-promo-tag" class="kfc-applied-coupon-tag" style="display: none;">
              <span id="kfc-applied-promo-text">🎉 Mã giảm giá</span>
              <button id="kfc-remove-promo-btn" style="background:none;border:none;color:#EF4444;cursor:pointer;font-weight:bold;">✕ Gỡ</button>
            </div>
          </div>

          <!-- Breakdown -->
          <div class="kfc-breakdown-row">
            <span>Tạm tính:</span>
            <span id="kfc-cart-subtotal" style="font-weight: 700; color: #111827;">0đ</span>
          </div>
          <div class="kfc-breakdown-row is-discount" id="kfc-cart-discount-row" style="display: none;">
            <span>Giảm giá khuyến mãi:</span>
            <span id="kfc-cart-discount">-0đ</span>
          </div>
          <div class="kfc-breakdown-row">
            <span>Phí giao hàng:</span>
            <span id="kfc-cart-fee" style="font-weight: 700; color: #111827;">15.000đ</span>
          </div>
          <div class="kfc-breakdown-total">
            <span class="kfc-total-label">Tổng thanh toán:</span>
            <span class="kfc-total-value" id="kfc-cart-total">0đ</span>
          </div>

          <!-- Checkout CTA -->
          <button class="kfc-checkout-btn" id="kfc-cart-checkout-btn">
            Tiến Hành Đặt Hàng →
          </button>
        </div>
      </aside>
    `;

    // Cache elements
    this.dom = {
      backdrop: root.querySelector('#kfc-cart-backdrop'),
      drawer: root.querySelector('#kfc-cart-drawer'),
      headerCount: root.querySelector('#kfc-cart-header-count'),
      closeBtn: root.querySelector('#kfc-cart-close-btn'),
      body: root.querySelector('#kfc-cart-body'),
      footer: root.querySelector('#kfc-cart-footer'),
      promoInput: root.querySelector('#kfc-cart-promo-input'),
      applyPromoBtn: root.querySelector('#kfc-cart-apply-promo-btn'),
      appliedPromoTag: root.querySelector('#kfc-applied-promo-tag'),
      appliedPromoText: root.querySelector('#kfc-applied-promo-text'),
      removePromoBtn: root.querySelector('#kfc-remove-promo-btn'),
      subtotal: root.querySelector('#kfc-cart-subtotal'),
      discountRow: root.querySelector('#kfc-cart-discount-row'),
      discount: root.querySelector('#kfc-cart-discount'),
      fee: root.querySelector('#kfc-cart-fee'),
      total: root.querySelector('#kfc-cart-total'),
      checkoutBtn: root.querySelector('#kfc-cart-checkout-btn')
    };
  }

  _bindEvents() {
    // Đóng drawer khi bấm backdrop hoặc nút đóng
    this.dom.backdrop.addEventListener('click', () => this.close());
    this.dom.closeBtn.addEventListener('click', () => this.close());

    // Áp dụng voucher
    this.dom.applyPromoBtn.addEventListener('click', () => this._handleApplyPromo());
    this.dom.promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._handleApplyPromo();
    });

    // Gỡ voucher
    this.dom.removePromoBtn.addEventListener('click', () => {
      this.service.removePromo();
      this._showToast('Đã gỡ mã khuyến mãi', 'info');
    });

    // Nút checkout
    this.dom.checkoutBtn.addEventListener('click', () => {
      if (this.service.getTotalCount() === 0) {
        this._showToast('Giỏ hàng của bạn đang trống!', 'info');
        return;
      }
      this.close();

      // Callback hoặc CustomEvent
      if (typeof this.options.onCheckout === 'function') {
        this.options.onCheckout(this.service.getState());
      }

      window.dispatchEvent(new CustomEvent('kfc:cart:checkout', {
        bubbles: true,
        detail: this.service.getState()
      }));
    });

    // Lắng nghe thay đổi từ CartService
    this.service.subscribe((eventType, state, detail) => {
      this.render();

      if (eventType === 'promo_invalidated') {
        this._showToast(`Mã "${detail.code}" đã bị hủy vì giá trị đơn không còn đủ điều kiện tối thiểu.`, 'info');
      } else if (eventType === 'item_added') {
        this._showToast(`Đã thêm "${detail.product.name}" vào giỏ hàng!`);
      }
    });

    // Lắng nghe phím ESC để đóng giỏ hàng
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  async _handleApplyPromo() {
    const code = (this.dom.promoInput.value || '').trim();
    if (!code) {
      this._showToast('Vui lòng nhập mã khuyến mãi', 'info');
      return;
    }

    this.dom.applyPromoBtn.disabled = true;
    this.dom.applyPromoBtn.textContent = '...';

    const res = await this.service.validateAndApplyPromoCode(code);
    this.dom.applyPromoBtn.disabled = false;
    this.dom.applyPromoBtn.textContent = 'ÁP DỤNG';

    if (res.success) {
      this._showToast(res.message);
      this.dom.promoInput.value = '';
    } else {
      this._showToast(res.message, 'error');
    }
  }

  _showToast(message, type = 'success') {
    // Dùng container chung hoặc tự tạo
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;display:flex;flex-direction:column;gap:0.5rem;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : '#D97706';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    toast.style.cssText = `background-color:${bg};color:#fff;padding:0.75rem 1.25rem;border-radius:0.75rem;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;font-weight:600;font-family:'Inter',sans-serif;pointer-events:auto;transition:all 0.3s ease;`;
    toast.innerHTML = `<span style="background:rgba(255,255,255,0.25);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;">${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  open() {
    this.isOpen = true;
    this.dom.backdrop.classList.add('is-active');
    this.dom.drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang phía sau
    this.render();
  }

  close() {
    this.isOpen = false;
    this.dom.backdrop.classList.remove('is-active');
    this.dom.drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  render() {
    const items = this.service.getItems();
    const count = this.service.getTotalCount();
    const subtotal = this.service.getSubtotal();
    const discount = this.service.getDiscountAmount();
    const fee = this.service.getDeliveryFee();
    const total = this.service.getTotalAmount();
    const promo = this.service.getAppliedPromo();

    // 1. Cập nhật Badge trên Header
    this.dom.headerCount.textContent = `(${count} món)`;
    const navBadges = document.querySelectorAll(this.options.badgeSelector);
    navBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      if (count > 0) {
        badge.classList.remove('hidden');
      }
    });

    // 2. Render Body
    if (items.length === 0) {
      this.dom.body.innerHTML = `
        <div class="kfc-cart-empty">
          <div class="kfc-cart-empty-icon">🛒</div>
          <div class="kfc-cart-empty-title">Giỏ hàng của bạn đang trống</div>
          <p class="kfc-cart-empty-subtitle">Hãy chọn cho mình vài miếng gà giòn rụm hoặc combo tiết kiệm nhé!</p>
          <button onclick="kfcCartUI.close()" style="background-color:#E4002B;color:#fff;border:none;border-radius:9999px;padding:0.75rem 1.75rem;font-weight:700;font-size:0.8125rem;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 12px rgba(228,0,43,0.3);">
            Khám Phá Món Ăn
          </button>
        </div>
      `;
      this.dom.footer.style.display = 'none';
      return;
    }

    this.dom.footer.style.display = 'block';

    let itemsHtml = '';
    for (const item of items) {
      const lineTotal = item.unit_price * item.quantity;
      itemsHtml += `
        <div class="kfc-cart-item-card" data-product-id="${item.product_id}">
          <img src="${item.image_url}" alt="${item.product_name}" class="kfc-cart-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=120';">
          <div class="kfc-cart-item-info">
            <h4 class="kfc-cart-item-name" title="${item.product_name}">${item.product_name}</h4>
            <div class="kfc-cart-item-price">${this._formatVND(item.unit_price)}</div>
            <div class="kfc-stepper">
              <button class="kfc-stepper-btn btn-qty-minus" data-id="${item.product_id}">-</button>
              <span class="kfc-stepper-value">${item.quantity}</span>
              <button class="kfc-stepper-btn btn-qty-plus" data-id="${item.product_id}">+</button>
            </div>
          </div>
          <div class="kfc-cart-item-actions">
            <div class="kfc-cart-item-subtotal">${this._formatVND(lineTotal)}</div>
            <button class="kfc-cart-item-remove btn-item-remove" data-id="${item.product_id}">
              ✕ Xóa
            </button>
          </div>
        </div>
      `;
    }

    this.dom.body.innerHTML = itemsHtml;

    // Gắn sự kiện tăng giảm & xóa trên từng item
    this.dom.body.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.updateQuantity(Number(btn.dataset.id), -1);
      });
    });

    this.dom.body.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.updateQuantity(Number(btn.dataset.id), 1);
      });
    });

    this.dom.body.querySelectorAll('.btn-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.removeItem(Number(btn.dataset.id));
        this._showToast('Đã xóa món khỏi giỏ hàng', 'info');
      });
    });

    // 3. Render Footer (Breakdown & Promo)
    this.dom.subtotal.textContent = this._formatVND(subtotal);
    this.dom.fee.textContent = fee === 0 ? 'Miễn phí' : this._formatVND(fee);
    this.dom.total.textContent = this._formatVND(total);

    if (discount > 0) {
      this.dom.discountRow.style.display = 'flex';
      this.dom.discount.textContent = `-${this._formatVND(discount)}`;
    } else {
      this.dom.discountRow.style.display = 'none';
    }

    if (promo) {
      this.dom.appliedPromoTag.style.display = 'flex';
      this.dom.appliedPromoText.textContent = `🎉 Mã [${promo.code}]: Giảm ${this._formatVND(discount)}`;
      this.dom.promoInput.parentElement.style.display = 'none';
    } else {
      this.dom.appliedPromoTag.style.display = 'none';
      this.dom.promoInput.parentElement.style.display = 'flex';
    }
  }
}

// Khởi tạo instance và xuất cho toàn cục
export let kfcCartUI = null;
if (typeof window !== 'undefined') {
  kfcCartUI = new CartUI();
  window.kfcCartUI = kfcCartUI;
}

export default kfcCartUI;
