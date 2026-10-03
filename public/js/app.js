/**
 * KFC VIETNAM - FRONTEND APPLICATION LOGIC
 * Tương tác giỏ hàng, gọi REST API, tra cứu đơn hàng, quản trị Admin
 */

// ========================================================
// DỮ LIỆU DỰ PHÒNG TỨC THÌ (FALLBACK DATA)
// Đảm bảo 100% hiển thị sản phẩm ngay cả khi server chưa bật hoặc mở file trực tiếp
// ========================================================
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Gà Rán & Gà Quay', slug: 'ga-ran-ga-quay', description: 'Gà tươi 100% tẩm ướp 11 loại gia vị bí truyền', icon: 'drumstick', display_order: 1 },
  { id: 2, name: 'Combo 1 Người', slug: 'combo-1-nguoi', description: 'Khẩu phần hoàn hảo vừa vặn cho một người', icon: 'user', display_order: 2 },
  { id: 3, name: 'Combo Nhóm & Gia Đình', slug: 'combo-nhom', description: 'Tiết kiệm hơn, sum vầy trọn niềm vui', icon: 'users', display_order: 3 },
  { id: 4, name: 'Burger & Cơm & Mì Ý', slug: 'burger-com', description: 'Bữa chính no bụng, đa dạng hương vị', icon: 'sandwich', display_order: 4 },
  { id: 5, name: 'Thức Ăn Nhẹ & Tráng Miệng', slug: 'thuc-an-nhe', description: 'Bánh trứng, khoai tây giòn tan khó cưỡng', icon: 'cookie', display_order: 5 },
  { id: 6, name: 'Thức Uống', slug: 'thuc-uong', description: 'Nước ngọt có gas và đồ uống giải nhiệt mát lạnh', icon: 'cup-soda', display_order: 6 },
];

