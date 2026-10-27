import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { processOrderItems, generateOrderNumber, MenuItemInput } from '../services/order.service';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, customerName, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Daftar item pesanan tidak boleh kosong' });
    }

    let userId = req.user?.id;
    if (!userId) {
      const defaultEmail = customerEmail || 'mahasiswa@kampus.ac.id';
      let user = await prisma.user.findUnique({ where: { email: defaultEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: customerName || 'Mahasiswa',
            email: defaultEmail,
            passwordHash: 'demopassword',
            role: 'CUSTOMER',
          },
        });
      }
      userId = user.id;
    }

    // Ambil data menu resmi dari database untuk mencegah manipulasi harga dari client
    const rawItems: MenuItemInput[] = [];
    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
      if (!menu) {
        return res.status(404).json({ message: `Menu dengan ID ${item.menuId} tidak ditemukan` });
      }
      rawItems.push({
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: parseInt(item.quantity, 10),
        isAvailable: menu.isAvailable,
      });
    }

    // Jalankan kalkulasi dan validasi aturan bisnis melalui Service Layer
    const calculation = processOrderItems(rawItems);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          totalAmount: calculation.totalAmount,
          status: 'WAITING_PAYMENT',
          items: {
            create: calculation.items.map((i) => ({
              menuId: i.menuId,
              quantity: i.quantity,
              priceAtOrder: i.priceAtOrder,
              subtotal: i.subtotal,
            })),
          },
          payment: {
            create: {
              method: 'QRIS',
              amount: calculation.totalAmount,
              status: 'PENDING',
            },
          },
        },
        include: {
          items: { include: { menu: true } },
          payment: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return newOrder;
    });

    return res.status(201).json({
      message: 'Pesanan berhasil dibuat, silakan lanjutkan pembayaran QRIS',
      order,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Gagal membuat pesanan' });
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSeller = req.user?.role === 'SELLER';
    const userId = req.user?.id;

    const where: any = {};
    if (!isSeller && userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { menu: true } },
        payment: true,
        queue: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil data pesanan', error: error.message });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID pesanan tidak valid' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { menu: true } },
        payment: true,
        queue: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    return res.json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil detail pesanan', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID pesanan tidak valid' });
    }

    const { status } = req.body;
    const validStatuses = ['WAITING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}` });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status },
        include: { queue: true },
      });

      if (order.queue) {
        let queueStatus = order.queue.status;
        if (status === 'PREPARING') queueStatus = 'IN_PROGRESS';
        else if (status === 'READY') queueStatus = 'READY';
        else if (status === 'COMPLETED') queueStatus = 'COMPLETED';

        if (queueStatus !== order.queue.status) {
          await tx.queue.update({
            where: { id: order.queue.id },
            data: { status: queueStatus },
          });
        }
      }

      return order;
    });

    return res.json({ message: 'Status pesanan berhasil diperbarui', order: updatedOrder });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal memperbarui status pesanan', error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID pesanan tidak valid' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.queue.deleteMany({ where: { orderId: id } });
      await tx.payment.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return res.json({ message: 'Pesanan dan antrean berhasil dihapus' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal menghapus pesanan', error: error.message });
  }
};

export const clearAllOrders = async (_req: Request, res: Response) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.queue.deleteMany({});
      await tx.payment.deleteMany({});
      await tx.orderItem.deleteMany({});
      await tx.order.deleteMany({});
    });

    return res.json({ message: 'Seluruh antrean dan riwayat pesanan berhasil dibersihkan' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal membersihkan semua antrean', error: error.message });
  }
};
