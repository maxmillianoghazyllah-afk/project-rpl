import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getQueue = async (req: Request, res: Response) => {
  try {
    const queues = await prisma.queue.findMany({
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
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil data antrean', error: error.message });
  }
};

export const updateQueueStatus = async (req: AuthenticatedRequest, res: Response) => {
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

    const updatedQueue = await prisma.$transaction(async (tx) => {
      const queue = await tx.queue.update({
        where: { id },
        data: { status },
      });

      let orderStatus: string | null = null;
      if (status === 'IN_PROGRESS') orderStatus = 'PREPARING';
      else if (status === 'READY') orderStatus = 'READY';
      else if (status === 'COMPLETED') orderStatus = 'COMPLETED';

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
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal memperbarui status antrean', error: error.message });
  }
};
