import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Utensils,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Tag,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api';
import { Menu } from '../../types';

export const SellerMenuPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Kategori Dinamis
  const [categories, setCategories] = useState<string[]>(['Makanan', 'Minuman', 'Camilan']);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Global notification banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadMenus();
    loadCategories();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await api.getMenus();
      setMenus(data);
    } catch (err) {
      console.error('Error fetching menus', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Gagal memuat kategori dari server', err);
    }
  };

  const openAddModal = () => {
    setEditingMenu(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory(categories[0] || 'Makanan');
    setImageUrl('');
    setIsAvailable(true);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setName(menu.name);
    setDescription(menu.description || '');
    setPrice(String(menu.price));
    setCategory(menu.category || 'Makanan');
    setImageUrl(menu.imageUrl || '');
    setIsAvailable(menu.isAvailable);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama makanan/minuman wajib diisi!');
      return;
    }

    const parsedPrice = parseInt(price, 10);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Harga harus berupa angka lebih besar dari Rp 0!');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        imageUrl:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isAvailable,
      };

      if (editingMenu) {
        await api.updateMenu(editingMenu.id, payload);
        showFeedback('success', `Menu "${payload.name}" berhasil diperbarui!`);
      } else {
        await api.createMenu(payload);
        showFeedback('success', `Menu baru "${payload.name}" berhasil ditambahkan!`);
      }

      setShowModal(false);
      await loadMenus();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan menu. Periksa input data.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (menu: Menu) => {
    try {
      const nextState = !menu.isAvailable;
      await api.updateMenu(menu.id, { isAvailable: nextState });
      showFeedback(
        'success',
        `Status menu "${menu.name}" diubah menjadi ${nextState ? 'Tersedia' : 'Habis'}.`
      );
      await loadMenus();
    } catch (err: any) {
      showFeedback('error', err.message || 'Gagal mengubah ketersediaan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus atau menonaktifkan menu ini?')) return;
    try {
      await api.deleteMenu(id);
      showFeedback('success', 'Menu berhasil dihapus/dinonaktifkan.');
      await loadMenus();
    } catch (err: any) {
      showFeedback('error', err.message || 'Gagal menghapus menu');
    }
  };

  // Handlers Kategori Dinamis
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('Nama kategori tidak boleh kosong!');
      return;
    }

    try {
      const updated = await api.addCategory(trimmed);
      setCategories(updated);
      setNewCategoryName('');
      showFeedback('success', `Kategori "${trimmed}" berhasil ditambahkan!`);
    } catch (err: any) {
      setCategoryError(err.message || 'Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    setCategoryError(null);
    if (['makanan', 'minuman'].includes(catName.toLowerCase())) {
      alert('Kategori "Makanan" dan "Minuman" adalah kategori wajib dan tidak dapat dihapus.');
      return;
    }

    if (!confirm(`Hapus kategori "${catName}"?\nMenu yang terdaftar di kategori ini akan tetap tersimpan.`)) {
      return;
    }

    try {
      const updated = await api.deleteCategory(catName);
      setCategories(updated);
      showFeedback('success', `Kategori "${catName}" berhasil dihapus.`);
    } catch (err: any) {
      setCategoryError(err.message || 'Gagal menghapus kategori');
    }
  };

  const handleClearAllMenus = async () => {
    if (
      !confirm(
        'Yakin ingin mengosongkan SELURUH menu?\nDaftar menu akan dibersihkan agar Anda bisa memasukkan menu sendiri dari awal.'
      )
    ) {
      return;
    }
    try {
      await api.clearAllMenus();
      await loadMenus();
      showFeedback('success', 'Seluruh menu berhasil dikosongkan!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Gagal mengosongkan menu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-brand-600" /> Manajemen Menu Kantin
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tambah menu baru, sunting harga, kelola kategori makanan, atau atur status stok.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Tombol Kosongkan Semua Menu */}
          {menus.length > 0 && (
            <button
              onClick={handleClearAllMenus}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              title="Kosongkan seluruh menu agar bisa diisi dari awal"
            >
              <Trash2 className="w-4 h-4" />
              Kosongkan Semua
            </button>
          )}

          {/* Tombol Kelola Kategori */}
          <button
            onClick={() => {
              setCategoryError(null);
              setShowCategoryModal(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Tag className="w-4 h-4 text-brand-600" />
            Kelola Kategori
          </button>

          {/* Tombol Tambah Menu Baru */}
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu Baru
          </button>
        </div>
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Foto & Nama Menu</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Harga Satuan</th>
                <th className="py-4 px-4">Ketersediaan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">
                    Memuat daftar menu...
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                      <Utensils className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Daftar Menu Masih Kosong</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Belum ada menu yang terdaftar. Anda dapat menambahkan menu makanan atau minuman sendiri.
                    </p>
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <Plus className="w-4 h-4" /> Tambah Menu Baru Sekarang
                    </button>
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            menu.imageUrl ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={menu.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{menu.name}</span>
                          <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                            {menu.description || 'Porsi standar'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-semibold text-gray-700 text-[10px]">
                        {menu.category || 'Makanan'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-brand-600">
                      Rp {menu.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(menu)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition ${
                          menu.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title="Klik untuk mengubah ketersediaan"
                      >
                        <Power className="w-3 h-3" />
                        {menu.isAvailable ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(menu)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition"
                        title="Sunting Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Hapus / Nonaktifkan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kelola Kategori */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-lg text-gray-900">Kelola Kategori Menu</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Kategori <strong>Makanan</strong> dan <strong>Minuman</strong> adalah kategori utama yang dilindungi. Penjual dapat menambah kategori baru dan menghapus kategori kustom lainnya.
            </p>

            {categoryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {categoryError}
              </div>
            )}

            {/* Form Tambah Kategori Baru */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama kategori baru (contoh: Camilan, Dessert, Paket Hemat)..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            {/* List Kategori Terdaftar */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Daftar Kategori Aktif ({categories.length})
              </span>
              {categories.map((cat) => {
                const isPermanent = ['makanan', 'minuman'].includes(cat.toLowerCase());
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-800">{cat}</span>
                      {isPermanent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Lock className="w-3 h-3" /> Wajib
                        </span>
                      )}
                    </div>

                    {!isPermanent ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title={`Hapus kategori ${cat}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Tidak dapat dihapus</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                {editingMenu ? 'Sunting Menu Kantin' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Makanan / Minuman *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Nasi Ayam Sambal Matah"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-gray-700">Kategori</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(true);
                      }}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      + Kategori
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL Foto (Opsional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan lauk, porsi, atau rasa..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="availCheck" className="font-semibold text-gray-800 cursor-pointer">
                  Status Menu: Tersedia untuk Dipesan
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
