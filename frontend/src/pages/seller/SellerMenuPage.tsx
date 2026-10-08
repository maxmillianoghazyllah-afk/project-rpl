import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power, Utensils, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { Menu } from '../../types';

export const SellerMenuPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

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

  const openAddModal = () => {
    setEditingMenu(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Makanan');
    setImageUrl('');
    setIsAvailable(true);
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
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Nama dan harga menu wajib diisi!');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        description,
        price: parseInt(price, 10),
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isAvailable,
      };

      if (editingMenu) {
        await api.updateMenu(editingMenu.id, payload);
      } else {
        await api.createMenu(payload);
      }

      setShowModal(false);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan menu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (menu: Menu) => {
    try {
      await api.updateMenu(menu.id, { isAvailable: !menu.isAvailable });
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah ketersediaan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus atau menonaktifkan menu ini?')) return;
    try {
      await api.deleteMenu(id);
      await loadMenus();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus menu');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-brand-600" /> Manajemen Menu Kantin
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tambah, sunting harga, atau atur status ketersediaan stok makanan dan minuman.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Menu Baru
        </button>
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
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Memuat daftar menu...
                  </td>
                </tr>
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Belum ada menu yang terdaftar.
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={menu.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={menu.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{menu.name}</span>
                          <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                            {menu.description || '-'}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-black text-lg text-gray-900">
                {editingMenu ? 'Sunting Menu Kantin' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Makanan / Minuman</label>
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
                  <label className="block font-bold text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Camilan">Camilan</option>
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
                <label className="block font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan lauk, rasa, atau porsi..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="availCheck" className="font-semibold text-gray-800">
                  Status Menu: Tersedia untuk Dipesan
                </label>
              </div>

              <div className="pt-4 flex gap-2">
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
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md transition"
                >
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
