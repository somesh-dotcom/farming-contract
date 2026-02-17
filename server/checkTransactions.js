const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        contract: {
          include: {
            farmer: true,
            buyer: true,
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('Recent transactions:');
    transactions.forEach(t => {
      console.log(`ID: ${t.id.substring(0,8)}... Status: ${t.status} Buyer: ${t.contract?.buyer?.name} Farmer: ${t.contract?.farmer?.name} Product: ${t.contract?.product?.name}`);
    });
    
    // Check buyer-specific transactions
    const buyers = await prisma.user.findMany({
      where: { role: 'BUYER' },
      select: { id: true, name: true }
    });
    
    console.log('\nBuyers in system:');
    buyers.forEach(b => {
      console.log(`- ${b.name} (ID: ${b.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactions();