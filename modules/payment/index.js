/**
 * KFC VIETNAM - PAYMENT MODULE ENTRY POINT
 * Xuất bản dịch vụ thanh toán và UI controller
 */

import { PaymentService, paymentService, SUPPORTED_BANKS } from './payment.service.js';
import { PaymentUI, kfcPaymentUI } from './payment.ui.js';

if (typeof window !== 'undefined') {
  window.PaymentService = PaymentService;
  window.paymentService = paymentService;
  window.PaymentUI = PaymentUI;
  window.kfcPaymentUI = kfcPaymentUI;
}

export {
  PaymentService,
  paymentService,
  SUPPORTED_BANKS,
  PaymentUI,
  kfcPaymentUI
};

export default {
  PaymentService,
  paymentService,
  SUPPORTED_BANKS,
  PaymentUI,
  kfcPaymentUI
};