const FALLBACK_PRODUCTS = [
  // Gà Rán & Gà Quay
  {
    id: 1, category_id: 1, category_name: 'Gà Rán & Gà Quay',
    name: 'Gà Giòn Cay (2 Miếng)', slug: 'ga-gion-cay-2-mieng',
    description: '2 miếng gà tươi rán giòn rụm với vị cay đậm đà đặc trưng KFC.',
    price: 79000, original_price: 89000,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 540, prep_time_minutes: 10
  },
  {
    id: 2, category_id: 1, category_name: 'Gà Rán & Gà Quay',
    name: 'Gà Truyền Thống (3 Miếng)', slug: 'ga-truyen-thong-3-mieng',
    description: '3 miếng gà công thức nguyên bản 11 loại thảo mộc và gia vị của Đại tá Sanders.',
    price: 115000, original_price: 129000,
    image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 0, calories: 680, prep_time_minutes: 12
  },
  {
    id: 3, category_id: 1, category_name: 'Gà Rán & Gà Quay',
    name: 'Cánh Gà Giòn Cay (4 Miếng)', slug: 'canh-ga-gion-cay-4-mieng',
    description: '4 cánh gà giòn tan vàng ươm, thơm lừng vị tiêu đen và ớt cay tê lưỡi.',
    price: 89000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1527477321005-4d45d3c4bc05?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 0, is_new: 0, calories: 490, prep_time_minutes: 10
  },
  {
    id: 4, category_id: 1, category_name: 'Gà Rán & Gà Quay',
    name: 'Gà Que Phô Mai (4 Que)', slug: 'ga-que-pho-mai-4-que',
    description: 'Thịt ức gà cuộn phô mai béo ngậy kéo sợi hấp dẫn.',
    price: 49000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 1, calories: 320, prep_time_minutes: 8
  },

  // Combo 1 Người
  {
    id: 5, category_id: 2, category_name: 'Combo 1 Người',
    name: 'Combo Gà Rán 1 Người', slug: 'combo-ga-ran-1-nguoi',
    description: '1 miếng gà rán giòn + 1 khoai tây chiên vừa + 1 ly Pepsi mát lạnh.',
    price: 69000, original_price: 85000,
    image_url: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 0, calories: 620, prep_time_minutes: 10
  },
  {
    id: 6, category_id: 2, category_name: 'Combo 1 Người',
    name: 'Combo Burger Zinger 1 Người', slug: 'combo-burger-zinger-1-nguoi',
    description: '1 Burger Zinger phi-lê gà cay giòn + 1 khoai chiên + 1 Pepsi lon.',
    price: 89000, original_price: 105000,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 710, prep_time_minutes: 12
  },
  {
    id: 7, category_id: 2, category_name: 'Combo 1 Người',
    name: 'Combo Cơm Gà Teriyaki 1 Người', slug: 'combo-com-ga-teriyaki-1-nguoi',
    description: '1 Cơm phi lê gà sốt Teriyaki + 1 súp rong biển nóng + 1 ly trà đào.',
    price: 72000, original_price: 85000,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 1, calories: 580, prep_time_minutes: 10
  },

  // Combo Nhóm & Gia Đình
  {
    id: 8, category_id: 3, category_name: 'Combo Nhóm & Gia Đình',
    name: 'Combo Sum Vầy (3 - 4 Người)', slug: 'combo-sum-vay-3-4-nguoi',
    description: '5 miếng Gà Rán + 1 Burger Zinger + 1 Hộp Khoai tây cỡ lớn + 3 Ly Pepsi.',
    price: 259000, original_price: 310000,
    image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 1650, prep_time_minutes: 15
  },
  {
    id: 9, category_id: 3, category_name: 'Combo Nhóm & Gia Đình',
    name: 'Combo Tiệc Nhóm Thịnh Soạn (5 - 6 Người)', slug: 'combo-tiec-nhom-thinh-soan',
    description: '8 miếng Gà Rán + 4 Bánh trứng Tart + 2 Hộp Khoai cỡ lớn + 4 Nước ngọt lon.',
    price: 389000, original_price: 450000,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 2400, prep_time_minutes: 18
  },

  // Burger & Cơm & Mì Ý
  {
    id: 10, category_id: 4, category_name: 'Burger & Cơm & Mì Ý',
    name: 'Burger Zinger Cay Thượng Hạng', slug: 'burger-zinger-cay-thuong-hang',
    description: 'Phi-lê ức gà ướp sốt cay chiên giòn, rau xà lách tươi và sốt mayonnaise béo thơm.',
    price: 65000, original_price: 75000,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 480, prep_time_minutes: 8
  },
  {
    id: 11, category_id: 4, category_name: 'Burger & Cơm & Mì Ý',
    name: 'Burger Tôm Giòn Rụm', slug: 'burger-tom-gion-rum',
    description: 'Nhân tôm biển tươi ngọt bọc bột giòn tan, kèm xốt tartar chua ngọt.',
    price: 55000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 0, calories: 410, prep_time_minutes: 8
  },
  {
    id: 12, category_id: 4, category_name: 'Burger & Cơm & Mì Ý',
    name: 'Cơm Gà Giòn Cay Xốt Teriyaki', slug: 'com-ga-gion-cay-xot-teriyaki',
    description: 'Cơm dẻo thơm ăn kèm phi lê gà chiên giòn rưới nước sốt Teriyaki Nhật Bản đậm vị.',
    price: 52000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    is_spicy: 1, is_popular: 1, is_new: 0, calories: 560, prep_time_minutes: 10
  },
  {
    id: 13, category_id: 4, category_name: 'Burger & Cơm & Mì Ý',
    name: 'Mì Ý Xốt Cà Gà Viên Phô Mai', slug: 'mi-y-xot-ca-ga-vien-pho-mai',
    description: 'Sợi mì Ý dai ngon thấm đẫm xốt cà chua đậm đà kèm thịt gà viên và phô mai rắc.',
    price: 49000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 1, calories: 490, prep_time_minutes: 10
  },

  // Thức Ăn Nhẹ & Tráng Miệng
  {
    id: 14, category_id: 5, category_name: 'Thức Ăn Nhẹ & Tráng Miệng',
    name: 'Bánh Trứng Egg Tart (Hộp 4 Cái)', slug: 'banh-trung-egg-tart-hop-4-cai',
    description: 'Vỏ ngàn lớp giòn tan bọc lớp kem trứng béo ngậy nướng xém cạnh, thơm lừng.',
    price: 65000, original_price: 72000,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 0, calories: 420, prep_time_minutes: 5
  },
  {
    id: 15, category_id: 5, category_name: 'Thức Ăn Nhẹ & Tráng Miệng',
    name: 'Bánh Trứng Egg Tart (1 Cái)', slug: 'banh-trung-egg-tart-1-cai',
    description: 'Bánh trứng nướng nóng hổi ăn kèm sau bữa gà rán giòn rụm.',
    price: 18000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 0, calories: 105, prep_time_minutes: 2
  },
  {
    id: 16, category_id: 5, category_name: 'Thức Ăn Nhẹ & Tráng Miệng',
    name: 'Khoai Tây Chiên Cỡ Lớn', slug: 'khoai-tay-chien-co-lon',
    description: 'Khoai tây cắt lát giòn ngoài mềm trong, rắc muối tiêu vừa vị.',
    price: 38000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 0, calories: 380, prep_time_minutes: 5
  },
  {
    id: 17, category_id: 5, category_name: 'Thức Ăn Nhẹ & Tráng Miệng',
    name: 'Bắp Cải Trộn Coleslaw', slug: 'bap-cai-tron-coleslaw',
    description: 'Bắp cải tươi giòn hòa quyện xốt salad chua béo, chống ngấy tuyệt đối.',
    price: 22000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 0, calories: 95, prep_time_minutes: 3
  },

  // Thức Uống
  {
    id: 18, category_id: 6, category_name: 'Thức Uống',
    name: 'Pepsi Vị Chanh Không Calo', slug: 'pepsi-vi-chanh-khong-calo',
    description: 'Sảng khoái mát lạnh cực đã không lo tăng cân.',
    price: 19000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 1, calories: 0, prep_time_minutes: 2
  },
  {
    id: 19, category_id: 6, category_name: 'Thức Uống',
    name: 'Pepsi Ly Lớn Mát Lạnh', slug: 'pepsi-ly-lon-mat-lanh',
    description: 'Đầy ắp đá lạnh xua tan cơn khát ngày hè.',
    price: 19000, original_price: null,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 0, is_new: 0, calories: 150, prep_time_minutes: 2
  },
  {
    id: 20, category_id: 6, category_name: 'Thức Uống',
    name: 'Trà Đào Hạt Chia Thanh Mát', slug: 'tra-dao-hat-chia-thanh-mat',
    description: 'Vị trà đào thơm ngát quyện cùng miếng đào ngâm giòn và hạt chia bổ dưỡng.',
    price: 29000, original_price: 35000,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    is_spicy: 0, is_popular: 1, is_new: 0, calories: 90, prep_time_minutes: 3
  }
];

// Trạng thái ứng dụng (Application State)
const state = {
  categories: FALLBACK_CATEGORIES,
  products: FALLBACK_PRODUCTS,
  activeCategory: 'all',
  searchQuery: '',
  filterSpicy: false,
  filterPopular: false,
  filterNew: false,
  cart: JSON.parse(localStorage.getItem('kfc_cart') || '[]'),
  appliedPromo: null,
  stores: [],
  activeCity: 'all',
  currentViewingProduct: null
};

// ========================================================
// 1. TIỆN ÍCH HỖ TRỢ (HELPERS)
// ========================================================

