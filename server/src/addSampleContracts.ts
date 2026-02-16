import { PrismaClient, ContractStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding sample contracts...');

  // Get farmers and buyers
  const farmers = await prisma.user.findMany({
    where: { role: 'FARMER' },
    take: 5,
  });

  const buyers = await prisma.user.findMany({
    where: { role: 'BUYER' },
    take: 5,
  });

  const products = await prisma.product.findMany();

  if (farmers.length === 0 || buyers.length === 0 || products.length === 0) {
    console.log('❌ Need at least 1 farmer, 1 buyer, and 1 product. Please run seed first.');
    return;
  }

  const contractsToAdd: any[] = [];
  const today = new Date();

  // Create 10-15 sample contracts
  const numContracts = Math.floor(Math.random() * 6) + 10;

  for (let i = 0; i < numContracts; i++) {
    const farmer = farmers[Math.floor(Math.random() * farmers.length)];
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    // Random quantity based on product type
    const quantity = product.category === 'GRAINS'
      ? Math.floor(Math.random() * 50) + 10  // 10-60 quintals
      : Math.floor(Math.random() * 500) + 100; // 100-600 kg

    // Random price per unit
    const basePrice = product.category === 'GRAINS'
      ? Math.floor(Math.random() * 1000) + 2000  // ₹2000-3000 per quintal
      : product.category === 'VEGETABLES'
      ? Math.floor(Math.random() * 30) + 30      // ₹30-60 per kg
      : product.category === 'FRUITS'
      ? Math.floor(Math.random() * 50) + 50       // ₹50-100 per kg
      : Math.floor(Math.random() * 100) + 50;     // ₹50-150 per kg

    const pricePerUnit = basePrice;
    const totalValue = quantity * pricePerUnit;

    // Random dates (contracts from last 60 days to future 30 days)
    const daysAgo = Math.floor(Math.random() * 60);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysAgo);

    const contractDuration = Math.floor(Math.random() * 90) + 30; // 30-120 days
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(deliveryDate.getDate() + contractDuration);

    // Random status
    const statusRand = Math.random();
    let status: ContractStatus;
    if (statusRand < 0.3) {
      status = ContractStatus.DRAFT;
    } else if (statusRand < 0.5) {
      status = ContractStatus.PENDING;
    } else if (statusRand < 0.8) {
      status = ContractStatus.ACTIVE;
    } else {
      status = ContractStatus.COMPLETED;
    }

    // Random location
    const locations = [
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Punjab',
      'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Andhra Pradesh', 'Kerala'
    ];
    
    // Add Bangalore and some areas
    const bangaloreAreas = [
      'Bangalore', 'Bangalore - Indiranagar', 'Bangalore - Koramangala', 
      'Bangalore - Whitefield', 'Bangalore - HSR Layout', 'Bangalore - BTM Layout'
    ];
    
    // Combine locations with higher probability for Bangalore areas
    const allLocations = [...locations, ...bangaloreAreas, ...bangaloreAreas];
    const location = allLocations[Math.floor(Math.random() * allLocations.length)];

    contractsToAdd.push({
      farmerId: farmer.id,
      buyerId: buyer.id,
      productId: product.id,
      quantity: quantity,
      unit: product.unit,
      pricePerUnit: pricePerUnit,
      totalValue: totalValue,
      startDate: startDate,
      deliveryDate: deliveryDate,
      status: status,
      location: location,
      terms: `Contract for ${product.name} delivery. Payment terms: ${Math.random() > 0.5 ? '50% advance, 50% on delivery' : 'Full payment on delivery'}.`,
    });
  }

  // Insert all contracts
  console.log(`📦 Creating ${contractsToAdd.length} contracts...`);
  for (const contractData of contractsToAdd) {
    await prisma.contract.create({
      data: contractData,
    });
  }

  console.log(`✅ Created ${contractsToAdd.length} sample contracts`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to add sample contracts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

