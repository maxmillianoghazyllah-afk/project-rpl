/**
 * Service Layer: Logika Bisnis Validasi dan Transisi Pembayaran QRIS (User Story 3 & 4)
 */

export type PaymentMethod = 'QRIS';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED';

export interface PaymentValidationInput {
  orderTotal: number;
  paymentAmount: number;
  method: string;
}

/**
 * Validasi kecocokan nominal pembayaran dengan total tagihan pesanan.
 */
export function validatePaymentAmount(orderTotal: number, paymentAmount: number): boolean {
  if (orderTotal <= 0) {
    throw new Error('Total tagihan pesanan tidak valid');
  }
  if (paymentAmount <= 0) {
    throw new Error('Nominal pembayaran harus lebih dari 0');
  }
  return orderTotal === paymentAmount;
}

/**
 * Validasi metode pembayaran yang didukung (versi 1 hanya QRIS).
 */
export function validatePaymentMethod(method: string): boolean {
  return method.trim().toUpperCase() === 'QRIS';
}

/**
 * Validasi apakah transisi status pembayaran diizinkan.
 */
export function canTransitionPaymentStatus(current: PaymentStatus, target: PaymentStatus): boolean {
  if (current === target) return true;

  switch (current) {
    case 'PENDING':
      return target === 'PAID' || target === 'REJECTED' || target === 'CANCELLED';
    case 'PAID':
      // Pembayaran yang sudah PAID terkunci secara finansial, tidak boleh diubah
      return false;
    case 'REJECTED':
      // Pembayaran yang ditolak tidak boleh langsung di-approve
      return false;
    case 'CANCELLED':
      return false;
    default:
      return false;
  }
}
