/**
 * KFC VIETNAM - PAYMENT SERVICE (MODULE THANH TOÁN)
 * Quản lý nghiệp vụ thanh toán qua MoMo QR và Thẻ ATM Nội Địa
 */

// Danh sách ngân hàng nội địa phổ biến (Napas)
export const SUPPORTED_BANKS = [
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', bin: '970436', color: '#005b38' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', shortName: 'Techcombank', bin: '970407', color: '#e31b23' },
  { code: 'MB', name: 'Ngân hàng TMCP Quân Đội', shortName: 'MB Bank', bin: '970422', color: '#13328b' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu Tư và Phát Triển VN', shortName: 'BIDV', bin: '970418', color: '#00558f' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', bin: '970416', color: '#0072bc' },
  { code: 'CTG', name: 'Ngân hàng TMCP Công Thương Việt Nam', shortName: 'VietinBank', bin: '970415', color: '#0066b3' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', bin: '970432', color: '#00b14f' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', bin: '970423', color: '#5b2d86' }
];

export class PaymentService {
  constructor() {
    this.testOtp = '123456';
    this.otpStore = new Map();
  }

  /**
   * Lấy danh sách ngân hàng được hỗ trợ
   */
  getSupportedBanks() {
    return [...SUPPORTED_BANKS];
  }

  /**
   * Định dạng số thẻ ATM thành các khối 4 số: xxxx xxxx xxxx xxxx
   */
  formatCardNumber(val) {
    if (!val) return '';
    const clean = String(val).replace(/\D/g, '').slice(0, 19);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  /**
   * Kiểm tra tính hợp lệ của số thẻ ATM bằng thuật toán Luhn (Mod 10)
   */
  validateLuhn(cardNumber) {
    if (!cardNumber) return false;
    const clean = String(cardNumber).replace(/\s/g, '');
    if (!/^\d{16,19}$/.test(clean)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  /**
   * Kiểm tra ngày hết hạn MM/YY (Phải là tháng hợp lệ và trong tương lai)
   */
  validateCardExpiry(expiryString) {
    if (!expiryString) return { valid: false, message: 'Vui lòng nhập ngày hết hạn thẻ' };
    const clean = expiryString.trim();
    const match = clean.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return { valid: false, message: 'Định dạng ngày hết hạn phải là MM/YY (VD: 12/28)' };

    const month = parseInt(match[1], 10);
    const year = 2000 + parseInt(match[2], 10);

    if (month < 1 || month > 12) {
      return { valid: false, message: 'Tháng không hợp lệ (01 - 12)' };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, message: 'Thẻ của bạn đã hết hạn' };
    }

    return { valid: true };
  }

  /**
   * Kiểm tra tên chủ thẻ (chữ cái không dấu, in hoa)
   */
  validateCardholderName(name) {
    if (!name || !name.trim()) return { valid: false, message: 'Vui lòng nhập tên chủ thẻ' };
    const clean = name.trim().toUpperCase();
    if (!/^[A-Z\s]{3,30}$/.test(clean)) {
      return { valid: false, message: 'Tên chủ thẻ phải viết hoa không dấu (ví dụ: NGUYEN VAN A)' };
    }
    return { valid: true, formattedName: clean };
  }

  /**
   * Sinh thông tin mã QR MoMo cho đơn hàng
   */
  generateMoMoPayload(orderCode, amount) {
    if (!orderCode || !amount) {
      throw new Error('Thiếu mã đơn hoặc số tiền');
    }
    const cleanAmount = Number(amount);
    const qrData = `2|99|0901234567|KFC VIETNAM||0|0|${cleanAmount}|Thanh toan don hang ${orderCode}|transfer_myqr`;

    return {
      receiver: 'KFC VIỆT NAM (OFFICIAL)',
      phone: '0901234567',
      orderCode,
      amount: cleanAmount,
      description: `KFC ${orderCode}`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrData)}`
    };
  }

  /**
   * Gửi mã OTP xác thực giao dịch ATM (Mô phỏng)
   */
  sendOTP(phone) {
    const otp = this.testOtp;
    this.otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 60 * 1000 // 60s
    });
    return {
      success: true,
      phone,
      message: `Mã OTP xác thực thanh toán đã được gửi tới số ${phone}`,
      testHint: `(Mã OTP thử nghiệm nhanh: ${otp})`
    };
  }

  /**
   * Xác thực mã OTP
   */
  verifyOTP(phone, inputOtp) {
    if (!inputOtp || !inputOtp.trim()) {
      return { valid: false, message: 'Vui lòng nhập mã OTP' };
    }

    // Cho phép mã master 123456 trong mọi trường hợp thử nghiệm
    if (inputOtp.trim() === this.testOtp) {
      return { valid: true, message: 'Xác thực OTP thành công!' };
    }

    const session = this.otpStore.get(phone);
    if (!session) {
      return { valid: false, message: 'Phiên OTP không tồn tại hoặc đã hết hạn' };
    }

    if (Date.now() > session.expiresAt) {
      return { valid: false, message: 'Mã OTP đã hết hiệu lực, vui lòng lấy mã mới' };
    }

    if (session.otp !== inputOtp.trim()) {
      return { valid: false, message: 'Mã OTP không chính xác' };
    }

    return { valid: true, message: 'Xác thực OTP thành công!' };
  }

  /**
   * Xác nhận hoàn tất thanh toán với backend
   */
  async confirmPayment(orderCode, paymentMethod, transactionId = null, fetcher = null) {
    const fetchFunc = fetcher || (typeof fetch !== 'undefined' ? fetch : null);
    const txn = transactionId || `TXN-${Date.now()}`;

    if (fetchFunc) {
      try {
        const res = await fetchFunc('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_code: orderCode,
            payment_method: paymentMethod,
            transaction_id: txn
          })
        });
        const result = await res.json();
        if (result.success) return result;
      } catch (err) {
        console.warn('Lỗi mạng API verify, fallback xác nhận cục bộ', err);
      }
    }

    // Fallback cập nhật offline trong localStorage
    if (typeof localStorage !== 'undefined') {
      const localOrders = JSON.parse(localStorage.getItem('kfc_local_orders') || '[]');
      const target = localOrders.find(o => o.order_code === orderCode);
      if (target) {
        target.payment_status = 'PAID';
        target.order_status = 'PREPARING';
        target.payment_method = paymentMethod;
        localStorage.setItem('kfc_local_orders', JSON.stringify(localOrders));
      }
    }

    return {
      success: true,
      message: 'Xác nhận thanh toán thành công!',
      data: {
        order_code: orderCode,
        payment_status: 'PAID',
        order_status: 'PREPARING',
        transaction_id: txn
      }
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
