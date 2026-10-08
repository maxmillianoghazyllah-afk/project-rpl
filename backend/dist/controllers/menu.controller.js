"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenu = exports.updateMenu = exports.createMenu = exports.getMenuById = exports.getMenus = void 0;
const prisma_1 = require("../lib/prisma");
const getMenus = async (req, res) => {
    try {
        const { category, availableOnly } = req.query;
        const where = {};
        if (category && typeof category === 'string') {
            where.category = category;
        }
        if (availableOnly === 'true') {
            where.isAvailable = true;
        }
        const menus = await prisma_1.prisma.menu.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ menus });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil daftar menu', error: error.message });
    }
};
exports.getMenus = getMenus;
const getMenuById = async (req, res) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID menu tidak valid' });
        }
        const menu = await prisma_1.prisma.menu.findUnique({ where: { id } });
        if (!menu) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        return res.json({ menu });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil detail menu', error: error.message });
    }
};
exports.getMenuById = getMenuById;
const createMenu = async (req, res) => {
    try {
        const { name, description, price, imageUrl, category, isAvailable } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Nama dan harga menu wajib diisi' });
        }
        const menu = await prisma_1.prisma.menu.create({
            data: {
                name,
                description: description || '',
                price: parseInt(price, 10),
                imageUrl: imageUrl || '',
                category: category || 'Makanan',
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
            },
        });
        return res.status(201).json({ message: 'Menu berhasil ditambahkan', menu });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal menambahkan menu baru', error: error.message });
    }
};
exports.createMenu = createMenu;
const updateMenu = async (req, res) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID menu tidak valid' });
        }
        const { name, description, price, imageUrl, category, isAvailable } = req.body;
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (description !== undefined)
            dataToUpdate.description = description;
        if (price !== undefined)
            dataToUpdate.price = parseInt(price, 10);
        if (imageUrl !== undefined)
            dataToUpdate.imageUrl = imageUrl;
        if (category !== undefined)
            dataToUpdate.category = category;
        if (isAvailable !== undefined)
            dataToUpdate.isAvailable = Boolean(isAvailable);
        const updatedMenu = await prisma_1.prisma.menu.update({
            where: { id },
            data: dataToUpdate,
        });
        return res.json({ message: 'Menu berhasil diperbarui', menu: updatedMenu });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal memperbarui menu', error: error.message });
    }
};
exports.updateMenu = updateMenu;
const deleteMenu = async (req, res) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID menu tidak valid' });
        }
        // Check if menu is in any orders
        const orderItemCount = await prisma_1.prisma.orderItem.count({ where: { menuId: id } });
        if (orderItemCount > 0) {
            const updated = await prisma_1.prisma.menu.update({
                where: { id },
                data: { isAvailable: false },
            });
            return res.json({
                message: 'Menu sudah pernah dipesan dalam riwayat transaksi; status diubah menjadi tidak tersedia (nonaktif)',
                menu: updated,
            });
        }
        await prisma_1.prisma.menu.delete({ where: { id } });
        return res.json({ message: 'Menu berhasil dihapus' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Gagal menghapus menu', error: error.message });
    }
};
exports.deleteMenu = deleteMenu;
