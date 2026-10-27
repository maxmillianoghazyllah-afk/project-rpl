/**
 * Service Layer: Logika Bisnis Pemesanan Menu Makanan (Fitur Inti 1)
 * Memisahkan aturan bisnis dari HTTP controller agar dapat diuji secara terisolasi (Unit Test).
 */

export interface MenuItemInput {
  menuId: number;
  quantity: number;
  price: number;
  name: string;
  isAvailable: boolean;
}

export interface CalculatedOrderItem {
  menuId: number;
  name: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

export interface OrderCalculationResult {
  items: CalculatedOrderItem[];
  totalAmount: number;
}

/**
 * Menghitung subtotal untuk satu item pesanan.
 */
export function calculateItemSubtotal(price: number, quantity: number): number {
  if (price < 0) {
    throw new Error('Harga menu tidak boleh negatif');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Jumlah pesanan harus berupa bilangan bulat positif lebih dari nol');
  }
  return price * quantity;
}

/**
 * Menghitung total harga seluruh pesanan di backend untuk mencegah manipulasi harga dari client.
 */
export function calculateOrderTotal(items: CalculatedOrderItem[]): number {
  if (!items || items.length === 0) {
    throw new Error('Daftar item pesanan tidak boleh kosong');
  }
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

/**
 * Validasi dan kalkulasi seluruh item pesanan berdasarkan data menu resmi.
 */
export function processOrderItems(rawItems: MenuItemInput[]): OrderCalculationResult {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Pesanan harus memiliki minimal 1 item');
  }

  const calculatedItems: CalculatedOrderItem[] = [];

  for (const item of rawItems) {
    if (!item.isAvailable) {
      throw new Error(`Menu "${item.name}" saat ini sedang tidak tersedia (habis)`);
    }

    const subtotal = calculateItemSubtotal(item.price, item.quantity);

    calculatedItems.push({
      menuId: item.menuId,
      name: item.name,
      quantity: item.quantity,
      priceAtOrder: item.price,
      subtotal,
    });
  }

  const totalAmount = calculateOrderTotal(calculatedItems);

  return {
    items: calculatedItems,
    totalAmount,
  };
}

/**
 * Menghasilkan nomor pesanan unik dengan format ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(date: Date = new Date(), randomSuffix?: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const suffix = randomSuffix ?? Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${suffix}`;
}
