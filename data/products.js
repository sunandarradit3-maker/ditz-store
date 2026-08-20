const products = [
  {
    id: 'web-starter',
    slug: 'website-starter',
    name: 'Website Starter',
    category: 'Website',
    price: 149000,
    oldPrice: 199000,
    badge: 'BEST SELLER',
    icon: '◈',
    description: 'Landing page modern, responsive, cepat, dan siap deploy untuk personal brand atau UMKM.',
    features: ['Responsive mobile', 'SEO dasar', 'Form kontak', 'Deploy-ready'],
    active: true
  },
  {
    id: 'web-business',
    slug: 'website-business',
    name: 'Website Business',
    category: 'Website',
    price: 349000,
    oldPrice: 449000,
    badge: 'PRO',
    icon: '◆',
    description: 'Website bisnis multi-section dengan katalog, CTA, analytics-ready, dan struktur scalable.',
    features: ['Multi-section', 'Katalog layanan', 'Analytics-ready', 'Optimasi performa'],
    active: true
  },
  {
    id: 'ecommerce-core',
    slug: 'ecommerce-core',
    name: 'E-Commerce Core',
    category: 'E-Commerce',
    price: 799000,
    oldPrice: 999000,
    badge: 'FULL STACK',
    icon: '▣',
    description: 'Toko online dengan katalog, keranjang, checkout, tracking order, akun pelanggan, dan admin panel.',
    features: ['Cart + checkout', 'Order tracking', 'Customer account', 'Admin panel'],
    active: true
  },
  {
    id: 'admin-dashboard',
    slug: 'admin-dashboard',
    name: 'Admin Dashboard',
    category: 'System',
    price: 499000,
    oldPrice: null,
    badge: 'SECURE',
    icon: '⌘',
    description: 'Dashboard manajemen data dengan autentikasi server-side, filter, laporan, dan kontrol akses.',
    features: ['Secure session', 'CRUD data', 'Reporting', 'Audit-ready'],
    active: true
  },
  {
    id: 'custom-api',
    slug: 'custom-api',
    name: 'Custom API & Backend',
    category: 'Backend',
    price: 649000,
    oldPrice: null,
    badge: 'CUSTOM',
    icon: '⌁',
    description: 'Backend dan API custom untuk integrasi aplikasi, bot, dashboard, atau layanan internal.',
    features: ['REST API', 'Database', 'Validation', 'Security headers'],
    active: true
  },
  {
    id: 'maintenance',
    slug: 'maintenance-monthly',
    name: 'Maintenance Monthly',
    category: 'Support',
    price: 99000,
    oldPrice: null,
    badge: 'SUPPORT',
    icon: '✦',
    description: 'Pemeliharaan website bulanan untuk update kecil, monitoring, backup workflow, dan optimasi.',
    features: ['Monitoring', 'Minor updates', 'Performance check', 'Support'],
    active: true
  }
]

module.exports = { products }
