import { PrismaClient, ContractStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleContracts() {
  try {
    // Get the farmer and buyer
    const farmer = await prisma.user.findFirst({
      where: { role: 'FARMER' }
    });
    
    const buyer = await prisma.user.findFirst({
      where: { role: 'BUYER' }
    });
    
    if (!farmer || !buyer) {
      console.log('Missing farmer or buyer');
      return;
    }
    
    // Get some products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    // Create sample contracts
    const contracts = [
      {
        farmerId: farmer.id,
        buyerId: buyer.id,
        productId: products[0].id, // Wheat
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 25,
        totalValue: 100 * 25, // quantity * pricePerUnit
        startDate: new Date(),
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        terms: 'Delivery at Bangalore Central Market',
        location: 'Bangalore - Central Market',
        status: ContractStatus.DRAFT
      },
      {
        farmerId: farmer.id,
        buyerId: buyer.id,
        productId: products[2].id, // Tomato
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 40,
        totalValue: 50 * 40, // quantity * pricePerUnit
        startDate: new Date(),
        deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        terms: 'Organic produce required',
        location: 'Bangalore - Electronic City',
        status: ContractStatus.PENDING
      },
      {
        farmerId: farmer.id,
        buyerId: buyer.id,
        productId: products[4].id, // Mango
        quantity: 200,
        unit: 'kg',
        pricePerUnit: 80,
        totalValue: 200 * 80, // quantity * pricePerUnit
        startDate: new Date(),
        deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        terms: 'Premium grade mangoes',
        location: 'Bangalore - Koramangala',
        status: ContractStatus.ACTIVE
      }
    ];
    
    // Insert contracts
    for (const contractData of contracts) {
      const contract = await prisma.contract.create({
        data: contractData
      });
      
      // Get related data for logging
      const product = await prisma.product.findUnique({
        where: { id: contract.productId },
        select: { name: true }
      });
      
      const farmerInfo = await prisma.user.findUnique({
        where: { id: contract.farmerId },
        select: { name: true }
      });
      
      const buyerInfo = await prisma.user.findUnique({
        where: { id: contract.buyerId },
        select: { name: true }
      });
      
      console.log(`Created contract: ${product?.name} from ${farmerInfo?.name} to ${buyerInfo?.name}`);
    }
    
    console.log('Sample contracts added successfully!');
  } catch (error) {
    console.error('Error adding sample contracts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleContracts();