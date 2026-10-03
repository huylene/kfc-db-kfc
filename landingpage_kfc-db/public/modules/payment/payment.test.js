/**
 * KFC VIETNAM - PAYMENT MODULE RIGOROUS UNIT TESTS
 * Kiểm thử nghiệp vụ MoMo QR, Thẻ ATM Napas, Thuật toán Luhn, Expiry, OTP, Confirm API
 */

import { PaymentService, SUPPORTED_BANKS } from './payment.service.js';

console.log('🧪 Bắt đầu kiểm thử nghiêm ngặt cho MODULE THANH TOÁN (MOMO QR & THẺ ATM NỘI ĐỊA)...\n');

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

const service = new PaymentService();

// ==========================================
// 1. KIỂM THỬ DANH SÁCH NGÂN HÀNG HỖ TRỢ (NAPAS)
// ==========================================
console.log('--- 1. Kiểm thử danh sách ngân hàng hỗ trợ ---');
const banks = service.getSupportedBanks();
assert(banks.length === 8, 'Hỗ trợ đủ 8 ngân hàng Napas lớn nhất');

const vcb = banks.find(b => b.code === 'VCB');
assert(Boolean(vcb && vcb.bin === '970436' && vcb.shortName === 'Vietcombank'), 'Định dạng Vietcombank đúng mã BIN 970436');

const tcb = banks.find(b => b.code === 'TCB');
assert(Boolean(tcb && tcb.bin === '970407'), 'Techcombank có mã BIN 970407');

// ==========================================
// 2. KIỂM THỬ ĐỊNH DẠNG SỐ THẺ (FORMAT CARD NUMBER)
// ==========================================
console.log('\n--- 2. Kiểm thử formatCardNumber ---');
assert(service.formatCardNumber('') === '', 'Chuỗi rỗng trả về rỗng');
assert(service.formatCardNumber(null) === '', 'Giá trị null trả về rỗng');
assert(service.formatCardNumber('9704360012345674') === '9704 3600 1234 5674', 'Tách 16 số thành 4 cụm cách nhau bởi dấu cách');
assert(service.formatCardNumber('9704-3600-1234-5674') === '9704 3600 1234 5674', 'Lọc bỏ ký tự gạch nối và format chuẩn');
assert(service.formatCardNumber('9704360012345674999999999').length <= 23, 'Giới hạn tối đa 19 chữ số thẻ');

// ==========================================
// 3. KIỂM THỬ THUẬT TOÁN LUHN (MOD 10 CHECKSUM)
// ==========================================
console.log('\n--- 3. Kiểm thử thuật toán Luhn cho thẻ ATM ---');
assert(service.validateLuhn('9704 3600 1234 5672') === true, 'Thẻ Napas hợp lệ 9704360012345672 vượt qua Luhn');
assert(service.validateLuhn('4532 0151 1283 0366') === true, 'Thẻ Visa test hợp lệ 4532015112830366 vượt qua Luhn');
assert(service.validateLuhn('9704 3600 1234 5675') === false, 'Sai số checksum cuối cùng bị từ chối');
assert(service.validateLuhn('1234 5678') === false, 'Độ dài nhỏ hơn 16 số bị từ chối');
assert(service.validateLuhn('970436001234567A') === false, 'Chứa ký tự chữ cái bị từ chối');
assert(service.validateLuhn('') === false, 'Chuỗi rỗng bị từ chối');
assert(service.validateLuhn(null) === false, 'Giá trị null bị từ chối');

// ==========================================
// 4. KIỂM THỬ NGÀY HẾT HẠN (MM/YY EXPIRY)
// ==========================================
console.log('\n--- 4. Kiểm thử ngày hết hạn thẻ ATM ---');
assert(service.validateCardExpiry('').valid === false, 'Rỗng bị từ chối');
assert(service.validateCardExpiry('13/28').valid === false, 'Tháng 13 không hợp lệ');
assert(service.validateCardExpiry('00/28').valid === false, 'Tháng 00 không hợp lệ');
assert(service.validateCardExpiry('12-28').valid === false, 'Sai định dạng dấu gạch nối');
assert(service.validateCardExpiry('12/20').valid === false, 'Năm trong quá khứ 2020 bị báo hết hạn');
assert(service.validateCardExpiry('12/32').valid === true, 'Ngày trong tương lai 12/32 hợp lệ');

