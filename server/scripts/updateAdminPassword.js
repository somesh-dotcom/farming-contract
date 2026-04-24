const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    console.log('🔐 Starting password update...');
    
    const newPassword = 'admin@3900';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('Hashed password:', hashedPassword);
    
    const result = await prisma.user.updateMany({
      where: {
        email: 'admin@contractfarming.com'
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('✅ Password updated!');
    console.log('Users updated:', result.count);
    console.log('New password: admin@3900');
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
