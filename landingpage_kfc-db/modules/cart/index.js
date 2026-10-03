/**
 * KFC VIETNAM - CART MODULE (MODULE #1)
 * Entry Point xuất toàn bộ Service và UI
 */

export { CartService, cartService } from './cart.service.js';
export { CartUI, kfcCartUI } from './cart.ui.js';

// Khởi tạo tiện ích gắn sẵn cho Window
if (typeof window !== 'undefined') {
  // Hàm toàn cục cho nút thêm vào giỏ từ bất kỳ thẻ sản phẩm nào
  window.kfcAddToCart = (product, quantity = 1) => {
    import('./cart.service.js').then(({ cartService }) => {
      cartService.addItem(product, quantity);
    });
  };

  // Mở / Đóng giỏ hàng
  window.kfcOpenCart = () => {
    import('./cart.ui.js').then(({ kfcCartUI }) => {
      if (kfcCartUI) kfcCartUI.open();
    });
  };

  window.kfcCloseCart = () => {
    import('./cart.ui.js').then(({ kfcCartUI }) => {
      if (kfcCartUI) kfcCartUI.close();
    });
  };
}
