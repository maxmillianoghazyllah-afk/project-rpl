/**
 * Service Layer: Logika Bisnis Pengelolaan Menu & Kategori Kantin (User Story 1 & P8)
 */

export interface MenuDataInput {
  name: string;
  price: number;
  category?: string;
  description?: string;
}

export const DEFAULT_PERMANENT_CATEGORIES = ['Makanan', 'Minuman'];
export const DEFAULT_CATEGORIES = ['Makanan', 'Minuman', 'Camilan'];
export const VALID_CATEGORIES = DEFAULT_CATEGORIES;

let registeredCategories: string[] = [...DEFAULT_CATEGORIES];

/**
 * Mendapatkan seluruh daftar kategori aktif.
 */
export function getRegisteredCategories(): string[] {
  return [...registeredCategories];
}

/**
 * Mendaftarkan kategori menu baru oleh penjual.
 */
export function registerCategory(categoryName: string): string[] {
  const trimmed = categoryName?.trim();
  if (!trimmed) {
    throw new Error('Nama kategori tidak boleh kosong');
  }
  const exists = registeredCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    throw new Error(`Kategori "${trimmed}" sudah terdaftar`);
  }
  registeredCategories.push(trimmed);
  return [...registeredCategories];
}

/**
 * Menghapus kategori menu (Kategori Makanan dan Minuman dilindungi dan tidak dapat dihapus).
 */
export function unregisterCategory(categoryName: string): string[] {
  const trimmed = categoryName?.trim();
  if (!trimmed) {
    throw new Error('Nama kategori tidak boleh kosong');
  }
  if (DEFAULT_PERMANENT_CATEGORIES.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error(`Kategori wajib "${trimmed}" tidak dapat dihapus`);
  }
  const index = registeredCategories.findIndex((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (index === -1) {
    throw new Error(`Kategori "${trimmed}" tidak ditemukan`);
  }
  registeredCategories.splice(index, 1);
  return [...registeredCategories];
}

/**
 * Reset kategori ke default (untuk keperluan testing).
 */
export function resetCategoriesToDefault(): void {
  registeredCategories = [...DEFAULT_CATEGORIES];
}

/**
 * Validasi input data menu baru atau perubahan menu.
 */
export function validateMenuData(
  input: MenuDataInput,
  allowedCategories: string[] = registeredCategories
): { valid: boolean; normalizedCategory: string } {
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
    const matched = allowedCategories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!matched) {
      throw new Error(`Kategori "${trimmed}" tidak valid. Pilihan: ${allowedCategories.join(', ')}`);
    }
    normalizedCategory = matched;
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
      if (categoryFilter === 'Lainnya') {
        const isFood = menuCat.toLowerCase() === 'makanan';
        const isDrink = menuCat.toLowerCase() === 'minuman';
        if (isFood || isDrink) return false;
      } else if (menuCat.toLowerCase() !== categoryFilter.toLowerCase()) {
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
