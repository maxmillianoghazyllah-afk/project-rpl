/**
 * Service Layer: Logika Bisnis Promo, Diskon, dan Opsi Pemesanan (P11 Feature)
 * Menangani validasi kode voucher mahasiswa, kalkulasi persentase diskon,
 * batas maksimal potongan (cap), dan biaya pengemasan ramah lingkungan (takeaway).
 */

export interface PromoRule {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // Persentase (e.g. 20%) atau Potongan Flat (e.g. 5000)
  minOrder: number;
  maxDiscount?: number;
  isActive: boolean;
  validUntil: string;
}

export const PROMO_RULES: Record<string, PromoRule> = {
  MABA2026: {
    code: 'MABA2026',
    type: 'PERCENTAGE',
    value: 20, // 20%
    minOrder: 20000,
    maxDiscount: 10000,
    isActive: true,
    validUntil: '2026-12-31',
  },
  HEMAT5K: {
    code: 'HEMAT5K',
    type: 'FIXED',
    value: 5000, // Rp 5.000
    minOrder: 25000,
    isActive: true,
    validUntil: '2026-12-31',
  },
  KANTINBERKAH: {
    code: 'KANTINBERKAH',
    type: 'PERCENTAGE',
    value: 50, // 50%
    minOrder: 30000,
    maxDiscount: 15000,
    isActive: true,
    validUntil: '2026-12-31',
  },
  EXPIREDPROMO: {
    code: 'EXPIREDPROMO',
    type: 'FIXED',
    value: 5000,
    minOrder: 10000,
    isActive: false,
    validUntil: '2025-01-01',
  },
};

export interface PromoCalculationResult {
  code: string;
  discountAmount: number;
  finalAmount: number;
  description: string;
}

/**
 * Validasi dan kalkulasi diskon kode voucher promo kantin.
 */
export function applyPromoCode(totalAmount: number, rawCode?: string): PromoCalculationResult {
  if (totalAmount < 0) {
    throw new Error('Total belanja tidak boleh bernilai negatif');
  }

  if (!rawCode || !rawCode.trim()) {
    return {
      code: '',
      discountAmount: 0,
      finalAmount: totalAmount,
      description: 'Tanpa promo',
    };
  }

  const code = rawCode.trim().toUpperCase();
  const rule = PROMO_RULES[code];

  if (!rule) {
    throw new Error(`Kode voucher "${code}" tidak ditemukan`);
  }

  if (!rule.isActive) {
    throw new Error(`Kode voucher "${code}" sudah tidak aktif atau kedaluwarsa`);
  }

  if (totalAmount < rule.minOrder) {
    throw new Error(
      `Minimal belanja untuk kode "${code}" adalah Rp ${rule.minOrder.toLocaleString('id-ID')}`
    );
  }

  let discount = 0;
  if (rule.type === 'PERCENTAGE') {
    discount = Math.floor((totalAmount * rule.value) / 100);
    if (rule.maxDiscount && discount > rule.maxDiscount) {
      discount = rule.maxDiscount;
    }
  } else if (rule.type === 'FIXED') {
    discount = rule.value;
  }

  // Pengaman: Diskon tidak boleh melebihi total pesanan
  if (discount > totalAmount) {
    discount = totalAmount;
  }

  const finalAmount = Math.max(0, totalAmount - discount);

  return {
    code,
    discountAmount: discount,
    finalAmount,
    description:
      rule.type === 'PERCENTAGE'
        ? `Diskon ${rule.value}% (Maks Rp ${rule.maxDiscount?.toLocaleString('id-ID') || 'unlimited'})`
        : `Potongan flat Rp ${rule.value.toLocaleString('id-ID')}`,
  };
}

/**
 * Kalkulasi biaya kemasan ramah lingkungan untuk opsi Takeaway (bungkus).
 */
export function calculateTakeawayFee(isTakeaway: boolean, itemCount: number): number {
  if (!isTakeaway) return 0;
  if (itemCount <= 0) {
    throw new Error('Jumlah item takeaway tidak valid');
  }
  const FEE_PER_ITEM = 1000; // Rp 1.000 per kemasan ramah lingkungan
  return itemCount * FEE_PER_ITEM;
}

/**
 * Validasi format kode voucher promo.
 */
export function validatePromoCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim();
  // Hanya alfanumerik kapital, panjang 4-15 karakter
  return /^[A-Z0-9]{4,15}$/.test(clean.toUpperCase());
}
