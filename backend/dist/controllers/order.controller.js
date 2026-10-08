"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = require("../lib/prisma");
const createOrder = async (req, res) => {
    try {
        const { items, customerName, customerEmail } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Daftar item pesanan tidak boleh kosong' });
        }
        let userId = req.user?.id;
        if (!userId) {
            const defaultEmail = customerEmail || 'mahasiswa@kampus.ac.id';
            let user = await prisma_1.prisma.user.findUnique({ where: { email: defaultEmail } });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: {
                        name: customerName || 'Budi Santoso (Mahasiswa)',
                        email: defaultEmail,
                        passwordHash: 'demopassword',
                        role: 'CUSTOMER',
                    },
                });
            }
            userId = user.id;
        }
        let totalAmount = 0;
        const preparedItems = [];
        for (const item of items) {
            const menu = await prisma_1.prisma.menu.findUnique({ where: { id: item.menuId } });
            if (!menu) {
                return res.status(404).json({ message: `Menu dengan ID ${item.menuId} tidak ditemukan` });
            }
            if (!menu.isAvailable) {
                return res.status(400).json({ message: `Menu "${menu.name}" sedang tidak tersedia` });
            }
            const qty = parseInt(item.quantity, 10);
            if (isNaN(qty) || qty <= 0) {
                return res.status(400).json({ message: `Jumlah pesanan untuk ${menu.name} tidak valid` });
            }
            const subtotal = menu.price * qty;
            totalAmount += subtotal;
            preparedItems.push({
                menuId: menu.id,
                quantity: qty,
                priceAtOrder: menu.price,
                subtotal,
            });
        }
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${dateStr}-${randomSuffix}`;
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    orderNumber,
                    totalAmount,
                    status: 'WAITING_PAYMENT',
                    items: {
                        create: preparedItems,
                    },
                    payment: {
                        create: {
                            method: 'QRIS',
                            amount: totalAmount,
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal membuat pesanan', error: error.message });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const isSeller = req.user?.role === 'SELLER';
        const userId = req.user?.id;
        const where = {};
        if (!isSeller && userId) {
            where.userId = userId;
        }
        const orders = await prisma_1.prisma.order.findMany({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil data pesanan', error: error.message });
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID pesanan tidak valid' });
        }
        const order = await prisma_1.prisma.order.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil detail pesanan', error: error.message });
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
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
        const updatedOrder = await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id },
                data: { status },
                include: { queue: true },
            });
            if (order.queue) {
                let queueStatus = order.queue.status;
                if (status === 'PREPARING')
                    queueStatus = 'IN_PROGRESS';
                else if (status === 'READY')
                    queueStatus = 'READY';
                else if (status === 'COMPLETED')
                    queueStatus = 'COMPLETED';
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui status pesanan', error: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
