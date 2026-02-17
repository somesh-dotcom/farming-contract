const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingContracts() {
  try {
    // Get all contracts with transactions
    const contracts = await prisma.contract.findMany({
      include: { transactions: true }
    });
    
    let updatedCount = 0;
    
    for (const contract of contracts) {
      if (contract.transactions.length > 0) {
        const allCompleted = contract.transactions.every(t => t.status === 'COMPLETED');
        
        if (allCompleted && contract.status !== 'COMPLETED') {
          console.log(`Updating contract ${contract.id} from ${contract.status} to COMPLETED`);
          
          await prisma.contract.update({
            where: { id: contract.id },
            data: { status: 'COMPLETED' }
          });
          
          updatedCount++;
        }
      }
    }
    
    console.log(`\n✅ Fixed ${updatedCount} contracts that had all completed transactions but wrong status`);
    
  } catch (error) {
    console.error('Error fixing contracts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingContracts();