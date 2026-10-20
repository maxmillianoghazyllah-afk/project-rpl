/**
 * Service Layer: Logika Bisnis Pengelolaan Menu Kantin (User Story 1)
 */

export interface MenuDataInput {
  name: string;
  price: number;
  category?: string;
  description?: string;
}

export const VALID_CATEGORIES = ['Makanan', 'Minuman', 'Camilan'];

/**
 * Validasi input data menu baru atau perubahan menu.
 */
export function validateMenuData(input: MenuDataInput): { valid: boolean; normalizedCategory: string } {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Nama menu makanan/minuman tidak boleh kosong');
  }

  if (typeof input.price !== 'number' || isNaN(input.price)) {
    throw new Error('Harga menu harus berupa angka numerik');
  }

  if (input.price <= 0) {
    throw new Error('Harga menu harus lebih besar dari 0');
  }

  let normalizedCategory = 'Makanan';
  if (input.category && input.category.trim().length > 0) {
    const trimmed = input.category.trim();
    if (!VALID_CATEGORIES.includes(trimmed)) {
      throw new Error(`Kategori "${trimmed}" tidak valid. Pilihan: ${VALID_CATEGORIES.join(', ')}`);
    }
    normalizedCategory = trimmed;
  }

  return { valid: true, normalizedCategory };
}

/**
 * Menentukan tindakan penghapusan menu: jika sudah pernah dipesan, menu tidak boleh di-hard delete,
 * melainkan harus dinonaktifkan (isAvailable = false) untuk menjaga integritas riwayat transaksi (DocArsitek P3 Bagian 12).
 */
export function determineMenuDeletionStrategy(orderCount: number): 'HARD_DELETE' | 'DEACTIVATE' {
  if (orderCount < 0) {
    throw new Error('Jumlah riwayat pesanan tidak valid');
  }
  return orderCount > 0 ? 'DEACTIVATE' : 'HARD_DELETE';
}

/**
 * Menyaring daftar menu berdasarkan kategori dan kata kunci pencarian.
 */
export function filterMenuList<T extends { name: string; category?: string; description?: string | null; isAvailable: boolean }>(
  menus: T[],
  categoryFilter?: string,
  searchQuery?: string,
  availableOnly?: boolean
): T[] {
  return menus.filter((menu) => {
    if (availableOnly && !menu.isAvailable) {
      return false;
    }

    if (categoryFilter && categoryFilter !== 'Semua') {
      const menuCat = menu.category || 'Makanan';
      if (menuCat.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = menu.name.toLowerCase().includes(q);
      const matchDesc = menu.description ? menu.description.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc) {
        return false;
      }
    }

    return true;
  });
}
