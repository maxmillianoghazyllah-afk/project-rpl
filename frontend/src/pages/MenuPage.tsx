import React, { useState, useEffect } from 'react';
import { Plus, Check, ShoppingBag, Search, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Menu } from '../types';
import { useCart } from '../context/CartContext';

interface MenuPageProps {
  onNavigateToCart: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onNavigateToCart }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, items, totalItems } = useCart();

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await api.getMenus();
      setMenus(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Semua', 'Makanan', 'Minuman'];

  const filteredMenus = menus.filter((menu) => {
    const matchesCategory =
      selectedCategory === 'Semua' ||
      (selectedCategory === 'Makanan' && (menu.category === 'Makanan' || !menu.category)) ||
      menu.category === selectedCategory;
    const matchesSearch =
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getItemCount = (menuId: number) => {
    const item = items.find((i) => i.menu.id === menuId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 p-6 md:p-10 text-white shadow-xl mb-8 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Antrean Tanpa Berdesakan
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pesan Menu Kantin Kampus, Bayar QRIS, Ambil Saat Siap!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-orange-50 font-normal leading-relaxed">
            Pilih menu favoritmu secara online, selesaikan pembayaran via QRIS tanpa antre di kasir, dan pantau giliran nomor antreanmu langsung dari HP.
          </p>
        </div>
        {/* Background decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-48 h-48 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
        {/* Category Pills */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-brand-500/25'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari makanan atau minuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 p-4" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={loadMenus}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <p className="text-gray-500 font-medium">Tidak ada menu yang sesuai kriteria pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => {
            const count = getItemCount(menu.id);
            return (
              <div
                key={menu.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={menu.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!menu.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        Habis
                      </span>
                    </div>
                  )}
                  {menu.category && (
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      {menu.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">{menu.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {menu.description || 'Menu lezat siap saji dari kantin.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Harga</span>
                      <span className="text-base font-extrabold text-brand-600">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(menu)}
                      disabled={!menu.isAvailable}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        !menu.isAvailable
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : count > 0
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                          : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                      }`}
                    >
                      {count > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Ditambah ({count})
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Tambah
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button for Mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-30 sm:hidden">
          <button
            onClick={onNavigateToCart}
            className="bg-brand-600 text-white px-5 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-brand-700 active:scale-95 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Keranjang ({totalItems})
          </button>
        </div>
      )}
    </div>
  );
};
