const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();
    const contracts = await prisma.contract.findMany();
    const transactions = await prisma.transaction.findMany();
    
    console.log('Users:', users.length);
    console.log('Products:', products.length);
    console.log('Contracts:', contracts.length);
    console.log('Transactions:', transactions.length);
    
    if (contracts.length > 0) {
      console.log('\nSample contract IDs:');
      contracts.slice(0, 3).forEach(c => {
        console.log(`  ${c.id}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();