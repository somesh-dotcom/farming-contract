const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({ 
      select: { 
        name: true, 
        role: true,
        email: true
      } 
    });
    console.log('Users:');
    users.forEach(u => {
      console.log(`  ${u.name} (${u.email}) - ${u.role}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();