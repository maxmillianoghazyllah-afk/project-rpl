/**
 * Service Layer: Logika Bisnis Pembayaran QRIS & Manajemen Antrean (Fitur Inti 2)
 * Memisahkan aturan bisnis status antrean dan penomoran dari controller agar dapat diuji secara terisolasi (Unit Test).
 */

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED';
export type OrderStatus = 'WAITING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

/**
 * Format nomor antrean berurutan harian, contoh: A-001, A-002, dst.
 */
export function formatQueueNumber(sequence: number, prefix: string = 'A'): string {
  if (!Number.isInteger(sequence) || sequence <= 0) {
    throw new Error('Nomor urut antrean harus berupa bilangan bulat positif lebih dari nol');
  }
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Validasi aturan alur perubahan status pembayaran QRIS.
 */
export function isValidPaymentTransition(current: PaymentStatus, target: PaymentStatus): boolean {
  if (current === target) return true;

  switch (current) {
    case 'PENDING':
      return target === 'PAID' || target === 'REJECTED' || target === 'CANCELLED';
    case 'PAID':
      // Pembayaran yang sudah disetujui tidak boleh diubah menjadi ditolak
      return false;
    case 'REJECTED':
    case 'CANCELLED':
      return false;
    default:
      return false;
  }
}

/**
 * Validasi aturan alur perubahan status antrean dapur kantin.
 * Alur yang valid: WAITING -> IN_PROGRESS -> READY -> COMPLETED
 */
export function isValidQueueTransition(current: QueueStatus, target: QueueStatus): boolean {
  if (current === target) return true;

  const validTransitions: Record<QueueStatus, QueueStatus[]> = {
    WAITING: ['IN_PROGRESS', 'COMPLETED'],
    IN_PROGRESS: ['READY', 'COMPLETED'],
    READY: ['COMPLETED'],
    COMPLETED: [], // Tidak boleh kembali setelah selesai
  };

  return validTransitions[current]?.includes(target) ?? false;
}

/**
 * Sinkronisasi otomatis dari status antrean ke status pesanan.
 */
export function mapQueueStatusToOrderStatus(queueStatus: QueueStatus): OrderStatus {
  switch (queueStatus) {
    case 'WAITING':
      return 'CONFIRMED';
    case 'IN_PROGRESS':
      return 'PREPARING';
    case 'READY':
      return 'READY';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      throw new Error(`Status antrean "${queueStatus}" tidak valid`);
  }
}
