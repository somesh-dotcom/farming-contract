const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBuyerTransactions() {
  try {
    // Check transactions created by Test Buyer
    const testBuyerId = 'd58bb0c3-d269-4929-8246-654c4e8f97b3';
    const buyerTransactions = await prisma.transaction.findMany({
      where: { userId: testBuyerId },
      include: {
        contract: {
          include: {
            farmer: true,
            buyer: true,
            product: true
          }
        }
      }
    });
    
    console.log('Transactions created by Test Buyer:');
    console.log('Count:', buyerTransactions.length);
    buyerTransactions.forEach(t => {
      console.log(`ID: ${t.id.substring(0,8)}... Status: ${t.status} Contract Buyer: ${t.contract?.buyer?.name}`);
    });
    
    // Check transactions for contracts where Test Buyer is the buyer
    const buyerContractTransactions = await prisma.transaction.findMany({
      where: {
        contract: {
          buyerId: testBuyerId
        }
      },
      include: {
        contract: {
          include: {
            farmer: true,
            buyer: true,
            product: true
          }
        }
      }
    });
    
    console.log('\nTransactions for contracts where Test Buyer is buyer:');
    console.log('Count:', buyerContractTransactions.length);
    buyerContractTransactions.forEach(t => {
      console.log(`ID: ${t.id.substring(0,8)}... Status: ${t.status} Contract Buyer: ${t.contract?.buyer?.name} Transaction User: ${t.userId === testBuyerId ? 'YES' : 'NO'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBuyerTransactions();