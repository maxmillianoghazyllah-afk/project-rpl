import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Kantin Queue...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const customer = await prisma.user.upsert({
    where: { email: 'mahasiswa@kampus.ac.id' },
    update: {},
    create: {
      name: 'Budi Santoso (Mahasiswa)',
      email: 'mahasiswa@kampus.ac.id',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'kantin@kampus.ac.id' },
    update: {},
    create: {
      name: 'Ibu Kantin Berkah (Penjual)',
      email: 'kantin@kampus.ac.id',
      passwordHash,
      role: 'SELLER',
    },
  });

  console.log(`Users created: ${customer.email}, ${seller.email}`);

  // 2. Seed Menus
  const menus = [
    {
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng harum dengan suwiran ayam, telur ceplok, kerupuk, dan acar segar.',
      price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      category: 'Makanan',
      isAvailable: true,
    },
    {
      name: 'Ayam Geprek Sambal Bawang',
      description: 'Ayam krispi renyah digeprek dengan cabai rawit pedas mantap plus nasi putih hangat.',
      price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      category: 'Makanan',
      isAvailable: true,
    },
    {
      name: 'Mie Ayam Bakso Komplit',
      description: 'Mie kenyal dengan potongan ayam kecap manis gurih, kuah kaldu segar, dan 2 butir bakso sapi.',
      price: 16000,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      category: 'Makanan',
      isAvailable: true,
    },
    {
      name: 'Nasi Rames Telur Balado',
      description: 'Nasi putih dengan lauk telur balado bumbu merah, tumis buncis tempe, dan sambal.',
      price: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      category: 'Makanan',
      isAvailable: true,
    },
    {
      name: 'Es Teh Manis Jumbo',
      description: 'Teh melati wangi dingin menyegarkan dengan porsi jumbo.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
      category: 'Minuman',
      isAvailable: true,
    },
    {
      name: 'Es Jeruk Peras Segar',
      description: 'Perasan jeruk asli manis asam dingin pelepas dahaga.',
      price: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
      category: 'Minuman',
      isAvailable: true,
    },
    {
      name: 'Kopi Susu Gula Aren',
      description: 'Espresso robusta berpadu susu segar creamy dan lelehan manis gula aren murni.',
      price: 8000,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      category: 'Minuman',
      isAvailable: true,
    },
    {
      name: 'Air Mineral Dingin 600ml',
      description: 'Air mineral murni dalam kemasan botol dingin.',
      price: 3000,
      imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80',
      category: 'Minuman',
      isAvailable: true,
    },
  ];

  for (const item of menus) {
    const existing = await prisma.menu.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menu.create({ data: item });
    }
  }

  console.log(`Menus seeded successfully (${menus.length} items)`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
