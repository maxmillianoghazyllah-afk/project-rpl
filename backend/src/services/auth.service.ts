/**
 * Service Layer: Logika Bisnis Autentikasi dan Hak Akses Pengguna
 */

export type UserRole = 'CUSTOMER' | 'SELLER';

/**
 * Validasi alamat email kampus atau standar.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validasi kelayakan password (minimal 6 karakter untuk aplikasi MVP).
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

/**
 * Menentukan role pengguna saat pendaftaran (default: CUSTOMER).
 */
export function determineUserRole(roleInput?: string): UserRole {
  if (!roleInput) return 'CUSTOMER';
  const upper = roleInput.trim().toUpperCase();
  return upper === 'SELLER' ? 'SELLER' : 'CUSTOMER';
}

/**
 * Memeriksa apakah pengguna memiliki hak akses sebagai penjual kantin.
 */
export function hasSellerPrivilege(role?: string): boolean {
  if (!role) return false;
  return role.trim().toUpperCase() === 'SELLER';
}
