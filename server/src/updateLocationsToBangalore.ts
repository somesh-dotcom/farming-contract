import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Bangalore areas mapping
const bangaloreAreas = [
  'Bangalore - Indiranagar',
  'Bangalore - Koramangala',
  'Bangalore - Whitefield',
  'Bangalore - HSR Layout',
  'Bangalore - BTM Layout',
  'Bangalore - Jayanagar',
  'Bangalore - Electronic City',
  'Bangalore - Marathahalli',
  'Bangalore - Bannerghatta',
  'Bangalore - Hebbal',
  'Bangalore - Yelahanka',
  'Bangalore - Frazer Town',
  'Bangalore - RT Nagar',
  'Bangalore - Peenya',
  'Bangalore - Banashankari',
  'Bangalore - Basavanagudi',
  'Bangalore - Wilson Garden',
  'Bangalore - Ulsoor',
  'Bangalore - KR Puram',
  'Bangalore - Malleshwaram'
];

async function updateContractLocations() {
  console.log('🔄 Updating contract locations to Bangalore areas...');
  
  // Get all contracts
  const contracts = await prisma.contract.findMany();
  console.log(`📦 Found ${contracts.length} contracts to update`);
  
  let updatedCount = 0;
  
  // Update each contract with a random Bangalore area
  for (const contract of contracts) {
    const randomArea = bangaloreAreas[Math.floor(Math.random() * bangaloreAreas.length)];
    
    await prisma.contract.update({
      where: { id: contract.id },
      data: { location: randomArea }
    });
    
    updatedCount++;
    if (updatedCount % 10 === 0) {
      console.log(`✅ Updated ${updatedCount}/${contracts.length} contracts`);
    }
  }
  
  console.log(`✅ Successfully updated ${updatedCount} contracts with Bangalore areas`);
}

async function updateMarketPriceLocations() {
  console.log('🔄 Updating market price locations to Bangalore areas...');
  
  // Get all market prices
  const marketPrices = await prisma.marketPrice.findMany();
  console.log(`📦 Found ${marketPrices.length} market prices to update`);
  
  let updatedCount = 0;
  
  // Update each market price with a random Bangalore area
  for (const price of marketPrices) {
    const randomArea = bangaloreAreas[Math.floor(Math.random() * bangaloreAreas.length)];
    
    await prisma.marketPrice.update({
      where: { id: price.id },
      data: { location: randomArea }
    });
    
    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`✅ Updated ${updatedCount}/${marketPrices.length} market prices`);
    }
  }
  
  console.log(`✅ Successfully updated ${updatedCount} market prices with Bangalore areas`);
}

async function main() {
  console.log('🌱 Starting location update to Bangalore areas...');
  
  try {
    await updateContractLocations();
    await updateMarketPriceLocations();
    
    console.log('🎉 All locations successfully updated to Bangalore areas!');
  } catch (error) {
    console.error('❌ Error updating locations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();