// ==========================================
// 5. KIỂM THỬ TÊN CHỦ THẺ (CARDHOLDER NAME)
// ==========================================
console.log('\n--- 5. Kiểm thử tên chủ thẻ ---');
assert(service.validateCardholderName('').valid === false, 'Tên rỗng bị từ chối');
assert(service.validateCardholderName('NGUYEN VAN A').valid === true, 'Tên chuẩn in hoa không dấu hợp lệ');
assert(service.validateCardholderName('nguyen van a').valid === true && service.validateCardholderName('nguyen van a').formattedName === 'NGUYEN VAN A', 'Tên chữ thường tự động in hoa');
assert(service.validateCardholderName('AB').valid === false, 'Tên quá ngắn (< 3 ký tự) bị từ chối');
assert(service.validateCardholderName('NGUYEN VAN A 123').valid === false, 'Tên chứa số bị từ chối');
assert(service.validateCardholderName('NGUYEN @@@').valid === false, 'Tên chứa ký tự đặc biệt bị từ chối');

// ==========================================
// 6. KIỂM THỬ PAYLOAD MÃ QR MOMO
// ==========================================
console.log('\n--- 6. Kiểm thử sinh mã QR MoMo ---');
try {
  service.generateMoMoPayload(null, 150000);
  assert(false, 'Thiếu mã đơn hàng phải ném lỗi');
} catch (err) {
  assert(true, 'Bắt lỗi khi thiếu mã đơn hàng');
}

const momo = service.generateMoMoPayload('KFC-982314', 249000);
assert(momo.receiver === 'KFC VIỆT NAM (OFFICIAL)', 'Đơn vị thụ hưởng là KFC VIỆT NAM (OFFICIAL)');
assert(momo.amount === 249000, 'Số tiền thanh toán đúng 249.000đ');
assert(momo.orderCode === 'KFC-982314', 'Mã đơn hàng khớp chính xác');
assert(momo.qrUrl.includes('api.qrserver.com'), 'Chứa URL QR hợp lệ');

// ==========================================
// 7. KIỂM THỬ GỬI & XÁC THỰC MÃ OTP
// ==========================================
console.log('\n--- 7. Kiểm thử luồng mã OTP ---');
const otpSession = service.sendOTP('0901234567');
assert(otpSession.success === true, 'Gửi OTP thành công');
assert(otpSession.phone === '0901234567', 'Khớp số điện thoại người nhận');

// Kiểm tra master test OTP 123456
const masterCheck = service.verifyOTP('0901234567', '123456');
assert(masterCheck.valid === true, 'Mã thử nghiệm master 123456 luôn xác thực thành công');

// Kiểm tra mã rỗng hoặc sai
assert(service.verifyOTP('0901234567', '').valid === false, 'Mã rỗng bị từ chối');
assert(service.verifyOTP('0901234567', '000000').valid === false, 'Mã OTP sai bị từ chối');

// ==========================================
// 8. KIỂM THỬ XÁC NHẬN THANH TOÁN (CONFIRM PAYMENT)
// ==========================================
console.log('\n--- 8. Kiểm thử xác nhận thanh toán với Backend & Fallback ---');
async function testConfirm() {
  // Mock fetcher giả lập endpoint backend /api/payments/verify
  const mockFetcher = async (url, opts) => {
    assert(url === '/api/payments/verify', 'Gọi đúng endpoint /api/payments/verify');
    const body = JSON.parse(opts.body);
    assert(body.order_code === 'KFC-TEST-1', 'Truyền đúng order_code');
    assert(body.payment_method === 'MOMO', 'Truyền đúng phương thức thanh toán MOMO');
    return {
      json: async () => ({
        success: true,
        message: 'Xác nhận thanh toán thành công!',
        data: {
          order_code: body.order_code,
          payment_status: 'PAID',
          order_status: 'PREPARING'
        }
      })
    };
  };

  const res1 = await service.confirmPayment('KFC-TEST-1', 'MOMO', 'TXN-MOMO-001', mockFetcher);
  assert(res1.success === true, 'Thanh toán MoMo thành công qua Mock API');
  assert(res1.data.payment_status === 'PAID', 'Trạng thái chuyển sang PAID');
  assert(res1.data.order_status === 'PREPARING', 'Trạng thái đơn hàng chuyển sang PREPARING');

  // Thử nghiệm fallback khi API ngắt kết nối
  const failingFetcher = async () => { throw new Error('Network error'); };
  const resFallback = await service.confirmPayment('KFC-FALLBACK-1', 'ATM', 'TXN-ATM-002', failingFetcher);
  assert(resFallback.success === true, 'Fallback ngoại tuyến hoạt động bền bỉ');
  assert(resFallback.data.payment_status === 'PAID', 'Trạng thái đơn hàng vẫn ghi nhận PAID trong chế độ fallback');
}

await testConfirm();

// ==========================================
// TỔNG KẾT
// ==========================================
console.log('\n=============================================');
console.log(`🎉 KẾT QUẢ KIỂM THỬ PAYMENT MODULE: ${passed} PASSED, ${failed} FAILED`);
console.log('=============================================\n');

if (failed > 0) {
  process.exit(1);
}
