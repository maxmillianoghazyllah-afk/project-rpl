import { Menu, Order, QueueResponse, UserRole } from '../types';

const API_BASE = '/api';

// Default menu kosong saat di-boot awal (penjual dapat memasukkan menu sendiri)
const DEFAULT_MENUS: Menu[] = [];

export const DEFAULT_CATEGORIES = ['Makanan', 'Minuman', 'Camilan'];

function getLocalCategories(): string[] {
  try {
    const raw = localStorage.getItem('kantin_menu_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const set = new Set([...DEFAULT_CATEGORIES.slice(0, 2), ...parsed]);
        return Array.from(set);
      }
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_CATEGORIES];
}

function saveLocalCategories(cats: string[]) {
  try {
    localStorage.setItem('kantin_menu_categories', JSON.stringify(cats));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

function getLocalMenus(): Menu[] {
  try {
    const raw = localStorage.getItem('kantin_local_menus');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local menus', e);
  }
  return [];
}

function saveLocalMenus(menus: Menu[]) {
  try {
    localStorage.setItem('kantin_local_menus', JSON.stringify(menus));
  } catch (e) {
    console.error('Error saving local menus', e);
  }
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem('kantin_local_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local orders', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem('kantin_local_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders', e);
  }
}

function getHeaders(role?: UserRole): HeadersInit {
  const activeRole = role || (localStorage.getItem('kantin_active_role') as UserRole) || 'CUSTOMER';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-user-role': activeRole,
    'x-user-id': activeRole === 'SELLER' ? '2' : '1',
  };

  const token = localStorage.getItem('kantin_token');
  if (token && activeRole !== 'SELLER') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const api = {
  // Menus
  async getMenus(category?: string, availableOnly?: boolean): Promise<Menu[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (availableOnly) params.append('availableOnly', 'true');
      const res = await fetch(`${API_BASE}/menus?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.menus)) {
          saveLocalMenus(data.menus);
          return data.menus;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, using local cache', err);
    }

    let list = getLocalMenus();
    if (category && category !== 'Semua') {
      list = list.filter((m) => m.category?.toLowerCase() === category.toLowerCase());
    }
    if (availableOnly) {
      list = list.filter((m) => m.isAvailable);
    }
    return list;
  },

  async createMenu(menuData: Partial<Menu>): Promise<Menu> {
    try {
      const res = await fetch(`${API_BASE}/menus`, {
        method: 'POST',
        headers: getHeaders('SELLER'),
        body: JSON.stringify(menuData),
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocalMenus();
        saveLocalMenus([data.menu, ...current]);
        return data.menu;
      }
    } catch (err) {
      console.warn('Backend offline, saving menu to local cache', err);
    }

    // Seamless Local Fallback
    const current = getLocalMenus();
    const newMenu: Menu = {
      id: Date.now(),
      name: menuData.name?.trim() || 'Menu Baru',
      description: menuData.description?.trim() || '',
      price: Number(menuData.price) || 10000,
      category: menuData.category || 'Makanan',
      imageUrl:
        menuData.imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable: menuData.isAvailable !== undefined ? Boolean(menuData.isAvailable) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocalMenus([newMenu, ...current]);
    return newMenu;
  },

  async updateMenu(id: number, menuData: Partial<Menu>): Promise<Menu> {
    try {
      const res = await fetch(`${API_BASE}/menus/${id}`, {
        method: 'PATCH',
        headers: getHeaders('SELLER'),
        body: JSON.stringify(menuData),
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocalMenus().map((m) => (m.id === id ? { ...m, ...data.menu } : m));
        saveLocalMenus(current);
        return data.menu;
      }
    } catch (err) {
      console.warn('Backend offline, updating menu in local cache', err);
    }

    const current = getLocalMenus();
    let updated: Menu | null = null;
    const nextMenus = current.map((m) => {
      if (m.id === id) {
        updated = {
          ...m,
          ...menuData,
          price: menuData.price !== undefined ? Number(menuData.price) : m.price,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return m;
    });
    saveLocalMenus(nextMenus);
    return updated || ({ ...menuData, id } as Menu);
  },

  async deleteMenu(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE}/menus/${id}`, {
        method: 'DELETE',
        headers: getHeaders('SELLER'),
      });
      if (res.ok) {
        const current = getLocalMenus().filter((m) => m.id !== id);
        saveLocalMenus(current);
        return res.json();
      }
    } catch (err) {
      console.warn('Backend offline, deleting menu from local cache', err);
    }

    const current = getLocalMenus().filter((m) => m.id !== id);
    saveLocalMenus(current);
    return { message: 'Menu berhasil dihapus' };
  },

  async clearAllMenus(): Promise<{ message: string }> {
    saveLocalMenus([]);
    return { message: 'Seluruh menu berhasil dikosongkan' };
  },

  // Categories Management (Penjual bisa tambah kategori baru & hapus kategori kustom)
  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/menus/categories`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          saveLocalCategories(data.categories);
          return data.categories;
        }
      }
    } catch (err) {
      // offline fallback
    }
    return getLocalCategories();
  },

  async addCategory(name: string): Promise<string[]> {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error('Nama kategori tidak boleh kosong');

    try {
      const res = await fetch(`${API_BASE}/menus/categories`, {
        method: 'POST',
        headers: getHeaders('SELLER'),
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          saveLocalCategories(data.categories);
          return data.categories;
        }
      }
    } catch (err) {
      // offline fallback
    }

    const current = getLocalCategories();
    if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Kategori "${trimmed}" sudah terdaftar`);
    }
    const updated = [...current, trimmed];
    saveLocalCategories(updated);
    return updated;
  },

  async deleteCategory(name: string): Promise<string[]> {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error('Nama kategori tidak valid');
    if (['makanan', 'minuman'].includes(trimmed.toLowerCase())) {
      throw new Error('Kategori "Makanan" dan "Minuman" adalah kategori permanen dan tidak dapat dihapus');
    }

    try {
      const res = await fetch(`${API_BASE}/menus/categories/${encodeURIComponent(trimmed)}`, {
        method: 'DELETE',
        headers: getHeaders('SELLER'),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          saveLocalCategories(data.categories);
          return data.categories;
        }
      }
    } catch (err) {
      // offline fallback
    }

    const current = getLocalCategories();
    const updated = current.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
    saveLocalCategories(updated);
    return updated;
  },

  // Orders
  async createOrder(
    items: { menuId: number; quantity: number; notes?: string }[],
    customerName?: string
  ): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders('CUSTOMER'),
        body: JSON.stringify({ items, customerName }),
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocalOrders();
        saveLocalOrders([data.order, ...current.filter((o) => o.id !== data.order.id)]);
        return data.order;
      }
    } catch (err) {
      console.warn('Backend offline/database unreachable, creating order locally', err);
    }

    // Seamless Local Fallback for Order Creation
    const menus = getLocalMenus();
    let total = 0;
    const orderItems = items.map((it, idx) => {
      const m = menus.find((x) => x.id === it.menuId) || {
        id: it.menuId,
        name: 'Menu Pilihan',
        price: 15000,
        category: 'Makanan',
        isAvailable: true,
      };
      const subtotal = m.price * it.quantity;
      total += subtotal;
      return {
        id: Date.now() + idx,
        orderId: Date.now(),
        menuId: it.menuId,
        menu: m,
        quantity: it.quantity,
        priceAtOrder: m.price,
        subtotal,
        notes: it.notes?.trim() || undefined,
      };
    });

    const orderId = Date.now();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveName = customerName?.trim() || localStorage.getItem('kantin_customer_name') || 'Mahasiswa';

    const localOrder: Order = {
      id: orderId,
      orderNumber,
      userId: 1,
      user: {
        id: 1,
        name: effectiveName,
        email: 'mahasiswa@kampus.ac.id',
      },
      totalAmount: total,
      status: 'WAITING_PAYMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
      payment: {
        id: orderId + 1,
        orderId,
        method: 'QRIS',
        amount: total,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    };

    const current = getLocalOrders();
    saveLocalOrders([localOrder, ...current]);
    return localOrder;
  },

  async getOrders(role?: UserRole): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: getHeaders(role),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          saveLocalOrders(data.orders);
          return data.orders;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, using local orders cache', err);
    }
    return getLocalOrders();
  },

  async getOrderById(id: number): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (err) {
      console.warn('Backend unavailable for getOrderById, using local cache', err);
    }
    const order = getLocalOrders().find((o) => o.id === id);
    if (!order) throw new Error('Detail pesanan tidak ditemukan');
    return order;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders('SELLER'),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (err) {
      console.warn('Backend unavailable for updateOrderStatus, updating local cache', err);
    }

    let updated: Order | null = null;
    const orders = getLocalOrders().map((o) => {
      if (o.id === id) {
        let qStatus = o.queue?.status;
        if (status === 'PREPARING') qStatus = 'IN_PROGRESS';
        if (status === 'READY') qStatus = 'READY';
        if (status === 'COMPLETED') qStatus = 'COMPLETED';

        updated = {
          ...o,
          status: status as any,
          queue: o.queue ? { ...o.queue, status: (qStatus as any) || o.queue.status } : undefined,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return o;
    });
    saveLocalOrders(orders);
    return updated || ({ id, status } as any);
  },

  async deleteOrder(id: number): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders('SELLER'),
      });
      if (res.ok) {
        const current = getLocalOrders().filter((o) => o.id !== id);
        saveLocalOrders(current);
        return res.json();
      }
    } catch (err) {
      console.warn('Backend offline, deleting order from local cache', err);
    }

    const current = getLocalOrders().filter((o) => o.id !== id);
    saveLocalOrders(current);
    return { message: 'Antrean pesanan berhasil dihapus' };
  },

  async clearAllOrders(): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'DELETE',
        headers: getHeaders('SELLER'),
      });
      if (res.ok) {
        saveLocalOrders([]);
        return res.json();
      }
    } catch (err) {
      console.warn('Backend offline, clearing all orders from local cache', err);
    }

    saveLocalOrders([]);
    return { message: 'Seluruh antrean berhasil dibersihkan' };
  },

  // Payment
  async confirmPayment(orderId: number, proofUrl?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/payment/confirmation`, {
        method: 'POST',
        headers: getHeaders('CUSTOMER'),
        body: JSON.stringify({ proofUrl }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable for confirmPayment, updating local cache', err);
    }

    const orders = getLocalOrders().map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'WAITING_PAYMENT' as const,
          payment: o.payment ? { ...o.payment, proofUrl: proofUrl || 'Sudah dibayar via QRIS' } : undefined,
        };
      }
      return o;
    });
    saveLocalOrders(orders);
    return { message: 'Konfirmasi pembayaran berhasil dicatat' };
  },

  async decidePayment(orderId: number, action: 'APPROVE' | 'REJECT'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/payment/decision`, {
        method: 'PATCH',
        headers: getHeaders('SELLER'),
        body: JSON.stringify({ action }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable for decidePayment, updating local cache', err);
    }

    const orders = getLocalOrders();
    const existingCount = orders.filter((o) => o.queue).length;
    const queueNumber = `A-${String(existingCount + 1).padStart(3, '0')}`;

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        if (action === 'APPROVE') {
          return {
            ...o,
            status: 'CONFIRMED' as const,
            payment: o.payment ? { ...o.payment, status: 'PAID' as const } : undefined,
            queue: {
              id: Date.now(),
              orderId: o.id,
              queueNumber,
              status: 'WAITING' as const,
              createdAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        } else {
          return {
            ...o,
            status: 'CANCELLED' as const,
            payment: o.payment ? { ...o.payment, status: 'REJECTED' as const } : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return o;
    });
    saveLocalOrders(updated);
    return { message: action === 'APPROVE' ? 'Pembayaran disetujui' : 'Pembayaran ditolak', queueNumber };
  },

  // Queue
  async getQueue(): Promise<QueueResponse> {
    try {
      const res = await fetch(`${API_BASE}/queue`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Backend unavailable for getQueue, extracting from local cache', err);
    }

    const orders = getLocalOrders();
    const queues = orders
      .filter((o) => o.queue)
      .map((o) => o.queue!)
      .reverse();
    const inProgress = queues.filter((q) => q.status === 'IN_PROGRESS');
    const ready = queues.filter((q) => q.status === 'READY');
    const waiting = queues.filter((q) => q.status === 'WAITING');

    return {
      queues,
      currentProcessingNumber: inProgress[0]?.queueNumber || (ready[0]?.queueNumber || '-'),
      totalWaiting: waiting.length,
      totalInProgress: inProgress.length,
      totalReady: ready.length,
    };
  },

  async updateQueueStatus(id: number, status: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/queue/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders('SELLER'),
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable for updateQueueStatus, updating local cache', err);
    }

    const orders = getLocalOrders().map((o) => {
      if (o.queue && o.queue.id === id) {
        return {
          ...o,
          queue: { ...o.queue, status: status as any },
        };
      }
      return o;
    });
    saveLocalOrders(orders);
    return { message: 'Status antrean berhasil diperbarui' };
  },
};
