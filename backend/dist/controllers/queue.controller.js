"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQueueStatus = exports.getQueue = void 0;
const prisma_1 = require("../lib/prisma");
const getQueue = async (req, res) => {
    try {
        const queues = await prisma_1.prisma.queue.findMany({
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true } },
                        items: { include: { menu: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        const currentInProgress = queues.find((q) => q.status === 'IN_PROGRESS');
        const lastReady = queues.filter((q) => q.status === 'READY').pop();
        return res.json({
            queues,
            currentProcessingNumber: currentInProgress ? currentInProgress.queueNumber : (lastReady ? lastReady.queueNumber : '-'),
            totalWaiting: queues.filter((q) => q.status === 'WAITING').length,
            totalInProgress: queues.filter((q) => q.status === 'IN_PROGRESS').length,
            totalReady: queues.filter((q) => q.status === 'READY').length,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil data antrean', error: error.message });
    }
};
exports.getQueue = getQueue;
const updateQueueStatus = async (req, res) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID antrean tidak valid' });
        }
        const { status } = req.body;
        const validStatuses = ['WAITING', 'IN_PROGRESS', 'READY', 'COMPLETED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Status antrean tidak valid. Pilihan: ${validStatuses.join(', ')}` });
        }
        const updatedQueue = await prisma_1.prisma.$transaction(async (tx) => {
            const queue = await tx.queue.update({
                where: { id },
                data: { status },
            });
            let orderStatus = null;
            if (status === 'IN_PROGRESS')
                orderStatus = 'PREPARING';
            else if (status === 'READY')
                orderStatus = 'READY';
            else if (status === 'COMPLETED')
                orderStatus = 'COMPLETED';
            if (orderStatus) {
                await tx.order.update({
                    where: { id: queue.orderId },
                    data: { status: orderStatus },
                });
            }
            return queue;
        });
        return res.json({
            message: 'Status antrean berhasil diperbarui',
            queue: updatedQueue,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui status antrean', error: error.message });
    }
};
exports.updateQueueStatus = updateQueueStatus;
