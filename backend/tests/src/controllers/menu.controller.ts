import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { validateMenuData, determineMenuDeletionStrategy } from '../services/menu.service';

export const getMenus = async (req: Request, res: Response) => {
  try {
    const { category, availableOnly } = req.query;

    const where: any = {};
    if (category && typeof category === 'string' && category !== 'Semua') {
      where.category = category;
    }
    if (availableOnly === 'true') {
      where.isAvailable = true;
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ menus });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil daftar menu', error: error.message });
  }
};

export const getMenuById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      return res.status(404).json({ message: 'Menu tidak ditemukan' });
    }

    return res.json({ menu });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal mengambil detail menu', error: error.message });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, category, isAvailable } = req.body;

    // Validasi data menu menggunakan menu.service
    const validation = validateMenuData({
      name,
      price: parseInt(price, 10),
      category,
      description,
    });

    const menu = await prisma.menu.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : '',
        price: parseInt(price, 10),
        imageUrl: imageUrl ? imageUrl.trim() : '',
        category: validation.normalizedCategory,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });

    return res.status(201).json({ message: 'Menu berhasil ditambahkan', menu });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Gagal menambahkan menu baru' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const { name, description, price, imageUrl, category, isAvailable } = req.body;

    const dataToUpdate: any = {};
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Nama menu tidak boleh kosong' });
      }
      dataToUpdate.name = name.trim();
    }
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (price !== undefined) {
      const parsedPrice = parseInt(price, 10);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: 'Harga menu harus lebih dari 0' });
      }
      dataToUpdate.price = parsedPrice;
    }
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl.trim();
    if (category !== undefined) dataToUpdate.category = category.trim();
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({ message: 'Menu berhasil diperbarui', menu: updatedMenu });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Gagal memperbarui menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID menu tidak valid' });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { menuId: id } });
    const strategy = determineMenuDeletionStrategy(orderItemCount);

    if (strategy === 'DEACTIVATE') {
      const updated = await prisma.menu.update({
        where: { id },
        data: { isAvailable: false },
      });
      return res.json({
        message: 'Menu sudah pernah dipesan dalam riwayat transaksi; status diubah menjadi tidak tersedia (nonaktif)',
        menu: updated,
      });
    }

    await prisma.menu.delete({ where: { id } });
    return res.json({ message: 'Menu berhasil dihapus' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Gagal menghapus menu', error: error.message });
  }
};