function formatVND(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  toast.className = `${bgClass} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-slide-right transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function saveCartToStorage() {
  localStorage.setItem('kfc_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('nav-cart-badge');
  const drawerCount = document.getElementById('drawer-cart-count');
  
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
    // Hiệu ứng nảy nhẹ khi cập nhật số lượng
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
  }
  if (drawerCount) {
    drawerCount.textContent = `(${count} món)`;
  }
}

// ========================================================
// 2. KHỞI TẠO DỮ LIỆU TỪ BACKEND API
// ========================================================

async function initApp() {
  // Render ngay lập tức dữ liệu để người dùng KHÔNG bao giờ thấy màn hình trống
  renderCategories();
  renderProducts();
  updateCartBadge();
  setupEventListeners();

  // Sau đó cố gắng đồng bộ dữ liệu tươi mới từ SQLite backend
  try {
    await Promise.allSettled([
      loadCategories(),
      loadProducts(),
      loadStores(),
      loadReviews()
    ]);
  } catch (err) {
    console.log('Chạy ở chế độ offline/fallback data');
  }
}

async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      state.categories = result.data;
      renderCategories();
    }
  } catch (e) {
    // Giữ nguyên FALLBACK_CATEGORIES
  }
}

async function loadProducts() {
  try {
    let url = '/api/products?';
    const params = [];
    if (state.activeCategory !== 'all') {
      params.push(`category_id=${state.activeCategory}`);
    }
    if (state.searchQuery) {
      params.push(`search=${encodeURIComponent(state.searchQuery)}`);
    }
    if (state.filterSpicy) {
      params.push('spicy=1');
    }
    if (state.filterPopular) {
      params.push('popular=1');
    }

    const res = await fetch(url + params.join('&'));
    const result = await res.json();
    if (result.success && result.data.length > 0) {
      state.products = result.data;
      renderProducts();
    } else {
      filterFallbackProducts();
    }
  } catch (e) {
    filterFallbackProducts();
  }
}

function filterFallbackProducts() {
  let list = [...FALLBACK_PRODUCTS];
  if (state.activeCategory !== 'all') {
    list = list.filter(p => String(p.category_id) === String(state.activeCategory));
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }
  if (state.filterSpicy) {
    list = list.filter(p => p.is_spicy === 1);
  }
  if (state.filterPopular) {
    list = list.filter(p => p.is_popular === 1);
  }
  state.products = list;
  renderProducts();
}

async function loadStores() {
  try {
    let url = '/api/stores';
    if (state.activeCity !== 'all') {
      url += `?city=${encodeURIComponent(state.activeCity)}`;
    }
    const res = await fetch(url);
    const result = await res.json();
    if (result.success) {
      state.stores = result.data;
      renderStores();
    }
  } catch (e) {
    renderStores();
  }
}

async function loadReviews() {
  try {
    const res = await fetch('/api/reviews');
    const result = await res.json();
    if (result.success) {
      renderReviews(result.data);
    }
  } catch (e) {
    // Fallback reviews
  }
}

// ========================================================
// 3. RENDER GIAO DIỆN
// ========================================================

function renderCategories() {
  const container = document.getElementById('category-tabs');
  if (!container) return;

  let html = `
    <button onclick="selectCategory('all')" 
      class="px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
        state.activeCategory === 'all' 
          ? 'bg-[#E4002B] text-white shadow-lg shadow-red-500/30' 
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }">
      <span>🍗</span> Tất Cả Món
    </button>
  `;

  for (const cat of state.categories) {
    const isActive = state.activeCategory === String(cat.id);
    html += `
      <button onclick="selectCategory('${cat.id}')" 
        class="px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
          isActive 
            ? 'bg-[#E4002B] text-white shadow-lg shadow-red-500/30' 
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }">
        <span>${getCategoryEmoji(cat.slug || '')}</span> ${cat.name}
      </button>
    `;
  }

  container.innerHTML = html;
}

function getCategoryEmoji(slug) {
  if (slug.includes('ga-ran')) return '🍗';
  if (slug.includes('combo-1')) return '👤';
  if (slug.includes('combo-nhom')) return '👨‍👩‍👧‍👦';
  if (slug.includes('burger')) return '🍔';
  if (slug.includes('thuc-an-nhe')) return '🥧';
  if (slug.includes('thuc-uong')) return '🥤';
  return '🍽️';
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  const countLabel = document.getElementById('products-count');
  if (!container) return;

  if (countLabel) {
    countLabel.textContent = `Hiển thị ${state.products.length} món ăn thơm ngon`;
  }

  if (state.products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="text-6xl mb-4">🍗</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Không tìm thấy món ăn phù hợp</h3>
        <p class="text-gray-500 text-sm mb-6">Thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-[#E4002B] text-white font-bold rounded-full hover:bg-red-700 transition">
          Xóa bộ lọc
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  for (const p of state.products) {
    const isDiscounted = p.original_price && p.original_price > p.price;
    const discountPercent = isDiscounted ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;

    html += `
      <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover flex flex-col group">
        <!-- Thumbnail & Badges -->
        <div class="relative overflow-hidden h-52 bg-gray-100 cursor-pointer" onclick="openProductModal(${p.id})">
          <img src="${p.image_url}" alt="${p.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600'">
          
          <div class="absolute top-3 left-3 flex flex-col gap-1.5">
            ${p.is_popular ? '<span class="bg-[#E4002B] text-white text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">🔥 Bán chạy</span>' : ''}
            ${p.is_new ? '<span class="bg-amber-500 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md">✨ Món Mới</span>' : ''}
            ${p.is_spicy ? '<span class="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md">🌶️ Cay</span>' : ''}
          </div>

          ${isDiscounted ? `
            <div class="absolute top-3 right-3 bg-red-600 text-white text-xs font-extrabold px-2 py-1 rounded-md shadow">
              -${discountPercent}%
            </div>
          ` : ''}

          <div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded">
            ⏱️ ${p.prep_time_minutes || 15} phút
          </div>
        </div>

        <!-- Nội dung Thẻ món -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">${p.category_name || 'KFC Menu'}</div>
            <h3 class="font-bold text-gray-900 text-lg group-hover:text-[#E4002B] transition-colors line-clamp-1 cursor-pointer" 
              onclick="openProductModal(${p.id})">
              ${p.name}
            </h3>
            <p class="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              ${p.description || 'Thịt gà tươi giòn rụm đậm đà hương vị KFC.'}
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
            <div>
              <div class="text-xl font-extrabold text-[#E4002B] font-kfc-heading">
                ${formatVND(p.price)}
              </div>
              ${isDiscounted ? `
                <div class="text-xs text-gray-400 line-through">
                  ${formatVND(p.original_price)}
                </div>
              ` : ''}
            </div>

            <!-- Nút Thêm Vào Giỏ Nổi Bật -->
            <button onclick="addToCart(${p.id}); event.stopPropagation();" 
              class="px-4 py-2 bg-[#E4002B] hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span>+</span>
              <span>Thêm Giỏ</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderStores() {
  const container = document.getElementById('stores-list');
  if (!container) return;

  const defaultStores = [
    { name: 'KFC Hai Bà Trưng', address: 'Số 330 Hai Bà Trưng, Phường Tân Định', district: 'Quận 1', city: 'Hồ Chí Minh', phone: '028 3820 5001', opening_hours: '08:00 - 22:30', has_drive_thru: 0 },
    { name: 'KFC Nguyễn Thị Minh Khai', address: 'Số 14 Nguyễn Thị Minh Khai', district: 'Quận 1', city: 'Hồ Chí Minh', phone: '028 3824 1002', opening_hours: '08:00 - 23:00', has_drive_thru: 1 },
    { name: 'KFC Bà Triệu', address: 'Số 292 Bà Triệu', district: 'Quận Hai Bà Trưng', city: 'Hà Nội', phone: '024 3974 8123', opening_hours: '08:30 - 22:00', has_drive_thru: 0 }
  ];

  const storesToRender = (state.stores && state.stores.length > 0) ? state.stores : defaultStores;

  let html = '';
  for (const s of storesToRender) {
    html += `
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-red-200 transition">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-bold text-gray-900 text-base">${s.name}</h4>
          ${s.has_drive_thru ? '<span class="text-[11px] bg-red-100 text-[#E4002B] font-bold px-2 py-0.5 rounded">🚗 Drive-Thru</span>' : ''}
        </div>
        <p class="text-sm text-gray-600 mb-2 flex items-start gap-1.5">
          <span class="text-red-500 mt-0.5">📍</span> ${s.address}, ${s.district}, ${s.city}
        </p>
        <div class="text-xs text-gray-500 flex items-center gap-4 mb-4">
          <span>⏰ ${s.opening_hours}</span>
          <span>📞 ${s.phone}</span>
        </div>
        <div class="flex gap-2">
          <a href="tel:${s.phone.replace(/\\s/g, '')}" class="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition">
            Gọi Đặt Bàn
          </a>
          <button onclick="showToast('Đang mở bản đồ dẫn đường tới ${s.name}', 'info')" class="flex-1 text-center py-2 bg-red-50 hover:bg-red-100 text-[#E4002B] text-xs font-bold rounded-lg transition">
            Xem Đường Đi
          </button>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderReviews(reviews) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  const defaultReviews = [
    { customer_name: 'Nguyễn Hoàng Nam', rating: 5, comment: 'Gà rán giòn cay nóng hổi giao nhanh đúng 20 phút. Vỏ gà giòn rụm bên trong thịt mọng nước chuẩn vị KFC!' },
    { customer_name: 'Trần Thị Thu Trang', rating: 5, comment: 'Bánh trứng egg tart tuyệt đỉnh! Cả nhà mình ai cũng thích, thơm béo bùi ngậy.' },
    { customer_name: 'Lê Minh Khoa', rating: 5, comment: 'Burger Zinger phi lê cay đỉnh chóp, sốt mayonnaise hòa quyện ăn rất cuốn miệng.' }
  ];

  const list = (reviews && reviews.length > 0) ? reviews : defaultReviews;

  let html = '';
  for (const r of list) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    html += `
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-gray-900">${r.customer_name}</span>
            <span class="text-amber-500 font-bold tracking-widest text-sm">${stars}</span>
          </div>
          <p class="text-xs text-gray-600 italic">"${r.comment}"</p>
        </div>
        <div class="text-[11px] text-gray-400 mt-4 flex items-center justify-between">
          <span>Khách hàng KFC</span>
          <span>${r.created_at ? r.created_at.slice(0, 10) : 'Gần đây'}</span>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// ========================================================
// 4. LOGIC GIỎ HÀNG (CART ACTIONS)
// ========================================================

function addToCart(productId, quantity = 1) {
  const product = state.products.find(p => p.id === productId) || FALLBACK_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: quantity,
      image_url: product.image_url
    });
  }

  saveCartToStorage();
  showToast(`🍗 Đã thêm "${product.name}" vào giỏ hàng!`);
  
  // Tự động mở nhẹ giỏ hàng để người dùng thấy rõ món vừa được thêm
  openCartDrawer();
}

function updateCartQty(productId, delta) {
  const item = state.cart.find(i => i.product_id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCartToStorage();
  }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.product_id !== productId);
  saveCartToStorage();
  showToast('Đã xóa món khỏi giỏ hàng', 'info');
}

function clearCart() {
  state.cart = [];
  state.appliedPromo = null;
  saveCartToStorage();
}

function renderCartDrawer() {
  const listEl = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty-state');
  const footerEl = document.getElementById('cart-footer');
  if (!listEl) return;

  if (state.cart.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    footerEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  footerEl.classList.remove('hidden');

  let subtotal = 0;
  let html = '';

  for (const item of state.cart) {
    const lineTotal = item.unit_price * item.quantity;
    subtotal += lineTotal;

    html += `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <img src="${item.image_url}" alt="${item.product_name}" class="w-16 h-16 rounded-lg object-cover" onerror="this.src='https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=120';">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm text-gray-900 truncate">${item.product_name}</h4>
          <div class="text-[#E4002B] font-extrabold text-sm">${formatVND(item.unit_price)}</div>
          <div class="flex items-center gap-2 mt-1.5">
            <button onclick="updateCartQty(${item.product_id}, -1)" class="w-6 h-6 rounded bg-white border border-gray-300 flex items-center justify-center font-bold text-xs hover:bg-gray-100 cursor-pointer">-</button>
            <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
            <button onclick="updateCartQty(${item.product_id}, 1)" class="w-6 h-6 rounded bg-white border border-gray-300 flex items-center justify-center font-bold text-xs hover:bg-gray-100 cursor-pointer">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold text-sm text-gray-900">${formatVND(lineTotal)}</div>
          <button onclick="removeFromCart(${item.product_id})" class="text-gray-400 hover:text-red-500 text-xs mt-2 transition cursor-pointer">
            ✕ Xóa
          </button>
        </div>
      </div>
    `;
  }

  listEl.innerHTML = html;

  // Tính toán khuyến mãi & phí ship
  let discountAmount = 0;
  if (state.appliedPromo) {
    const p = state.appliedPromo;
    if (subtotal >= p.min_order_value) {
      if (p.discount_type === 'fixed') {
        discountAmount = p.discount_value;
      } else if (p.discount_type === 'percent') {
        discountAmount = Math.round((subtotal * p.discount_value) / 100);
        if (p.max_discount && discountAmount > p.max_discount) {
          discountAmount = p.max_discount;
        }
      }
    } else {
      state.appliedPromo = null; // Huỷ mã nếu không còn đủ điều kiện min order
      showToast(`Mã giảm giá đã bị gỡ vì đơn chưa đạt tối thiểu ${formatVND(p.min_order_value)}`, 'info');
    }
  }

  const deliveryFee = (state.appliedPromo && state.appliedPromo.code === 'KFCFREESHIP') ? 0 : 15000;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  document.getElementById('cart-subtotal').textContent = formatVND(subtotal);
  document.getElementById('cart-delivery-fee').textContent = deliveryFee === 0 ? 'Miễn phí' : formatVND(deliveryFee);
  
  const discountRow = document.getElementById('cart-discount-row');
  if (discountAmount > 0) {
    discountRow.classList.remove('hidden');
    document.getElementById('cart-discount').textContent = `-${formatVND(discountAmount)}`;
  } else {
    discountRow.classList.add('hidden');
  }

  document.getElementById('cart-total').textContent = formatVND(total);
}

// Áp dụng Voucher
async function applyVoucherCode(codeToApply = null) {
  const input = document.getElementById('cart-promo-input');
  const code = (codeToApply || input.value || '').trim();

  if (!code) {
    showToast('Vui lòng nhập mã khuyến mãi', 'info');
    return;
  }

  // Danh sách voucher offline fallback
  const fallbackPromos = {
    'KFCFREESHIP': { code: 'KFCFREESHIP', title: 'Miễn Phí Giao Hàng', discount_type: 'fixed', discount_value: 15000, min_order_value: 100000 },
    'GIAM20K': { code: 'GIAM20K', title: 'Giảm Ngay 20K', discount_type: 'fixed', discount_value: 20000, min_order_value: 120000 },
    'SUPERDEAL50': { code: 'SUPERDEAL50', title: 'Siêu Deal Giảm 20%', discount_type: 'percent', discount_value: 20, min_order_value: 200000, max_discount: 50000 },
    'WELCOMEKFC': { code: 'WELCOMEKFC', title: 'Quà Chào Bạn Mới', discount_type: 'fixed', discount_value: 10000, min_order_value: 50000 }
  };

  try {
    const res = await fetch(`/api/promotions?code=${encodeURIComponent(code)}`);
    const result = await res.json();

    if (result.success && result.data) {
      applyPromoObject(result.data);
      return;
    }
  } catch (err) {
    // Offline fallback
  }

  const cleanCode = code.toUpperCase();
  if (fallbackPromos[cleanCode]) {
    applyPromoObject(fallbackPromos[cleanCode]);
  } else {
    showToast('Mã khuyến mãi không hợp lệ hoặc đã hết hạn', 'error');
  }
}

function applyPromoObject(promo) {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  if (subtotal < promo.min_order_value) {
    showToast(`Đơn hàng phải từ ${formatVND(promo.min_order_value)} để áp dụng mã này`, 'info');
    return;
  }

  state.appliedPromo = promo;
  renderCartDrawer();
  showToast(`🎉 Đã áp dụng mã "${promo.code}": ${promo.title}`);
}

// Sao chép mã từ banner và tự áp dụng
window.copyAndApplyCoupon = function(code) {
  openCartDrawer();
  const input = document.getElementById('cart-promo-input');
  if (input) input.value = code;
  applyVoucherCode(code);
};

// ========================================================
// 5. ĐẶT HÀNG & THANH TOÁN (CHECKOUT MODAL & POPUP THÀNH CÔNG)
// ========================================================

function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng của bạn đang trống! Hãy chọn món trước.', 'info');
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('hidden');
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('btn-submit-order');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⏳</span> Đang lưu đơn hàng...';

  const orderData = {
    customer_name: form.customer_name.value.trim(),
    customer_phone: form.customer_phone.value.trim(),
    customer_email: form.customer_email.value.trim(),
    delivery_type: form.delivery_type.value,
    delivery_address: form.delivery_address.value.trim(),
    note: form.note.value.trim(),
    payment_method: form.payment_method.value,
    promo_code: state.appliedPromo ? state.appliedPromo.code : null,
    items: state.cart.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
      unit_price: i.unit_price,
      quantity: i.quantity
    }))
  };

  let createdOrder = null;

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await res.json();
    if (result.success) {
      createdOrder = result.data;
    }
  } catch (err) {
    console.warn('Gửi qua mạng không thành công, tạo đơn fallback cục bộ', err);
  }

  // Fallback: Tạo đơn hàng cục bộ tức thì để LUÔN LUÔN hoạt động khi offline
  if (!createdOrder) {
    const subtotal = state.cart.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
    let discount = 0;
    if (state.appliedPromo) {
      if (state.appliedPromo.discount_type === 'fixed') discount = state.appliedPromo.discount_value;
      else discount = Math.round((subtotal * state.appliedPromo.discount_value) / 100);
    }
    const fee = (state.appliedPromo && state.appliedPromo.code === 'KFCFREESHIP') || orderData.delivery_type === 'pickup' ? 0 : 15000;
    const total = Math.max(0, subtotal - discount + fee);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    createdOrder = {
      order_code: `KFC-${randomSuffix}`,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address || 'Nhận tại nhà hàng',
      total_amount: total,
      items: [...state.cart],
      order_status: 'PENDING',
      payment_method: orderData.payment_method
    };

    const localOrders = JSON.parse(localStorage.getItem('kfc_local_orders') || '[]');
    localOrders.unshift(createdOrder);
    localStorage.setItem('kfc_local_orders', JSON.stringify(localOrders));
  }

  // Hoàn tất giỏ hàng và đóng checkout modal
  clearCart();
  closeCheckoutModal();
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Xác Nhận Đặt Hàng';

  // Điều hướng thanh toán theo phương thức
  if (orderData.payment_method === 'MOMO' && window.kfcPaymentUI) {
    window.kfcPaymentUI.openMoMoModal({
      orderCode: createdOrder.order_code,
      amount: createdOrder.total_amount,
      customerPhone: createdOrder.customer_phone,
      onPaid: (paidOrder) => {
        showOrderSuccessModal({ ...createdOrder, ...paidOrder });
      }
    });
    return;
  }

  if (orderData.payment_method === 'ATM' && window.kfcPaymentUI) {
    window.kfcPaymentUI.openATMModal({
      orderCode: createdOrder.order_code,
      amount: createdOrder.total_amount,
      customerPhone: createdOrder.customer_phone,
      customerName: createdOrder.customer_name,
      onPaid: (paidOrder) => {
        showOrderSuccessModal({ ...createdOrder, ...paidOrder });
      }
    });
    return;
  }

  // Mặc định COD hoặc phương thức khác
  showOrderSuccessModal(createdOrder);
}

function showOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  document.getElementById('success-order-code').textContent = order.order_code;
  document.getElementById('success-order-total').textContent = formatVND(order.total_amount);
  document.getElementById('success-order-phone').textContent = order.customer_phone;
  modal.classList.remove('hidden');

  showToast(`🎉 Chúc mừng ${order.customer_name}! Đơn hàng ${order.order_code} đã được xác nhận.`);
}

function closeOrderSuccessModal() {
  document.getElementById('order-success-modal').classList.add('hidden');
}

// Hàm Test Nhanh Pop-up Đặt Hàng Thành Công
window.testOrderSuccessPopup = function() {
  const sampleOrder = {
    order_code: `KFC-${Math.floor(100000 + Math.random() * 900000)}`,
    customer_name: 'Khách Hàng Trải Nghiệm',
    customer_phone: '0901234567',
    delivery_address: 'Số 123 Đường Hai Bà Trưng, Quận 1, TP.HCM',
    total_amount: 148000
  };
  showOrderSuccessModal(sampleOrder);
};

// Hàm Test Nhanh Pop-up Thanh Toán MoMo QR
window.testMoMoPaymentPopup = function() {
  const code = `KFC-${Math.floor(100000 + Math.random() * 900000)}`;
  if (window.kfcPaymentUI) {
    window.kfcPaymentUI.openMoMoModal({
      orderCode: code,
      amount: 178000,
      customerPhone: '0901234567',
      onPaid: (paidOrder) => {
        showOrderSuccessModal({
          order_code: code,
          customer_name: 'Khách Hàng MoMo',
          customer_phone: '0901234567',
          delivery_address: 'Tòa nhà Bitexco, Q.1, TP.HCM',
          total_amount: 178000,
          ...paidOrder
        });
      }
    });
  }
};

// Hàm Test Nhanh Pop-up Thanh Toán Thẻ ATM Napas
window.testATMPaymentPopup = function() {
  const code = `KFC-${Math.floor(100000 + Math.random() * 900000)}`;
  if (window.kfcPaymentUI) {
    window.kfcPaymentUI.openATMModal({
      orderCode: code,
      amount: 245000,
      customerPhone: '0901234567',
      customerName: 'NGUYEN VAN A',
      onPaid: (paidOrder) => {
        showOrderSuccessModal({
          order_code: code,
          customer_name: 'NGUYEN VAN A',
          customer_phone: '0901234567',
          delivery_address: 'Tòa nhà Landmark 81, Bình Thạnh, TP.HCM',
          total_amount: 245000,
          ...paidOrder
        });
      }
    });
  }
};

// ========================================================
// 6. TRA CỨU ĐƠN HÀNG (ORDER TRACKING)
// ========================================================

async function handleTrackOrder() {
  const input = document.getElementById('track-search-input');
  const query = (input.value || '').trim();

  if (!query) {
    showToast('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại', 'info');
    return;
  }

  const resultContainer = document.getElementById('track-result-container');
  resultContainer.innerHTML = '<div class="text-center py-6 text-gray-500">Đang tra cứu dữ liệu đơn hàng...</div>';
  resultContainer.classList.remove('hidden');

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
    const result = await res.json();

    if (result.success && result.data) {
      renderOrderTrackingResult(result.data);
      return;
    }
  } catch (err) {
    // Thử tìm trong local orders
  }

  // Tìm trong local orders
  const localOrders = JSON.parse(localStorage.getItem('kfc_local_orders') || '[]');
  const matched = localOrders.find(o => o.order_code === query || o.customer_phone === query);

  if (matched) {
    renderOrderTrackingResult(matched);
    return;
  }

  resultContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl text-center">
      <p class="font-bold">Không tìm thấy đơn hàng với thông tin: ${query}</p>
      <p class="text-xs text-red-500 mt-1">Vui lòng kiểm tra lại mã đơn (Ví dụ: KFC-829104) hoặc số điện thoại bạn đã đặt</p>
    </div>
  `;
}

function renderOrderTrackingResult(order) {
  const container = document.getElementById('track-result-container');
  
  const statuses = ['PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED'];
  const currentStep = statuses.indexOf(order.order_status);

  const statusLabels = {
    PENDING: 'Chờ Tiếp Nhận',
    PREPARING: 'Bếp Đang Nấu',
    DELIVERING: 'Đang Giao Hàng',
    COMPLETED: 'Hoàn Tất Đơn',
    CANCELLED: 'Đã Hủy'
  };

  let stepsHtml = '';
  if (order.order_status === 'CANCELLED') {
    stepsHtml = `
      <div class="p-4 bg-red-100 text-red-800 rounded-xl font-bold text-center">
        ❌ Đơn hàng này đã bị hủy.
      </div>
    `;
  } else {
    stepsHtml = `
      <div class="grid grid-cols-4 gap-2 text-center text-xs font-bold pt-4 pb-2">
        <div class="${currentStep >= 0 ? 'text-[#E4002B]' : 'text-gray-300'}">
          <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${currentStep >= 0 ? 'bg-[#E4002B] text-white' : 'bg-gray-100 text-gray-400'}">1</div>
          Chờ xác nhận
        </div>
        <div class="${currentStep >= 1 ? 'text-[#E4002B]' : 'text-gray-300'}">
          <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#E4002B] text-white' : 'bg-gray-100 text-gray-400'}">2</div>
          Đang chế biến
        </div>
        <div class="${currentStep >= 2 ? 'text-[#E4002B]' : 'text-gray-300'}">
          <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#E4002B] text-white' : 'bg-gray-100 text-gray-400'}">3</div>
          Đang giao hàng
        </div>
        <div class="${currentStep >= 3 ? 'text-[#E4002B]' : 'text-gray-300'}">
          <div class="w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#E4002B] text-white' : 'bg-gray-100 text-gray-400'}">4</div>
          Đã giao xong
        </div>
      </div>
    `;
  }

  let itemsHtml = '';
  for (const item of (order.items || [])) {
    itemsHtml += `
      <div class="flex justify-between py-1.5 text-xs text-gray-700">
        <span>${item.product_name} <b>x${item.quantity}</b></span>
        <span class="font-semibold">${formatVND(item.unit_price * item.quantity)}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg animate-fade-in">
      <div class="flex flex-wrap items-center justify-between border-b pb-4 gap-2">
        <div>
          <span class="text-xs text-gray-500">Mã đơn hàng:</span>
          <h4 class="text-lg font-black text-[#E4002B]">${order.order_code}</h4>
        </div>
        <div class="text-right">
          <span class="text-xs text-gray-500">Trạng thái:</span>
          <div class="font-bold text-sm px-3 py-1 bg-red-50 text-[#E4002B] rounded-full inline-block">
            ${statusLabels[order.order_status] || order.order_status}
          </div>
        </div>
      </div>

      ${stepsHtml}

      <div class="mt-6 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4 text-xs">
        <div>
          <p class="text-gray-500">Người nhận:</p>
          <p class="font-bold text-gray-800">${order.customer_name} - ${order.customer_phone}</p>
          <p class="text-gray-500 mt-2">Địa chỉ giao hàng:</p>
          <p class="font-medium text-gray-800">${order.delivery_address || 'Nhận tại cửa hàng'}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl">
          <p class="font-bold text-gray-800 mb-2">Chi tiết món ăn:</p>
          ${itemsHtml}
          <div class="border-t border-gray-200 mt-2 pt-2 flex justify-between font-extrabold text-sm text-[#E4002B]">
            <span>Tổng thanh toán:</span>
            <span>${formatVND(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// 7. QUẢN TRỊ ADMIN (ADMIN DASHBOARD)
// ========================================================

async function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.remove('hidden');
  await refreshAdminDashboard();
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}

async function refreshAdminDashboard() {
  try {
    const statsRes = await fetch('/api/admin/stats');
    const statsResult = await statsRes.json();
    if (statsResult.success) {
      document.getElementById('admin-stat-revenue').textContent = formatVND(statsResult.data.total_revenue);
      document.getElementById('admin-stat-orders').textContent = statsResult.data.total_orders;
      document.getElementById('admin-stat-products').textContent = statsResult.data.total_products;
    }

    const ordersRes = await fetch('/api/admin/orders');
    const ordersResult = await ordersRes.json();
    if (ordersResult.success) {
      renderAdminOrdersTable(ordersResult.data);
    }
  } catch (err) {
    // Hiển thị dữ liệu cục bộ nếu có
    const localOrders = JSON.parse(localStorage.getItem('kfc_local_orders') || '[]');
    renderAdminOrdersTable(localOrders);
  }
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-gray-400">Chưa có đơn hàng nào</td></tr>';
    return;
  }

  let html = '';
  for (const o of orders) {
    html += `
      <tr class="border-b border-gray-100 hover:bg-gray-50 text-xs">
        <td class="p-3 font-bold text-gray-900">${o.order_code}</td>
        <td class="p-3">
          <div class="font-bold">${o.customer_name}</div>
          <div class="text-gray-500">${o.customer_phone}</div>
        </td>
        <td class="p-3 text-gray-600 max-w-[200px] truncate" title="${o.delivery_address || ''}">
          ${o.delivery_address || 'Nhận tại quầy'}
        </td>
        <td class="p-3 font-extrabold text-[#E4002B]">${formatVND(o.total_amount)}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${o.payment_method === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
            ${o.payment_method || 'COD'}
          </span>
        </td>
        <td class="p-3">
          <select onchange="updateOrderStatus(${o.id || 0}, this.value)" 
            class="p-1 rounded border border-gray-200 text-xs font-semibold bg-white cursor-pointer">
            <option value="PENDING" ${o.order_status === 'PENDING' ? 'selected' : ''}>Chờ duyệt</option>
            <option value="PREPARING" ${o.order_status === 'PREPARING' ? 'selected' : ''}>Đang nấu</option>
            <option value="DELIVERING" ${o.order_status === 'DELIVERING' ? 'selected' : ''}>Đang giao</option>
            <option value="COMPLETED" ${o.order_status === 'COMPLETED' ? 'selected' : ''}>Hoàn tất</option>
            <option value="CANCELLED" ${o.order_status === 'CANCELLED' ? 'selected' : ''}>Hủy đơn</option>
          </select>
        </td>
        <td class="p-3 text-gray-400">${o.created_at ? o.created_at.slice(11, 16) : 'Vừa xong'}</td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

async function updateOrderStatus(orderId, newStatus) {
  if (!orderId) {
    showToast(`Đã đổi trạng thái đơn sang ${newStatus}`);
    return;
  }
  try {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: newStatus })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Đã cập nhật đơn sang: ${newStatus}`);
      refreshAdminDashboard();
    }
  } catch (err) {
    showToast('Lỗi khi cập nhật trạng thái', 'error');
  }
}

