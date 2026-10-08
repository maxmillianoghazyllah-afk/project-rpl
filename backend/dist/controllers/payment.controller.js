"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decidePayment = exports.confirmPayment = void 0;
const prisma_1 = require("../lib/prisma");
const confirmPayment = async (req, res) => {
    try {
        const orderId = parseInt(String(req.params.id), 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID pesanan tidak valid' });
        }
        const { proofUrl } = req.body;
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { orderId },
            include: { order: true },
        });
        if (!payment) {
            return res.status(404).json({ message: 'Data pembayaran untuk pesanan ini tidak ditemukan' });
        }
        if (payment.status === 'PAID') {
            return res.status(400).json({ message: 'Pembayaran ini sudah dikonfirmasi dan disetujui sebelumnya' });
        }
        const updatedPayment = await prisma_1.prisma.payment.update({
            where: { orderId },
            data: {
                proofUrl: proofUrl || 'https://via.placeholder.com/400x600.png?text=Bukti+Transfer+QRIS',
                status: 'PENDING',
            },
            include: { order: true },
        });
        return res.json({
            message: 'Konfirmasi pembayaran berhasil dikirim. Menunggu verifikasi dari penjual kantin.',
            payment: updatedPayment,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengirim konfirmasi pembayaran', error: error.message });
    }
};
exports.confirmPayment = confirmPayment;
const decidePayment = async (req, res) => {
    try {
        const orderId = parseInt(String(req.params.id), 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID pesanan tidak valid' });
        }
        const { action } = req.body; // 'APPROVE' or 'REJECT'
        if (action !== 'APPROVE' && action !== 'REJECT') {
            return res.status(400).json({ message: 'Aksi harus berupa APPROVE atau REJECT' });
        }
        const sellerId = req.user?.id || 2;
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { payment: true, queue: true },
            });
            if (!order) {
                throw new Error('Pesanan tidak ditemukan');
            }
            if (action === 'APPROVE') {
                const updatedPayment = await tx.payment.update({
                    where: { orderId },
                    data: {
                        status: 'PAID',
                        confirmedBy: sellerId,
                    },
                });
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'CONFIRMED' },
                });
                let queue = order.queue;
                if (!queue) {
                    const totalQueuesToday = await tx.queue.count();
                    const nextNumber = totalQueuesToday + 1;
                    const queueNumber = `A-${String(nextNumber).padStart(3, '0')}`;
                    queue = await tx.queue.create({
                        data: {
                            orderId,
                            queueNumber,
                            status: 'WAITING',
                        },
                    });
                }
                return { order: updatedOrder, payment: updatedPayment, queue };
            }
            else {
                const updatedPayment = await tx.payment.update({
                    where: { orderId },
                    data: {
                        status: 'REJECTED',
                        confirmedBy: sellerId,
                    },
                });
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'CANCELLED' },
                });
                return { order: updatedOrder, payment: updatedPayment, queue: null };
            }
        });
        const isApproved = action === 'APPROVE';
        return res.json({
            message: isApproved
                ? `Pembayaran disetujui! Nomor antrean pesanan: ${result.queue?.queueNumber}`
                : 'Pembayaran ditolak dan pesanan telah dibatalkan',
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal memproses keputusan pembayaran', error: error.message });
    }
};
exports.decidePayment = decidePayment;
