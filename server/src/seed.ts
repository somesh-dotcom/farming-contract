import { PrismaClient, ProductCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@contractfarming.com' },
    update: {},
    create: {
      email: 'admin@contractfarming.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      phone: '+1234567890',
      city: 'Admin City',
      state: 'Admin State',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test farmer user
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@test.com' },
    update: {},
    create: {
      email: 'farmer@test.com',
      password: farmerPassword,
      name: 'Test Farmer',
      role: 'FARMER',
      phone: '+1234567890',
      city: 'Farm City',
      state: 'Farm State',
    },
  });
  console.log('✅ Created test farmer user:', farmer.email);

  // Create test buyer user
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      password: buyerPassword,
      name: 'Test Buyer',
      role: 'BUYER',
      phone: '+1234567890',
      city: 'Test City',
      state: 'Test State',
    },
  });
  console.log('✅ Created test buyer user:', buyer.email);

  // Create sample products
  const products = [
    {
      name: 'Wheat',
      category: ProductCategory.GRAINS,
      description: 'High-quality wheat grain',
      unit: 'quintal',
    },
    {
      name: 'Rice',
      category: ProductCategory.GRAINS,
      description: 'Premium quality rice',
      unit: 'quintal',
    },
    {
      name: 'Tomato',
      category: ProductCategory.VEGETABLES,
      description: 'Fresh red tomatoes',
      unit: 'kg',
    },
    {
      name: 'Potato',
      category: ProductCategory.VEGETABLES,
      description: 'Fresh potatoes',
      unit: 'kg',
    },
    {
      name: 'Mango',
      category: ProductCategory.FRUITS,
      description: 'Sweet mangoes',
      unit: 'kg',
    },
    {
      name: 'Onion',
      category: ProductCategory.VEGETABLES,
      description: 'Fresh onions',
      unit: 'kg',
    },
    {
      name: 'Turmeric',
      category: ProductCategory.SPICES,
      description: 'Organic turmeric',
      unit: 'kg',
    },
    {
      name: 'Lentil',
      category: ProductCategory.PULSES,
      description: 'Quality lentils',
      unit: 'kg',
    },
  ];

  for (const product of products) {
    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: product,
      });
      console.log(`✅ Created product: ${created.name}`);
    } else {
      console.log(`⏭️  Product already exists: ${product.name}`);
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@contractfarming.com');
  console.log('     Password: admin123');
  console.log('   Test Farmer:');
  console.log('     Email: farmer@test.com');
  console.log('     Password: farmer123');
  console.log('   Test Buyer:');
  console.log('     Email: buyer@test.com');
  console.log('     Password: buyer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