// ========================================================
// 8. PRODUCT DETAIL MODAL & FILTERS
// ========================================================

function openProductModal(productId) {
  const p = state.products.find(item => item.id === productId) || FALLBACK_PRODUCTS.find(item => item.id === productId);
  if (!p) return;

  state.currentViewingProduct = p;
  const modal = document.getElementById('product-detail-modal');

  document.getElementById('modal-prod-img').src = p.image_url;
  document.getElementById('modal-prod-name').textContent = p.name;
  document.getElementById('modal-prod-category').textContent = p.category_name || 'KFC Menu';
  document.getElementById('modal-prod-desc').textContent = p.description || 'Thịt gà tươi thơm ngon giòn rụm với 11 loại thảo mộc đặc trưng KFC.';
  document.getElementById('modal-prod-price').textContent = formatVND(p.price);
  document.getElementById('modal-prod-cal').textContent = `${p.calories || 450} Kcal`;
  document.getElementById('modal-prod-prep').textContent = `${p.prep_time_minutes || 15} phút`;
  document.getElementById('modal-prod-qty').value = 1;

  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-detail-modal').classList.add('hidden');
}

function addCurrentProductFromModal() {
  if (!state.currentViewingProduct) return;
  const qty = parseInt(document.getElementById('modal-prod-qty').value, 10) || 1;
  addToCart(state.currentViewingProduct.id, qty);
  closeProductModal();
}

