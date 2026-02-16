import { PrismaClient, TransactionStatus, PaymentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding sample transactions...');

  // Get all active and completed contracts
  const contracts = await prisma.contract.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'COMPLETED', 'PENDING']
      }
    },
    include: {
      farmer: true,
      buyer: true,
    },
  });

  if (contracts.length === 0) {
    console.log('❌ No contracts found. Please create some contracts first.');
    return;
  }

  const paymentMethods = ['bank_transfer', 'upi', 'cash', 'cheque', 'neft'];
  const transactionsToAdd: any[] = [];

  for (const contract of contracts) {
    const totalValue = contract.totalValue;
    
    // Generate 1-4 transactions per contract
    const numTransactions = Math.floor(Math.random() * 4) + 1;
    
    // Distribute total value across transactions with payment types
    let remainingAmount = totalValue;
    const transactionData: Array<{ amount: number; type: PaymentType }> = [];

    // First transaction is usually ADVANCE (20-30%)
    if (numTransactions > 1) {
      const advancePercentage = Math.random() * 0.1 + 0.2; // 20-30%
      const advanceAmount = Math.round(totalValue * advancePercentage * 100) / 100;
      transactionData.push({ amount: advanceAmount, type: PaymentType.ADVANCE });
      remainingAmount -= advanceAmount;
    }

    // Middle transactions are PARTIAL
    for (let i = 1; i < numTransactions - 1; i++) {
      const percentage = Math.random() * 0.2 + 0.15; // 15-35% of remaining
      const amount = Math.round(remainingAmount * percentage * 100) / 100;
      transactionData.push({ amount: amount, type: PaymentType.PARTIAL });
      remainingAmount -= amount;
    }

    // Last transaction is FINAL
    if (numTransactions > 1) {
      transactionData.push({ amount: Math.round(remainingAmount * 100) / 100, type: PaymentType.FINAL });
    } else {
      // Single transaction
      transactionData.push({ amount: totalValue, type: PaymentType.OTHER });
    }

    // Generate transactions with dates spread over contract period
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.deliveryDate);
    const now = new Date();
    const contractEnd = endDate > now ? now : endDate;
    
    const timeSpan = contractEnd.getTime() - startDate.getTime();
    const daysBetween = Math.max(1, Math.floor(timeSpan / (1000 * 60 * 60 * 24)));

    transactionData.forEach((txnData, index) => {
      // Calculate date (spread over contract period)
      const daysOffset = Math.floor((daysBetween / numTransactions) * index);
      const transactionDate = new Date(startDate);
      transactionDate.setDate(transactionDate.getDate() + daysOffset);
      
      // Don't create future transactions
      if (transactionDate > now) {
        transactionDate.setTime(now.getTime());
      }

      // Determine status based on date and contract status
      let status: TransactionStatus;
      if (contract.status === 'COMPLETED') {
        status = Math.random() > 0.1 ? TransactionStatus.COMPLETED : TransactionStatus.PENDING;
      } else if (contract.status === 'ACTIVE') {
        // More recent transactions might be pending
        const daysAgo = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
        status = daysAgo < 7 && Math.random() > 0.6 
          ? TransactionStatus.PENDING 
          : TransactionStatus.COMPLETED;
      } else {
        status = TransactionStatus.PENDING;
      }

      // Randomly assign to farmer or buyer (usually buyer pays farmer)
      const userId = Math.random() > 0.2 ? contract.buyerId : contract.farmerId;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      transactionsToAdd.push({
        contractId: contract.id,
        userId: userId,
        amount: txnData.amount,
        status: status,
        paymentMethod: paymentMethod,
        paymentType: txnData.type,
        transactionDate: transactionDate,
      });
    });
  }

  // Insert all transactions
  console.log(`📦 Inserting ${transactionsToAdd.length} transactions...`);
  for (const transactionData of transactionsToAdd) {
    await prisma.transaction.create({
      data: transactionData,
    });
  }

  console.log(`✅ Added ${transactionsToAdd.length} transactions for ${contracts.length} contracts`);
  
  // Show summary
  const summary = await prisma.transaction.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { amount: true },
  });

  console.log('\n📊 Transaction Summary:');
  summary.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat._count.id} transactions, Total: ₹${stat._sum.amount?.toLocaleString() || 0}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Failed to add sample transactions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

