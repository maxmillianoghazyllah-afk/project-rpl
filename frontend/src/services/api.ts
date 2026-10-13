import { Menu, Order, QueueResponse, UserRole } from '../types';

const API_BASE = '/api';

function getHeaders(role?: UserRole): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('kantin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Fallback demo role
  const activeRole = role || (localStorage.getItem('kantin_active_role') as UserRole) || 'CUSTOMER';
  headers['x-user-role'] = activeRole;
  headers['x-user-id'] = activeRole === 'SELLER' ? '2' : '1';

  return headers;
}

export const api = {
  // Menus
  async getMenus(category?: string, availableOnly?: boolean): Promise<Menu[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (availableOnly) params.append('availableOnly', 'true');
    const res = await fetch(`${API_BASE}/menus?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil daftar menu');
    const data = await res.json();
    return data.menus;
  },

  async createMenu(menuData: Partial<Menu>): Promise<Menu> {
    const res = await fetch(`${API_BASE}/menus`, {
      method: 'POST',
      headers: getHeaders('SELLER'),
      body: JSON.stringify(menuData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menambahkan menu');
    }
    const data = await res.json();
    return data.menu;
  },

  async updateMenu(id: number, menuData: Partial<Menu>): Promise<Menu> {
    const res = await fetch(`${API_BASE}/menus/${id}`, {
      method: 'PATCH',
      headers: getHeaders('SELLER'),
      body: JSON.stringify(menuData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memperbarui menu');
    }
    const data = await res.json();
    return data.menu;
  },

  async deleteMenu(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/menus/${id}`, {
      method: 'DELETE',
      headers: getHeaders('SELLER'),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menghapus menu');
    }
    return res.json();
  },

  // Orders
  async createOrder(items: { menuId: number; quantity: number }[], customerName?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders('CUSTOMER'),
      body: JSON.stringify({ items, customerName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal membuat pesanan');
    }
    const data = await res.json();
    return data.order;
  },

  async getOrders(role?: UserRole): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders(role),
    });
    if (!res.ok) throw new Error('Gagal mengambil daftar pesanan');
    const data = await res.json();
    return data.orders;
  },

  async getOrderById(id: number): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil detail pesanan');
    const data = await res.json();
    return data.order;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders('SELLER'),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memperbarui status pesanan');
    }
    const data = await res.json();
    return data.order;
  },

  // Payment
  async confirmPayment(orderId: number, proofUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment/confirmation`, {
      method: 'POST',
      headers: getHeaders('CUSTOMER'),
      body: JSON.stringify({ proofUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal mengirim konfirmasi pembayaran');
    }
    return res.json();
  },

  async decidePayment(orderId: number, action: 'APPROVE' | 'REJECT'): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment/decision`, {
      method: 'PATCH',
      headers: getHeaders('SELLER'),
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memproses keputusan pembayaran');
    }
    return res.json();
  },

  // Queue
  async getQueue(): Promise<QueueResponse> {
    const res = await fetch(`${API_BASE}/queue`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data antrean');
    return res.json();
  },

  async updateQueueStatus(id: number, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/queue/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders('SELLER'),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memperbarui status antrean');
    }
    return res.json();
  },
};