function selectCategory(catId) {
  state.activeCategory = catId;
  renderCategories();
  loadProducts();
}

function toggleSpicyFilter() {
  state.filterSpicy = !state.filterSpicy;
  const btn = document.getElementById('filter-spicy-btn');
  btn.classList.toggle('bg-red-500', state.filterSpicy);
  btn.classList.toggle('text-white', state.filterSpicy);
  loadProducts();
}

function togglePopularFilter() {
  state.filterPopular = !state.filterPopular;
  const btn = document.getElementById('filter-popular-btn');
  btn.classList.toggle('bg-amber-500', state.filterPopular);
  btn.classList.toggle('text-white', state.filterPopular);
  loadProducts();
}

function resetFilters() {
  state.activeCategory = 'all';
  state.searchQuery = '';
  state.filterSpicy = false;
  state.filterPopular = false;
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  renderCategories();
  loadProducts();
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function filterStoresByCity(city) {
  state.activeCity = city;
  const buttons = document.querySelectorAll('.store-city-btn');
  buttons.forEach(btn => {
    const isThis = btn.dataset.city === city;
    btn.classList.toggle('bg-[#E4002B]', isThis);
    btn.classList.toggle('text-white', isThis);
    btn.classList.toggle('bg-gray-100', !isThis);
    btn.classList.toggle('text-gray-700', !isThis);
  });
  loadStores();
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    customer_name: form.review_name.value.trim(),
    rating: parseInt(form.review_rating.value, 10),
    comment: form.review_comment.value.trim()
  };

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showToast(result.message);
      form.reset();
      loadReviews();
      return;
    }
  } catch (err) {
    // Offline
  }

  showToast('Cảm ơn bạn đã gửi đánh giá!');
  form.reset();
}

// ========================================================
// 9. EVENT LISTENERS
// ========================================================

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        loadProducts();
      }, 300);
    });
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }

  const trackInput = document.getElementById('track-search-input');
  if (trackInput) {
    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleTrackOrder();
    });
  }
}

// Khởi chạy khi DOM load
document.addEventListener('DOMContentLoaded', initApp);

// Export cho inline HTML
window.selectCategory = selectCategory;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.applyVoucherCode = applyVoucherCode;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.handleTrackOrder = handleTrackOrder;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.updateOrderStatus = updateOrderStatus;
window.refreshAdminDashboard = refreshAdminDashboard;
window.toggleSpicyFilter = toggleSpicyFilter;
window.togglePopularFilter = togglePopularFilter;
window.resetFilters = resetFilters;
window.filterStoresByCity = filterStoresByCity;
window.addCurrentProductFromModal = addCurrentProductFromModal;
