import bcrypt from 'bcrypt';
import 'dotenv/config';
import prisma from '../src/config/db.js';
async function seed() {
  try {
    await prisma.$queryRaw`TRUNCATE order_items, orders, products, categories, users RESTART IDENTITY CASCADE;`;

    console.log('Creating users...');
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('User123!', 10),
        role: 'USER',
      },
    });

    const alice = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: await bcrypt.hash('Alice123!', 10),
        role: 'USER',
      },
    });

    console.log('Creating categories...');
    
    const electronics = await prisma.category.create({
      data: { name: 'Electronics' },
    });
    
    const clothing = await prisma.category.create({
      data: { name: 'Clothing' },
    });
    
    const books = await prisma.category.create({
      data: { name: 'Books' },
    });

    console.log('Creating products...');
    
    const laptop = await prisma.product.create({
      data: {
        name: 'Laptop',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 999.99,
        stock: 10,
        categoryId: electronics.id,
      },
    });
    
    const mouse = await prisma.product.create({
      data: {
        name: 'Mouse',
        description: 'Ergonomic mouse with wireless connectivity',
        price: 29.99,
        stock: 25,
        categoryId: electronics.id,
      },
    });
    
    const tshirt = await prisma.product.create({
      data: {
        name: 'T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        stock: 50,
        categoryId: clothing.id,
      },
    });
    
    const novel = await prisma.product.create({
      data: {
        name: 'Novel',
        description: 'Bestselling fiction novel',
        price: 14.99,
        stock: 30,
        categoryId: books.id,
      },
    });

    console.log('Creating orders...');
    
    await prisma.order.create({
      data: {
        userId: regularUser.id,
        status: 'PENDING',
        items: {
          create: [
            { productId: laptop.id, quantity: 1, price: laptop.price },
            { productId: mouse.id, quantity: 2, price: mouse.price },
          ],
        },
      },
    });
    
    await prisma.order.create({
      data: {
        userId: regularUser.id,
        status: 'COMPLETED',
        items: {
          create: [
            { productId: tshirt.id, quantity: 1, price: tshirt.price },
          ],
        },
      },
    });
    
    await prisma.order.create({
      data: {
        userId: alice.id,
        status: 'PENDING',
        items: {
          create: [
            { productId: novel.id, quantity: 2, price: novel.price },
          ],
        },
      },
    });

    console.log('\nSeed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin:   admin@example.com / Admin123!');
    console.log('User:    user@example.com / User123!');
    console.log('Alice:   alice@example.com / Alice123!');
    
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
