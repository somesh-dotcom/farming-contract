import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testUsers() {
  try {
    console.log('🔍 Testing user data...');
    
    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🌱 No users found. Running seed...');
      // Run seed logic
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@contractfarming.com',
          password: hashedPassword,
          name: 'System Admin',
          role: 'ADMIN',
          phone: '+1234567890',
          city: 'Bangalore',
          state: 'Karnataka',
        },
      });
      
      const buyerPassword = await bcrypt.hash('buyer123', 10);
      await prisma.user.create({
        data: {
          email: 'buyer@test.com',
          password: buyerPassword,
          name: 'Test Buyer',
          role: 'BUYER',
          phone: '+1234567891',
          city: 'Bangalore',
          state: 'Karnataka',
        },
      });
      
      console.log('✅ Created test users');
    }
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsers();