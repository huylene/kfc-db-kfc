/**
 * KFC VIETNAM - PAYMENT UI CONTROLLER (MODULE THANH TOÁN)
 * Quản lý giao diện Pop-up Quét Mã QR MoMo & Thẻ ATM Nội Địa (Napas)
 */

import { paymentService, SUPPORTED_BANKS } from './payment.service.js';

export class PaymentUI {
  constructor(options = {}) {
    this.service = options.service || paymentService;
    this.formatVND = options.formatVND || (val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val));
    this.showToast = options.showToast || (msg => alert(msg));
    this.momoTimer = null;
    this.otpTimer = null;
    this.activeOrder = null;
    this.selectedBank = SUPPORTED_BANKS[0]; // Mặc định Vietcombank
    this.init();
  }

  init() {
    this._ensureModalsInDOM();
  }

  /**
   * Tạo sẵn khung DOM cho MoMo Modal và ATM Modal
   */
  _ensureModalsInDOM() {
    if (document.getElementById('kfc-momo-modal')) return;

    const modalHTML = `
      <!-- MOMO QR MODAL -->
      <div id="kfc-momo-modal" class="payment-modal-overlay">
        <div class="payment-modal-container">
          <div class="payment-modal-header momo-header">
            <h3 class="payment-modal-title">
              <span class="payment-icon-badge" style="background:#fff; color:#a50064; font-weight:900; font-size:12px; display:inline-flex; align-items:center; justify-content:center;">MoMo</span>
              Thanh Toán Qua Ví MoMo
            </h3>
            <button type="button" class="payment-modal-close" id="btn-close-momo">&times;</button>
          </div>
          <div class="payment-modal-body">
            <div class="momo-qr-wrapper">
              <div class="momo-order-meta">
                <div class="momo-meta-item">
                  <div class="meta-label">Mã Đơn Hàng</div>
                  <div class="meta-val" id="momo-modal-order-code">KFC-000000</div>
                </div>
                <div class="momo-meta-item">
                  <div class="meta-label">Đơn Vị Thụ Hưởng</div>
                  <div class="meta-val" style="font-size:13px;">KFC VIỆT NAM</div>
                </div>
                <div class="momo-meta-item total-item">
                  <span class="meta-label" style="font-size:14px;">Số Tiền Thanh Toán:</span>
                  <span class="meta-val" id="momo-modal-amount">0 ₫</span>
                </div>
              </div>

              <div class="momo-timer-badge" id="momo-timer-badge">
                <span>⏱ Mã QR hết hạn sau:</span>
                <strong id="momo-countdown-text">05:00</strong>
              </div>

              <div class="momo-qr-frame">
                <img id="momo-qr-image" src="" alt="Mã QR MoMo">
              </div>

              <div class="momo-instructions">
                <p><strong>Hướng dẫn quét mã MoMo:</strong></p>
                <ol>
                  <li>Mở ứng dụng <strong>Ví MoMo</strong> trên điện thoại</li>
                  <li>Chọn tính năng <strong>Quét Mã</strong> (Scan QR) trên màn hình chính</li>
                  <li>Hướng camera vào mã QR để xác nhận chuyển tiền đúng số tiền</li>
                </ol>
              </div>

              <button type="button" class="btn-momo-simulate" id="btn-simulate-momo-pay">
                ⚡ Mô Phỏng Quét Mã & Thanh Toán Thành Công
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ATM PAYMENT MODAL -->
      <div id="kfc-atm-modal" class="payment-modal-overlay">
        <div class="payment-modal-container">
          <div class="payment-modal-header atm-header">
            <h3 class="payment-modal-title">
              <span class="payment-icon-badge" style="background:#fff; color:#e4002b; font-weight:900; font-size:11px; display:inline-flex; align-items:center; justify-content:center;">ATM</span>
              Thẻ ATM Nội Địa / Napas
            </h3>
            <button type="button" class="payment-modal-close" id="btn-close-atm">&times;</button>
          </div>
          <div class="payment-modal-body">
            <div id="atm-step-form" class="atm-flow-container">
              <!-- Ngân hàng hỗ trợ -->
              <div class="atm-bank-selection">
                <h4>
                  <span>1. Chọn ngân hàng phát hành thẻ</span>
                  <span style="font-size:11px; color:#6b7280; font-family:sans-serif; text-transform:none;">(Hỗ trợ Napas 247)</span>
                </h4>
                <div class="atm-bank-grid" id="atm-bank-grid"></div>
              </div>

              <!-- Thẻ mô phỏng trực quan -->
              <div class="atm-mockup-wrapper">
                <div class="atm-card-mockup" id="atm-card-preview">
                  <div class="atm-mockup-top">
                    <div class="atm-mockup-chip"></div>
                    <div class="atm-mockup-bank" id="preview-bank-name">VIETCOMBANK</div>
                  </div>
                  <div class="atm-mockup-number" id="preview-card-number">9704 36•• •••• ••••</div>
                  <div class="atm-mockup-bottom">
                    <div class="atm-mockup-holder">
                      <div class="atm-mockup-label">CHỦ THẺ</div>
                      <div class="atm-mockup-val" id="preview-card-holder">NGUYEN VAN A</div>
                    </div>
                    <div>
                      <div class="atm-mockup-label">HẾT HẠN</div>
                      <div class="atm-mockup-val" id="preview-card-expiry">12/28</div>
                    </div>
                    <div class="atm-napas-logo">NAPAS</div>
                  </div>
                </div>
              </div>

              <!-- Form nhập chi tiết thẻ -->
              <form id="atm-input-form" class="atm-card-form" onsubmit="return false;">
                <h4>2. Nhập thông tin thẻ</h4>

                <div class="atm-form-group">
                  <label>Số thẻ ATM *</label>
                  <input type="text" id="atm-input-number" class="atm-input-control" placeholder="9704 xxxx xxxx xxxx" maxlength="23" autocomplete="off">
                  <div class="atm-error-hint" id="error-atm-number">Số thẻ không hợp lệ (thuật toán Luhn Napas)</div>
                </div>

                <div class="atm-form-group">
                  <label>Tên in trên thẻ (không dấu) *</label>
                  <input type="text" id="atm-input-holder" class="atm-input-control" placeholder="NGUYEN VAN A" maxlength="30" autocomplete="off" style="text-transform:uppercase;">
                  <div class="atm-error-hint" id="error-atm-holder">Vui lòng nhập tên chủ thẻ viết hoa không dấu</div>
                </div>

                <div class="atm-form-row">
                  <div class="atm-form-group">
                    <label>Ngày hết hạn (MM/YY) *</label>
                    <input type="text" id="atm-input-expiry" class="atm-input-control" placeholder="12/28" maxlength="5" autocomplete="off">
                    <div class="atm-error-hint" id="error-atm-expiry">Ngày hết hạn không hợp lệ</div>
                  </div>
                  <div class="atm-form-group">
                    <label>Số tiền thanh toán</label>
                    <input type="text" id="atm-input-amount" class="atm-input-control" readonly style="background:#f3f4f6; font-weight:700; color:#e4002b;">
                  </div>
                </div>

                <div style="margin-bottom:12px;">
                  <button type="button" id="btn-fill-demo-card" style="background:#f8fafc; border:1px dashed #cbd5e1; color:#0284c7; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; width:100%;">
                    💡 Điền nhanh số thẻ ATM mẫu hợp lệ để thử nghiệm
                  </button>
                </div>

                <button type="submit" class="btn-atm-submit" id="btn-submit-atm">
                  TIẾP TỤC XÁC THỰC OTP →
                </button>
              </form>
            </div>

            <!-- OTP Dialog Step -->
            <div id="atm-step-otp" style="display:none;" class="otp-dialog-box">
              <div class="otp-icon-header">🛡️</div>
              <h3 class="otp-title">Xác Thực Mã OTP Ngân Hàng</h3>
              <p class="otp-desc">
                Mã xác thực giao dịch đã được gửi đến số điện thoại 
                <strong id="otp-masked-phone">090****567</strong>. Vui lòng nhập mã để hoàn tất.
              </p>

              <input type="text" id="atm-otp-input" class="otp-input-field" maxlength="6" placeholder="••••••" autocomplete="one-time-code">

              <div class="otp-timer-text">
                Mã có hiệu lực trong: <span id="otp-countdown-val">60s</span>
              </div>

              <div class="otp-quick-test" id="btn-quick-fill-otp">
                👉 Bấm vào đây để điền mã OTP thử nghiệm nhanh: <strong>123456</strong>
              </div>

              <div class="otp-actions">
                <button type="button" class="btn-otp-cancel" id="btn-cancel-otp">Quay Lại</button>
                <button type="button" class="btn-otp-confirm" id="btn-confirm-otp">Xác Nhận Thanh Toán</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this._bindModalEvents();
    this._renderBankGrid();
  }

  /**
   * Render lưới danh sách ngân hàng Napas
   */
  _renderBankGrid() {
    const grid = document.getElementById('atm-bank-grid');
    if (!grid) return;

    grid.innerHTML = SUPPORTED_BANKS.map((bank, idx) => `
      <div class="atm-bank-card ${idx === 0 ? 'selected' : ''}" data-bank-code="${bank.code}">
        <div class="bank-logo-badge" style="background:${bank.color};">${bank.shortName}</div>
        <div class="bank-shortname">${bank.code}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.atm-bank-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.atm-bank-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const code = card.getAttribute('data-bank-code');
        this.selectedBank = SUPPORTED_BANKS.find(b => b.code === code) || SUPPORTED_BANKS[0];
        this._updateCardMockup();
      });
    });
  }

  /**
   * Cập nhật hiển thị thẻ trực quan
   */
  _updateCardMockup() {
    const cardEl = document.getElementById('atm-card-preview');
    const bankNameEl = document.getElementById('preview-bank-name');
    const numEl = document.getElementById('preview-card-number');
    const holderEl = document.getElementById('preview-card-holder');
    const expiryEl = document.getElementById('preview-card-expiry');

    if (this.selectedBank && cardEl) {
      bankNameEl.textContent = this.selectedBank.shortName.toUpperCase();
      cardEl.style.background = `linear-gradient(135deg, ${this.selectedBank.color} 0%, #111827 100%)`;
    }

    const rawNum = document.getElementById('atm-input-number').value.trim();
    numEl.textContent = rawNum ? rawNum : `${this.selectedBank.bin} •••• •••• ••••`;

    const rawHolder = document.getElementById('atm-input-holder').value.trim();
    holderEl.textContent = rawHolder ? rawHolder.toUpperCase() : 'NGUYEN VAN A';

    const rawExpiry = document.getElementById('atm-input-expiry').value.trim();
    expiryEl.textContent = rawExpiry ? rawExpiry : '12/28';
  }

  /**
   * Đăng ký các sự kiện tương tác
   */
  _bindModalEvents() {
    // Đóng MoMo
    const closeMoMo = () => this.closeMoMoModal();
    document.getElementById('btn-close-momo').addEventListener('click', closeMoMo);
    document.getElementById('kfc-momo-modal').addEventListener('click', (e) => {
      if (e.target.id === 'kfc-momo-modal') closeMoMo();
    });

    // Đóng ATM
    const closeATM = () => this.closeATMModal();
    document.getElementById('btn-close-atm').addEventListener('click', closeATM);
    document.getElementById('kfc-atm-modal').addEventListener('click', (e) => {
      if (e.target.id === 'kfc-atm-modal') closeATM();
    });

    // Mô phỏng thanh toán MoMo
    document.getElementById('btn-simulate-momo-pay').addEventListener('click', () => {
      this._handleMoMoPaymentSuccess();
    });

    // Form ATM: Format input & validate realtime
    const numInput = document.getElementById('atm-input-number');
    numInput.addEventListener('input', (e) => {
      e.target.value = this.service.formatCardNumber(e.target.value);
      this._updateCardMockup();
      document.getElementById('error-atm-number').classList.remove('show');
    });

    const holderInput = document.getElementById('atm-input-holder');
    holderInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      this._updateCardMockup();
      document.getElementById('error-atm-holder').classList.remove('show');
    });

    const expiryInput = document.getElementById('atm-input-expiry');
    expiryInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length >= 2) {
        v = v.slice(0, 2) + '/' + v.slice(2, 4);
      }
      e.target.value = v;
      this._updateCardMockup();
      document.getElementById('error-atm-expiry').classList.remove('show');
    });

    // Điền thẻ demo
    document.getElementById('btn-fill-demo-card').addEventListener('click', () => {
      numInput.value = '9704 3600 1234 5672'; // Số thẻ hợp lệ thuật toán Luhn
      holderInput.value = 'NGUYEN VAN A';
      expiryInput.value = '12/28';
      this._updateCardMockup();
    });

    // Submit form thẻ ATM -> chuyển sang bước OTP
    document.getElementById('btn-submit-atm').addEventListener('click', () => {
      this._handleSubmitATMForm();
    });

    // Điền nhanh mã OTP
    document.getElementById('btn-quick-fill-otp').addEventListener('click', () => {
      document.getElementById('atm-otp-input').value = '123456';
    });

    // Quay lại form nhập thẻ từ bước OTP
    document.getElementById('btn-cancel-otp').addEventListener('click', () => {
      document.getElementById('atm-step-otp').style.display = 'none';
      document.getElementById('atm-step-form').style.display = 'flex';
      if (this.otpTimer) clearInterval(this.otpTimer);
    });

    // Xác nhận mã OTP
    document.getElementById('btn-confirm-otp').addEventListener('click', () => {
      this._handleVerifyOTP();
    });
  }

  /**
   * Mở modal thanh toán MoMo QR
   */
  openMoMoModal({ orderCode, amount, customerPhone, onPaid }) {
    this.activeOrder = { orderCode, amount, customerPhone, onPaid };

    document.getElementById('momo-modal-order-code').textContent = orderCode;
    document.getElementById('momo-modal-amount').textContent = this.formatVND(amount);

    const payload = this.service.generateMoMoPayload(orderCode, amount);
    const qrImg = document.getElementById('momo-qr-image');
    qrImg.src = payload.qrUrl;

    // Đếm ngược 5 phút
    let timeLeft = 300;
    const countdownEl = document.getElementById('momo-countdown-text');
    if (this.momoTimer) clearInterval(this.momoTimer);

    this.momoTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(this.momoTimer);
        countdownEl.textContent = '00:00 (Hết hạn)';
        this.showToast('Mã QR đã hết hạn, vui lòng đặt lại đơn', 'warning');
      } else {
        const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const s = String(timeLeft % 60).padStart(2, '0');
        countdownEl.textContent = `${m}:${s}`;
      }
    }, 1000);

    const modal = document.getElementById('kfc-momo-modal');
    modal.classList.add('active');
  }

  closeMoMoModal() {
    const modal = document.getElementById('kfc-momo-modal');
    if (modal) modal.classList.remove('active');
    if (this.momoTimer) clearInterval(this.momoTimer);
  }

  /**
   * Xử lý khi quét mã MoMo thành công
   */
  async _handleMoMoPaymentSuccess() {
    if (!this.activeOrder) return;
    const btn = document.getElementById('btn-simulate-momo-pay');
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang xác nhận thanh toán...';

    const { orderCode, onPaid } = this.activeOrder;
    const txnId = `MOMO-${Date.now()}`;

    const res = await this.service.confirmPayment(orderCode, 'MOMO', txnId);

    btn.disabled = false;
    btn.innerHTML = '⚡ Mô Phỏng Quét Mã & Thanh Toán Thành Công';
    this.closeMoMoModal();

    this.showToast('✅ Quét mã MoMo thành công! Đơn hàng đã thanh toán.', 'success');

    if (typeof onPaid === 'function') {
      onPaid(res.data || { order_code: orderCode, payment_status: 'PAID', payment_method: 'MOMO' });
    }
  }

  /**
   * Mở modal thanh toán thẻ ATM
   */
  openATMModal({ orderCode, amount, customerPhone, customerName, onPaid }) {
    this.activeOrder = { orderCode, amount, customerPhone, customerName, onPaid };

    document.getElementById('atm-input-amount').value = this.formatVND(amount);
    document.getElementById('atm-step-form').style.display = 'flex';
    document.getElementById('atm-step-otp').style.display = 'none';

    // Reset error hints
    document.getElementById('error-atm-number').classList.remove('show');
    document.getElementById('error-atm-holder').classList.remove('show');
    document.getElementById('error-atm-expiry').classList.remove('show');

    // Mặc định tên khách hàng
    if (customerName) {
      const cleanName = customerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      document.getElementById('atm-input-holder').value = cleanName;
    }

    this._updateCardMockup();

    const modal = document.getElementById('kfc-atm-modal');
    modal.classList.add('active');
  }

  closeATMModal() {
    const modal = document.getElementById('kfc-atm-modal');
    if (modal) modal.classList.remove('active');
    if (this.otpTimer) clearInterval(this.otpTimer);
  }

  /**
   * Xác thực form thông tin thẻ ATM trước khi sang OTP
   */
  _handleSubmitATMForm() {
    const cardNum = document.getElementById('atm-input-number').value.trim();
    const holder = document.getElementById('atm-input-holder').value.trim();
    const expiry = document.getElementById('atm-input-expiry').value.trim();

    let valid = true;

    // 1. Kiểm tra Luhn
    if (!this.service.validateLuhn(cardNum)) {
      const err = document.getElementById('error-atm-number');
      err.textContent = 'Số thẻ không hợp lệ (thuật toán Luhn Napas). Hãy thử bấm nút "Điền nhanh"';
      err.classList.add('show');
      valid = false;
    } else {
      document.getElementById('error-atm-number').classList.remove('show');
    }

    // 2. Kiểm tra tên chủ thẻ
    const holderCheck = this.service.validateCardholderName(holder);
    if (!holderCheck.valid) {
      const err = document.getElementById('error-atm-holder');
      err.textContent = holderCheck.message;
      err.classList.add('show');
      valid = false;
    } else {
      document.getElementById('error-atm-holder').classList.remove('show');
    }

    // 3. Kiểm tra ngày hết hạn
    const expiryCheck = this.service.validateCardExpiry(expiry);
    if (!expiryCheck.valid) {
      const err = document.getElementById('error-atm-expiry');
      err.textContent = expiryCheck.message;
      err.classList.add('show');
      valid = false;
    } else {
      document.getElementById('error-atm-expiry').classList.remove('show');
    }

    if (!valid) return;

    // Gửi OTP mô phỏng
    const phone = (this.activeOrder && this.activeOrder.customerPhone) || '0901234567';
    this.service.sendOTP(phone);

    // Chuyển sang bước OTP
    document.getElementById('atm-step-form').style.display = 'none';
    const otpStep = document.getElementById('atm-step-otp');
    otpStep.style.display = 'block';

    const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    document.getElementById('otp-masked-phone').textContent = maskedPhone;
    document.getElementById('atm-otp-input').value = '';
    document.getElementById('atm-otp-input').focus();

    // Khởi chạy đếm ngược 60s
    let otpTime = 60;
    const timerVal = document.getElementById('otp-countdown-val');
    if (this.otpTimer) clearInterval(this.otpTimer);

    this.otpTimer = setInterval(() => {
      otpTime--;
      if (otpTime <= 0) {
        clearInterval(this.otpTimer);
        timerVal.textContent = 'Hết hạn';
      } else {
        timerVal.textContent = `${otpTime}s`;
      }
    }, 1000);
  }

  /**
   * Xác thực mã OTP và hoàn tất thanh toán
   */
  async _handleVerifyOTP() {
    const inputOtp = document.getElementById('atm-otp-input').value.trim();
    const phone = (this.activeOrder && this.activeOrder.customerPhone) || '0901234567';

    const check = this.service.verifyOTP(phone, inputOtp);
    if (!check.valid) {
      this.showToast(`❌ ${check.message}`, 'error');
      return;
    }

    const btn = document.getElementById('btn-confirm-otp');
    btn.disabled = true;
    btn.textContent = '⏳ Đang xác nhận...';

    const { orderCode, onPaid } = this.activeOrder;
    const txnId = `ATM-${this.selectedBank.code}-${Date.now()}`;

    const res = await this.service.confirmPayment(orderCode, 'ATM', txnId);

    btn.disabled = false;
    btn.textContent = 'Xác Nhận Thanh Toán';
    this.closeATMModal();

    this.showToast('✅ Thanh toán thẻ ATM thành công! Giao dịch được bảo đảm qua Napas.', 'success');

    if (typeof onPaid === 'function') {
      onPaid(res.data || { order_code: orderCode, payment_status: 'PAID', payment_method: 'ATM' });
    }
  }
}

export const kfcPaymentUI = new PaymentUI({
  showToast: (msg, type) => {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      console.log(`[Toast] [${type}] ${msg}`);
    }
  },
  formatVND: (val) => {
    if (typeof window.formatVND === 'function') {
      return window.formatVND(val);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }
});

// Gán biến toàn cục phục vụ live-server & non-module scripts
if (typeof window !== 'undefined') {
  window.PaymentUI = PaymentUI;
  window.kfcPaymentUI = kfcPaymentUI;
}

export default kfcPaymentUI;
